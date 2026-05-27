---
id: 01ksqe7jh8f2ry4tw896gzcz2k
parent: null
status: shipped
shipped_at: 2026-05-28T09:47:00Z
evidence: 01ksqe7jh8f2ry4tw896gzcz2k.evidence.md
intent: "Agregar POST /users para crear usuarios vía API"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - src/db/users.ts
  - src/server.ts
write_set:
  - src/routes/users.ts
  - src/db/users.ts
  - test/users-create.test.ts
invariants:
  - "GET /health sigue siendo público y devuelve 200"
  - "GET /users/:email sigue requiriendo JWT y devuelve usuario o 404/400"
  - "Tests existentes (7) siguen pasando"
validation_commands:
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/routes/users.ts src/db/users.ts"
  - "git rm test/users-create.test.ts"
estimated_size: S
risk: bajo
created_at: 2026-05-28T09:00:00Z
---

# Agregar POST /users

## Contexto

Ahora que el endpoint `GET /users/:email` está protegido por JWT (ADR-001), el siguiente
paso natural es añadir creación de usuarios vía `POST /users`. Sin esta ruta, los usuarios
solo se pueden añadir directamente en el stub DB (`src/db/users.ts`), lo cual no es viable
para integración real.

## Acceptance Criteria

- [ ] **AC-1**: Dado body `{ email, name }` válido + JWT válido, cuando `POST /users`, entonces recibo 201 + el usuario creado
- [ ] **AC-2**: Dado body sin `email` o sin `name`, cuando `POST /users`, entonces recibo 400 `{ error: 'email and name required' }`
- [ ] **AC-3**: Dado body con `email` en formato inválido, cuando `POST /users`, entonces recibo 400 `{ error: 'invalid email format' }`
- [ ] **AC-4**: `GET /health` y `GET /users/:email` siguen funcionando sin regresión

## Diseño técnico

- `src/db/users.ts`: añadir función `createUser(email, name)` que escribe en el Map y devuelve el usuario
- `src/routes/users.ts`: añadir `usersRouter.post('/')` con validación de body antes de llamar `createUser`
- El middleware `requireAuth` ya aplica a todo el prefijo `/users`, no hay que tocar `server.ts`
- Sin persistencia real — el Map es in-memory, se resetea al reiniciar

## Plan de ejecución

1. Leer `src/db/users.ts` (mode=full) — entender estructura del Map
2. Añadir `createUser(email: string, name: string)` a `src/db/users.ts`
3. En `src/routes/users.ts`, importar `createUser` y añadir handler `POST /`
4. Añadir `test/users-create.test.ts` cubriendo AC-1, AC-2, AC-3
5. Ejecutar `npm test` → verde (8 tests total)

## Notas de rollback

Cambio aditivo — ninguna función existente se modifica. Rollback con `git checkout` en
ambos archivos fuente y `git rm` del nuevo test.
