BEGIN;

INSERT INTO servers (
  id,
  slug,
  name,
  description,
  host,
  port,
  game,
  status,
  auth_mode,
  country_code,
  probe_status,
  last_probe_attempt_at,
  last_probe_success_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'aurora-smp',
  'Aurora SMP',
  'A friendly survival SMP with community builds, events, and steady uptime.',
  'play.aurora-smp.net',
  25565,
  'mc_java',
  'active',
  'official',
  'US',
  'online',
  now(),
  now(),
  now(),
  now()
)
ON CONFLICT DO NOTHING;

INSERT INTO server_socials (
  server_id,
  platform,
  url,
  display_order,
  created_at,
  updated_at
)
SELECT
  s.id,
  social.platform,
  social.url,
  social.display_order,
  now(),
  now()
FROM servers AS s
CROSS JOIN (
  VALUES
    ('website', 'https://aurora-smp.net', 0),
    ('discord', 'https://discord.gg/aurorasmp', 1)
) AS social(platform, url, display_order)
WHERE s.slug = 'aurora-smp'
ON CONFLICT DO NOTHING;

INSERT INTO server_supported_clients (
  server_id,
  client_name,
  client_version,
  created_at,
  updated_at
)
SELECT
  s.id,
  client.client_name,
  client.client_version,
  now(),
  now()
FROM servers AS s
CROSS JOIN (
  VALUES
    ('mc_java', '1.21.4')
) AS client(client_name, client_version)
WHERE s.slug = 'aurora-smp'
ON CONFLICT DO NOTHING;

INSERT INTO collector_probe_cycles (
  id, submission_id, collector_instance_id, slot_start, started_at, completed_at,
  target_count, success_count, failure_count, classification, created_at, updated_at
) VALUES (
  '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000102', 'demo',
  date_trunc('minute', now()), now(), now(), 1, 1, 0, 'accepted', now(), now()
) ON CONFLICT DO NOTHING;

INSERT INTO server_probe_observations (
  cycle_id, server_id, slot_start, observed_at, outcome, online_players, created_at, updated_at
)
SELECT
  '00000000-0000-4000-8000-000000000101', s.id,
  date_trunc('minute', now()), now(), 'online', 87, now(), now()
FROM servers s
WHERE s.slug = 'aurora-smp'
ON CONFLICT DO NOTHING;

COMMIT;
