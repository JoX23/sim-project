#!/usr/bin/env bash
# pre-tool.sh — Tier gate del harness (F1)
#
# Protocolo de hooks Claude Code:
# - Recibe JSON por stdin con la invocación del tool
# - Exit 0 = allow
# - Exit 2 + mensaje a stderr = block con motivo visible para el usuario
# - Cualquier otro código = error del hook (no afecta el tool)
#
# En F1 solo enforzamos tier `full-access` (HITL gate determinista).
# F2 añadirá: budget tracking + degradación + span structurado a telemetry.

set -euo pipefail

# Leer payload del hook (Claude Code lo manda por stdin)
HOOK_INPUT="$(cat || true)"

# Si jq está disponible, parseamos; si no, fallback a grep simple
TOOL_NAME=""
TOOL_INPUT=""

if command -v jq >/dev/null 2>&1; then
  TOOL_NAME="$(echo "$HOOK_INPUT" | jq -r '.tool_name // ""' 2>/dev/null || echo "")"
  TOOL_INPUT="$(echo "$HOOK_INPUT" | jq -r '.tool_input.command // .tool_input // ""' 2>/dev/null || echo "")"
else
  TOOL_NAME="$(echo "$HOOK_INPUT" | grep -oE '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"([^"]+)"$/\1/' || echo "")"
  TOOL_INPUT="$(echo "$HOOK_INPUT" | grep -oE '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"([^"]+)"$/\1/' || echo "")"
fi

# Solo enforzamos sobre Bash en F1; otros tools pasan
if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

# Convertir a lowercase para matching más robusto
CMD_LOWER="$(echo "$TOOL_INPUT" | tr '[:upper:]' '[:lower:]')"

# Patrones de tier full-access — siempre HITL (block + mensaje al usuario)
# El usuario puede aprobar manualmente respondiendo al prompt de Claude Code.
declare -a FULL_ACCESS_PATTERNS=(
  'git[[:space:]]+push'
  'git[[:space:]]+push[[:space:]]+--force'
  'git[[:space:]]+reset[[:space:]]+--hard'
  'git[[:space:]]+clean[[:space:]]+-f'
  'rm[[:space:]]+-rf'
  '(npm|pnpm|yarn|pip|cargo|gem)[[:space:]]+publish'
  'gh[[:space:]]+release[[:space:]]+create'
  'gh[[:space:]]+pr[[:space:]]+merge'
  '\.env[[:alnum:]_-]*[[:space:]]*='
  'cat[[:space:]]+.*\.env'
  'echo[[:space:]]+.*>[[:space:]]*\.env'
)

# Patrones de read sobre secretos / credenciales (siempre block)
declare -a SECRET_READ_PATTERNS=(
  '~/\.ssh/'
  '~/\.aws/'
  '/etc/shadow'
  '/etc/sudoers'
)

for pattern in "${SECRET_READ_PATTERNS[@]}"; do
  if echo "$CMD_LOWER" | grep -qE "$pattern"; then
    echo "🛑 Harness tier gate: el comando intenta leer credenciales/secretos del sistema." >&2
    echo "    Comando: $TOOL_INPUT" >&2
    echo "    Política: _contract.md §3 — operaciones tier 'full-access' siempre HITL." >&2
    exit 2
  fi
done

for pattern in "${FULL_ACCESS_PATTERNS[@]}"; do
  if echo "$CMD_LOWER" | grep -qE "$pattern"; then
    echo "🛑 Harness tier gate: operación tier 'full-access' detectada." >&2
    echo "    Comando: $TOOL_INPUT" >&2
    echo "    Política: _contract.md §3 — siempre HITL. Si confirmas, ejecuta sin el hook o aprueba manualmente." >&2
    exit 2
  fi
done

# (F2+) Placeholder para span estructurado a telemetry.
# En F1 no escribimos archivos para no contaminar el repo.
# Cuando F2 active esto: descomenta y ajusta retention en _contract.md.
#
# TELEMETRY_DIR=".claude/telemetry"
# SESSION_FILE="$TELEMETRY_DIR/$(date -u +%Y%m%d)-session.jsonl"
# mkdir -p "$TELEMETRY_DIR"
# echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"tool\":\"$TOOL_NAME\",\"cmd_hash\":\"$(echo -n "$TOOL_INPUT" | shasum | cut -d' ' -f1)\",\"tier\":\"sandbox-edit\"}" >> "$SESSION_FILE"

exit 0
