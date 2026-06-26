# @firstspawn/collector

> **What this answers** — The collector service: runtime, env, heartbeat
> behavior, and validation.
>
> **Open when** — You're working on heartbeat collection or freshness.

Heartbeat collector for active game-server targets. The collector asks the API
for active targets, probes `mc_java` servers, and sends heartbeat or probe
failure payloads back to the API.

## Runtime

- Source: `apps/collector/src`
- Docker runtime: `apps/collector/Dockerfile`
- API dependency: `@firstspawn/api` collector routes
- Target source: `GET /api/v1/collector/targets`
- Heartbeat sink: `POST /api/v1/collector/heartbeats`

## Local Development

```bash
docker compose up -d postgres redis
pnpm --filter @firstspawn/api dev
pnpm --filter @firstspawn/collector dev
```

For local collector process to local API:

```bash
COLLECTOR_API_BASE_URL=http://localhost:8000/api/v1
```

For Docker collector container to Docker API service:

```bash
COLLECTOR_API_BASE_URL=http://api:8000/api/v1
```

## Environment

Set these in repo root `.env`:

- `API_COLLECTOR_KEY`
- `COLLECTOR_API_BASE_URL`
- `COLLECTOR_PING_INTERVAL_SECONDS`
- `COLLECTOR_PAYLOAD_INTERVAL_SECONDS`
- `COLLECTOR_CONCURRENCY`
- `COLLECTOR_TARGET_PAGE_SIZE`
- `COLLECTOR_PROBE_TIMEOUT_MS`
- `COLLECTOR_HOST`
- `COLLECTOR_PORT`

## Validation

```bash
pnpm --filter @firstspawn/collector lint
pnpm --filter @firstspawn/collector typecheck
pnpm --filter @firstspawn/collector test
```

The Docker service exposes `/healthz` and `/metrics` inside the Compose network.
