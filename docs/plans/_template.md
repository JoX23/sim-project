---
id: <ULID-26-CHARS>
parent: null
status: draft
intent: "<frase imperativa máx 15 palabras>"
tier: sandbox-edit
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
estimated_size: M
risk: medio
created_at: 2026-05-27T00:00:00Z
---

# <Título del plan derivado del intent>

## Contexto

Por qué este cambio importa ahora. Referencias a plans padres si aplica
(`parent:` en frontmatter). Restricciones o decisiones previas relevantes.

## Acceptance Criteria

Criterios verificables vía `validation_commands`. Formato Gherkin (Dado/Cuando/Entonces)
recomendado para AC complejos; lista simple para AC triviales.

- [ ] **AC-1**: Dado <contexto>, cuando <acción>, entonces <resultado observable>
- [ ] **AC-2**: <happy path>
- [ ] **AC-3**: <edge case relevante>
- [ ] **AC-4**: <no-regresión de flujo adyacente>

## Diseño técnico

Decisiones de arquitectura, contratos nuevos, datos, integraciones.
Mantener escueto — el detalle exhaustivo va en ADRs si la decisión es structural.

## Plan de ejecución

Pasos numerados que el `implementer` seguirá. Cada paso debe ser ejecutable
sin ambigüedad y producir un cambio observable.

1. <paso 1: leer archivo X, identificar función Y>
2. <paso 2: modificar Y para soportar Z>
3. <paso 3: añadir test en `<test path>` cubriendo AC-1 y AC-2>
4. <paso 4: ejecutar `<TEST_CMD>` y verificar verde>

## Notas de rollback

Cuándo revertir y cómo. Si `rollback:` en frontmatter cubre todo, mover aquí
solo notas adicionales (ej. impacto en datos, notificaciones a stakeholders).

## Referencias

- ADR-NNN si aplica
- Plan padre `<ULID>` si aplica
- Tickets `tickets/<id>.yaml` si aplica
