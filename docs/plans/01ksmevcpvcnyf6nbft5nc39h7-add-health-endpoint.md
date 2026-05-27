---
id: 01ksmevcpvcnyf6nbft5nc39h7
parent: null
status: shipped
shipped_at: 2026-05-27T10:18:00Z
evidence: 01ksmevcpvcnyf6nbft5nc39h7.evidence.md
intent: "Agregar GET /health que devuelve {status: 'ok'}"
tier: sandbox-edit
read_set:
  - src/server.ts
  - test/users.test.ts
write_set:
  - src/server.ts
invariants:
  - "Tests existentes en test/users.test.ts siguen pasando"
  - "Endpoint /users sigue funcionando"
validation_commands:
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/server.ts"
estimated_size: XS
risk: bajo
created_at: 2026-05-27T10:14:00Z
---

# Agregar endpoint /health

## Contexto

Sim project necesita un health check para que orquestadores externos (k8s, Railway) puedan verificar liveness. No hay historial previo (proyecto nuevo).

## Acceptance Criteria

- [ ] **AC-1**: Dado el server corriendo, cuando hago `GET /health`, entonces recibo `{status: 'ok'}` con status 200
- [ ] **AC-2**: Test cubre el happy path
- [ ] **AC-3**: Tests existentes siguen pasando (no-regresión)

## Diseño técnico

- Añadir un handler inline en `src/server.ts` antes del mount de `/users`
- No requiere router separado para 1 endpoint trivial

## Plan de ejecución

1. Leer `src/server.ts` (mode=full) para entender el setup actual
2. Añadir `app.get('/health', (_, res) => res.json({status: 'ok'}))` después de `app.use(express.json())` y antes de `app.use('/users', ...)`
3. Añadir test en `test/health.test.ts` cubriendo AC-1
4. Ejecutar `npm test` → verde

## Notas de rollback

Trivial — un solo archivo afectado, un solo bloque añadido. `git checkout` revierte.
