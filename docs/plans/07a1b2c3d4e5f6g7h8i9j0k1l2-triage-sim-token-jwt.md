---
id: 07a1b2c3d4e5f6g7h8i9j0k1l2
parent: 06f742nh45ej7hatx4pgpr13zd
status: shipped
shipped_at: "2026-05-28T23:25:00Z"
evidence: 07a1b2c3d4e5f6g7h8i9j0k1l2.evidence.md
intent: "Fix tokens sim-token-* por jwt.sign() en 3 archivos de test"
tier: sandbox-edit
read_set:
  - test/users-search.test.ts
  - test/users-list-sort.test.ts
  - test/users-list-created-at.test.ts
write_set:
  - test/users-search.test.ts
  - test/users-list-sort.test.ts
  - test/users-list-created-at.test.ts
invariants:
  - "Los 11 tests de los 3 archivos pasan post-fix"
  - "La suite completa no introduce regresiones"
  - "src/middleware/auth.ts no se modifica"
validation_commands:
  - "node_modules/.bin/jest test/users-search.test.ts test/users-list-sort.test.ts test/users-list-created-at.test.ts"
  - "node_modules/.bin/jest"
rollback:
  - "git checkout HEAD -- test/users-search.test.ts test/users-list-sort.test.ts test/users-list-created-at.test.ts"
estimated_size: XS
risk: bajo
created_at: "2026-05-28T23:20:00Z"
behavioral_hypothesis: null
---

## Bug

3 archivos de test usan `sim-token-*` (ej. `Bearer sim-token-ada@example.com`) que no son JWTs válidos. `jwt.verify()` en `requireAuth` lanza → response 401 en lugar del status esperado por cada test.

## Test de regresión (ya presentes pre-fix)

Los 11 tests existentes en los 3 archivos SON el test de regresión:
- test/users-search.test.ts (4 tests) — estado actual: FAIL
- test/users-list-sort.test.ts (4 tests) — estado actual: FAIL
- test/users-list-created-at.test.ts (3 tests) — estado actual: FAIL

## Fix planeado

En cada archivo, reemplazar:
```typescript
const AUTH = { Authorization: 'Bearer sim-token-ada@example.com' };
```
por:
```typescript
import jwt from 'jsonwebtoken';
const SECRET = 'dev-only-not-for-prod';
const AUTH = { Authorization: `Bearer ${jwt.sign({ sub: 'ada', email: 'ada@example.com' }, SECRET)}` };
```
Patrón idéntico al aplicado en PR #2 para users-update.test.ts.

## Rollback

`git checkout HEAD -- test/users-search.test.ts test/users-list-sort.test.ts test/users-list-created-at.test.ts`
