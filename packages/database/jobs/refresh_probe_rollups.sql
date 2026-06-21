-- Refresh closed UTC probe buckets. Unknown observations count toward coverage,
-- but never toward availability or player aggregates.
\set ON_ERROR_STOP on

begin;
set local timezone = 'UTC';
select pg_advisory_xact_lock(734906201);

with bounds as (
  select
    date_trunc('hour', now() - (:'rollup_lag_minutes')::int * interval '1 minute') as end_at,
    date_trunc('hour', now() - (:'rollup_lag_minutes')::int * interval '1 minute')
      - (:'rollup_lookback_hours')::int * interval '1 hour' as start_at
), source as (
  select
    o.server_id,
    date_trunc('hour', o.observed_at) as bucket_start,
    count(*)::int as sample_count,
    count(*) filter (where o.outcome = 'online')::int as online_count,
    count(*) filter (where o.outcome = 'offline')::int as offline_count,
    count(*) filter (where o.outcome = 'unknown')::int as unknown_count,
    count(o.online_players)::int as player_sample_count,
    round(avg(o.online_players)::numeric, 2) as players_avg,
    max(o.online_players) as players_peak,
    max(o.observed_at) as last_observed_at
  from server_probe_observations o cross join bounds b
  where o.observed_at >= b.start_at and o.observed_at < b.end_at
  group by o.server_id, date_trunc('hour', o.observed_at)
)
insert into server_probe_hourly (
  server_id, bucket_start, sample_count, online_count, offline_count,
  unknown_count, player_sample_count, players_avg, players_peak,
  last_observed_at, created_at, updated_at
)
select server_id, bucket_start, sample_count, online_count, offline_count,
  unknown_count, player_sample_count, players_avg, players_peak,
  last_observed_at, now(), now()
from source
on conflict (server_id, bucket_start) do update set
  sample_count = excluded.sample_count,
  online_count = excluded.online_count,
  offline_count = excluded.offline_count,
  unknown_count = excluded.unknown_count,
  player_sample_count = excluded.player_sample_count,
  players_avg = excluded.players_avg,
  players_peak = excluded.players_peak,
  last_observed_at = excluded.last_observed_at,
  updated_at = now();

with bounds as (
  select
    date_trunc('day', now()) as end_at,
    date_trunc('day', now()) - ((:'rollup_lookback_hours')::int + 24) * interval '1 hour' as start_at
), source as (
  select
    h.server_id,
    (h.bucket_start at time zone 'UTC')::date as bucket_date,
    sum(h.sample_count)::int as sample_count,
    sum(h.online_count)::int as online_count,
    sum(h.offline_count)::int as offline_count,
    sum(h.unknown_count)::int as unknown_count,
    sum(h.player_sample_count)::int as player_sample_count,
    round(sum(h.players_avg * h.player_sample_count) / nullif(sum(h.player_sample_count), 0), 2) as players_avg,
    max(h.players_peak) as players_peak,
    max(h.last_observed_at) as last_observed_at
  from server_probe_hourly h cross join bounds b
  where h.bucket_start >= b.start_at and h.bucket_start < b.end_at
  group by h.server_id, (h.bucket_start at time zone 'UTC')::date
)
insert into server_probe_daily (
  server_id, bucket_date, sample_count, online_count, offline_count,
  unknown_count, player_sample_count, players_avg, players_peak,
  last_observed_at, created_at, updated_at
)
select server_id, bucket_date, sample_count, online_count, offline_count,
  unknown_count, player_sample_count, players_avg, players_peak,
  last_observed_at, now(), now()
from source
on conflict (server_id, bucket_date) do update set
  sample_count = excluded.sample_count,
  online_count = excluded.online_count,
  offline_count = excluded.offline_count,
  unknown_count = excluded.unknown_count,
  player_sample_count = excluded.player_sample_count,
  players_avg = excluded.players_avg,
  players_peak = excluded.players_peak,
  last_observed_at = excluded.last_observed_at,
  updated_at = now();

commit;
