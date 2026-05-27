# Harness Changelog

Versionado del propio harness (separado del proyecto que lo usa).
Formato: [Keep a Changelog](https://keepachangelog.com/) — Semver.

---

## [0.1.0] — F1 Foundation

Release inicial. Implementa el loop PEV mínimo del paper *Code as Agent Harness* (2026).

### Added

- Estructura base `.claude/` con commands, skills, hooks
- 3 commands: `/plan`, `/ship`, `/triage`
- 4 skills stack-neutral: `planner`, `implementer`, `reviewer`, `tester`
- Hook `pre-tool.sh` con tier-gating (read-only / sandbox-edit / full-access)
- Contrato compartido `_contract.md` con PEV invariants, lean-ctx invariants, DoD, severities, HITL table
- Plan files con frontmatter ULID en `docs/plans/`
- Evidence bundles post-`/ship` en `docs/plans/<ULID>.evidence.md`
- Memory system con 4 tipos (user/feedback/project/reference) en `memory/`
- Tickets one-file-per-ticket en `tickets/` (evita merge conflicts)
- ADRs en `docs/architecture/adrs/`
- Script `scripts/harness-test.sh` para validación de coherencia interna
- `AGENTS.md` como fuente única; `CLAUDE.md` la importa con `@AGENTS.md`
- `.mcp.json` declarando `lean-ctx` como dependencia requerida

### Deferred (a F2 / F3)

- Telemetry estructurada (post-tool hook escribiendo JSONL) — F2
- Token budgets enforced + degradación automática — F2
- `/harness-doctor` que lee telemetría — F2
- Benchmarks reproducibles (`benchmarks/`) — F2
- Multi-candidate planning — F3.1
- Shadow-mode self-evolution — F3.2
- CLI tool (`harness init/doctor/upgrade/eval`) — F3.3
- Presets multi-stack — F3.4
- Publishing (Template repo / npm / pypi) — F3.5
