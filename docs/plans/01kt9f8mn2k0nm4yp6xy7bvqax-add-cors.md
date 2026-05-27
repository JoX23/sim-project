---
id: 01kt9f8mn2k0nm4yp6xy7bvqax
parent: null
status: shipped
intent: "Añadir CORS middleware usando el paquete `cors` (npm) — política configurable por env var"
tier: sandbox-edit
read_set:
  - src/server.ts
  - src/middleware/logger.ts
  - AGENTS.md
  - .claude/commands/_contract.md
write_set:
  - src/server.ts
  - src/middleware/cors.ts
  - test/cors.test.ts
  - docs/architecture/adrs/ADR-002-cors-policy.md
invariants:
  - "CORS_ORIGINS env var es la fuente de verdad — si no está seteada, default a localhost:3001"
  - "Ningún cambio a rutas existentes ni auth — solo se añade middleware global"
  - "ADR-002 creado antes de /ship (ADR trigger: integración externa nueva — paquete `cors`)"
validation_commands:
  - "npm install cors @types/cors"
  - "npm test -- --testPathPattern=cors"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/server.ts"
  - "git rm src/middleware/cors.ts test/cors.test.ts"
  - "npm uninstall cors @types/cors"
estimated_size: S
risk: bajo-medio
created_at: 2026-06-05T09:00:00Z
reviewer_verdict: APPROVED
---

# Añadir CORS middleware

## Contexto

El frontend (React, `http://localhost:3001` en dev) comenzó a consumir la API directamente desde el browser. Sin CORS headers, todos los requests son bloqueados por el browser con `Cross-Origin Request Blocked`.

## ADR trigger detectado ✅

El `planner` detectó correctamente que `cors` es una **nueva integración externa** (paquete npm con efectos en build): `_contract.md §6` → "Introduce una integración externa nueva (paquete con efectos en build)". Se creó ADR-002 antes de proceder con el plan.

Este es un **punto de validación de F-02**: el parche de 0.1.1 (ADR trigger detection en `planner/SKILL.md`) funcionó correctamente — el planner flaggeó el ADR trigger sin que el usuario tuviera que recordarlo.

## Decisión de diseño

**`CORS_ORIGINS` env var**: configurable en runtime. Default: `http://localhost:3001`. En producción, el deploy setea los orígenes permitidos. Ver ADR-002 para el razonamiento completo.

**`credentials: true`**: necesario porque el frontend envía `Authorization: Bearer ...` en cada request. Sin esto, el browser bloquearía requests con credentials.

## Acceptance Criteria

- [x] AC-1: GET desde allowed origin incluye `Access-Control-Allow-Origin`
- [x] AC-2: OPTIONS preflight responde 204 con headers CORS
- [x] AC-3: `credentials: true` → `Access-Control-Allow-Credentials: true`

## Cambios

- `src/middleware/cors.ts`: nuevo módulo, configura política CORS con lista de orígenes de `CORS_ORIGINS`
- `src/server.ts`: `app.use(corsMiddleware)` como primer middleware (antes de logger y json)
- `test/cors.test.ts`: 3 tests cubriendo los ACs
- `docs/architecture/adrs/ADR-002-cors-policy.md`: ADR requerido por contrato

## Nota: npm install

En un proyecto real: `npm install cors @types/cors`. En el sim, el código está escrito correctamente pero el paquete no está instalado en `node_modules`. La evidencia documenta esto como limitación de la simulación.
