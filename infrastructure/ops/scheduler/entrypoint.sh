#!/usr/bin/env sh
set -eu

if [ -z "${API_DATABASE_URL:-}" ]; then
  : "${DB_USER:?DB_USER is required when API_DATABASE_URL is not set}"
  : "${DB_PASSWORD:?DB_PASSWORD is required when API_DATABASE_URL is not set}"
  : "${DB_NAME:?DB_NAME is required when API_DATABASE_URL is not set}"
  DB_HOST="${DB_HOST:-postgres}"
  API_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}"
  export API_DATABASE_URL
fi

archive_schedule="${SCHEDULE_ARCHIVE_INACTIVE:-0 2 * * *}"
rollup_schedule="${SCHEDULE_ROLLUP_RETENTION:-30 2 * * *}"
purge_schedule="${SCHEDULE_PURGE_DELETED_USERS:-0 3 * * *}"

crontab_file="/tmp/scheduler.crontab"

cat >"${crontab_file}" <<EOF
${archive_schedule} /work/infrastructure/ops/scheduler/job-runner.sh archive-inactive /work/infrastructure/ops/cron/archive-inactive-servers.sh
${rollup_schedule} /work/infrastructure/ops/scheduler/job-runner.sh rollup-retention /work/infrastructure/ops/cron/aggregate-retention.sh
${purge_schedule} /work/infrastructure/ops/scheduler/job-runner.sh purge-deleted-users /work/infrastructure/ops/cron/purge-deleted-users.sh
EOF

echo "scheduler_timezone=UTC"
echo "scheduler_archive=${archive_schedule}"
echo "scheduler_rollup=${rollup_schedule}"
echo "scheduler_purge=${purge_schedule}"

exec /usr/local/bin/supercronic "${crontab_file}"
