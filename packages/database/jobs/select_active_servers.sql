-- Source query for heartbeat workers.
-- Both ping and payload collectors must only target active servers.

select
  s.id,
  s.slug,
  s.host,
  s.port,
  s.game,
  s.region
from servers s
where s.status = 'active'
order by s.created_at asc;
