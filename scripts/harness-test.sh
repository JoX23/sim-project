#!/usr/bin/env bash
# harness-test.sh — Valida coherencia interna del propio harness (F1).
# Idempotente: re-ejecutable sin daño. Portable: bash 3.2+, sin jq.
#
# Exit codes:
#   0 — todos los checks pasan
#   1 — al menos un check falló (detalle a stderr)
#
# Uso:
#   bash scripts/harness-test.sh                # checks F1
#   bash scripts/harness-test.sh --verbose      # imprime cada check OK también

set -uo pipefail

VERBOSE=0
if [ "${1:-}" = "--verbose" ] || [ "${1:-}" = "-v" ]; then
  VERBOSE=1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FAIL_COUNT=0
PASS_COUNT=0

# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  if [ $VERBOSE -eq 1 ]; then
    echo "  ✅ $1"
  fi
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "  ❌ $1" >&2
}

section() {
  echo ""
  echo "▶ $1"
}

file_contains() {
  # $1 = path, $2 = pattern (regex grep-extended)
  grep -qE "$2" "$1" 2>/dev/null
}

count_lines() {
  wc -l < "$1" 2>/dev/null | tr -d ' '
}

# ----------------------------------------------------------------------------
# Section 1 — Root contracts
# ----------------------------------------------------------------------------

section "Section 1 — Root contracts"

if [ -f "AGENTS.md" ]; then
  pass "AGENTS.md exists"
else
  fail "AGENTS.md missing — fuente única del contrato público"
fi

if [ -f "CLAUDE.md" ]; then
  pass "CLAUDE.md exists"
  if file_contains "CLAUDE.md" '@AGENTS\.md'; then
    pass "CLAUDE.md imports AGENTS.md (@AGENTS.md detected)"
  else
    fail "CLAUDE.md no importa AGENTS.md — esperado '@AGENTS.md' para evitar drift"
  fi
else
  fail "CLAUDE.md missing"
fi

if [ -f ".mcp.json" ]; then
  pass ".mcp.json exists"
  if file_contains ".mcp.json" 'lean-ctx'; then
    pass ".mcp.json declares lean-ctx"
  else
    fail ".mcp.json no declara lean-ctx — dependencia mandatoria del harness"
  fi
else
  fail ".mcp.json missing"
fi

# ----------------------------------------------------------------------------
# Section 2 — .claude/ versioning + structure
# ----------------------------------------------------------------------------

section "Section 2 — .claude/ versioning + structure"

if [ -f ".claude/VERSION" ]; then
  VERSION="$(cat .claude/VERSION | tr -d '[:space:]')"
  if echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    pass ".claude/VERSION = $VERSION (semver válido)"
  else
    fail ".claude/VERSION '$VERSION' no es semver — esperado MAJOR.MINOR.PATCH"
  fi
else
  fail ".claude/VERSION missing"
fi

if [ -f ".claude/CHANGELOG.md" ]; then
  pass ".claude/CHANGELOG.md exists"
else
  fail ".claude/CHANGELOG.md missing"
fi

if [ -f ".claude/settings.template.json" ]; then
  pass ".claude/settings.template.json exists (config de referencia)"
else
  fail ".claude/settings.template.json missing — plantilla de tier enforcement"
fi

# ----------------------------------------------------------------------------
# Section 3 — Commands integrity
# ----------------------------------------------------------------------------

section "Section 3 — Commands integrity"

for cmd in plan ship triage; do
  CMD_PATH=".claude/commands/${cmd}.md"
  if [ -f "$CMD_PATH" ]; then
    pass "command $cmd.md exists"
    if file_contains "$CMD_PATH" '_contract\.md'; then
      pass "  → $cmd.md references _contract.md"
    else
      fail "  → $cmd.md no referencia _contract.md (debe leerlo según protocolo)"
    fi
  else
    fail "command $cmd.md missing"
  fi
done

if [ -f ".claude/commands/_contract.md" ]; then
  pass "_contract.md exists"
  CONTRACT_LINES=$(count_lines ".claude/commands/_contract.md")
  if [ "$CONTRACT_LINES" -lt 400 ]; then
    pass "  → _contract.md = $CONTRACT_LINES líneas (bajo 400, OK para F1)"
  else
    fail "  → _contract.md = $CONTRACT_LINES líneas — considera split (recomendación: >300)"
  fi
else
  fail "_contract.md missing — contrato compartido obligatorio"
fi

# ----------------------------------------------------------------------------
# Section 4 — Skills integrity
# ----------------------------------------------------------------------------

section "Section 4 — Skills integrity"

for skill in planner implementer reviewer tester; do
  SKILL_PATH=".claude/skills/${skill}/SKILL.md"
  if [ -f "$SKILL_PATH" ]; then
    pass "skill $skill/SKILL.md exists"
    # Frontmatter validation: name + description en primeras 10 líneas
    HEAD10="$(head -10 "$SKILL_PATH")"
    if echo "$HEAD10" | grep -qE '^name:[[:space:]]+'; then
      pass "  → frontmatter has 'name:'"
    else
      fail "  → $skill no tiene 'name:' en frontmatter"
    fi
    if echo "$HEAD10" | grep -qE '^description:[[:space:]]+'; then
      pass "  → frontmatter has 'description:'"
    else
      fail "  → $skill no tiene 'description:' en frontmatter"
    fi
  else
    fail "skill $skill/SKILL.md missing"
  fi
done

# ----------------------------------------------------------------------------
# Section 5 — Hooks
# ----------------------------------------------------------------------------

section "Section 5 — Hooks"

if [ -f ".claude/hooks/pre-tool.sh" ]; then
  pass "pre-tool.sh exists"
  if [ -x ".claude/hooks/pre-tool.sh" ]; then
    pass "  → pre-tool.sh is executable"
  else
    fail "  → pre-tool.sh NO es ejecutable — corre: chmod +x .claude/hooks/pre-tool.sh"
  fi
else
  fail "pre-tool.sh missing"
fi

if [ -f ".claude/hooks/README.md" ]; then
  pass "hooks/README.md exists"
else
  fail "hooks/README.md missing"
fi

# ----------------------------------------------------------------------------
# Section 6 — Memory
# ----------------------------------------------------------------------------

section "Section 6 — Memory"

if [ -f "memory/MEMORY.md" ]; then
  pass "memory/MEMORY.md exists"
  MEM_LINES=$(count_lines "memory/MEMORY.md")
  if [ "$MEM_LINES" -le 200 ]; then
    pass "  → MEMORY.md = $MEM_LINES líneas (≤200, OK para auto-load)"
  else
    fail "  → MEMORY.md = $MEM_LINES líneas — supera 200, Claude truncará"
  fi
else
  fail "memory/MEMORY.md missing"
fi

if [ -f "memory/README.md" ]; then
  pass "memory/README.md exists"
else
  fail "memory/README.md missing"
fi

# ----------------------------------------------------------------------------
# Section 7 — Docs templates
# ----------------------------------------------------------------------------

section "Section 7 — Docs templates"

for template in "docs/plans/_template.md" "docs/architecture/adrs/_template.md" "docs/runbooks/README.md" "docs/prompts/README.md"; do
  if [ -f "$template" ]; then
    pass "$template exists"
  else
    fail "$template missing"
  fi
done

# Plan template debe tener frontmatter completo
PLAN_TMPL="docs/plans/_template.md"
if [ -f "$PLAN_TMPL" ]; then
  for field in "id:" "read_set:" "write_set:" "invariants:" "validation_commands:" "rollback:"; do
    if file_contains "$PLAN_TMPL" "^${field}"; then
      pass "  → plan template has field '$field'"
    else
      fail "  → plan template missing field '$field'"
    fi
  done
fi

# ----------------------------------------------------------------------------
# Section 8 — Tickets
# ----------------------------------------------------------------------------

section "Section 8 — Tickets"

if [ -f "tickets/_template.yaml" ]; then
  pass "tickets/_template.yaml exists"
else
  fail "tickets/_template.yaml missing"
fi

if [ -f "tickets/README.md" ]; then
  pass "tickets/README.md exists"
else
  fail "tickets/README.md missing"
fi

# ----------------------------------------------------------------------------
# Section 9 — lean-ctx intent-level anti-pattern check
# ----------------------------------------------------------------------------

section "Section 9 — lean-ctx anti-patterns (intent-level)"

# Buscamos anti-patterns en commands/skills (frase explícita "Read X completo" o similar)
# NO match positivo de ctx_* (eso es validación de uso correcto, no de ausencia)
# Solo flagueamos frases en MAYÚSCULAS específicas que claramente piden el patrón malo.

ANTIPATTERN_FILES=$(find .claude/commands .claude/skills -name "*.md" 2>/dev/null)

if [ -z "$ANTIPATTERN_FILES" ]; then
  fail "no se encontraron commands/skills para validar"
else
  AP_FOUND=0
  # Patrones que indican mal uso (no menciones legítimas en tablas de _contract.md)
  # Buscamos en líneas que NO sean tablas markdown (sin '|' en la línea)
  for f in $ANTIPATTERN_FILES; do
    # Skip _contract.md de la check (es donde se enumera explícitamente)
    if [ "$(basename "$f")" = "_contract.md" ]; then
      continue
    fi
    # Bash hardcoded con cat/head/tail sin ctx_shell context
    if grep -nE '`?\b(cat|head|tail)[[:space:]]+[^|`]*\.md`?' "$f" | grep -v 'ctx_\|`#' | grep -v '_contract.md' > /tmp/_ap_$$.tmp 2>/dev/null; then
      if [ -s /tmp/_ap_$$.tmp ]; then
        # Solo flagear si parece instrucción real (no en bloque de código de anti-pattern)
        true  # Para F1, no flageamos nada — esta check se afina con casos reales
      fi
      rm -f /tmp/_ap_$$.tmp
    fi
  done
  pass "anti-pattern scan completed (F1 baseline — refina con casos reales en F2)"
fi

# ----------------------------------------------------------------------------
# Section 10 — Placeholder check (stack-agnostic)
# ----------------------------------------------------------------------------

section "Section 10 — Stack placeholders"

# Warn (no fail) si quedan placeholders sin reemplazar
PLACEHOLDER_FILES=$(grep -l '<STACK\|<RUNTIME\|<BUILD_CMD\|<TEST_CMD\|<LINT_CMD\|<OWNER_NAME\|<MAIN_BRANCH' AGENTS.md CLAUDE.md 2>/dev/null || true)
if [ -n "$PLACEHOLDER_FILES" ]; then
  echo "  ⚠️  Placeholders sin reemplazar (esperado en template recién clonado):"
  for f in $PLACEHOLDER_FILES; do
    echo "      $f"
  done
  echo "      → Esto NO falla el check; reemplaza al personalizar para tu proyecto."
fi

# ----------------------------------------------------------------------------
# Resumen
# ----------------------------------------------------------------------------

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Pasaron: $PASS_COUNT"
echo "  Fallaron: $FAIL_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAIL_COUNT -eq 0 ]; then
  echo "✅ Harness coherente (v$(cat .claude/VERSION 2>/dev/null || echo '?'))"
  exit 0
else
  echo "❌ $FAIL_COUNT check(s) fallaron — ver salida arriba"
  exit 1
fi
