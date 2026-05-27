---
id: 01ksxspk4r2x5v7n3qz8tm6yz1k
parent: null
status: shipped
shipped_at: 2026-05-31T16:30:00Z
evidence: 01ksxspk4r2x5v7n3qz8tm6yz1k.evidence.md
intent: "Añadir campo createdAt ISO-8601 al tipo User en toda la API"
tier: sandbox-edit
read_set:
  - src/db/users.ts
  - src/routes/users.ts
  - test/users.test.ts
write_set:
  - src/db/users.ts
  - test/users-created-at.test.ts
invariants:
  - "Todos los usuarios nuevos tienen createdAt como ISO-8601 string"
  - "El usuario seed ada@example.com tiene createdAt fijo (no undefined)"
  - "Tests existentes (16) siguen pasando"
  - "GET /users devuelve createdAt en cada objeto de la lista"
validation_commands:
  - "npm test -- --testPathPattern=users-created-at"
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/db/users.ts"
  - "git rm test/users-created-at.test.ts"
estimated_size: S
risk: bajo
created_at: 2026-05-31T14:00:00Z
---

# Añadir campo createdAt al tipo User

## Contexto

Los clientes necesitan saber cuándo se creó cada usuario para ordenar por antigüedad
y para auditoría. El campo `createdAt` es una extensión de datos (no un cambio de
comportamiento), pero toca el tipo central del sistema y el usuario seed.

Este plan es representativo de cambios "migration-style" en proyectos con DB in-memory:
no hay una migración SQL, pero hay que actualizar los datos estáticos seed y el código
de creación.

## Acceptance Criteria

- [ ] **AC-1**: `POST /users` devuelve `{ email, name, createdAt }` con `createdAt` en ISO-8601
- [ ] **AC-2**: El usuario seed `ada@example.com` tiene `createdAt: '2026-05-27T00:00:00.000Z'`
  (fecha histórica, no el momento del inicio del proceso)
- [ ] **AC-3**: `GET /users` devuelve objetos con `createdAt` en todos los items de `users[]`
- [ ] **AC-4**: `findUserByEmail` devuelve el objeto completo con `createdAt`
- [ ] **AC-5**: TypeScript compila sin errores — el tipo se actualiza en `src/db/users.ts`

## Diseño técnico

- Cambio de tipo en `src/db/users.ts`: `{ email, name }` → `{ email, name, createdAt: string }`
- Inicialización del Map: añadir `createdAt: '2026-05-27T00:00:00.000Z'` al seed
- `createUser`: añadir `createdAt: new Date().toISOString()` al objeto antes de `DB.set`
- No hay cambios en routes — el router ya propaga el objeto completo del DB layer

## Plan de ejecución

1. Leer `src/db/users.ts` — confirmar estructura del Map y firmas de funciones
2. Actualizar el tipo del Map y el usuario seed con `createdAt` fijo
3. En `createUser`, añadir `createdAt: new Date().toISOString()`
4. Añadir `test/users-created-at.test.ts` cubriendo AC-1, AC-2, AC-4
5. Ejecutar `npm test` → verde (17 tests); `npm run typecheck` → clean
