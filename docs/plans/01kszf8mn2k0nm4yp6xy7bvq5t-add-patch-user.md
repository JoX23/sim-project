---
id: 01kszf8mn2k0nm4yp6xy7bvq5t
parent: 01ksvejh4m2k0nm8yp6xy7bvq3r
status: shipped
shipped_at: 2026-06-01T10:22:00Z
evidence: 01kszf8mn2k0nm4yp6xy7bvq5t.evidence.md
intent: "Agregar PATCH /users/:email para que un usuario actualice su propio nombre"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - src/db/users.ts
  - src/middleware/auth.ts
write_set:
  - src/routes/users.ts
  - src/db/users.ts
  - test/users-update.test.ts
invariants:
  - "Solo el propietario del JWT puede actualizar su propio usuario (403 si no coincide)"
  - "Solo name es mutable — email es inmutable (no aceptar email en body)"
  - "DELETE y GET existentes no se ven afectados"
  - "Tests existentes (17) siguen pasando"
validation_commands:
  - "npm test -- --testPathPattern=users-update"
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/routes/users.ts src/db/users.ts"
  - "git rm test/users-update.test.ts"
estimated_size: XS
risk: bajo
created_at: 2026-06-01T09:40:00Z
---

# Agregar PATCH /users/:email (update propio nombre)

## Contexto

Con DELETE y GET funcionales, falta el Update del CRUD. La restricción de ownership
(solo el JWT owner puede modificar) es análoga al DELETE implementado en el plan
`01ksvejh4m2k0nm8yp6xy7bvq3r` — se reutiliza el mismo patrón `req.user?.email !== email`.

Email es inmutable por diseño: cambiarlo rompería la PK del Map. Si se necesita en el
futuro, requiere un plan propio con migración de datos.

## Acceptance Criteria

- [ ] **AC-1**: `PATCH /users/:email` con JWT matching → 200 `{ email, name, createdAt }`
- [ ] **AC-2**: `PATCH /users/:email` con JWT no matching → 403
- [ ] **AC-3**: `PATCH /users/:email` con email inexistente → 404
- [ ] **AC-4**: `PATCH /users/:email` con formato de email inválido → 400
- [ ] **AC-5**: Body sin `name` → 400 (campo requerido)
- [ ] **AC-6**: Sin JWT válido → 401 (middleware ya cubre)

## Diseño técnico

- `src/db/users.ts`: `updateUser(email, name)` — lookup → merge → return updated; null si no existe
- `src/routes/users.ts`: `PATCH /:email` con validación format, ownership (403), null check (404)
- Body: `{ name: string }` — email del path, no del body

## Plan de ejecución

1. Leer `src/db/users.ts` — confirmar estructura del Map (incluye createdAt)
2. Añadir `updateUser(email: string, name: string): Promise<{...} | null>`
3. En `src/routes/users.ts`, añadir `PATCH /:email` reutilizando EMAIL_RE y patrón ownership
4. Añadir `test/users-update.test.ts` cubriendo AC-1..AC-5
5. Ejecutar `npm test` → verde (18 tests)

## Notas de rollback

Cambio aditivo — `updateUser` no modifica lógica existente del Map. El PATCH handler
no interfiere con rutas existentes (Express las registra en orden de declaración).
