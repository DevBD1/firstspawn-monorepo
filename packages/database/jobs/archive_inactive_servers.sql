-- Safety guard: collector silence must not archive catalog rows.
-- This job is intentionally disabled until archival is driven by explicit
-- catalog/admin evidence instead of heartbeat freshness.
-- Usage (example):
--   psql "$API_DATABASE_URL" -v archive_after_hours=168 -f packages/database/jobs/archive_inactive_servers.sql

\set ON_ERROR_STOP on

with archived as (
  select s.id, s.slug, s.last_probe_attempt_at, s.created_at
  from servers s
  where false
)
select count(*)::int as archived_servers
from archived;
