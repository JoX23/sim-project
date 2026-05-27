---
id: 01kt1spk4r2x5v7n3qz8tm7yw2
parent: 01ksxspk4r2x5v7n3qz8tm6yz1k
status: shipped
shipped_at: 2026-06-02T16:10:00Z
evidence: 01kt1spk4r2x5v7n3qz8tm7yw2.evidence.md
intent: "Refactor: extraer EMAIL_RE a utils/validation.ts + cubrir untested region createdAt en lista"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - docs/plans/01ksxspk4r2x5v7n3qz8tm6yz1k.evidence.md
write_set:
  - src/utils/validation.ts
  - src/routes/users.ts
  - test/users-list-created-at.test.ts
invariants:
  - "EMAIL_RE no cambia — solo se mueve de src a un módulo compartido"
  - "Comportamiento observable de todos los endpoints es idéntico pre/post"
  - "Tests existentes (30) siguen pasando sin modificación"
  - "El nuevo test cubre el untested region del plan 01ksxspk4r2x5v7n3qz8tm6yz1k"
validation_commands:
  - "npm test -- --testPathPattern=users-list-created-at"
  - "npm test"
  - "npm run typecheck"
  - "npm run lint"
rollback:
  - "git checkout HEAD -- src/routes/users.ts"
  - "git rm src/utils/validation.ts test/users-list-created-at.test.ts"
estimated_size: XS
risk: bajo
created_at: 2026-06-02T15:00:00Z
---

# Refactor: validation util + cobertura untested region

## Contexto

Dos motivaciones independientes convergidas en un plan XS:

**1. Refactor EMAIL_RE:**
El regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` está copiado inline en `src/routes/users.ts`.
Con el endpoint `/search` ahora en el mismo archivo (y futuros endpoints posibles),
moverlo a `src/utils/validation.ts` es el momento oportuno — exactamente 1 archivo
lo usa, el move es atómico y no cambia el comportamiento.

**2. Cubrir untested region del día 5:**
El evidence `01ksxspk4r2x5v7n3qz8tm6yz1k` documentó:
> "no hay test que llame listUsers y verifique el campo createdAt en los objetos"

Un test explícito en `test/users-list-created-at.test.ts` cierra esta deuda.

## Acceptance Criteria

- [ ] **AC-1**: `src/utils/validation.ts` exporta `EMAIL_RE`
- [ ] **AC-2**: `src/routes/users.ts` importa `EMAIL_RE` desde utils (no define inline)
- [ ] **AC-3**: `GET /users` devuelve objetos con campo `createdAt` por item
- [ ] **AC-4**: `npm run typecheck` limpio
- [ ] **AC-5**: 0 tests existentes rotos

## Plan de ejecución

1. Crear `src/utils/validation.ts` con `export const EMAIL_RE = ...`
2. En `src/routes/users.ts`, borrar la definición inline e importar desde utils
3. Añadir `test/users-list-created-at.test.ts` verificando que cada user en `GET /users`
   tiene `createdAt` como ISO string
4. `npm test` → verde (31 tests)
