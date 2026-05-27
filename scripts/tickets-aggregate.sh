#!/usr/bin/env bash
# tickets-aggregate.sh — Genera reporte agregado de tickets desde tickets/*.yaml
# Idempotente: re-ejecutable, output sobrescrito.
# Output: tickets/_report.md (gitignored — deriva)
#
# Uso: bash scripts/tickets-aggregate.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TICKETS_DIR="tickets"
OUTPUT="$TICKETS_DIR/_report.md"

if [ ! -d "$TICKETS_DIR" ]; then
  echo "❌ tickets/ no existe" >&2
  exit 1
fi

# Lista de YAMLs excluyendo _template
TICKET_FILES=$(find "$TICKETS_DIR" -maxdepth 1 -name "*.yaml" ! -name "_template.yaml" 2>/dev/null | sort)

if [ -z "$TICKET_FILES" ]; then
  cat > "$OUTPUT" <<EOF
# Tickets — reporte agregado

_Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)_

No hay tickets activos. Crea uno copiando \`tickets/_template.yaml\` a
\`tickets/<ULID>.yaml\` y rellénalo.

Para generar ULID: \`date -u +%s%N | shasum | cut -c1-26\` (fallback portable).
EOF
  echo "✅ Reporte generado (sin tickets): $OUTPUT"
  exit 0
fi

# Función portable para extraer field YAML simple (no anidado)
yaml_get() {
  # $1 = file, $2 = field
  grep -E "^${2}:[[:space:]]+" "$1" | head -1 | sed -E "s/^${2}:[[:space:]]+//" | sed -E 's/^["'"'"']//' | sed -E 's/["'"'"']$//'
}

{
  echo "# Tickets — reporte agregado"
  echo ""
  echo "_Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)_"
  echo ""
  echo "## Tabla resumen"
  echo ""
  echo "| ID | Title | Type | Status | Priority | Points | Epic |"
  echo "|---|---|---|---|---|---|---|"

  for f in $TICKET_FILES; do
    ID=$(yaml_get "$f" "id")
    TITLE=$(yaml_get "$f" "title")
    TYPE=$(yaml_get "$f" "type")
    STATUS=$(yaml_get "$f" "status")
    PRIORITY=$(yaml_get "$f" "priority")
    POINTS=$(yaml_get "$f" "points")
    EPIC=$(yaml_get "$f" "epic")
    EPIC="${EPIC:-—}"

    echo "| \`${ID:0:8}…\` | $TITLE | $TYPE | $STATUS | $PRIORITY | $POINTS | $EPIC |"
  done

  echo ""
  echo "## Agrupado por status"
  echo ""

  for st in backlog in_progress blocked resolved wontfix; do
    COUNT=0
    for f in $TICKET_FILES; do
      if [ "$(yaml_get "$f" status)" = "$st" ]; then
        COUNT=$((COUNT + 1))
      fi
    done
    echo "- **$st**: $COUNT"
  done

  echo ""
  echo "## Total"
  echo ""
  TOTAL_FILES=$(echo "$TICKET_FILES" | wc -w | tr -d ' ')
  echo "Tickets totales: $TOTAL_FILES"
} > "$OUTPUT"

echo "✅ Reporte generado: $OUTPUT"
