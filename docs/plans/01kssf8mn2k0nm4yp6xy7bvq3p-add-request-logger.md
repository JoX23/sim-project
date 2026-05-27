---
id: 01kssf8mn2k0nm4yp6xy7bvq3p
parent: null
status: shipped
shipped_at: 2026-05-29T10:15:00Z
evidence: 01kssf8mn2k0nm4yp6xy7bvq3p.evidence.md
intent: "Añadir middleware de logging de requests HTTP"
tier: sandbox-edit
read_set:
  - src/server.ts
  - src/middleware/auth.ts
write_set:
  - src/middleware/logger.ts
  - src/server.ts
  - test/logger.test.ts
invariants:
  - "GET /health sigue respondiendo 200 (middleware no bloquea)"
  - "JWT auth sigue funcionando (logger corre antes de auth, no interfiere)"
  - "Tests existentes (10) siguen pasando"
validation_commands:
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/server.ts"
  - "git rm src/middleware/logger.ts test/logger.test.ts"
estimated_size: XS
risk: bajo
created_at: 2026-05-29T09:30:00Z
---

# Añadir request logging middleware

## Contexto

En producción necesitamos visibilidad mínima de qué endpoints se llaman y cuándo.
Actualmente el servidor corre sin ningún output de acceso — un restart o deploy
silencioso no deja rastro. Añadir un logger antes de todos los middlewares garantiza
que cada request (incluyendo las 401 de auth fallida) quede registrado.

No se añade `morgan` como dependencia para mantener el proyecto lean. Un custom
middleware de 3 líneas es suficiente para el sim; en producción sería morgan o pino-http.

## Acceptance Criteria

- [ ] **AC-1**: Cada request imprime en stdout: `[<ISO timestamp>] <METHOD> <path>`
- [ ] **AC-2**: El logger corre **antes** de auth y health — visible incluso para requests rechazados
- [ ] **AC-3**: `GET /health` sigue respondiendo 200 (middleware llama `next()`)
- [ ] **AC-4**: Tests existentes siguen pasando (no-regresión)

## Diseño técnico

- Nuevo archivo `src/middleware/logger.ts` con función `requestLogger(req, _res, next)`
- Mount en `src/server.ts` con `app.use(requestLogger)` como **primer** middleware (antes de express.json y health)
- Sin dependencias externas nuevas

## Plan de ejecución

1. Crear `src/middleware/logger.ts` con `requestLogger`
2. En `src/server.ts`, importar y montar como primer `app.use`
3. Añadir `test/logger.test.ts` cubriendo AC-1 (verifica que la función existe y llama next)
4. Ejecutar `npm test` → verde (11 tests)

## Notas de rollback

Aditivo puro excepto por la línea `app.use(requestLogger)` en server.ts. Rollback simple.
