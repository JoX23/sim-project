# Runbooks

Playbooks operacionales: un problema = un archivo.

## Cuándo escribir un runbook

- Problema operacional que ocurre **más de una vez** (regla de tres: lo veo, lo veo de nuevo, escribo runbook)
- Procedimiento que **requiere pasos ordenados** y verificaciones intermedias
- Recovery o rollback de incidente que reproducirá el equipo o tu yo-futuro
- Setup/teardown de infrastructure que no cabe en `AGENTS.md`

## Cuándo NO escribir un runbook

- Pasos triviales (`npm install`) — viven en `AGENTS.md`
- Documentación de feature — vive en el código + tests
- Decisiones arquitectónicas — viven en `docs/architecture/adrs/`
- Plan de trabajo — vive en `docs/plans/<ULID>.md`

## Formato

Cada runbook es un archivo `<slug>.md` con estructura:

```markdown
# Runbook — <Problema concreto en frase>

## Cuándo aplicar
[Síntomas que disparan este runbook]

## Diagnóstico (read-only primero)
1. <comando para confirmar el problema>
2. <comando para descartar causa A>

## Resolución
1. <paso 1 con comando exacto>
2. <paso 2>
3. Verificar: <comando o métrica que confirma fix>

## Rollback (si la resolución falla)
1. <paso de reversión>

## Notas
- Última vez que ocurrió: <fecha>
- Owner: <quién mantiene este runbook>
```

## Ejemplos potenciales

- `deploy-rollback.md` — qué hacer cuando un deploy rompe prod
- `db-migration-failed.md` — recovery de migración fallida
- `secrets-rotation.md` — rotar credenciales sin downtime
- `mcp-server-down.md` — qué hacer si lean-ctx falla
