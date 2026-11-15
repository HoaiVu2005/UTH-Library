#!/bin/sh
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <path_to_backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file '${BACKUP_FILE}' does not exist."
  exit 1
fi

echo "[$(date)] Restoring database from ${BACKUP_FILE}..."
gunzip -c "${BACKUP_FILE}" | psql "${DATABASE_URL}"
echo "[$(date)] Database restored successfully."

