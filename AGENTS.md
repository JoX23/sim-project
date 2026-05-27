# AGENTS.md — Public contract for AI coding agents

> Single source of truth for any agent operating in this repo (Claude Code, Codex, Gemini, etc.).
> `CLAUDE.md` imports this file and only adds Claude-specific surfaces.

## Stack

- **Language(s)**: TypeScript
- **Runtime**: Node 20
- **Frameworks**: Express 4
- **Package manager**: npm
- **Test runner**: Jest

## Build / Test / Lint commands

```bash
npm run build           # tsc
npm test                # jest (supports --testPathPattern=<file>)
npm run lint            # eslint src (check mode, --no-fix)
npm run typecheck       # tsc --noEmit
npm run format          # prettier --check src
```

## Permission tiers

Operations are grouped in 3 tiers. The pre-tool hook (`.claude/hooks/pre-tool.sh`)
enforces them. Detailed table lives in [`.claude/commands/_contract.md`](.claude/commands/_contract.md).

- **read-only** — exploration, no mutations. Auto-allowed.
- **sandbox-edit** — local edits, tests, builds. Auto-allowed if scoped to repo.
- **full-access** — push, deploy, destructive ops. **Always HITL** (human-in-the-loop).

## Mandatory dependencies

- [`lean-ctx`](https://github.com/leanctx) MCP server — context runtime. Required.
  Declared in [`.mcp.json`](.mcp.json). Auto-installs via the global `lean-ctx`
  skill if missing on first `/plan` invocation.

## Workflow contract (PEV loop)

The harness implements the Plan–Execute–Verify loop from
*Code as Agent Harness* (2026, §3.4). Two commands:

1. **`/plan <intent>`** — produces a plan file `docs/plans/<ULID>.md` with
   read-set, write-set, invariants, validation commands, rollback points.
2. **`/ship <ULID>`** — executes the plan in sandbox tier, runs deterministic
   sensors (lint/typecheck/test), and writes `docs/plans/<ULID>.evidence.md`
   with results, untested regions, and residual risks.

A third command, **`/triage <bug>`**, handles regression-first bug fixing:
write the failing test → fix → test passes → reviewer approves.

Detailed contract: [`.claude/commands/_contract.md`](.claude/commands/_contract.md).

## Allow-list for shell operations

Agents may execute these without confirmation in `sandbox-edit` tier:

- File ops: `ls`, `find`, `cat`, `tail`, `head` (prefer `ctx_*` per `_contract.md`)
- Git read: `git status`, `git diff`, `git log`, `git show`, `git branch`
- Build/test/lint: `npm run build`, `npm test`, `npm run lint`, `npm run typecheck`
- Package mgmt (read): `npm list`, `npm outdated`

Operations **requiring HITL** (full-access tier):

- `git push`, `git push --force` (always blocked on `main`/`master`)
- `npm publish`, `npm run deploy`
- `rm -rf`, `git reset --hard`, `git clean -f`
- Modifying `.env*`, `secrets/`, `~/.ssh`, `~/.aws`, credentials
- Network calls to external APIs not in the allow-list

## Conventions

- **Language of user-facing docs**: Español (commands, skills, runbooks)
- **Language of technical metadata**: English (frontmatter, IDs, schemas, code identifiers)
- **IDs**: ULID (timestamp-sortable + random) for plans, tickets, ADRs
- **File naming**: kebab-case for files, snake_case for YAML fields, language-native for code
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- **Branches**: `feat/<slug>`, `fix/<slug>`, `chore/<slug>` — never push directly to `main`

## Memory

Persistent memory lives in [`memory/`](memory/MEMORY.md). Four types:
`user` / `feedback` / `project` / `reference`. See [`memory/README.md`](memory/README.md).

## Repository map

```
.claude/         # Harness: commands, skills, hooks, settings, versioning
memory/          # Persistent memory (MEMORY.md auto-loaded by Claude Code)
docs/plans/      # Plan files (ULID-named) + evidence bundles
docs/architecture/adrs/  # Architecture Decision Records
docs/runbooks/   # Operational playbooks
docs/prompts/    # Reusable prompt fragments
tickets/         # One YAML per ticket (avoids merge conflicts)
scripts/         # Harness self-tests, ticket aggregator, etc.
benchmarks/      # F2+ — reproducible task suite for self-measurement
```

## Version

Harness version: see [`.claude/VERSION`](.claude/VERSION). Changes logged in
[`.claude/CHANGELOG.md`](.claude/CHANGELOG.md).

## Contact / Owner

Jose Mariscal — jgmarsm@gmail.com
