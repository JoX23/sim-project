# Memory system

Memoria persistente del agente. Inspirado en el paper *Code as Agent Harness*
§3.2 (Memory and Context Engineering).

## Cómo funciona

- `MEMORY.md` se carga automáticamente al inicio de cada sesión Claude Code
- **Límite: 200 líneas** — más allá Claude trunca → mantener compacto
- Cada entrada en `MEMORY.md` es un link a un archivo hermano con el body
- Naming: `<tipo>_<slug>.md` (snake_case)

## Cuatro tipos

### `user` — sobre el usuario

Información del usuario: rol, expertise, preferencias, knowledge gaps. Permite
adaptar explicaciones y profundidad.

**Cuándo escribir**:
- Cuando aprendes su rol/expertise nuevo
- Cuando expresa preferencia sobre stack/herramientas/idioma

**Ejemplo**:
```markdown
---
name: user-role
description: rol, expertise, preferencias de comunicación
metadata:
  type: user
---

Senior fullstack engineer. Stack principal: TypeScript + Python.
Prefiere respuestas concisas en español, sin pep-talks.
Conoce Anthropic SDK, lean-ctx, MCP.
```

### `feedback` — correcciones + validaciones del usuario

Guidance del usuario sobre cómo trabajar. **Guarda correcciones y validaciones**
(no solo "no hagas X"; también "sí, exactamente así, sigue").

**Cuándo escribir**:
- Usuario corrige tu approach ("no, hazlo así")
- Usuario confirma un approach no-obvio ("perfecto, sigue así")

**Estructura**: regla + `**Why:**` + `**How to apply:**`.

**Ejemplo**:
```markdown
---
name: feedback-no-mock-db
description: tests integración usan DB real
metadata:
  type: feedback
---

Tests de integración usan DB real, nunca mocks.

**Why:** Q4 2025 un mock pasó pero la migración falló en prod.
**How to apply:** Cuando el plan toca `apps/backend/test/`, asume Postgres real
(docker-compose up -d). Si el plan no lo menciona, alertar al usuario.
```

### `project` — estado y contexto del proyecto

Información del proyecto que no se deriva del código: deadlines, decisiones,
incidentes, stakeholders.

**Cuándo escribir**:
- Decisiones que afectan futuro trabajo (ADRs, change in direction)
- Fechas absolutas (convierte "el jueves" → "2026-06-04")
- Quién hace qué, por qué

**Estructura**: fact + `**Why:**` + `**How to apply:**`.

**Ejemplo**:
```markdown
---
name: project-3-phases
description: harness 3-fase incremental
metadata:
  type: project
---

Harness se construye en 3 fases (F1/F2/F3). F2 no arranca sin 1 semana de
uso F1 en proyecto real.

**Why:** Evitar over-engineering antes de tener métricas reales (devil's
advocate session 2026-05-27).
**How to apply:** Si el usuario propone añadir telemetry/evolve/multi-cand,
recordar que están en F2/F3 y requieren F1 validado primero.
```

### `reference` — punteros a sistemas externos

Dónde vive información fuera del repo: Linear, Notion, Slack, dashboards,
papers, runbooks externos.

**Cuándo escribir**:
- Usuario menciona un sistema externo como fuente de verdad
- Hay un dashboard/board/canal específico para un tipo de info

**Ejemplo**:
```markdown
---
name: reference-paper-harness
description: paper Code as Agent Harness en repo root
metadata:
  type: reference
---

Paper base del proyecto: `2605.18747v1.pdf` en root del repo.
Secciones más relevantes:
- §3.4 — PEV loop (base de /plan + /ship)
- §3.5 — Harness engineering (base de F2/F3)
- §5.2 — Open problems (roadmap futuro)
```

## Qué NO escribir en memoria

- Patrones de código, convenciones, paths → derivables del state actual
- Git history → `git log` es fuente de verdad
- Bug fix recipes → el fix vive en el código
- Cualquier cosa ya en CLAUDE.md / AGENTS.md / _contract.md
- Estado efímero de la conversación actual

## Cómo usar memoria desde un command

```markdown
## Paso 0 — Contexto

1. `mcp__plugin_claude-mem_mcp-search__search` con keywords del intent + limit=5
2. `ctx_read("memory/MEMORY.md", mode=auto)` — solo si el search no devuelve suficiente
3. Para entradas específicas: `ctx_read("memory/<tipo>_<slug>.md", mode=full)` solo del relevante
```

## Memoria stale

Antes de actuar sobre una memoria, verifica que sigue siendo cierta. El paper
§3.2.4 (Long-term Memory) advierte sobre noise/drift. Si una memoria contradice
el state observado:

1. Verifica en código/git
2. Trust the present, update/delete the memory
3. No actúes en base a memoria stale
