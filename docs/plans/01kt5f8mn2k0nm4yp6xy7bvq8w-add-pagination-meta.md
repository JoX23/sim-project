---
ulid: 01kt5f8mn2k0nm4yp6xy7bvq8w
slug: add-pagination-meta
created_at: 2026-06-04T09:00:00Z
status: shipped
intent: Enriquecer respuesta de GET /users con metadata de paginación — page, limit, totalPages, hasNext
parent: null
read_set:
  - src/db/users.ts
  - src/routes/users.ts
  - test/users-list.test.ts
  - test/users-list-created-at.test.ts
write_set:
  - src/db/users.ts
  - test/users-list-pagination-meta.test.ts
invariants:
  - AC-1: GET /users response incluye page, limit, totalPages, hasNext junto a users y total
  - AC-2: totalPages = Math.max(1, Math.ceil(total / limit))
  - AC-3: hasNext = page < totalPages
  - AC-4: campos existentes (users, total) siguen presentes — backward compatible
  - AC-5: 0 tests existentes rotos
validation_commands:
  - npm test
rollback:
  - git checkout src/db/users.ts
  - rm -f test/users-list-pagination-meta.test.ts
---

## Contexto

Día 9 del sim-project F1. `GET /users` actualmente devuelve `{ users, total }`.
Los consumidores del API tienen que calcular `totalPages` y `hasNext` ellos mismos,
lo que genera lógica duplicada en cada cliente. Este plan añade los campos al response
sin breaking changes — los campos existentes permanecen.

## Acceptance Criteria

- **AC-1** Response de `GET /users` incluye `{ users, total, page, limit, totalPages, hasNext }`
- **AC-2** `totalPages = Math.max(1, Math.ceil(total / limit))` — mínimo 1 aunque DB vacía
- **AC-3** `hasNext = page < totalPages`
- **AC-4** `users` y `total` siguen presentes (backward compat con tests existentes)
- **AC-5** 0 tests existentes rotos

## Cambios planificados

| Archivo | Operación |
|---|---|
| `src/db/users.ts` | `listUsers()` retorna `page`, `limit`, `totalPages`, `hasNext` además de `users`, `total` |
| `test/users-list-pagination-meta.test.ts` | Nuevo file: 3 ACs (campos presentes, totalPages, hasNext en última página) |

## Nota de diseño

`listUsers(page, limit)` ya recibe `page` y `limit` como parámetros, por lo que
devolverlos en el response no requiere cambios en la firma — solo en el return object.
La ruta (`src/routes/users.ts`) hace `res.json(result)` directamente, sin cambios necesarios.
