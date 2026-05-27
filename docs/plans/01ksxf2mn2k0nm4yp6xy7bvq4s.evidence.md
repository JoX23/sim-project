---
plan_id: 01ksxf2mn2k0nm4yp6xy7bvq4s
status: shipped
shipped_at: 2026-05-31T10:42:00Z
diff_hash: simulated-p9q0r1s2
reviewer_verdict: APPROVED
ship_cycles: 1
type: triage
severity: security
---

## Test de regresión
- Pre-fix status: FAIL (esperado)
- Post-fix status: PASS

## Checks corridos
- ✅ Regression test passes: `should_return_403_when_deleting_another_user`
- ✅ No-regresión AC-1: DELETE con JWT propio sigue devolviendo 204
- ✅ Tests existentes pasan: 15 existing + 1 regression = 16 total
- ✅ Typecheck clean — `req.user?.email` está tipado por `AuthedRequest`
- ✅ Lint clean en write_set
- ✅ State consistency: write_set match diff ✓
- ✅ Reviewer: APPROVED

## Root cause
El plan original de DELETE (`01ksvejh4m2k0nm8yp6xy7bvq3r`) no incluía un AC de
ownership. La evidence lo marcó como `(info)` pero el reviewer no lo escaló a blocker.
**Lección: cualquier endpoint de mutación de datos de usuario requiere un invariant
explícito de ownership en el plan, no dejarlo como info.**

## Untested regions
- Un admin token que debería poder borrar a cualquier usuario (rol `admin` no existe aún
  en el sistema). El fix actual bloquea también ese caso futuro — acceptable por ahora.

## Residual risks
- La comparación `req.user?.email !== email` es case-sensitive. Si el token tiene
  `Ada@example.com` pero el DB almacena `ada@example.com`, la guardia deniega
  innecesariamente. Relacionado con el ticket pendiente de normalización de emails.

## Impacto en otros endpoints
- `GET /users/me` ya tenía la guardia de `email` claim y no expone datos de otros — no afectado.
- `POST /users`, `GET /users`, `GET /users/:email` no son operaciones de ownership — no afectados.

## Diff stat
```
 src/routes/users.ts                 |  3 +++
 test/users-delete-ownership.test.ts | 14 ++++++++++++++
 2 files changed, 17 insertions(+)
```
