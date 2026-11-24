#!/usr/bin/env bash
# Restore a dump from backups/ into another database:
#   npm run db:restore -- backups/rust-skins-YYYY-MM-DD-HHMM.sql[.gz] "postgresql://user:pass@host/db?sslmode=require"
# The dump drops and recreates every table it contains. Point it at a new or
# disposable database, then switch DATABASE_URL on Vercel and redeploy.
set -euo pipefail
FILE="${1:?usage: db-restore.sh <dump.sql[.gz]> <target DATABASE_URL>}"
TARGET="${2:?target DATABASE_URL required}"
PSQL="$(ls -d /opt/homebrew/opt/postgresql@18/bin/psql 2>/dev/null || command -v psql)"
if [[ "$FILE" == *.gz ]]; then
  gunzip -c "$FILE" | "$PSQL" "$TARGET" -v ON_ERROR_STOP=1 -q
else
  "$PSQL" "$TARGET" -v ON_ERROR_STOP=1 -q -f "$FILE"
fi
echo "restored $FILE"
