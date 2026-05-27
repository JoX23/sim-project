---
id: 01kt1f8mn2k0nm4yp6xy7bvq6u
parent: 01kszf8mn2k0nm4yp6xy7bvq5t
status: shipped
shipped_at: 2026-06-02T11:45:00Z
evidence: 01kt1f8mn2k0nm4yp6xy7bvq6u.evidence.md
intent: "Agregar GET /users/search?name= para buscar usuarios por nombre (substring, case-insensitive)"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - src/db/users.ts
write_set:
  - src/routes/users.ts
  - test/users-search.test.ts
invariants:
  - "GET /users (lista paginada) no se ve afectado"
  - "Búsqueda es case-insensitive"
  - "Query vacío retorna TODOS los usuarios (no error)"
  - "Tests existentes (25) siguen pasando"
validation_commands:
  - "npm test -- --testPathPattern=users-search"
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/routes/users.ts"
  - "git rm test/users-search.test.ts"
estimated_size: XS
risk: bajo
created_at: 2026-06-02T09:00:00Z
---

# Agregar GET /users/search?name= (búsqueda por nombre)

## Contexto

La lista paginada (`GET /users`) devuelve todos los usuarios. Con la base creciendo,
se necesita búsqueda por nombre para UIs de administración. La búsqueda substring
case-insensitive es el patrón más simple y suficiente para este stub.

`searchUsers` ya fue añadido a `src/db/users.ts` en el día 6 junto con `updateUser`.
Solo falta el endpoint HTTP.

## Acceptance Criteria

- [ ] **AC-1**: `GET /users/search?name=ada` → array con usuarios cuyo nombre contiene "ada"
- [ ] **AC-2**: búsqueda case-insensitive → `?name=ADA` devuelve lo mismo que `?name=ada`
- [ ] **AC-3**: `?name=` (query vacío) → todos los usuarios (no error 400)
- [ ] **AC-4**: sin query param `name` → 400 (param requerido)
- [ ] **AC-5**: sin JWT → 401 (middleware)

## Diseño técnico

- Nueva ruta `GET /search` en `usersRouter` (antes de `GET /:email` para evitar que
  Express interprete "search" como un email param)
- Usa `searchUsers(nameQuery)` del db layer (ya implementado)
- AC-3: query vacío `""` → devolver todos → `searchUsers("")` con `includes("")` = true
  para todos → correcto por construcción

## Nota de orden de rutas

La ruta `GET /search` debe declararse ANTES de `GET /:email`, o Express intrepretará
`/users/search` como `{ email: "search" }` y fallará la validación de EMAIL_RE.

## Plan de ejecución

1. En `src/routes/users.ts`, añadir `GET /search` antes de `GET /:email`
2. Añadir `test/users-search.test.ts` cubriendo AC-1..AC-4
3. Ejecutar `npm test` → verde (26 tests)
