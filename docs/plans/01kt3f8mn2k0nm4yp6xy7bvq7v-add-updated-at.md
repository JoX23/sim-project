---
ulid: 01kt3f8mn2k0nm4yp6xy7bvq7v
slug: add-updated-at
created_at: 2026-06-03T09:00:00Z
status: shipped
intent: Add `updatedAt` field to User model — initialized to createdAt on create, refreshed on every PATCH
parent: null
read_set:
  - src/db/users.ts
  - src/routes/users.ts
  - test/users-update.test.ts
  - test/users-created-at.test.ts
  - docs/plans/01kszf8mn2k0nm4yp6xy7bvq5t.evidence.md
write_set:
  - src/db/users.ts
  - test/users-update.test.ts
  - test/users-updated-at.test.ts
invariants:
  - AC-1: createUser() inicializa updatedAt === createdAt (mismo ISO instant)
  - AC-2: updateUser() refresca updatedAt a new Date().toISOString()
  - AC-3: seed user ada@example.com tiene updatedAt en la inicialización de DB
  - AC-4: PATCH /users/:email response body incluye updatedAt
  - AC-5: 0 tests existentes rotos
validation_commands:
  - npm test
rollback:
  - git checkout src/db/users.ts test/users-update.test.ts
  - rm -f test/users-updated-at.test.ts
---

## Contexto

Día 8 del sim-project F1. El campo `createdAt` se añadió en el plan `01ksxspk4r2x5v7n3qz8tm6yz1k`
(día 5). El evidence del plan de PATCH (`01kszf8mn2k0nm4yp6xy7bvq5t`) dejó como untested region:
> "no se verifica que el campo de timestamp se actualice al hacer PATCH"

Este plan cierra esa deuda técnica añadiendo `updatedAt` al modelo User.

## Acceptance Criteria

- **AC-1** `createUser` devuelve `{ ..., updatedAt }` con `updatedAt === createdAt`
- **AC-2** `updateUser` devuelve `{ ..., updatedAt }` con valor actualizado
- **AC-3** La fila seed `ada@example.com` en `DB` incluye `updatedAt`
- **AC-4** `PATCH /users/:email` responde con `updatedAt` en el body JSON
- **AC-5** 0 tests existentes rotos — todos los endpoints preservan comportamiento

## Cambios planificados

| Archivo | Operación |
|---|---|
| `src/db/users.ts` | Añadir `updatedAt: string` al type del Map; actualizar seed, `createUser()`, `updateUser()` |
| `test/users-update.test.ts` | Añadir `expect(res.body.updatedAt).toBeDefined()` al AC-1 existente |
| `test/users-updated-at.test.ts` | Nuevo test file: AC-1 (updatedAt===createdAt on create) + AC-2 (updatedAt defined after PATCH) |

## Riesgo identificado

TypeScript strict: si se actualiza el type del Map pero se olvida actualizar la fila seed,
el compilador falla en la inicialización — el plan invariant AC-3 existe exactamente para
forzar al implementer a no olvidarlo.
