plan_id: 01kszspk4r2x5v7n3qz8tm6zw1
status: shipped
shipped_at: 2026-06-01T15:05:00Z
diff_hash: simulated-v5w6x7y8
reviewer_verdict: APPROVED
ship_cycles: 1
## Bug resuelto
- `PATCH /users/:email` con `{ name: "   " }` → antes: 200 con nombre de espacios
- Después del fix: 400 `{ error: 'name required' }`
- Root cause: guard `!name` era truthy-falsy; strings de solo espacios son truthy en JS
- Fix: `!name?.trim()` + guardar `name.trim()` en DB
## Checks corridos
- ✅ Test regresión añadido primero (3 casos: solo-espacios, vacío, sin campo)
- ✅ Tests passed: 25 (21 existentes + 4 nuevos en users-update-validation.test.ts)
- ✅ Typecheck clean
- ✅ Suite completo verde — no regresiones en PATCH válido
- ✅ Reviewer: APPROVED (fix mínimo, regresión-first demostrado)
## Lección F1 capturada
El triage detectó un bug que el evidence bundle del plan anterior marcó como "candidato".
El ciclo evidence → triage funciona: el reviewer del ship no frena false positives,
sino que deja que los untested regions documenten deuda técnica que se convierte en
triages al día siguiente. Patrón validado.
 src/routes/users.ts              |  2 +-
 test/users-update-validation.test.ts | 28 ++++++++++++++++++++++++++++
 2 files changed, 29 insertions(+), 1 change
