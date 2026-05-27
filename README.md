# Code-as-Agent-Harness Template

> Template stack-agnóstico para proyectos donde el código es el **substrate operativo** del agente — basado en el paper *Code as Agent Harness* (2026).
> Implementa el loop **PEV** (Plan → Execute → Verify) con lean-ctx como context runtime canónico, multi-agente especializado, y permission tiers con HITL gates.

**Versión del harness**: ver [`.claude/VERSION`](.claude/VERSION) · **Changelog**: [`.claude/CHANGELOG.md`](.claude/CHANGELOG.md)

---

## TL;DR del flujo

```
                ┌─────────────────────────────────────────────────────┐
                │                  HARNESS PEV LOOP                   │
                └─────────────────────────────────────────────────────┘

   intent  ──→  /plan <intent>  ──→  docs/plans/<ULID>.md  (frontmatter + AC + rollback)
                     │
                     │ (skill: planner)
                     ▼
                ULID asignado
                     │
                     ▼
   /ship <ULID>  ──→  Pre-flight   ──→  implementer  ──→  tester  ──→  reviewer (GATE)
                          │              (skill)         (skill)         (skill)
                          │                                                  │
                          ▼                                                  ▼
                     baseline OK                                  APPROVED | CHANGES_REQ
                                                                            │
                                                            ┌───────────────┴─────────────┐
                                                            ▼                             ▼
                                                  docs/plans/<ULID>            ciclo ≤3:
                                                   .evidence.md                vuelve a implementer
                                                  (checks, risks,
                                                   diff hash, ...)

   bugs ──→  /triage <bug>  ──→  test que FALLA  →  fix  →  test PASS  →  reviewer
                                  (regression-first; mismo PEV abreviado)
```

**Comandos disponibles**:
- `/plan <intent>` — produce plan file con ULID
- `/ship <ULID>` — ejecuta + verifica + emite evidence bundle
- `/triage <bug>` — fix con test de regresión primero

**Skills (multi-agente)**:
- `planner` — produce plan files
- `implementer` — aplica cambios respetando read_set/write_set
- `tester` — deterministic sensor (tests + coverage + lint)
- `reviewer` — gate determinista contra `_contract.md`

---

## Quickstart (5 minutos)

```bash
# 1. Clonar
git clone <este-repo> mi-proyecto
cd mi-proyecto

# 2. Personalizar para tu stack — editar placeholders en AGENTS.md:
#    <LANGUAGES>, <RUNTIME>, <FRAMEWORKS>, <PKG_MGR>, <TEST_RUNNER>
#    <BUILD_CMD>, <TEST_CMD>, <LINT_CMD>, <TYPECHECK_CMD>, <FORMAT_CMD>
#    <MAIN_BRANCH>, <OWNER_NAME>, <OWNER_EMAIL>, <DEPLOY_CMD>
#    El script harness-test.sh avisa qué placeholders quedan.

# 3. Verificar coherencia
bash scripts/harness-test.sh

# 4. Abrir Claude Code y probar el flujo:
#    /plan "tu primer intent aquí"
#    → produce docs/plans/<ULID>.md
#    /ship <ULID>
#    → aplica + verifica + emite evidence
```

## Estructura

```
.
├── README.md                    # Este archivo
├── AGENTS.md                    # Contrato público (fuente única)
├── CLAUDE.md                    # Importa AGENTS.md + Claude-specifics (sin drift)
├── .mcp.json                    # Declara lean-ctx como required
├── .claude/
│   ├── VERSION                  # Semver del harness (0.1.0 = F1)
│   ├── CHANGELOG.md             # Historial
│   ├── settings.json            # Claude Code permissions (auto-managed)
│   ├── settings.template.json   # Tier enforcement template (referencia)
│   ├── commands/                # /plan, /ship, /triage + _contract.md
│   ├── skills/                  # planner, implementer, reviewer, tester
│   └── hooks/                   # pre-tool.sh (tier gate + HITL para destructive)
├── memory/                      # MEMORY.md (auto-load ≤200 líneas) + tipos
├── docs/
│   ├── plans/                   # Plan files (ULID-named) + evidence bundles
│   ├── architecture/adrs/       # ADRs (decisiones structurales)
│   ├── runbooks/                # Playbooks operacionales
│   └── prompts/                 # Fragments reutilizables
├── tickets/                     # Un YAML por ticket (evita merge conflicts)
├── scripts/                     # harness-test.sh, tickets-aggregate.sh
└── benchmarks/                  # F2+ — placeholder
```

## Roadmap por fases

Este template se construye en 3 fases (ver [`docs/plans/`](docs/plans/) para el plan maestro):

| Fase | Status | Objetivo |
|---|---|---|
| **F1 — Foundation** | ✅ Actual | PEV mínimo, lean-ctx first-class, hooks tier-gate, plan files con ULID |
| **F2 — Measurement** | ⏳ Pendiente | Benchmarks reproducibles, telemetry consumida, budgets enforced, `/harness-doctor` |
| **F3 — Evolution + Multi-stack** | ⏳ Pendiente | Multi-candidate planning, shadow-mode evolve, CLI tool, presets, publishing |

F2 no arranca sin 1 semana de uso F1 en proyecto real (ver ADR-001).

## Decisiones de diseño clave

- **Stack-agnóstico**: placeholders documentados, no asume lenguaje/framework
- **lean-ctx first-class**: declarado como dependencia (`.mcp.json`), prescrito en `_contract.md §2`, validado intent-level por `harness-test.sh`
- **Permission tiers como convención** + hook enforcement: read-only / sandbox-edit / full-access
- **ULID para plan files y tickets**: timestamp sortable + random, resuelve concurrent edits
- **One-file-per-ticket** vs. yaml monolítico: evita merge conflicts (paper §5.2.4)
- **AGENTS.md como fuente única**, CLAUDE.md la importa → cero drift
- **Idioma**: user-facing español, technical metadata inglés
- **Versionado del harness**: el harness es código → `.claude/VERSION` + `.claude/CHANGELOG.md`

## Referencia al paper

Documento fuente: [`2605.18747v1.pdf`](2605.18747v1.pdf) — "Code as Agent Harness" (Ning et al., 2026).

Mapeo paper → harness:

| Paper section | Harness component |
|---|---|
| §2.1 Code for Reasoning | Plan files como reasoning trace verificable |
| §2.3 Code for Environment | `_contract.md` + repo state como environment representation |
| §3.1 Planning | `/plan` command + `planner` skill |
| §3.2 Memory | `memory/` con 4 tipos + read on-demand |
| §3.3 Tool Use | Tier-gated, lifecycle hook (pre-tool.sh) |
| §3.4 PEV Loop | `/plan` + `/ship` (execute + verify integrados) |
| §3.5 Harness Engineering | F2 (telemetry), F3 (self-evolution) |
| §4 Multi-agent Orchestration | 4 skills especializados con shared substrate (plan files) |
| §5.2.4 Transactional shared state | One-file-per-ticket + plan ULIDs con `parent:` chain |

## Contribuir / extender

- Modificar harness → debe pasar `bash scripts/harness-test.sh`
- Cambio en `_contract.md` → bump `.claude/VERSION` + entry en CHANGELOG
- Nuevo command/skill → seguir patrón existente, frontmatter `name` + `description`
- Cambio en convención → ADR antes (ver `docs/architecture/adrs/_template.md`)

## Licencia

`<LICENSE>` — definir al personalizar.
