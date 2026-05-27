---
id: 01kszspk4r2x5v7n3qz8tm6zw1
parent: 01kszf8mn2k0nm4yp6xy7bvq5t
status: shipped
shipped_at: 2026-06-01T15:05:00Z
evidence: 01kszspk4r2x5v7n3qz8tm6zw1.evidence.md
intent: "Triage: PATCH /users/:email con name vacío ('') retorna 500 en vez de 400"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - test/users-update.test.ts
write_set:
  - test/users-update-validation.test.ts
  - src/routes/users.ts
invariants:
  - "PATCH con name='' → 400 (no 500)"
  - "PATCH con name válido sigue devolviendo 200"
  - "Tests existentes (21) siguen pasando"
validation_commands:
  - "npm test -- --testPathPattern=users-update-validation"
  - "npm test"
  - "npm run typecheck"
rollback:
  - "git checkout HEAD -- src/routes/users.ts"
  - "git rm test/users-update-validation.test.ts"
estimated_size: XS
risk: bajo
created_at: 2026-06-01T14:30:00Z
---

# Triage: PATCH empty name retorna 500 en vez de 400

## Bug

El evidence bundle de `01kszf8mn2k0nm4yp6xy7bvq5t` anotó que `""` (string vacío)
pasa el guard `if (!name)` porque `!""` es `true` en JavaScript — correcto. Pero el
evidence también señaló que `"   "` (solo espacios) es truthy, así que `!name` lo
deja pasar. Actualmente el handler llama `updateUser(email, "   ")` sin error,
guardando un nombre de solo espacios. No hay 500 en este path — el bug es que
`"   "` debería devolver 400 pero devuelve 200.

Bug reportado: `PATCH /users/:email` con `{ name: "   " }` → 200 (debería ser 400).

## Regresión-first

1. Escribir test en `test/users-update-validation.test.ts` que falle con el código actual
2. Arreglar `src/routes/users.ts` — cambiar `if (!name)` por `if (!name?.trim())`
3. Verificar que el test pasa y el suite completo sigue verde

## Fix

En `src/routes/users.ts`, handler de `PATCH /:email`:

```
// antes
if (!name) return res.status(400).json({ error: 'name required' });

// después
if (!name?.trim()) return res.status(400).json({ error: 'name required' });
```

Guardar el nombre trimmed: `updateUser(email, name.trim())` — evita nombres con
espacios líderes/traileros en la DB.
