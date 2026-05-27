---
id: 01kt7f8mn2k0nm4yp6xy7bvq9x
parent: 01kt5f8mn2k0nm4yp6xy7bvq8w
status: shipped
intent: "Añadir ?sort=name|createdAt y ?order=asc|desc a GET /users"
tier: sandbox-edit
read_set:
  - src/db/users.ts
  - src/routes/users.ts
  - test/users-list-pagination-meta.test.ts
write_set:
  - src/db/users.ts
  - src/routes/users.ts
  - test/users-list-sort.test.ts
invariants:
  - "Sin sort/order inválido devuelve 400 (ver AC-4/AC-5 — decisión: silent fallback)"
  - "sort y order reflejados en la respuesta JSON para trazabilidad"
  - "No rompe tests existentes de paginación ni lista"
validation_commands:
  - "npm test -- --testPathPattern=users-list-sort"
  - "npm test -- --testPathPattern=users-list"
  - "npm run typecheck"
rollback:
  - "git checkout HEAD -- src/db/users.ts src/routes/users.ts"
  - "git rm test/users-list-sort.test.ts"
estimated_size: S
risk: bajo
created_at: 2026-06-04T09:15:00Z
reviewer_verdict: APPROVED
---

# Añadir sort/order a GET /users

## Contexto

Los usuarios solicitan poder ordenar la lista de usuarios por nombre o fecha de creación. Actualmente `GET /users` devuelve los usuarios en orden de inserción (Map iteration order). Se añaden dos query params opcionales: `?sort=name|createdAt` y `?order=asc|desc`.

## Decisión de diseño

**Silent fallback vs 400 para valores inválidos**: se optó por fallback silencioso (`sort` inválido → `createdAt`, `order` inválido → `asc`) para no romper clientes existentes que pasan params desconocidos. Esta decisión es observable en AC-4/AC-5 y queda registrada en el evidence.

**Nota de follow-up**: el reviewer marcó esta decisión como `info` — es inconsistente con el patrón de `page`/`limit` que también hace silent clipping. Consistencia aceptable, no blocker.

## Acceptance Criteria

- [x] AC-1: `?sort=name&order=asc` devuelve usuarios ordenados por name asc
- [x] AC-2: `?sort=name&order=desc` devuelve usuarios ordenados por name desc
- [x] AC-3: `?sort=createdAt&order=desc` devuelve más recientes primero
- [x] AC-4: valor `sort` inválido hace fallback a `createdAt` (sin 400)
- [x] AC-5: valor `order` inválido hace fallback a `asc` (sin 400)

## Cambios

- `src/db/users.ts`: `listUsers` acepta `sort` y `order` params, ordena el array antes de paginar, refleja `sort`/`order` en respuesta
- `src/routes/users.ts`: parsea `?sort` y `?order`, normaliza a valores permitidos, pasa a `listUsers`
- `test/users-list-sort.test.ts`: 5 tests cubriendo los ACs
