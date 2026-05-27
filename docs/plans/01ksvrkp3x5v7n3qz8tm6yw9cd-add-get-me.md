---
id: 01ksvrkp3x5v7n3qz8tm6yw9cd
parent: 01ksmf34kx4nxnzpjzqa7n6kg2
status: shipped
shipped_at: 2026-05-30T16:55:00Z
evidence: 01ksvrkp3x5v7n3qz8tm6yw9cd.evidence.md
intent: "Agregar GET /users/me que devuelve el usuario del token JWT actual"
tier: sandbox-edit
read_set:
  - src/middleware/auth.ts
  - src/routes/users.ts
  - src/db/users.ts
write_set:
  - src/routes/users.ts
  - test/users-me.test.ts
invariants:
  - "GET /users/:email sigue funcionando (no colisión con /me)"
  - "GET /users/me sin JWT → 401 (middleware ya cubre)"
  - "Tests existentes (13) siguen pasando"
validation_commands:
  - "npm test -- --testPathPattern=users-me"
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/routes/users.ts"
  - "git rm test/users-me.test.ts"
estimated_size: S
risk: bajo
created_at: 2026-05-30T14:00:00Z
---

# Agregar GET /users/me

## Contexto

Ahora que `requireAuth` attachea `req.user = { sub, email? }` (ADR-001), los clientes
pueden obtener su propio perfil sin conocer su email exacto — solo necesitan su JWT.
`GET /users/me` lee `req.user.email` del token y delega en `findUserByEmail`.

Este endpoint es el patrón estándar en APIs REST con autenticación por token.

## Acceptance Criteria

- [ ] **AC-1**: Con JWT que incluye claim `email` válido → 200 + el usuario del DB
- [ ] **AC-2**: Con JWT que **no** incluye claim `email` → 400 `{ error: 'token missing email claim' }`
- [ ] **AC-3**: Con JWT con `email` no registrado en DB → 404
- [ ] **AC-4**: Ruta `/me` registrada **antes** de `/:email` para evitar que Express la capture como parámetro
- [ ] **AC-5**: `GET /users/:email` sigue funcionando sin regresión

## Diseño técnico

- El tipo `AuthedRequest` de `src/middleware/auth.ts` ya expone `req.user?: { sub, email? }`
- Guardia explícita: `if (!req.user?.email) return res.status(400)...`
- Registro de ruta en primer lugar del router para garantizar AC-4

## Plan de ejecución

1. Leer `src/middleware/auth.ts` — confirmar tipo `AuthedRequest` y campo `email?`
2. En `src/routes/users.ts`, importar `AuthedRequest` y añadir `GET /me` como **primera ruta**
3. Handler: guardia de `email`, lookup, 404 si no existe, 200 con usuario
4. Añadir `test/users-me.test.ts` cubriendo AC-1, AC-2, AC-3
5. Ejecutar `npm test` → verde (14 tests)
