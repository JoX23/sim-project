# Tickets

Backlog del proyecto. **Un archivo YAML por ticket** (vs. yaml monolítico) —
evita merge conflicts cuando múltiples agentes o humanos crean/actualizan
tickets en paralelo.

## Por qué un archivo por ticket

Inspirado en el paper §5.2.4 (Transactional Shared Program State): el yaml
monolítico es un blackboard sin semántica transaccional. Agentes paralelos
sobre el mismo archivo → merge conflicts inevitables. Archivos individuales:

- ✅ Concurrent writes sin conflict (cada uno toca su file)
- ✅ Git history limpia (un PR cambia el ticket que tocó)
- ✅ Filesystem es el index — `ls tickets/*.yaml` ya es la lista
- ❌ Reporte agregado requiere script (resuelto con `scripts/tickets-aggregate.sh`)

## Schema

Ver [`_template.yaml`](_template.yaml). Campos obligatorios:

- `id` — ULID 26 chars Crockford base32 (lowercase)
- `title`, `type`, `status`, `priority`, `points`
- `created_at`, `updated_at` — ISO 8601 UTC

Campos opcionales: `epic`, `sprint`, `related_plans`, `related_adrs`, `related_prs`,
`description`, `reproduction_steps`/`expected`/`actual` (bugs).

## Naming

`tickets/<ULID>.yaml` — el ULID es la identidad. **Sin slug en el nombre del
archivo** (a diferencia de plan files): si renombras tickets en bulk, el slug
queda obsoleto; el ULID nunca.

## Ciclo de vida

```
backlog → in_progress → resolved
              ↓
           blocked → in_progress
              ↓
           wontfix (terminal)
```

Cambios de status: actualiza `updated_at`. Si pasa a `resolved`, añade el
plan que lo cerró a `related_plans:` y el PR a `related_prs:`.

## Linkage con plans

Cuando un plan empieza a resolver un ticket:
1. Plan file en `docs/plans/<ULID>.md`
2. `tickets/<ULID-ticket>.yaml` añade el ULID del plan a `related_plans:`
3. Al `/ship` exitoso, `tickets/<ULID-ticket>.yaml` status → `resolved`

## Reporte agregado

```bash
bash scripts/tickets-aggregate.sh
# → genera tickets/_report.md con tabla de todos los tickets, agrupados por sprint/epic
```

`_report.md` está en `.gitignore` (deriva, no fuente).

## Cuándo NO usar tickets

- TODO de 5 minutos → comentario `// TODO:` en el código
- Idea futura sin commit → backlog en cabeza o memoria personal
- Decisión arquitectónica → ADR, no ticket
- Plan de trabajo activo → plan file, no ticket (los tickets pueden disparar plans)
