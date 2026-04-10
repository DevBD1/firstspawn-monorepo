-- Aggregates raw heartbeats older than retention window into hourly/daily rollups,
-- then deletes those raw rows.
-- Usage (example):
--   psql "$API_DATABASE_URL" -v retention_days=14 -f packages/database/jobs/rollup_retention.sql

\set ON_ERROR_STOP on

begin;
set local timezone = 'UTC';

with cutoff as (
  select now() - (:'retention_days' || ' days')::interval as ts
), hourly as (
  select
    sh.server_id,
    date_trunc('hour', sh.occurred_at) as bucket_start,
    count(*)::int as sample_count,
    count(*) filter (where sh.payload is not null)::int as payload_count,
    min(sh.ping_ms) as ping_min_ms,
    max(sh.ping_ms) as ping_max_ms,
    round(avg(sh.ping_ms)::numeric, 2) as ping_avg_ms,
    max(sh.uptime_seconds) as uptime_max_seconds,
    max(sh.online_players) as players_peak,
    max(sh.max_players) as max_players_peak,
    max(sh.occurred_at) as last_occurred_at
  from server_heartbeats sh
  cross join cutoff c
  where sh.occurred_at < c.ts
  group by sh.server_id, date_trunc('hour', sh.occurred_at)
)
insert into server_heartbeat_hourly (
  server_id,
  bucket_start,
  sample_count,
  payload_count,
  ping_min_ms,
  ping_max_ms,
  ping_avg_ms,
  uptime_max_seconds,
  players_peak,
  max_players_peak,
  last_occurred_at,
  created_at,
  updated_at
)
select
  h.server_id,
  h.bucket_start,
  h.sample_count,
  h.payload_count,
  h.ping_min_ms,
  h.ping_max_ms,
  h.ping_avg_ms,
  h.uptime_max_seconds,
  h.players_peak,
  h.max_players_peak,
  h.last_occurred_at,
  now(),
  now()
from hourly h
on conflict (server_id, bucket_start) do update
set
  sample_count = excluded.sample_count,
  payload_count = excluded.payload_count,
  ping_min_ms = excluded.ping_min_ms,
  ping_max_ms = excluded.ping_max_ms,
  ping_avg_ms = excluded.ping_avg_ms,
  uptime_max_seconds = excluded.uptime_max_seconds,
  players_peak = excluded.players_peak,
  max_players_peak = excluded.max_players_peak,
  last_occurred_at = excluded.last_occurred_at,
  updated_at = now();

with cutoff as (
  select now() - (:'retention_days' || ' days')::interval as ts
), daily as (
  select
    sh.server_id,
    (sh.occurred_at at time zone 'UTC')::date as bucket_date,
    count(*)::int as sample_count,
    count(*) filter (where sh.payload is not null)::int as payload_count,
    min(sh.ping_ms) as ping_min_ms,
    max(sh.ping_ms) as ping_max_ms,
    round(avg(sh.ping_ms)::numeric, 2) as ping_avg_ms,
    max(sh.uptime_seconds) as uptime_max_seconds,
    max(sh.online_players) as players_peak,
    max(sh.max_players) as max_players_peak,
    max(sh.occurred_at) as last_occurred_at
  from server_heartbeats sh
  cross join cutoff c
  where sh.occurred_at < c.ts
  group by sh.server_id, (sh.occurred_at at time zone 'UTC')::date
)
insert into server_heartbeat_daily (
  server_id,
  bucket_date,
  sample_count,
  payload_count,
  ping_min_ms,
  ping_max_ms,
  ping_avg_ms,
  uptime_max_seconds,
  players_peak,
  max_players_peak,
  last_occurred_at,
  created_at,
  updated_at
)
select
  d.server_id,
  d.bucket_date,
  d.sample_count,
  d.payload_count,
  d.ping_min_ms,
  d.ping_max_ms,
  d.ping_avg_ms,
  d.uptime_max_seconds,
  d.players_peak,
  d.max_players_peak,
  d.last_occurred_at,
  now(),
  now()
from daily d
on conflict (server_id, bucket_date) do update
set
  sample_count = excluded.sample_count,
  payload_count = excluded.payload_count,
  ping_min_ms = excluded.ping_min_ms,
  ping_max_ms = excluded.ping_max_ms,
  ping_avg_ms = excluded.ping_avg_ms,
  uptime_max_seconds = excluded.uptime_max_seconds,
  players_peak = excluded.players_peak,
  max_players_peak = excluded.max_players_peak,
  last_occurred_at = excluded.last_occurred_at,
  updated_at = now();

with cutoff as (
  select now() - (:'retention_days' || ' days')::interval as ts
), deleted as (
  delete from server_heartbeats sh
  using cutoff c
  where sh.occurred_at < c.ts
  returning 1
)
select count(*)::int as deleted_raw_rows
from deleted;

commit;
