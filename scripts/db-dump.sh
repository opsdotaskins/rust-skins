#!/usr/bin/env bash
# Full logical dump of the database in DATABASE_URL (from .env) into backups/.
# Plain SQL, no owners/privileges, with DROP IF EXISTS: restores into any
# Postgres (Neon, Supabase, RDS, local) with scripts/db-restore.sh.
# backups/ is gitignored: dumps contain customer emails and password hashes.
set -euo pipefail
cd "$(dirname "$0")/.."
URL="${DATABASE_URL:-$(grep '^DATABASE_URL=' .env | cut -d= -f2- | tr -d "\"'")}"
[ -n "$URL" ] || { echo "DATABASE_URL is empty" >&2; exit 1; }
PG_DUMP="$(ls -d /opt/homebrew/opt/postgresql@18/bin/pg_dump 2>/dev/null || command -v pg_dump)"
mkdir -p backups
OUT="backups/rust-skins-$(date +%Y-%m-%d-%H%M).sql"
"$PG_DUMP" "$URL" --no-owner --no-privileges --clean --if-exists -f "$OUT"
gzip -kf "$OUT"
echo "dump: $OUT ($(du -h "$OUT" | cut -f1)), gz: $OUT.gz"
