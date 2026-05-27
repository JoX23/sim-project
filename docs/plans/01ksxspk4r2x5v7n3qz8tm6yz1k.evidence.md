---
plan_id: 01ksxspk4r2x5v7n3qz8tm6yz1k
status: shipped
shipped_at: 2026-05-31T16:30:00Z
diff_hash: simulated-t3u4v5w6
reviewer_verdict: APPROVED
ship_cycles: 1
type: feature
---

## Checks corridos
- ✅ Tests passed: 17 (16 existing + 1 new en users-created-at.test.ts)
- ✅ Lint clean en write_set
- ✅ Typecheck clean — tipo del Map actualizado, TypeScript infiere el nuevo campo en todos los callers
- ✅ State consistency: write_set match diff ✓ (solo src/db/users.ts y test nuevo — routes no cambiaron porque propagan el objeto opaco)
- ✅ Reviewer: APPROVED

## Verificación de invariants
- AC-2: seed `ada@example.com` tiene `createdAt: '2026-05-27T00:00:00.000Z'` — verificado en test
- AC-5: `npm run typecheck` clean en 0 errores — el cambio de tipo propagó correctamente

## Untested regions
- AC-3 (lista con createdAt en cada item): no hay test que llame `listUsers` y verifique
  el campo en los objetos. Cubierto implícitamente por AC-4 (findUserByEmail) pero un
  test explícito de GET /users sería más robusto.

## Residual risks
- `new Date().toISOString()` usa el timezone del servidor. En multi-region, todos los
  servidores deben estar en UTC. No configurable en este stub, aceptable.
- Los tests existentes (`test/users.test.ts`) hacen `toEqual` sobre el objeto de usuario
  → ahora el objeto tiene `createdAt`, pero los tests solo verifican `not.toBeNull()`
  y no el shape completo → no rompieron. Si usaran `toStrictEqual({ email, name })` sin
  `createdAt`, habrían fallado — ilustra el valor de tests con shape explícito.

## Lecciones
- Cambios de tipo en el DB layer se propagan gratis a los endpoints si los routers
  pasan el objeto opaco (no lo desestructuran). El plan acertó en no incluir routes en
  el write_set — reviewer lo validó revisando que no era necesario.

## Diff stat
```
 src/db/users.ts             |  6 ++++--
 test/users-created-at.test.ts | 16 ++++++++++++++++
 2 files changed, 20 insertions(+), 2 changes
```
