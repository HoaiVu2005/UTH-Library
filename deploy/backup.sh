#!/bin/sh
set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/uth_library_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting database backup..."
pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"
echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}"

# Retention: keep backups for 30 days
find "${BACKUP_DIR}" -type f -name "uth_library_*.sql.gz" -mtime +30 -exec rm {} \;
echo "[$(date)] Cleaned backups older than 30 days."

