# Prompts reutilizables

Fragmentos de prompt que se referencian desde commands/skills para evitar
duplicación y maximizar cache hits.

## Cuándo crear un prompt fragment

- Mismo bloque de instrucciones aparece en 2+ commands o skills
- Bloque suficientemente largo (>20 líneas) para que la duplicación cueste tokens
- Contenido estable (no cambia con cada feature)

## Cuándo NO crear uno

- Una sola ubicación de uso → inline está bien
- Variable por uso (mucho `<placeholder>`) → no es reutilizable, mejor inline

## Formato

```markdown
---
id: <slug-kebab>
description: <para qué sirve>
used_by: [<command1>, <skill2>]
---

[Contenido del fragment, prosa o checklist]
```

## Carga

Desde un command/skill:

```markdown
## Paso N

Aplica los lineamientos de [`docs/prompts/<slug>.md`](../../docs/prompts/<slug>.md)
para esta sección.
```

El agente lee on-demand con `ctx_read("docs/prompts/<slug>.md", mode=full)`.

## Ejemplos potenciales (futuros)

- `commit-message-format.md` — Conventional Commits con ejemplos
- `pr-description-format.md` — template del PR body
- `security-review-checklist.md` — para skill `security` futuro
- `accessibility-checklist.md` — para skill `frontend-design` futuro
