---
id: 01kssspk4r2x5v7n3qz8tm6yw9
parent: 01ksqe7jh8f2ry4tw896gzcz2k
status: shipped
shipped_at: 2026-05-29T16:40:00Z
evidence: 01kssspk4r2x5v7n3qz8tm6yw9.evidence.md
intent: "Agregar GET /users con paginación por page y limit"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - src/db/users.ts
write_set:
  - src/routes/users.ts
  - src/db/users.ts
  - test/users-list.test.ts
invariants:
  - "GET /users/:email sigue funcionando (ruta existente no colisiona con GET /)"
  - "POST /users sigue devolviendo 201 para emails nuevos"
  - "Tests existentes (11) siguen pasando"
validation_commands:
  - "npm test -- --testPathPattern=users-list"
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/routes/users.ts src/db/users.ts"
  - "git rm test/users-list.test.ts"
estimated_size: S
risk: bajo
created_at: 2026-05-29T14:00:00Z
---

# Agregar GET /users — listado con paginación

## Contexto

Con `POST /users` funcional (plan `01ksqe7jh8f2ry4tw896gzcz2k`), el siguiente paso
lógico es poder listar los usuarios. Sin un endpoint de listado, no hay forma de
verificar qué usuarios existen sin conocer su email exacto.

Se añade paginación desde el primer día para evitar refactors costosos cuando el
stub DB crezca.

## Acceptance Criteria

- [ ] **AC-1**: `GET /users?page=1&limit=20` devuelve `{ users: [...], total: N }` con status 200
- [ ] **AC-2**: La respuesta incluye `total` (conteo de todos los usuarios, no solo de la página)
- [ ] **AC-3**: `page` y `limit` tienen defaults: `page=1`, `limit=20`, máximo `limit=100`
- [ ] **AC-4**: `GET /users/:email` sigue funcionando sin colisión (Express evalúa rutas en orden de registro)
- [ ] **AC-5**: Sin JWT válido → 401 (auth middleware aplica a todo `/users`)

## Diseño técnico

- `src/db/users.ts`: añadir `listUsers(page, limit)` que devuelve `{ users, total }`
- `src/routes/users.ts`: añadir `GET /` **antes** del handler `GET /:email` (orden importa en Express)
- `page` y `limit` se leen de `req.query`, se sanitizan con `Math.max/min` y `Number()`

## Plan de ejecución

1. Leer `src/db/users.ts` (mode=full) — entender estructura del Map
2. Añadir `listUsers(page: number, limit: number)` que retorna `{ users: [...], total: number }`
3. En `src/routes/users.ts`, añadir `GET /` **al inicio** del router (antes de `GET /:email`)
4. Añadir `test/users-list.test.ts` cubriendo AC-1, AC-2, AC-3
5. Ejecutar `npm test` → verde (12 tests)

## Notas de rollback

Cambio aditivo en DB y router. El único riesgo de colisión es el orden de rutas en Express.
Si `GET /` se registra después de `GET /:email`, `''` podría no matchear — verificar con test.
