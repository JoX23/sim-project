---
plan_id: 01ksmf34kx4nxnzpjzqa7n6kg2
status: shipped
shipped_at: 2026-05-27T11:30:00Z
diff_hash: simulated-c9d0e1f2
reviewer_verdict: APPROVED
ship_cycles: 2
type: feature
---

## Checks corridos
- ✅ Tests passed: 7 (3 existing + 3 auth + 1 health)
- ✅ Lint clean
- ✅ Typecheck clean
- ✅ State consistency: ⚠️ plan declared updating test/users-validation.test.ts y test/users.test.ts, pero esos tests **no requirieron cambio** (testean DB layer directo, desacoplado de middleware). Reviewer en ciclo 1 flageó write_set inflado → ciclo 2 corrigió plan y re-shipped.
- ✅ Reviewer: APPROVED en ciclo 2

## Untested regions
- Token refresh / expiration handling (out of scope para este plan; ticket separado)
- Race condition: token válido al middleware pero usuario eliminado entre middleware y handler

## Residual risks
- `JWT_SECRET = 'dev-only-not-for-prod'` fallback es peligroso si llega a prod sin override → runbook futuro de secrets rotation
- Sin blacklist de revocación

## Findings minor/info
- (minor) `AuthedRequest` interface podría moverse a un types file si crece
- (info) Considerar express-jwt en futuro para reducir custom code

## ADR
- ADR-001 creado documentando la decisión de jsonwebtoken vs alternativas

## Diff stat
```
 docs/architecture/adrs/ADR-001-introduce-jwt-auth.md | 32 ++++++++++
 src/middleware/auth.ts                               | 21 +++++++
 src/server.ts                                        |  2 +
 test/auth.test.ts                                    | 14 +++++
 package.json                                         |  3 +
 5 files changed, 72 insertions(+)
```
