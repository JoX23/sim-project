# Scripts

Utilidades del harness. Todos los scripts son **idempotentes** (re-ejecutables
sin daño) y **portables** (bash 3.2+, sin dependencias adicionales).

## `harness-test.sh`

Valida coherencia interna del harness. Corre como gate en CI o antes de commitear.

```bash
bash scripts/harness-test.sh           # check normal
bash scripts/harness-test.sh -v        # verbose (imprime cada PASS también)
```

Exit codes:
- `0` — todos los checks pasan
- `1` — al menos uno falló (detalle a stderr)

Sections que valida:
1. Root contracts (AGENTS.md + CLAUDE.md sin drift, .mcp.json declara lean-ctx)
2. .claude/ versioning (VERSION semver, CHANGELOG, settings template)
3. Commands integrity (plan/ship/triage referencian _contract.md)
4. Skills integrity (frontmatter name + description)
5. Hooks (pre-tool.sh ejecutable, README presente)
6. Memory (MEMORY.md ≤200 líneas)
7. Docs templates (plans/_template + adrs/_template + READMEs)
8. Tickets (_template.yaml + README)
9. lean-ctx anti-patterns (intent-level — F1 baseline, refinar en F2)
10. Stack placeholders (warning si quedan `<STACK>`, `<BUILD_CMD>`, etc.)

## `tickets-aggregate.sh`

Genera reporte agregado de tickets a partir de `tickets/*.yaml`.

```bash
bash scripts/tickets-aggregate.sh
# → tickets/_report.md (gitignored — deriva)
```

Output: tabla resumen + agrupado por status + total. Si no hay tickets, genera
un placeholder con instrucciones.

## (F2+) `telemetry-summarize.sh`

Resumen de spans JSONL en `.claude/telemetry/`. **No existe en F1**.

## (F2+) `run-benchmarks.sh`

Corre los 3 mini-benchmarks (`add-function`, `fix-bug`, `refactor`) y emite
`metrics.json` con las 6 métricas del paper §5.2.1. **No existe en F1**.

## (F2+) `harness-bench.sh`

Compara métricas vs. baseline (commit) — útil para detectar regresión del
propio harness. **No existe en F1**.

## Convenciones

- Shebang: `#!/usr/bin/env bash` (portable)
- `set -euo pipefail` siempre que sea posible
- Working directory: scripts cambian a la raíz del repo con `cd "$(dirname "$0")/.."`
- Output a `_<algo>.md` está en `.gitignore` (deriva, no fuente)
- Errores a stderr, success a stdout
