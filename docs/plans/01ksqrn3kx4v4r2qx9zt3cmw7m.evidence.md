---
plan_id: 01ksqrn3kx4v4r2qx9zt3cmw7m
status: shipped
shipped_at: 2026-05-28T15:22:00Z
diff_hash: simulated-b8c9d0e1
reviewer_verdict: APPROVED
ship_cycles: 1
type: triage
---

## Test de regresión
- Pre-fix status: FAIL (esperado)
- Post-fix status: PASS

## Checks corridos
- ✅ Regression test passes: `should_return_409_when_email_already_exists`
- ✅ Tests existentes pasan: 9 existing + 1 regression = 10 total
- ✅ Typecheck clean
- ✅ Lint clean en write_set
- ✅ State consistency: write_set match diff (src/db/users.ts ✓, src/routes/users.ts ✓, test/users-duplicate.test.ts añadido)
- ✅ Reviewer: APPROVED

## Root cause
`createUser` en `src/db/users.ts` usaba `DB.set(email, user)` sin comprobar si la clave ya
existía. El `Map.set` sobreescribe en silencio. Fix: añadir `if (DB.has(email)) throw new Error('duplicate')` antes del `set`.

## Untested regions
- Concurrent duplicate creation (race condition en Map in-memory — irrelevante en sim; en prod necesitaría transacción DB)

## Residual risks
- El check de duplicado depende de la comparación exacta de string. Emails case-insensitive
  (`Ada@example.com` vs `ada@example.com`) no se normalizan → not in scope para este fix, ticket separado.

## Diff stat
```
 src/db/users.ts             |  2 ++
 src/routes/users.ts         |  3 ++-
 test/users-duplicate.test.ts| 11 +++++++++++
 3 files changed, 15 insertions(+), 1 change
```
