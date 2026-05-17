#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${API_DATABASE_URL:-}" ]]; then
  echo "API_DATABASE_URL is required" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

psql "$API_DATABASE_URL" \
  -f "$repo_root/packages/database/jobs/purge_deleted_users.sql"
