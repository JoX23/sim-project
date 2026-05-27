# Contrato del harness (referenciado por todos los commands)

> Fuente única de invariantes, DoD, severidades y políticas. Los commands
> `/plan`, `/ship`, `/triage` y los skills (`planner`, `implementer`, `reviewer`,
> `tester`) lo leen como contrato compartido. **No duplicar** estas reglas en
> los markdown de commands/skills — referenciar por sección.

---

## 1. PEV Invariants (Plan → Execute → Verify)

Del paper *Code as Agent Harness* (2026, §3.4).

1. **Plan antes que Execute**. Ningún cambio en código sin un plan file con
   ULID. `/ship <ULID>` falla si el archivo no existe o no es válido.
2. **Verify es parte de Execute**, no opcional. `/ship` corre `tester` y
   `reviewer` siempre; sin gate aprobado no se cierra el ciclo.
3. **Evidence bundle obligatorio**. Cada `/ship` produce
   `docs/plans/<ULID>.evidence.md` con: checks corridos, untested regions,
   residual risks, diff hash.
4. **Plan files son inmutables tras `/ship`**. Edits posteriores van en un nuevo
   plan file con `parent: <ULID>` (cadena auditada).
5. **Rollback declarado, no inferido**. Cada plan file debe incluir un campo
   `rollback:` con comandos concretos. Si no hay rollback seguro, el plan
   requiere HITL.

---

## 2. lean-ctx Invariants (intent-level)

lean-ctx es el context runtime canónico del harness. Estos son los
**anti-patterns** que `scripts/harness-test.sh` busca en commands/skills:

| Anti-pattern | Reemplazo correcto | Razón |
|---|---|---|
| "Lee el archivo completo" / "Read X completo" | `ctx_read(path, mode=auto)` | 10 modos auto-seleccionados; re-read ~13 tokens |
| `cat archivo.md` / `head -n 100 file` | `ctx_read(path, lines:N-M)` o `mode=map` | Compresión + cache |
| `find . -name "*.ts"` listando todo | `ctx_tree(path, depth=N)` | Mapa compacto |
| `grep -r "X" .` | `ctx_search(pattern, path)` | Resultados estructurados |
| `bash` con pipe a `head/tail/sed` | `ctx_shell(command)` raw=false | 95+ patrones de compresión |

**Permitido sin reservas**: `Edit`, `Write`, `Glob`, `NotebookEdit` nativos
(lean-ctx es read-mostly). `ctx_edit` solo si Edit no está disponible.

**Modos de `ctx_read` por situación** (paper §3.2 + lean-ctx skill):

| Situación | Modo |
|---|---|
| Vas a editar el archivo | `full` |
| Solo necesitas API surface | `map` o `signatures` |
| Archivo grande, contexto general | `entropy` o `aggressive` |
| Rango específico | `lines:N-M` |
| Diff con versión anterior | `diff` |
| Tareas activas | `task` |

---

## 3. Permission Tiers (convención + enforcement)

Tres tiers. El pre-tool hook (`.claude/hooks/pre-tool.sh`) los enforce a
nivel Bash; `settings.json` los expone como allow/ask/deny.

| Tier | Qué permite | Auto-allow | Ejemplos |
|---|---|---|---|
| **read-only** | Exploración sin mutaciones | ✅ | `ctx_read`, `ctx_search`, `ctx_tree`, `git status/log/diff`, `ls`, `wc` |
| **sandbox-edit** | Edición local + tests/builds dentro del repo | ✅ si scope = repo | `Edit`, `Write`, `NotebookEdit`, `<TEST_CMD>`, `<LINT_CMD>`, `git add/commit` local |
| **full-access** | Operaciones con efecto fuera del repo o irreversibles | ❌ **siempre HITL** | `git push`, `<DEPLOY_CMD>`, `<PKG_MGR> publish`, `rm -rf`, mod a `.env*`, deploys |

### Tabla HITL (operaciones que **siempre** requieren aprobación humana)

- `git push` (a cualquier rama remota)
- `git push --force` (bloqueado además en `main`/`master`)
- `git reset --hard`, `git clean -f`
- `rm -rf <path>` (cualquier path)
- Modificar `.env*`, `secrets/`, `~/.ssh/`, `~/.aws/`, credenciales
- `<PKG_MGR> publish`, `gh release create`
- `<DEPLOY_CMD>` (Railway, Vercel, Fly, etc.)
- Cualquier llamada de red a APIs no listadas en `AGENTS.md`

---

## 4. Severities (para findings del `reviewer` skill)

| Severity | Bloquea merge | Definición |
|---|---|---|
| **blocker** | ✅ | Viola regla inviolable del contrato (ej.: tier violation, secret leak, plan ID inconsistente, lean-ctx anti-pattern en command) |
| **major** | ✅ | Rompe patrón obligatorio del proyecto (declarado en `AGENTS.md` o `_contract.md`); ej.: error sin tipar, falta de tests para nuevo path |
| **minor** | ❌ | Mejora de calidad sin riesgo (ej.: nombre confuso, comentario obsoleto) |
| **info** | ❌ | Sugerencia / refactor opcional |

Regla de gating: el veredicto del `reviewer` es `APPROVED` (solo minor/info)
o `CHANGES_REQUESTED` (≥1 blocker o major). No hay terceros estados.

---

## 5. Definition of Done (DoD)

Un `/ship` se considera completo solo si **todos** estos puntos pasan:

- [ ] Plan file con ULID válido referenciado por el `/ship`
- [ ] `read_set` y `write_set` del plan **matchean** el diff real (state consistency)
- [ ] Tests existentes pasan (no regresión)
- [ ] Tests nuevos cubren los AC declarados en el plan (verification strength)
- [ ] Lint corre limpio en archivos modificados (no auto-fix en archivos ajenos)
- [ ] Typecheck limpio si el stack lo soporta
- [ ] `reviewer` devuelve `APPROVED`
- [ ] Evidence bundle escrito en `docs/plans/<ULID>.evidence.md`
- [ ] Ninguna operación de tier `full-access` ejecutada sin HITL gate explícito
- [ ] Si el plan toca operación irreversible → ADR creado en `docs/architecture/adrs/`

---

## 6. ADR triggers (cuándo crear un ADR)

Crear `docs/architecture/adrs/ADR-<NNN>-<slug>.md` antes de `/ship` si el
cambio:

- Modifica el tier de permisos de un comando o herramienta
- Introduce una integración externa nueva (API, MCP server, paquete con efectos en build)
- Cambia una convención declarada en `AGENTS.md` o `_contract.md`
- Reemplaza una biblioteca/dependencia core
- Modifica el contrato público de un skill (input/output)

Sin ADR para estos casos, `reviewer` devuelve `CHANGES_REQUESTED` con
severity `major`.

---

## 7. Prompt caching guidance

Para maximizar cache hit rate de Anthropic / OpenAI:

- **Contenido estable arriba** de archivos cargados por contexto (`AGENTS.md`,
  `CLAUDE.md`, `_contract.md`, `MEMORY.md`).
- **Variables/contexto dinámico abajo** (último 20% del archivo).
- `_contract.md` no se reescribe completo en cada cambio — se añaden secciones
  al final cuando es posible.
- Plan files (`docs/plans/<ULID>.md`) cambian frecuentemente → no se cargan
  como contexto base; se leen on-demand.

---

## 8. Idioma y naming

- **User-facing docs** (commands, skills, runbooks, ADRs body): **Español**
- **Metadata técnica** (frontmatter YAML, IDs, identifiers de código,
  schemas, exit codes): **Inglés**
- **Files**: kebab-case (`add-feature.md`)
- **YAML fields**: snake_case (`read_set:`, `validation_commands:`)
- **ULIDs**: minúsculas + dígitos (`01jbvqd9...`)

---

## 9. Errores comunes de implementación (evitar)

- ❌ Duplicar reglas de `_contract.md` en commands → siempre referenciar por sección
- ❌ Crear plan files sin ULID → invalida idempotencia y cadena `parent:`
- ❌ Saltarse el `tester` skill en `/ship` por "ser un cambio trivial" → DoD lo exige
- ❌ Editar tickets.yaml monolítico → usar `tickets/<ULID>.yaml` individual
- ❌ Asumir tier auto-allow para operaciones no listadas → default = pedir HITL

---

## 10. Versionado del contrato

Este archivo es versionado con `.claude/VERSION` (semver). Cambios mayores
(reglas inviolables nuevas) → bump MAJOR. Cambios menores (clarificación,
nuevo anti-pattern) → bump MINOR. Typo fixes → PATCH.

Versión actual: **0.1.0** (F1 — Foundation).
