-- Purges users whose deletion window has elapsed.
-- Usage (example):
--   psql "$API_DATABASE_URL" -f packages/database/jobs/purge_deleted_users.sql

\set ON_ERROR_STOP on

begin;

with due as (
  select udr.id, udr.user_id
  from user_deletion_requests udr
  join users u on u.id = udr.user_id
  where udr.cancelled_at is null
    and udr.purged_at is null
    and u.status = 'deleted'
    and udr.purge_after <= now()
  for update
), marked as (
  update user_deletion_requests udr
  set
    purged_at = now(),
    updated_at = now()
  from due d
  where udr.id = d.id
  returning d.user_id
), deleted as (
  delete from users u
  using marked m
  where u.id = m.user_id
  returning u.id
)
select count(*)::int as purged_users
from deleted;

commit;
