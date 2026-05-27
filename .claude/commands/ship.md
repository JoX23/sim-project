# /ship — Ejecutar + verificar + emitir evidence bundle

Plan ID a ejecutar: **$ARGUMENTS** (debe ser un ULID existente en `docs/plans/`)

---

## ⚠️ Protocolo — leer antes de empezar

**Ejecuta los 6 pasos en secuencia completa sin detenerte.**

- Si el `reviewer` (Paso 5) devuelve `CHANGES_REQUESTED` → vuelves a Paso 3 con los findings (no abandones el ship)
- Máximo 3 ciclos Paso 3 → Paso 5 → Paso 3. En el cuarto fallo, escala a HITL.
- Un mensaje del usuario entre pasos = acknowledge, no redirect

**Anuncia al inicio**: "Ejecutando /ship en 6 pasos sobre plan <ULID>. No me detendré entre pasos."

---

## Contrato

Lee [`_contract.md`](_contract.md) secciones: **§1 PEV Invariants**, **§3 Permission Tiers**, **§4 Severities**, **§5 DoD**.

---

## Paso 0 — Cargar y validar el plan

1. `ctx_read("docs/plans/<ULID>*.md", mode=full)` — necesitas todo el plan
2. **Valida frontmatter**:
   - [ ] `id` matchea el ULID del argumento
   - [ ] `status: draft` (si `status: shipped` → error: ya ejecutado)
   - [ ] `read_set`, `write_set`, `invariants`, `validation_commands`, `rollback` presentes
   - [ ] `tier` declarado
3. **Verifica tier**:
   - Si `tier: full-access` → confirma con usuario antes de continuar (HITL obligatorio)
   - Si `tier: sandbox-edit` → procede (auto-allow)
   - Si `tier: read-only` → el plan no debería tener `write_set` no vacío → error

Si validación falla → reporta el error específico y aborta sin tocar archivos.

**→ Continúa INMEDIATAMENTE con Paso 1.**

---

## Paso 1 — Pre-flight check

Antes de modificar nada:

1. `ctx_shell("git status")` → working tree limpio o branch correcto (no estamos en `main` haciendo edits directos)
2. Para cada path en `read_set` → existe (`ctx_tree` o `ctx_read` quick)
3. Para cada path en `write_set` → ¿existe? Si sí, está en último commit (no es archivo huérfano)
4. `validation_commands` del plan → ejecuta los read-only (ej.: `<TEST_CMD>`) para baseline. Guarda exit codes.

Si baseline ya falla → reporta y aborta. No empieces a editar sobre estado roto.

**→ Paso 2.**

---

## Paso 2 — Invocar skill `implementer`

**Invoca `Skill` con `implementer`** pasando:

```
Plan ID: <ULID>
Plan path: docs/plans/<ULID>-*.md
Baseline status: [exit codes Paso 1]

Sigue el "Plan de ejecución" del plan paso a paso.
Solo modifica archivos en write_set (excepción: tests nuevos pueden añadirse aunque no estén pre-declarados, registra en evidence).
Respeta los invariants declarados.
Al terminar, devuelve:
  - Lista de archivos modificados (con git diff --stat)
  - Cualquier archivo tocado fuera del write_set (warning)
  - Hash SHA1 del diff completo
```

**→ Paso 3.**

---

## Paso 3 — Invocar skill `tester` (deterministic sensors)

**Invoca `Skill` con `tester`** pasando:

```
Plan ID: <ULID>
Diff producido por implementer: [paths modificados]
Validation commands del plan: [lista]

Ejecuta en este orden:
  1. validation_commands del plan (test suite + lint + typecheck)
  2. Cobertura sobre write_set (si aplica al stack)
  3. Identifica untested regions del write_set

Devuelve un reporte estructurado:
  - tests_passed: N
  - tests_failed: N (con listado)
  - coverage_per_file: {path: %}
  - untested_regions: [paths o funciones sin coverage]
  - lint_errors: N (con listado de archivos en write_set)
  - typecheck_errors: N
  - wall_time_seconds: N
```

Si `tests_failed > 0` o lint errors en write_set → escala al implementer (Paso 2) con los findings, ciclo bounded por el protocolo.

**→ Paso 4.**

---

## Paso 4 — State consistency check

Verifica que lo declarado en el plan matchea lo ejecutado:

- [ ] Diff real ⊆ write_set declarado (modulo tests añadidos)
- [ ] `read_set` no fue mutado
- [ ] `invariants` declarados siguen cumpliéndose (re-corre los validation_commands que los testean)
- [ ] No se tocaron paths en `.env*`, `secrets/`, `~/.ssh`, `~/.aws`

Cualquier desviación → severity `blocker` automático para el reviewer.

**→ Paso 5.**

---

## Paso 5 — Invocar skill `reviewer` (GATE)

**Invoca `Skill` con `reviewer`** pasando:

```
Plan ID: <ULID>
Diff: [output git diff]
Tester report: [Paso 3]
State consistency: [Paso 4 — pass/fail con detalles]
Contrato: _contract.md (todo)

Evalúa los 5 ejes del DoD (_contract.md §5).
Clasifica findings por severity: blocker / major / minor / info (_contract.md §4).

Devuelve:
  - veredicto: APPROVED | CHANGES_REQUESTED
  - findings: lista con {severity, file, line, message, suggested_fix}
  - dod_checklist: lista con cada DoD item marcado true/false
```

**Si `CHANGES_REQUESTED`** con ≥1 blocker o major:
  - Vuelve al Paso 2 (implementer) con los findings
  - Incrementa contador; si supera 3 ciclos → escala a HITL

**Si `APPROVED`** (solo minor/info) → continúa.

**→ Paso 6.**

---

## Paso 6 — Escribir evidence bundle + actualizar plan status

1. **Crea** `docs/plans/<ULID>.evidence.md` con frontmatter:

```yaml
---
plan_id: <ULID>
status: shipped
shipped_at: <ISO 8601>
diff_hash: <sha1 del paso 2>
reviewer_verdict: APPROVED
ship_cycles: <N (1 si pasó primera vez)>
---
```

Cuerpo:
```markdown
## Checks corridos
- ✅ Tests passed: <N>
- ✅ Lint: 0 errors en write_set
- ✅ Typecheck: clean (o N/A)
- ✅ State consistency: write_set match diff
- ✅ Reviewer: APPROVED

## Untested regions
- <lista de paths/funciones sin cobertura — del Paso 3>

## Residual risks
- <lista de riesgos no cubiertos por tests pero documentados>

## Findings minor/info (no bloqueantes)
- <de Paso 5, si los hubo>

## Diff stat
<output de git diff --stat>
```

2. **Actualiza** `docs/plans/<ULID>-*.md` cambiando frontmatter `status: draft` → `status: shipped` + añade `shipped_at:` y `evidence: <ULID>.evidence.md`.

3. **No** commitees automáticamente. Reporta cambios listos para que el usuario decida el commit (operación que potencialmente toca tier full-access vía hooks de CI).

---

## Resumen final

```
✅ /ship completado — plan <ULID>

| Campo                    | Valor                              |
|---|---|
| Plan                     | docs/plans/<ULID>-<slug>.md        |
| Status                   | shipped                            |
| Ship cycles (reviewer)   | N / 3                              |
| Tests passed             | N                                  |
| Lint errors (write_set)  | 0                                  |
| Coverage write_set       | N%                                 |
| Untested regions         | N (ver evidence)                   |
| Residual risks           | N (ver evidence)                   |
| Diff hash                | <sha1>                             |
| Evidence                 | docs/plans/<ULID>.evidence.md      |

Para commit: git add -A && git commit -m "<conventional commit msg>"
Para rollback: ver sección "rollback" del plan file
```

---

## Tabla de pasos

| Paso | Acción | Tool/Skill |
|---|---|---|
| 0 | Cargar + validar plan | `ctx_read(full)` |
| 1 | Pre-flight (baseline) | `ctx_shell` con validation_commands |
| 2 | Aplicar cambios | Skill `implementer` |
| 3 | Sensors deterministas | Skill `tester` |
| 4 | State consistency | inline |
| 5 | Gate de calidad | Skill `reviewer` |
| 6 | Evidence bundle + status | `Write` |
