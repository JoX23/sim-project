plan_id: 01kt1f8mn2k0nm4yp6xy7bvq6u
status: shipped
shipped_at: 2026-06-02T11:45:00Z
diff_hash: simulated-w6x7y8z9
reviewer_verdict: APPROVED
ship_cycles: 2
## Historia del ciclo (ship_cycles=2)
### Ciclo 1 — CHANGES_REQUESTED
El primer implemento retornaba 400 para query vacío (`?name=`), interpretando que
un query sin contenido era inválido. El reviewer rechazó con:
> "AC-3 del plan exige que query vacío devuelva todos los usuarios. El AC está en el
> plan file y el invariant lo especifica explícitamente. El 400 para `?name=` viola
> el contrato. Cambia el guard para distinguir entre param ausente (`/search` sin `?name`)
> y param vacío (`?name=`)."

### Ciclo 2 — APPROVED
Fix: cambiar el guard de `!nameQuery` a `!('name' in req.query)`. Así:
- `/users/search` (sin param) → 400 ✓
- `/users/search?name=` (vacío) → 200 con todos ✓
- `/users/search?name=ada` → 200 filtrado ✓

## Checks corridos (ciclo 2)
- ✅ Tests passed: 30 (25 existentes + 5 nuevos en users-search.test.ts)
- ✅ Typecheck clean
- ✅ Suite completo verde
- ✅ Reviewer: APPROVED
## Lección F1 capturada
El reviewer distinguió entre "param ausente" y "param vacío". Es una semántica REST
sutil que el implementer perdió en el primer ciclo. El plan file con el invariant
explícito ("Query vacío retorna TODOS") fue lo que armó al reviewer para rechazar
correctamente. Patrón: invariants en el plan file → reviewer tiene criterio de rechazo.
## Untested regions
- Búsqueda con caracteres especiales (ñ, acentos, emojis) — no probada, `includes()`
  de JS es Unicode-aware por defecto, debería funcionar.
- Paginación en resultados de búsqueda — no implementada. Si hay 1000 usuarios
  matching, se devuelven todos. Deuda técnica documentada.
- El route `/search` antes de `/:email` es importante para el orden de declaración —
  no hay test que pruebe que `/users/search` no matchea el param `:email`.
 src/routes/users.ts   |  8 ++++++++
 test/users-search.test.ts | 36 ++++++++++++++++++++++++++++++++++++
 2 files changed, 44 insertions(+)
