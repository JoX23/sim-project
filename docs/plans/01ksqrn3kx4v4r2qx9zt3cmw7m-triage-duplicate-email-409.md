---
id: 01ksqrn3kx4v4r2qx9zt3cmw7m
parent: 01ksqe7jh8f2ry4tw896gzcz2k
status: shipped
shipped_at: 2026-05-28T15:22:00Z
evidence: 01ksqrn3kx4v4r2qx9zt3cmw7m.evidence.md
intent: "Fix: POST /users con email duplicado devuelve 201 en lugar de 409"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - src/db/users.ts
write_set:
  - src/routes/users.ts
  - src/db/users.ts
  - test/users-duplicate.test.ts
invariants:
  - "Test de regresión should_return_409_when_email_already_exists pasa post-fix"
  - "POST /users con email nuevo sigue devolviendo 201 (no-regresión AC-1)"
  - "Tests existentes (9) siguen pasando"
validation_commands:
  - "npm test -- --testPathPattern=users-duplicate"
  - "npm test"
  - "npm run typecheck"
rollback:
  - "git checkout HEAD -- src/routes/users.ts src/db/users.ts"
  - "git rm test/users-duplicate.test.ts"
estimated_size: XS
risk: bajo
created_at: 2026-05-28T14:30:00Z
---

# Triage — POST /users devuelve 201 en email duplicado

## Bug

`POST /users` con un email que ya existe en la DB silenciosamente sobreescribe el registro
existente y devuelve `201 Created`. El cliente no puede distinguir entre "usuario creado" y
"usuario sobreescrito sin permiso". Violación del principio de idempotencia controlada: una
segunda creación debería ser 409 Conflict.

Detectado como **finding minor** en la evidence de `01ksqe7jh8f2ry4tw896gzcz2k`. Confirmado
manualmente llamando `POST /users` dos veces con `ada@example.com`.

## Test de regresión (añadido pre-fix)

- Path: `test/users-duplicate.test.ts`
- Nombre: `should_return_409_when_email_already_exists`
- Estado actual: **FAIL** (esperado — el bug existe: `createUser` no lanza en duplicado)

## Fix planeado

1. En `src/db/users.ts`: `createUser` verifica con `DB.has(email)` → si existe lanza `new Error('duplicate')`
2. En `src/routes/users.ts`: el handler `POST /` ya tiene el bloque `try/catch`. Añadir rama:
   `if (err.message === 'duplicate') return res.status(409).json({ error: 'email already exists' })`

## Rollback

`git checkout HEAD -- src/db/users.ts src/routes/users.ts` + `git rm test/users-duplicate.test.ts`
