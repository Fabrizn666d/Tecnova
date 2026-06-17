#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
LOG_FILE="$BACKUP_DIR/backup.log"
STAMP="$(date +%Y-%m-%d-%H%M)"
BACKUP_NAME="tecnova-auto-$STAMP.tar.gz"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
TMP_DIR="$BACKUP_DIR/.tmp-auto-$STAMP-$$"

mkdir -p "$BACKUP_DIR" "$TMP_DIR"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >> "$LOG_FILE"
}

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [ ! -f "$ROOT_DIR/prisma/tecnova.db" ]; then
  log "ERROR: no existe prisma/tecnova.db"
  exit 1
fi

FILES=("prisma/tecnova.db")
if [ -d "$ROOT_DIR/public/uploads" ]; then
  FILES+=("public/uploads")
fi
if [ -f "$ROOT_DIR/package.json" ]; then
  FILES+=("package.json")
fi

SOURCE_SIZE=0
for rel in "${FILES[@]}"; do
  size="$(du -sb "$ROOT_DIR/$rel" 2>/dev/null | awk '{print $1}')"
  SOURCE_SIZE=$((SOURCE_SIZE + ${size:-0}))
done
VERSION="sin-version"
if command -v node >/dev/null 2>&1 && [ -f "$ROOT_DIR/package.json" ]; then
  VERSION="$(node -e "const p=require('$ROOT_DIR/package.json'); console.log(p.version || 'sin-version')" 2>/dev/null || printf 'sin-version')"
fi

JSON_FILES=""
for rel in "${FILES[@]}"; do
  escaped="${rel//\\/\\\\}"
  escaped="${escaped//\"/\\\"}"
  if [ -n "$JSON_FILES" ]; then
    JSON_FILES="$JSON_FILES, "
  fi
  JSON_FILES="$JSON_FILES\"$escaped\""
done

cat > "$TMP_DIR/manifest.json" <<JSON
{
  "fecha": "$(date -Iseconds)",
  "tipo": "auto",
  "version": "$VERSION",
  "archivos": [$JSON_FILES],
  "tamanoFuente": $SOURCE_SIZE
}
JSON

log "Iniciando backup automatico: $BACKUP_NAME"
tar -czf "$BACKUP_PATH" -C "$TMP_DIR" manifest.json -C "$ROOT_DIR" "${FILES[@]}"
log "Backup creado: $BACKUP_NAME ($(du -h "$BACKUP_PATH" | awk '{print $1}'))"

find "$BACKUP_DIR" -maxdepth 1 -type f -name 'tecnova-auto-*.tar.gz' -printf '%T@ %p\n' \
  | sort -nr \
  | awk 'NR > 30 {print $2}' \
  | while IFS= read -r old_backup; do
      rm -f "$old_backup"
      log "Backup automatico antiguo eliminado por retencion: $(basename "$old_backup")"
    done
