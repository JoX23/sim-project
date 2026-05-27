---
name: tester
description: Deterministic sensor del harness. Corre validation_commands del plan, mide cobertura, identifica untested regions, reporta lint y typecheck. Stack-neutral (delega al test runner declarado en AGENTS.md). Se invoca desde /ship Paso 3, /triage Paso 2 (test que falla) y /triage Paso 5 (verificar fix).
---

# Tester skill

Rol en el harness PEV: **deterministic sensor** del paper §3.4.4. Corre las validaciones declaradas en el plan y devuelve un reporte estructurado que el `reviewer` consume como evidence. Stack-neutral: no asume runner; usa los placeholders resueltos de `AGENTS.md` (`<TEST_CMD>`, `<LINT_CMD>`, `<TYPECHECK_CMD>`).

## Contrato (input / output)

### Input
- `plan_id`: ULID
- `validation_commands`: lista del plan file
- `diff_paths`: archivos modificados (write_set + tests añadidos)
- Modo: `pre-fix` (espera FAIL, /triage Paso 2) | `post-fix` (espera PASS, /triage Paso 5) | `ship` (post-implementer, /ship Paso 3)

### Output
```yaml
mode: pre-fix | post-fix | ship
tests_total: N
tests_passed: N
tests_failed: N
failed_tests:
  - name: "<test name>"
    file: "<path>"
    error: "<truncated stack trace>"
coverage_per_file:
  <path>: <percent>
untested_regions:
  - <path>: "<function or block name>"
lint_errors_write_set: N
lint_errors_detail:
  - file: <path>
    line: N
    rule: "<rule id>"
typecheck_errors: N
typecheck_errors_detail:
  - file: <path>
    line: N
    message: "<error>"
wall_time_seconds: <number>
exit_codes:
  <command>: <code>
```

## Cómo escribir un test (modo `pre-fix` para /triage)

1. **Nombre claro**: `should_<expected_behavior>_when_<condition>`
2. **Mínimo**: solo lo necesario para reproducir el bug
3. **Determinista**: sin red, sin tiempo (a menos que el bug sea sobre eso)
4. **Aislado**: no depende de otros tests
5. **Localizado**: convención del stack (`*.test.ts`, `test_*.py`, `*_test.go`, etc.)

Ejecuta el test:
- Si **falla** (exit != 0) + error matchea síntoma → ✅ regression test válido
- Si **pasa** (exit == 0) → ❌ hipótesis incorrecta; reporta al caller con el output

## Cómo correr validation_commands (modo `ship` o `post-fix`)

1. **Orden importa**: tests → lint → typecheck (o el orden del plan)
2. **No paralelizar** salvo que el stack lo soporte explícitamente (evita race conditions en reporte)
3. **Capturar exit codes individualmente** — exit != 0 en lint ≠ exit != 0 en tests
4. **Timeout razonable**: si un command supera 300s → reportar timeout, no esperar indefinidamente

## Cobertura y untested regions

Para cada archivo en `write_set`:
- Si el stack reporta cobertura (lcov, cobertura.xml, etc.) → parsearla
- Si no → reporta `coverage_per_file: n/a`
- `untested_regions`: funciones/bloques en write_set sin cobertura ≥ 80% (heurística)

No es bloqueante per se, pero el `reviewer` lo evalúa contra el DoD.

## Lint scope

Lint corre **solo sobre archivos modificados** (los del diff_paths). Razón (del `_contract.md`): `--fix` global modifica archivos ajenos al cambio.

Si el lint config del proyecto no soporta filtrado por path → corre full lint y filtra los errors al reportar. Documenta esa diferencia en `notes`.

## Errores comunes a evitar

- ❌ Correr tests con `--bail` en modo `ship` → no ves todos los fallos
- ❌ Reportar coverage agregada del repo en lugar de archivos modificados
- ❌ Modificar archivos durante el test (cleanup en place, fixtures) → te conviertes en implementer, no eres
- ❌ Asumir test runner — siempre resolver desde `<TEST_CMD>` de AGENTS.md
- ❌ En modo `pre-fix`, declarar éxito si el test pasa → es lo contrario; en pre-fix el éxito es FAIL
