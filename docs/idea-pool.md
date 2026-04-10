# Idea Pool

Park future ideas here. Keep this file short and avoid repeating anything that
already lives in `README.md` or a service README.

## Discovery

- Relevance-driven server ranking
- Search and discovery refinements
- Geo-based boosting if it ever proves useful

## Trust

- Verified activity and reputation signals
- Review and report workflows
- Moderation escalation rules

## Platform

- Plugin verification and telemetry ideas
- Guild or social retention loops
- Agent control-plane concepts, if they return later

## Server Analytics

- Keep the clean split:
  - PostgreSQL rollups for product charts on public and owner-facing server pages
  - Prometheus + Grafana OSS for backend and collector ops
- If server owners later need full ops dashboards, extend instead of replacing:
  - add failed probe or offline event storage
  - add tighter rollups such as 5 minute buckets
  - add owner or team auth and tenant isolation
  - keep current heartbeat tables as historical product data
- Future chart endpoints to consider from hourly and daily heartbeat rollups:
  - `GET /api/v1/servers/:slug/summary`
  - `GET /api/v1/servers/:slug/charts/players?range=24h|7d|30d`
  - `GET /api/v1/servers/:slug/charts/ping?range=24h|7d|30d`
  - `GET /api/v1/servers/:slug/charts/activity?range=24h|7d|30d`
  - `GET /api/v1/servers/:slug/charts/availability?range=24h|7d|30d`
- Range mapping idea:
  - `24h` and `7d` use hourly rollups
  - `30d` uses daily rollups
- Availability caveat:
  - with success-only heartbeats, availability is inferred from expected sample count
  - at 5 minute cadence this is an observed uptime proxy, not exact uptime
