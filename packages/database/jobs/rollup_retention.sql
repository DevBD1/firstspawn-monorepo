-- Keep raw observations for 48h, hourly buckets for 90d, daily buckets for 730d.
-- A source row is deleted only after its replacement rollup is newer.
\set ON_ERROR_STOP on

begin;
set local timezone = 'UTC';
select pg_advisory_xact_lock(734906201);

delete from server_probe_observations o
where o.observed_at < date_trunc('hour', now() - (:'raw_retention_days')::int * interval '1 day')
  and exists (
    select 1 from server_probe_hourly h
    where h.server_id = o.server_id
      and h.bucket_start = date_trunc('hour', o.observed_at)
      and h.updated_at >= o.created_at
  );

delete from collector_probe_cycles c
where c.slot_start < date_trunc('hour', now() - (:'raw_retention_days')::int * interval '1 day')
  and not exists (select 1 from server_probe_observations o where o.cycle_id = c.id);

delete from server_probe_hourly h
where h.bucket_start < date_trunc('day', now() - (:'hourly_retention_days')::int * interval '1 day')
  and exists (
    select 1 from server_probe_daily d
    where d.server_id = h.server_id
      and d.bucket_date = (h.bucket_start at time zone 'UTC')::date
      and d.updated_at >= h.updated_at
  );

delete from server_probe_daily
where bucket_date < current_date - (:'daily_retention_days')::int;

commit;
