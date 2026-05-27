# ADR-003 — User role model (enum: user | admin)

**Status**: Accepted  
**Date**: 2026-06-11  
**Deciders**: Jose Mariscal  
**Related plan**: 01ktcf2hb9e1ry6sw796gzcz4n

## Context

The sim-project API exposes user data without any authorization-level distinction. As the
feature set grows (future: admin-only list without auth, bulk delete, etc.) we need a role
field on the User model to gate future endpoints.

This is not a new npm dependency — no new packages are added. The ADR trigger is a
**data model change with authorization implications**: adding a discriminator field that
future middleware will branch on.

## Decision

Add `role: 'user' | 'admin'` (TypeScript union) to the `User` interface in `src/db/users.ts`.
Default value on `createUser` is `'user'`. The field is exposed in all user-facing responses
(GET /users, GET /users/:email, GET /me, POST /users).

No admin-specific endpoints are added in this plan. Role assignment is out of scope for now
(only the DB layer + response shape change).

## Consequences

**Good**:
- Response shape is stable from day 1 — consumers can start reading `role` immediately.
- `createUser(email, name, role?)` signature is backward-compatible (role defaults to `'user'`).
- Zero new runtime deps.

**Neutral**:
- Existing DB seed entry (`ada@example.com`) is backfilled with `role: 'user'`.

**Risk**:
- If we later need role to be mutable (admin promotes user), `updateUser` needs a second
  patch; not addressed here. ADR-004 if/when that comes.

## Alternatives considered

1. Separate `roles` table / join — overkill for in-memory stub; revisit in F2.
2. `isAdmin: boolean` — rejected; harder to extend to multi-role (moderator, etc.).
