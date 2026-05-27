# CLAUDE.md

> Public contract for any agent → [`AGENTS.md`](AGENTS.md). Léelo primero.
> Este archivo añade únicamente surfaces específicas de Claude Code (commands, skills, plan files, memoria).

@AGENTS.md

## Commands disponibles

- `/plan <intent>` — produce un plan file con ULID en `docs/plans/`. Ver `.claude/commands/plan.md`.
- `/ship <ULID>` — ejecuta el plan (sandbox tier) + verifica + emite evidence bundle. Ver `.claude/commands/ship.md`.
- `/triage <bug>` — regression-first fix. Ver `.claude/commands/triage.md`.

> El contrato compartido entre commands vive en [`.claude/commands/_contract.md`](.claude/commands/_contract.md).
> Léelo cuando el comando lo referencie — no antes (token cost).

## Skills invocables

Multi-agente especializado (Skill tool). Stack-neutral por diseño:

- `planner` — produce plan files con frontmatter completo (read_set, write_set, invariants, validation_commands, rollback)
- `implementer` — aplica cambios respetando el read_set/write_set del plan
- `reviewer` — gate determinista contra `_contract.md`; veredicto APPROVED | CHANGES_REQUESTED
- `tester` — deterministic sensor (corre suite, reporta cobertura, identifica untested regions)

## Plan files

Ubicación: `docs/plans/<ULID>.md` (uno por intento). Schema: ver `docs/plans/_template.md`.
Evidence bundle post-`/ship`: `docs/plans/<ULID>.evidence.md`.

Reglas de naming:
- ID = ULID generado al inicio de `/plan` (timestamp sortable + random)
- Slug humano opcional como sufijo, separado por `-`: `01JBVQ...-add-suma.md`
- ULID es la fuente de verdad; el slug puede cambiar sin invalidar referencias

## Memoria

`memory/MEMORY.md` (auto-cargado, ≤200 líneas) + topic files. Cuatro tipos: `user`, `feedback`, `project`, `reference`.
Detalle: [`memory/README.md`](memory/README.md).

## Tickets

`tickets/<ULID>.yaml` — un archivo por ticket (evita conflicts vs. yaml monolítico).
Schema: `tickets/_template.yaml`. Reporte agregado opcional: `bash scripts/tickets-aggregate.sh`.

## lean-ctx

Esta herramienta usa lean-ctx como context runtime canónico. Mapeos obligatorios:

| Acción nativa | Preferir | Por qué |
|---|---|---|
| `Read <archivo>` | `ctx_read(path, mode=auto)` | Cache + re-read ~13 tokens; 10 modos según necesidad |
| `Bash <comando>` | `ctx_shell(command)` | 95+ patrones de compresión de output |
| `Grep <pattern>` | `ctx_search(pattern, path)` | Resultados compactos |
| `ls / find` | `ctx_tree(path, depth)` | Mapas de directorio compactos |

`Edit` / `Write` / `Glob` nativos siguen siendo correctos (lean-ctx es read-mostly).
Detalles: `_contract.md § lean-ctx invariants`.

## Convención de pasos en commands

Cada command (`/plan`, `/ship`, `/triage`) sigue el patrón medita-style:

- **Paso 0** — Contexto: `mcp__plugin_claude-mem_mcp-search__search` antes que `ctx_read`
- Pasos 1..N — Análisis + invocación de skills
- **"Continúa inmediatamente"** entre pasos — un mensaje del usuario entre pasos se trata como acknowledge, no redirect

## Errores comunes a evitar

- ❌ `Read AGENTS.md` completo cuando solo necesitas un campo → usa `ctx_read(path, lines:N-M)`
- ❌ Editar `tickets.yaml` monolítico → usa `tickets/<ULID>.yaml` individual
- ❌ Saltarse el pre-tool hook con bash directo → siempre pasa por la convención de tiers
- ❌ Crear plan files sin ULID → `_contract.md` lo exige
- ❌ Hacer `git push` sin HITL → tier `full-access` lo bloquea
