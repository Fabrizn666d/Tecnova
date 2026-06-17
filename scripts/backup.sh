#!/usr/bin/env bash
set -euo pipefail

SCRIPT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -d "/root/Tecnova" ]; then
  ROOT_DIR="/root/Tecnova"
else
  ROOT_DIR="$SCRIPT_ROOT"
fi
cd "$ROOT_DIR"

BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
LOG_FILE="$BACKUP_DIR/backup.log"
STAMP="$(date +%Y-%m-%d-%H-%M)"
BACKUP_NAME="tecnova-auto-$STAMP.tar.gz"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
TMP_DIR="$BACKUP_DIR/.tmp-auto-$STAMP-$$"

mkdir -p "$BACKUP_DIR" "$TMP_DIR"

if [ -e "$BACKUP_PATH" ]; then
  printf '[%s] ERROR: ya existe %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$BACKUP_NAME" >> "$LOG_FILE"
  exit 1
fi

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
  "tipo": "automatic",
  "nombre": "$BACKUP_NAME",
  "tamano": $SOURCE_SIZE,
  "archivos": [$JSON_FILES],
  "version": "$VERSION"
}
JSON

log "Iniciando backup automatico: $BACKUP_NAME"
mkdir -p "$TMP_DIR/prisma"
cp "$ROOT_DIR/prisma/tecnova.db" "$TMP_DIR/prisma/tecnova.db"

TAR_ARGS=(-czf "$BACKUP_PATH" -C "$TMP_DIR" manifest.json prisma/tecnova.db)
if [ -d "$ROOT_DIR/public/uploads" ]; then
  TAR_ARGS+=(-C "$ROOT_DIR" public/uploads)
fi

tar "${TAR_ARGS[@]}"
log "Backup creado: $BACKUP_NAME ($(du -h "$BACKUP_PATH" | awk '{print $1}'))"

find "$BACKUP_DIR" -maxdepth 1 -type f -name 'tecnova-auto-*.tar.gz' -printf '%T@ %p\n' \
  | sort -nr \
  | awk 'NR > 30 {print $2}' \
  | while IFS= read -r old_backup; do
      rm -f "$old_backup"
      log "Backup automatico antiguo eliminado por retencion: $(basename "$old_backup")"
    done
