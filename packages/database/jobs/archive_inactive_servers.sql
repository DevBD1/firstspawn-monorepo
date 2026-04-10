-- Archives servers that have not been seen for the configured threshold.
-- Usage (example):
--   psql "$API_DATABASE_URL" -v archive_after_hours=168 -f packages/database/jobs/archive_inactive_servers.sql

\set ON_ERROR_STOP on

with archived as (
  update servers s
  set
    status = 'archived',
    updated_at = now()
  where s.status = 'active'
    and coalesce(s.last_ping_at, s.created_at) < now() - (:'archive_after_hours' || ' hours')::interval
  returning s.id, s.slug, s.last_ping_at, s.created_at
)
select count(*)::int as archived_servers
from archived;
