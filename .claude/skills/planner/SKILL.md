---
name: planner
description: Produce un plan file estructurado con frontmatter ULID (read_set, write_set, invariants, validation_commands, rollback). Stack-neutral. Se invoca desde /plan Paso 2. Lee _contract.md secciones §1 PEV, §5 DoD, §6 ADR triggers antes de generar el plan.
---

# Planner skill

Rol en el harness PEV: transforma un intent natural en un **artefacto contractual** (plan file) que el `implementer` ejecutará y el `reviewer` verificará. Stack-neutral: no asume lenguaje ni framework — opera sobre paths, no sobre semántica.

## Contrato (input / output)

### Input
- Análisis del intent (tabla del `/plan` Paso 1)
- Contexto (Paso 0): plans previos, memorias, restricciones
- Referencia obligatoria: [`_contract.md`](../../commands/_contract.md) §1, §5, §6

### Output
Plan file completo con frontmatter YAML + cuerpo markdown. Estructura exacta en
[`docs/plans/_template.md`](../../../docs/plans/_template.md).

## Invariantes que debes respetar

1. **`read_set` ⊆ archivos realmente leídos por el `implementer`**. Sobre-declarar no es problema; sub-declarar rompe el state consistency check en `/ship` Paso 4.
2. **`write_set` = mínimo necesario**. Si te tienta añadir paths "por si acaso" → no. El `implementer` añadirá tests nuevos automáticamente; eso se registra en evidence, no en write_set.
3. **`invariants` testables**. Cada invariante debe poder verificarse vía `validation_commands`. "No romper nada" no es invariante; "tests/auth.test.ts sigue verde" sí.
4. **`validation_commands` ejecutables tal cual**. El `tester` los corre con `ctx_shell`. Si requieren contexto adicional, dócumentalo inline.
5. **`rollback` accionable**. Comandos shell o pasos manuales numerados. Si no hay rollback seguro → el plan necesita HITL antes de `/ship`.
6. **ULID único**. Verifica que `docs/plans/<ULID>*.md` no exista antes de proponer el ID.
7. **`tier` honesto**. Si dudas entre sandbox-edit y full-access → escoge full-access; el HITL gate evita sorpresas.

## Frontmatter obligatorio

```yaml
---
id: <ULID 26 chars, lowercase Crockford base32>
parent: <ULID del plan padre o null>
status: draft
intent: "<frase imperativa máx 15 palabras>"
tier: read-only | sandbox-edit | full-access
read_set:
  - <path1>
  - <path2>
write_set:
  - <path1>
  - <path2>
invariants:
  - "<regla testable 1>"
  - "<regla testable 2>"
validation_commands:
  - "<shell command 1>"
  - "<shell command 2>"
rollback:
  - "<comando o paso 1>"
  - "<comando o paso 2>"
estimated_size: XS | S | M | L | XL
risk: bajo | medio | alto
created_at: <ISO 8601>
---
```

## Cuerpo del plan (markdown)

Secciones obligatorias en este orden:

```markdown
## Contexto
[Por qué este cambio importa ahora. Plans padres relacionados.]

## Acceptance Criteria
- [ ] Dado <contexto>, cuando <acción>, entonces <resultado observable>
- [ ] [happy path]
- [ ] [edge case relevante]
- [ ] [no-regresión de flujo adyacente]

## Diseño técnico
[Decisiones de arquitectura, contratos nuevos, integraciones, datos.]

## Plan de ejecución
1. <paso ejecutable>
2. <paso ejecutable>
...

## Notas de rollback
[Cuándo y cómo revertir si algo sale mal en producción.]
```

## Cuándo proponer crear ADR

Activador (de `_contract.md §6`):
- Modifica tier de permisos
- Introduce dependencia/integración externa
- Cambia convención de `AGENTS.md` o `_contract.md`
- Reemplaza biblioteca core
- Modifica contrato público de un skill

Si aplica → menciónalo en tu output: "Este plan requiere ADR-NNN-<slug> antes del `/ship`".

## Errores comunes a evitar

- ❌ `write_set` que incluye tests por defecto → el `implementer` los añade y el evidence los registra
- ❌ Invariantes vagas como "código limpio" → no son testables
- ❌ `validation_commands` con `<TEST_CMD>` literal → resuelve el placeholder desde `AGENTS.md`
- ❌ ULID inventado sin verificar unicidad → conflict en filesystem
- ❌ Plan sin `rollback` para cambio destructivo → el reviewer lo bloqueará
