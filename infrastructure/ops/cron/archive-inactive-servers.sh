#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${API_DATABASE_URL:-}" ]]; then
  echo "API_DATABASE_URL is required" >&2
  exit 1
fi

ARCHIVE_AFTER_HOURS="${ARCHIVE_AFTER_HOURS:-168}" # Kept for CLI compatibility; SQL is a no-op guard.

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

psql "$API_DATABASE_URL" \
  -v archive_after_hours="$ARCHIVE_AFTER_HOURS" \
  -f "$repo_root/packages/database/jobs/archive_inactive_servers.sql"
