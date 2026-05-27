---
id: 01kt7spk4r2x5v7n3qz8tm7zw3
parent: null
status: shipped
intent: "Triage: GET /users/search?name= (empty) debe devolver 400 en lugar de todos los usuarios"
tier: sandbox-edit
read_set:
  - src/routes/users.ts
  - test/users-search.test.ts
write_set:
  - src/routes/users.ts
  - test/users-search.test.ts
invariants:
  - "El test AC-3 existente documentaba el comportamiento anterior (empty→todos) — debe actualizarse"
  - "AC-4 (missing name param → 400) no cambia"
  - "Los 4 tests restantes de /search no regresionan"
validation_commands:
  - "npm test -- --testPathPattern=users-search"
rollback:
  - "git checkout HEAD -- src/routes/users.ts test/users-search.test.ts"
estimated_size: XS
risk: bajo
created_at: 2026-06-04T14:30:00Z
reviewer_verdict: APPROVED
---

# Triage — empty search 400

## Contexto

**Report original**: `GET /users/search?name=` devuelve todos los usuarios en lugar de un error. El behavior actual estaba documentado como intencional en AC-3 de `test/users-search.test.ts`.

**Proceso de clarificación (HITL)**: antes de escribir el test regresivo, el harness detectó la contradicción: ¿es un bug o un cambio de spec? El PM confirmó: **cambio de spec** — empty string es inválido, debe devolver 400. Reason: evitar accidental full-scan cuando el frontend envía `?name=${userInput}` con input vacío.

**Consecuencia**: este triage es hybrid (bug fix + spec update). El test AC-3 se reescribe para reflejar el nuevo comportamiento. No se añade un test regresivo separado porque el AC-3 actualizado cumple esa función.

## Finding de proceso

Este caso ilustra el patrón **"triage vs spec change"**: un comportamiento que parece bug pero tiene test que lo define explícitamente. El harness debe pausar para HITL en este caso. Registrado como F-14 en el stress test log.

## Acceptance Criteria

- [x] AC-1: `?name=Ada` sigue funcionando (sin regresión)
- [x] AC-2: `?name=ada` (case-insensitive) sigue funcionando
- [x] AC-3: `?name=` devuelve 400 con `{ error: 'name must not be empty' }` (spec actualizada)
- [x] AC-4: missing `name` param sigue devolviendo 400

## Cambios

- `src/routes/users.ts`: añadido check `if (!nameQuery.trim())` antes de llamar `searchUsers`
- `test/users-search.test.ts`: AC-3 actualizado — antes esperaba 200 + todos los usuarios, ahora espera 400
