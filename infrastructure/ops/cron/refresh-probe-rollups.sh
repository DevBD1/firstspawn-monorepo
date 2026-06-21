#!/usr/bin/env bash
set -euo pipefail

: "${API_DATABASE_URL:?API_DATABASE_URL is required}"
ROLLUP_LAG_MINUTES="${ROLLUP_LAG_MINUTES:-10}"
ROLLUP_LOOKBACK_HOURS="${ROLLUP_LOOKBACK_HOURS:-3}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

psql "$API_DATABASE_URL" \
  -v rollup_lag_minutes="$ROLLUP_LAG_MINUTES" \
  -v rollup_lookback_hours="$ROLLUP_LOOKBACK_HOURS" \
  -f "$repo_root/packages/database/jobs/refresh_probe_rollups.sql"
