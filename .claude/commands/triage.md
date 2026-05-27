# /triage — Bug fix con regresión-first

Bug a triagear: **$ARGUMENTS**

---

## ⚠️ Protocolo — leer antes de empezar

**Ejecuta los 6 pasos en secuencia completa sin detenerte.**

- El test de regresión se escribe **antes** del fix (no después)
- Si el test no falla con la versión actual del código → no hay bug confirmado → reporta y aborta
- Un mensaje del usuario entre pasos = acknowledge, no redirect

**Anuncia al inicio**: "Ejecutando /triage en 6 pasos. Test de regresión antes del fix. No me detendré entre pasos."

---

## Contrato

Lee [`_contract.md`](_contract.md) secciones: **§1 PEV Invariants**, **§4 Severities**, **§5 DoD**.

---

## Paso 0 — Contexto del bug

1. `mcp__plugin_claude-mem_mcp-search__search` con descripción del bug + `limit=5` → ¿bug ya reportado? ¿hay plans previos?
2. Si el bug viene de un ticket: `ctx_read("tickets/<id>.yaml", mode=full)`
3. Si hay stack trace: `ctx_search(error_message, ".")` → localiza los puntos de fallo

Extrae: módulo afectado, severity reportada, contexto de reproducción.

**→ Continúa INMEDIATAMENTE con Paso 1.**

---

## Paso 1 — Reproducción mínima (inline)

Completa:

| Campo | Análisis |
|---|---|
| Síntoma | Qué ocurre que no debería |
| Comportamiento esperado | Qué debería ocurrir |
| Pasos de reproducción | Mínimos, deterministas |
| Severity propuesta | blocker / major / minor (justifica) |
| Hipótesis de causa | Tu mejor guess (sin tocar código aún) |
| Módulo/archivos sospechosos | Localización inicial |

Si no puedes reproducir → reporta y aborta. No fixees lo que no puedes ver fallar.

**⚠️ Caso especial — triage vs spec change**: antes de continuar, verifica si existe un test que afirme que el comportamiento reportado como bug es **correcto e intencional**. Si es así:
1. **Pausa. No escribas el test de regresión todavía.**
2. Informa al usuario: "El comportamiento descrito está cubierto por `<test>` como comportamiento esperado. ¿Es un bug o un cambio de spec?"
3. Si es **bug** (el test está mal): continúa con Paso 2 normalmente, el test existente se actualizará en write_set.
4. Si es **spec change**: trata el intent como una feature/cambio de comportamiento — usa `/plan` en lugar de `/triage`.

**→ Paso 2.**

---

## Paso 2 — Test de regresión (FALLA primero)

**Invoca `Skill` con `tester`** pasando:

```
Bug descrito en Paso 1: [pegar]
Módulo afectado: [Paso 1]
Hipótesis de causa: [Paso 1]

Escribe UN test que reproduzca el bug:
  - Nombre claro: should_<expected_behavior>_when_<condition>
  - Mínimo (no testees más de lo necesario para este bug)
  - Determinista (sin dependencias de red/tiempo a menos que el bug sea sobre eso)
  - Debe FALLAR contra el código actual

Ejecuta el test y verifica:
  - exit code != 0
  - El error matchea el síntoma del Paso 1

Devuelve: path del archivo de test, nombre del test, output del fallo.
```

Si el test pasa (no falla) → la hipótesis del Paso 1 es incorrecta → vuelve a Paso 1 con feedback. Bounded a 3 ciclos antes de escalar a HITL.

**→ Paso 3.**

---

## Paso 3 — Crear plan file mini

Genera ULID y escribe `docs/plans/<ULID>-triage-<slug>.md` con:

```yaml
---
id: <ULID>
parent: null
status: draft
intent: "Fix <bug síntoma>"
tier: sandbox-edit
read_set: [<archivos sospechosos del Paso 1>]
write_set: [<archivos a modificar>, <test añadido en Paso 2>]
invariants:
  - "Tests existentes siguen pasando"
  - "El test de regresión añadido pasa post-fix"
validation_commands:
  - <TEST_CMD para el test específico>
  - <TEST_CMD completo>
rollback:
  - "git revert <commit> o git checkout HEAD -- <files>"
estimated_size: XS
risk: <bug-dependent>
created_at: <ISO 8601>
---
```

Cuerpo mínimo:
```markdown
## Bug
[Síntoma del Paso 1]

## Test de regresión (ya añadido pre-fix)
- Path: <test path>
- Nombre: <test name>
- Estado actual: FAIL (esperado)

## Fix planeado
[Hipótesis del Paso 1 traducida a cambios concretos]

## Rollback
[Comandos]
```

**→ Paso 4.**

---

## Paso 4 — Invocar skill `implementer`

**Invoca `Skill` con `implementer`** pasando:

```
Plan ID: <ULID>
Plan path: docs/plans/<ULID>-triage-*.md
Test que debe pasar: <path>::<test name>

Aplica el fix mínimo para que el test de regresión pase.
NO modifiques otros tests.
NO añadas funcionalidad fuera del scope del bug.
```

**→ Paso 5.**

---

## Paso 5 — Verificar regresión + no-regresión

**Invoca `Skill` con `tester`**:

```
1. Corre el test de regresión añadido en Paso 2 → DEBE PASAR ahora
2. Corre la suite completa → ninguno de los pre-existentes debe romperse
3. Si aplica, mide cobertura del archivo modificado

Devuelve reporte estructurado (mismo formato que /ship Paso 3).
```

Si el test de regresión sigue fallando → vuelve a Paso 4 con el output del test (no inventes nuevas hipótesis sin evidencia). Si la suite tiene fallos nuevos → el fix introdujo regresión → revierte y vuelve a Paso 1.

**→ Paso 6.**

---

## Paso 6 — Gate + evidence bundle

**Invoca `Skill` con `reviewer`**:

```
Plan ID: <ULID>
Tipo: triage (regresión-first)
Diff: [output git diff]
Tester report: [Paso 5]

Verifica adicionalmente:
  - Que el test de regresión EXISTE en el diff
  - Que el test es minimal (no testea features extra)
  - Que el fix es proporcional al bug (no refactor encubierto)

Veredicto: APPROVED | CHANGES_REQUESTED
```

Si `APPROVED`:
1. Escribe `docs/plans/<ULID>.evidence.md` (mismo formato que /ship Paso 6)
2. Actualiza `status: shipped` en el plan
3. Si el bug venía de un ticket → actualiza `tickets/<id>.yaml` con `status: resolved` y `related_plans: [<ULID>]`

---

## Resumen final

```
✅ /triage completado

| Campo                | Valor                                    |
|---|---|
| Bug                  | <síntoma corto>                          |
| Severity             | blocker / major / minor                  |
| Plan ID              | <ULID>                                   |
| Test de regresión    | <path>::<name>                           |
| Pre-fix status       | FAIL (esperado)                          |
| Post-fix status      | PASS                                     |
| Suite completa       | PASS (N tests)                           |
| Diff stat            | <stat>                                   |
| Ticket actualizado   | tickets/<id>.yaml o N/A                  |
| Evidence             | docs/plans/<ULID>.evidence.md            |
```

---

## Tabla de pasos

| Paso | Acción | Tool/Skill |
|---|---|---|
| 0 | Contexto del bug | `mcp__plugin_claude-mem_mcp-search` + `ctx_read` + `ctx_search` |
| 1 | Reproducción mínima | inline |
| 2 | Test que FALLA primero | Skill `tester` |
| 3 | Plan file mini | `Write` |
| 4 | Aplicar fix mínimo | Skill `implementer` |
| 5 | Verificar regresión + no-regresión | Skill `tester` |
| 6 | Gate + evidence + ticket | Skill `reviewer` + `Write` |
