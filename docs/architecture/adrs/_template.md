---
adr_id: <NNN — número incremental zero-padded, ej. 001>
title: "<Decisión en frase corta>"
status: proposed | accepted | superseded | deprecated
date: 2026-05-27
deciders: [<owner>, <stakeholders>]
related_plans: [<ULID>, ...]
supersedes: <ADR-NNN o null>
superseded_by: <ADR-NNN o null>
---

# ADR-<NNN> — <Título>

## Contexto

Qué condiciones existían que motivaron la decisión. Problema concreto, no
abstracto. Mencionar restricciones que limitaron las opciones.

## Decisión

La decisión tomada, en una frase declarativa. Sin hedging ("podríamos...").

### Alternativas consideradas

- **<Opción A>** — descartada porque <razón>
- **<Opción B>** — descartada porque <razón>
- **<Opción elegida>** — escogida porque <razón positiva>

## Consecuencias

### Positivas
- <Beneficio 1 medible>
- <Beneficio 2 medible>

### Negativas / Trade-offs
- <Costo 1>
- <Limitación que aceptamos>

### Neutrales (a vigilar)
- <Cosa que cambia pero no es claramente buena ni mala>

## Implementación

Plan files relacionados (`related_plans:` en frontmatter). Si la decisión
introduce una nueva convención → documentarla en `_contract.md` o
`AGENTS.md` según corresponda.

## Cuándo revisar

Condiciones que dispararían revisar/superseder esta ADR (ej.: "si pasa de
3 usuarios concurrentes", "si lean-ctx libera versión 2.0", etc.).

---

## Cuándo crear un ADR (de `_contract.md §6`)

Crear ADR si el cambio:

- Modifica tier de permisos de un comando/herramienta
- Introduce integración externa (API, MCP server, paquete con efectos en build)
- Cambia convención de `AGENTS.md` o `_contract.md`
- Reemplaza biblioteca/dependencia core
- Modifica contrato público de un skill (input/output)

Sin ADR para estos casos → el `reviewer` devuelve `CHANGES_REQUESTED` con
severity `major`.

## Naming

- Archivo: `ADR-<NNN>-<slug-kebab>.md` (ej. `ADR-001-three-phases.md`)
- `<NNN>` es zero-padded a 3 dígitos
- Slug refleja la decisión, no la solución (`three-phases`, no `incremental-rollout`)
