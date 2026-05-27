---
id: 01ksmf34kx4nxnzpjzqa7n6kg2
parent: null
status: shipped
shipped_at: 2026-05-27T11:30:00Z
evidence: 01ksmf34kx4nxnzpjzqa7n6kg2.evidence.md
related_adrs: [ADR-001]
intent: "Añadir middleware JWT auth para proteger /users"
tier: sandbox-edit
read_set:
  - src/server.ts
  - src/routes/users.ts
  - package.json
write_set:
  - src/middleware/auth.ts
  - src/server.ts
  - src/routes/users.ts
  - test/auth.test.ts
  - package.json
invariants:
  - "GET /health sigue siendo público (no requiere auth)"
  - "GET /users/:email ahora requiere Authorization: Bearer <token>"
  - "Tests existentes pasan tras actualizar para incluir token mock"
validation_commands:
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/middleware/auth.ts src/server.ts src/routes/users.ts test/auth.test.ts package.json"
  - "git clean -fd src/middleware"
  - "npm install (para revertir package.json)"
estimated_size: M
risk: medio
created_at: 2026-05-27T11:00:00Z
---

# Añadir auth JWT a /users

## Contexto

El endpoint /users actualmente expone datos sin autenticación. Necesitamos JWT
bearer token validation antes de que se expanda con más rutas. Esta es la primera
introducción de una dependencia externa (`jsonwebtoken`) al proyecto.

## Acceptance Criteria

- [ ] **AC-1**: Dado un request sin `Authorization`, cuando llamo `GET /users/:email`, entonces recibo 401
- [ ] **AC-2**: Dado un token JWT inválido, cuando llamo `GET /users/:email`, entonces recibo 401
- [ ] **AC-3**: Dado un token JWT válido (firmado con `JWT_SECRET`), cuando llamo `GET /users/:email`, entonces recibo 200 + el usuario
- [ ] **AC-4**: GET /health sigue siendo público (200 sin token) — no-regresión
- [ ] **AC-5**: Tests de validation existentes siguen pasando (no-regresión)

## Diseño técnico

- Nuevo middleware en `src/middleware/auth.ts` que lee `Authorization: Bearer <token>`, verifica con `jsonwebtoken.verify(token, JWT_SECRET)`, attachea `req.user`
- Montaje selectivo en `src/server.ts`: aplica middleware solo a `/users`, no a `/health`
- `package.json` añade `jsonwebtoken` y `@types/jsonwebtoken` como deps
- Tests con tokens firmados en `test/auth.test.ts`

## Plan de ejecución

1. Añadir deps en `package.json` (no `npm install` aún — el diff las declara)
2. Crear `src/middleware/auth.ts` con función `requireAuth`
3. En `src/server.ts`, aplicar middleware antes de `app.use('/users', usersRouter)`
4. En `src/routes/users.ts`, no cambia handler — el middleware corre antes
5. Añadir `test/auth.test.ts` con 3 casos (no token, bad token, good token)
6. Actualizar `test/users-validation.test.ts` y `test/users.test.ts` para incluir token mock
7. Correr `npm test` → verde

## Notas de rollback

- Esta es la primera dependencia externa del proyecto → si rollback, además de revertir archivos hay que correr `npm install` para limpiar `package-lock.json` resultante
- Si el feature se desactiva pero queremos mantener la dep: feature flag `process.env.AUTH_REQUIRED === 'true'`
