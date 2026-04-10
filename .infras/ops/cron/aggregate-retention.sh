#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${API_DATABASE_URL:-}" ]]; then
  echo "API_DATABASE_URL is required" >&2
  exit 1
fi

RETENTION_DAYS="${RETENTION_DAYS:-14}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

psql "$API_DATABASE_URL" \
  -v retention_days="$RETENTION_DAYS" \
  -f "$repo_root/packages/database/jobs/rollup_retention.sql"
