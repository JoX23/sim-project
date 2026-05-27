---
id: 01ksvejh4m2k0nm8yp6xy7bvq3r
parent: 01ksqe7jh8f2ry4tw896gzcz2k
status: shipped
shipped_at: 2026-05-30T10:08:00Z
evidence: 01ksvejh4m2k0nm8yp6xy7bvq3r.evidence.md
intent: "Agregar DELETE /users/:email para eliminar un usuario"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - src/db/users.ts
write_set:
  - src/routes/users.ts
  - src/db/users.ts
  - test/users-delete.test.ts
invariants:
  - "GET /users/:email sigue devolviendo 200 para usuarios existentes"
  - "DELETE sobre email inexistente devuelve 404"
  - "Tests existentes (12) siguen pasando"
validation_commands:
  - "npm test -- --testPathPattern=users-delete"
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/routes/users.ts src/db/users.ts"
  - "git rm test/users-delete.test.ts"
estimated_size: XS
risk: bajo
created_at: 2026-05-30T09:15:00Z
---

# Agregar DELETE /users/:email

## Contexto

Con `POST /users` funcional, los usuarios necesitan poder eliminarse. Sin un endpoint
de borrado, los datos crecen indefinidamente en el stub (y en prod). Es el complemento
natural del CRUD iniciado en el plan `01ksqe7jh8f2ry4tw896gzcz2k`.

## Acceptance Criteria

- [ ] **AC-1**: `DELETE /users/:email` con email existente → 204 No Content
- [ ] **AC-2**: `DELETE /users/:email` con email inexistente → 404
- [ ] **AC-3**: `DELETE /users/:email` con email en formato inválido → 400
- [ ] **AC-4**: Sin JWT válido → 401 (auth middleware ya cubre esto)
- [ ] **AC-5**: `GET /users/:email` tras el DELETE → 404 (registro eliminado)

## Diseño técnico

- `src/db/users.ts`: añadir `deleteUser(email)` que llama `DB.delete()` y devuelve `boolean`
  (true si existía, false si no)
- `src/routes/users.ts`: añadir `DELETE /:email` con validación de formato + llamada a `deleteUser`
- Respuesta 204 (sin body) en success, consistente con REST semántico

## Plan de ejecución

1. Leer `src/db/users.ts` — confirmar estructura del Map
2. Añadir `deleteUser(email: string): Promise<boolean>`
3. En `src/routes/users.ts`, añadir handler `DELETE /:email` reutilizando `EMAIL_RE`
4. Añadir `test/users-delete.test.ts` cubriendo AC-1, AC-2, AC-3
5. Ejecutar `npm test` → verde (13 tests)

## Notas de rollback

Cambio aditivo en DB y router. El Map.delete() es atómico en Node.js single-thread.
