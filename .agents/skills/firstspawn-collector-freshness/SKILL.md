---
name: firstspawn-collector-freshness
description: Use for FirstSpawn collector work, heartbeat probing, collector targets, probe cadence, probe failure handling, freshness state, online/offline derivation, metrics, health checks, and outage-resistant catalog behavior.
---

# FirstSpawn Collector Freshness

Use this for collector and freshness behavior across `apps/collector`, API collector routes, and database jobs.

## Source Files

- Collector source: `apps/collector/src/`
- Collector package scripts: `apps/collector/package.json`
- API collector routes: `apps/api/src/routes/v1/collector.ts`
- API catalog freshness logic: `apps/api/src/routes/v1/servers.ts`
- Runtime schema: `apps/api/src/db/schema.ts`
- DB jobs: `packages/database/jobs/`
- Ops cron scripts: `.infras/ops/cron/`

## Collector Rules

- Collector fetches paginated targets from `GET /api/v1/collector/targets`.
- Collector posts one heartbeat event per request to `POST /api/v1/collector/heartbeats`.
- Auth uses `API_COLLECTOR_KEY` through the `x-collector-key` header.
- Probe cadence defaults to 5 minute pings and 30 minute raw payload storage unless current env/config says otherwise.
- Collector exposes `/healthz` and `/metrics`.
- Keep collector logic platform-agnostic.
- Docker runtime is wired through `apps/collector/Dockerfile` and `docker-compose.yml`.

## Freshness Rules

- MVP platform is `mc_java`.
- Collector accepts only successful heartbeat samples.
- Offline is absence, not an explicit heartbeat event.
- Online/offline is derived from freshness with a 15 minute window unless current code says otherwise.
- Heartbeat dedupe is scoped by `(server_id, idempotency_key)`.
- Late or out-of-order successful samples may be accepted.
- `servers.last_ping_at` must stay monotonic.
- Collector silence, probe failures, DNS failures, and stale freshness must not archive catalog rows.

## Workflow

1. Trace the path from target query to probe to API heartbeat ingestion.
2. Check idempotency and monotonic timestamp behavior before changing writes.
3. Keep failure handling explicit and safe.
4. Add or update tests for dedupe, late samples, failed probes, and freshness visibility when behavior changes.
5. Avoid mixing collector runtime concerns into public catalog route code.

## Validation

```bash
pnpm --filter @firstspawn/collector lint
pnpm --filter @firstspawn/collector typecheck
pnpm --filter @firstspawn/collector test
pnpm --filter @firstspawn/api test
```
