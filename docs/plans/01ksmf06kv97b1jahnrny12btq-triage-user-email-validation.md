---
id: 01ksmf06kv97b1jahnrny12btq
parent: null
status: shipped
shipped_at: 2026-05-27T10:30:00Z
evidence: 01ksmf06kv97b1jahnrny12btq.evidence.md
intent: "Fix: /users/:email devuelve 404 para emails inválidos, debería 400"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - src/db/users.ts
write_set:
  - src/routes/users.ts
  - test/users-validation.test.ts
invariants:
  - "Tests existentes en test/users.test.ts siguen pasando"
  - "Test de regresión añadido pasa post-fix"
  - "GET /users/<email-válido-existente> sigue devolviendo 200"
validation_commands:
  - "npm test -- --testPathPattern=users-validation"
  - "npm test"
  - "npm run typecheck"
rollback:
  - "git revert <commit> o git checkout HEAD -- src/routes/users.ts test/users-validation.test.ts"
estimated_size: XS
risk: bajo
created_at: 2026-05-27T10:25:00Z
---

# Triage — Email validation en GET /users/:email

## Bug

GET /users/notanemail devuelve 404 ('not found') en vez de 400 ('invalid email format'). Síntoma: cliente no puede distinguir entre "usuario inexistente" y "email mal formado", complica debugging.

## Test de regresión (añadido pre-fix)

- Path: `test/users-validation.test.ts`
- Nombre: `should_return_400_when_email_format_invalid`
- Estado actual: **FAIL** (esperado — el bug existe)

## Fix planeado

1. En `src/routes/users.ts`, antes de llamar `findUserByEmail`, validar con regex básico: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
2. Si falla → `res.status(400).json({ error: 'invalid email format' })`
3. Si pasa → continuar con flujo normal

## Rollback

`git checkout HEAD -- src/routes/users.ts test/users-validation.test.ts`
