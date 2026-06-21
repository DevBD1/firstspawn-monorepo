#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${API_DATABASE_URL:-}" ]]; then
  echo "API_DATABASE_URL is required" >&2
  exit 1
fi

RETENTION_DAYS="${RETENTION_DAYS:-2}"
HOURLY_RETENTION_DAYS="${HOURLY_RETENTION_DAYS:-90}"
DAILY_RETENTION_DAYS="${DAILY_RETENTION_DAYS:-730}"

for value in "$RETENTION_DAYS" "$HOURLY_RETENTION_DAYS" "$DAILY_RETENTION_DAYS"; do
  if [[ ! "$value" =~ ^[1-9][0-9]*$ ]]; then
    echo "retention periods must be positive integers" >&2
    exit 1
  fi
done

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

ROLLUP_LOOKBACK_HOURS="$((RETENTION_DAYS * 24 + 24))" \
  bash "$repo_root/infrastructure/ops/cron/refresh-probe-rollups.sh"

psql "$API_DATABASE_URL" \
  -v raw_retention_days="$RETENTION_DAYS" \
  -v hourly_retention_days="$HOURLY_RETENTION_DAYS" \
  -v daily_retention_days="$DAILY_RETENTION_DAYS" \
  -f "$repo_root/packages/database/jobs/rollup_retention.sql"
