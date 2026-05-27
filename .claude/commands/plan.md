# /plan — Producir plan file con ULID

Intent del feature/cambio: **$ARGUMENTS**

---

## ⚠️ Protocolo — leer antes de empezar

**Ejecuta los 5 pasos en secuencia completa sin detenerte.**

- NO esperes confirmación entre pasos
- Un mensaje del usuario entre pasos = acknowledge, no redirect
- NO marques completo hasta tener el plan file escrito y el ULID asignado

**Anuncia al inicio**: "Ejecutando /plan en 5 pasos. No me detendré entre pasos."

---

## Contrato

Lee [`_contract.md`](_contract.md) secciones: **§1 PEV Invariants**, **§2 lean-ctx**, **§5 DoD**, **§6 ADR triggers**. Si tu intent toca operaciones tier `full-access` → necesitas ADR antes del `/ship` siguiente.

---

## Paso 0 — Contexto (memoria + telemetry + lean-ctx)

1. `mcp__plugin_claude-mem_mcp-search__search` con keywords del intent + `limit=5` → detecta plans previos relacionados o memorias relevantes
2. `ctx_read("memory/MEMORY.md", mode=auto)` → index de memorias project/user/feedback
3. `ctx_tree("docs/plans/", depth=1)` → ¿hay plans con parent encadenable?
4. Si encontraste un plan padre relevante: `ctx_read(<padre>.md, mode=map)` para obtener `read_set`/`write_set` heredables
5. (F2+ — placeholder) `bash scripts/telemetry-summarize.sh --last` cuando exista; en F1 no aplica

Extrae: plans previos relacionados, áreas de código tocadas, restricciones del proyecto.

**→ Continúa INMEDIATAMENTE con Paso 1.**

---

## Paso 1 — Análisis del intent (inline)

Completa la tabla:

| Campo | Análisis |
|---|---|
| Intent verbalizado | Una frase imperativa, máx. 15 palabras |
| Valor de negocio | Por qué importa ahora |
| Read-set candidato | Archivos/módulos que necesitas LEER (no editar) |
| Write-set candidato | Archivos que vas a EDITAR/CREAR/ELIMINAR |
| Invariantes | Reglas que NO deben romperse (tests existentes, contratos públicos, constraints DB) |
| Tier requerido | read-only \| sandbox-edit \| full-access |
| ADR necesario | Sí/no según `_contract.md §6` |
| Tamaño estimado | XS=1 / S=2 / M=3 / L=5 / XL=8+ |
| Riesgo | bajo / medio / alto + por qué |

**→ Paso 2.**

---

## Paso 2 — Invocar skill `planner`

**Invoca `Skill` con `planner`** pasando:

```
Análisis Paso 1: [pegar tabla]
Contexto Paso 0: [plans previos, memorias, restricciones]
Contrato: §1 PEV invariants, §5 DoD del _contract.md

Produce un plan file siguiendo el template docs/plans/_template.md.
Frontmatter YAML obligatorio:
  id: <ULID a generar>
  parent: <ULID del plan padre o null>
  status: draft
  intent: <una frase>
  tier: <read-only|sandbox-edit|full-access>
  read_set: [lista de paths]
  write_set: [lista de paths]
  invariants: [lista de reglas que no romper]
  validation_commands: [shell commands para validar]
  rollback: [shell commands o pasos manuales]
  estimated_size: <XS|S|M|L|XL>
  risk: <bajo|medio|alto>
  created_at: <ISO 8601>

Cuerpo del plan en markdown:
  ## Contexto
  ## Acceptance Criteria (en formato Gherkin: Dado/Cuando/Entonces)
  ## Diseño técnico
  ## Plan de ejecución (pasos numerados que el implementer seguirá)
  ## Notas de rollback
```

El skill devuelve: el contenido completo del plan file + el ULID generado.

**→ Paso 3.**

---

## Paso 3 — Review preliminar inline

Antes de escribir el archivo, verifica:

- [ ] ¿El `read_set` cubre todo lo que necesita leer el implementer?
- [ ] ¿El `write_set` es realmente el mínimo necesario? (over-scoping = mala señal)
- [ ] ¿Los `invariants` son testables? (vagos como "no romper nada" → reformula)
- [ ] ¿Los `validation_commands` son ejecutables tal cual?
- [ ] ¿El `rollback` es accionable sin context adicional?
- [ ] ¿El tier coincide con las operaciones reales del plan?
- [ ] Si tier = `full-access` o invariante público se modifica → ¿hay ADR?

Si falla algún check → vuelve al planner con feedback específico.

**→ Paso 4.**

---

## Paso 4 — Escribir plan file

1. **Genera ULID**:
   ```bash
   # Si tienes ulid CLI: ulid
   # Fallback portable:
   date -u +"%Y%m%dT%H%M%SZ"  # timestamp + sufijo aleatorio
   ```
   Forma final: 26 caracteres alfanuméricos (Crockford base32). Ej.: `01jbvqd9k8m2n3p4r5s6t7v8w9`.

2. **Escribe** `docs/plans/<ULID>-<slug-corto>.md` con el contenido del Paso 2.
   - `<slug-corto>` opcional, derivado del intent (máx. 4 palabras kebab-case)
   - El archivo es la fuente de verdad; el slug es solo cosmetic

3. Si requería ADR (Paso 3 detectó trigger): crea también
   `docs/architecture/adrs/ADR-<NNN>-<slug>.md` con la decisión.

**→ Paso 5.**

---

## Paso 5 — Resumen final

```
✅ /plan completado

| Campo            | Valor                                  |
|---|---|
| Plan ID          | <ULID>                                 |
| Intent           | <una frase>                            |
| Tier             | read-only / sandbox-edit / full-access |
| Tamaño           | XS/S/M/L/XL                            |
| Riesgo           | bajo/medio/alto                        |
| ADR creado       | Sí (ADR-NNN) / No                      |
| Read-set         | N archivos                             |
| Write-set        | N archivos                             |
| Archivo          | docs/plans/<ULID>-<slug>.md            |

Para ejecutar: /ship <ULID>
Para abandonar: mover docs/plans/<ULID>-<slug>.md a docs/plans/rejected/
```

---

## Tabla de pasos

| Paso | Acción | Tool/Skill |
|---|---|---|
| 0 | Contexto (memoria + lean-ctx) | `mcp__plugin_claude-mem_mcp-search` + `ctx_read` + `ctx_tree` |
| 1 | Análisis del intent | inline |
| 2 | Construir plan file | Skill `planner` |
| 3 | Review preliminar | inline |
| 4 | Escribir archivo + ADR si aplica | `Write` |
| 5 | Resumen | inline |
