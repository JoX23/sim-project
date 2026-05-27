---
id: 01ksxf2mn2k0nm4yp6xy7bvq4s
parent: 01ksvejh4m2k0nm8yp6xy7bvq3r
status: shipped
shipped_at: 2026-05-31T10:42:00Z
evidence: 01ksxf2mn2k0nm4yp6xy7bvq4s.evidence.md
intent: "Fix seguridad: DELETE /users/:email debe devolver 403 si el JWT no es del mismo usuario"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - src/middleware/auth.ts
write_set:
  - src/routes/users.ts
  - test/users-delete-ownership.test.ts
invariants:
  - "Test de regresión should_return_403_when_deleting_another_user pasa post-fix"
  - "DELETE /users/<propio-email> con JWT correcto sigue devolviendo 204 (no-regresión AC-1)"
  - "Tests existentes (15) siguen pasando"
validation_commands:
  - "npm test -- --testPathPattern=users-delete-ownership"
  - "npm test"
  - "npm run typecheck"
rollback:
  - "git checkout HEAD -- src/routes/users.ts"
  - "git rm test/users-delete-ownership.test.ts"
estimated_size: XS
risk: medio
created_at: 2026-05-31T09:00:00Z
---

# Triage — DELETE /users/:email sin verificación de ownership

## Bug

`DELETE /users/victim@example.com` con un JWT válido de `attacker@example.com` devuelve
204 — borra al usuario víctima exitosamente. El middleware `requireAuth` solo verifica
que el token sea válido, no que corresponda al recurso solicitado.

Descubierto como `(info)` en la evidence de `01ksvejh4m2k0nm8yp6xy7bvq3r` y escalado
a **security bug** por QA. Clasificación: OWASP A01:2021 Broken Access Control.

## Reproducción

```
# Crear dos usuarios:
POST /users { email: "alice@x.com", name: "Alice" }   # JWT de alice
POST /users { email: "bob@x.com",   name: "Bob"   }   # JWT de alice también

# Bob borra a Alice — debería ser 403:
DELETE /users/alice@x.com   # Authorization: Bearer <jwt-de-bob>   → actualmente 204 ❌
```

## Test de regresión (añadido pre-fix)

- Path: `test/users-delete-ownership.test.ts`
- Nombre: `should_return_403_when_deleting_another_user`
- Estado actual: **FAIL** (esperado — la guardia no existe)

## Fix planeado

En `src/routes/users.ts`, handler `DELETE /:email`:
```typescript
if (req.user?.email !== email) {
  return res.status(403).json({ error: 'forbidden' });
}
```
Esta línea va **antes** del `deleteUser()` call, tras la validación de formato.

## Rollback

`git checkout HEAD -- src/routes/users.ts` + `git rm test/users-delete-ownership.test.ts`

## Severidad

Security bug — riesgo: medio (requiere JWT válido de otro usuario, no anónimo).
Priorizamos sobre cualquier feature pendiente.
