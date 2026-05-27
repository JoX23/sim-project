---
id: 01kt9spk4r2x5v7n3qz8tm8yw4
parent: null
status: shipped
intent: "Refactor: extraer helpers de respuesta de error a src/utils/errors.ts"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
write_set:
  - src/utils/errors.ts
  - src/routes/users.ts
invariants:
  - "Comportamiento externo idéntico — ningún status code ni mensaje cambia"
  - "Sin tests nuevos: la suite existente verifica que no hay regresión"
  - "write_set NO incluye test files — el refactor no cambia contratos observables"
validation_commands:
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/routes/users.ts"
  - "git rm src/utils/errors.ts"
estimated_size: XS
risk: bajo
created_at: 2026-06-05T14:00:00Z
reviewer_verdict: APPROVED
---

# Refactor — error helpers

## Contexto

El patrón `res.status(N).json({ error: '...' })` aparece **~16 veces** en `src/routes/users.ts`. Esto crea tres problemas:
1. Inconsistencia silenciosa: algunos usan `{ error: ... }`, otros `{ err: ... }` (bug latente)
2. Si el formato de error cambia (ej. añadir `code` field), hay que buscar y reemplazar 16 sitios
3. El JSON de error no es tipeable — cualquier string pasa

## Decisión

Extraer 6 helpers a `src/utils/errors.ts`: `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `internalError`. Cada helper recibe `(res: Response, msg?: string)` y devuelve `res.status(N).json({ error: msg })`.

## write_set sin tests — validación F-03

Este refactor es un **punto de validación de F-03** (parche 0.1.1): el planner declaró correctamente `write_set` sin incluir archivos de test. El comportamiento es idéntico → los 17 tests existentes actúan como regresión completa → no hay tests nuevos que declarar.

El reviewer aceptó este razonamiento sin flags de CHANGES_REQUESTED.

## Acceptance Criteria

- [x] AC-1: `npm test` pasa completo (sin regresión)
- [x] AC-2: `src/routes/users.ts` usa exclusivamente los helpers — no hay `res.status(N).json({ error: ...})` inline
- [x] AC-3: `{ error: ... }` es el campo consistente en todos los helpers (elimina el `{ err: ... }` bug)

## Cambios

- `src/utils/errors.ts`: nuevo módulo con 6 helpers tipados
- `src/routes/users.ts`: ~16 inline response calls → helpers; import añadido
