# @firstspawn/collector

The collector probes every active Minecraft Java server on fixed ten-minute UTC
slots. It submits one atomic cycle to `POST /api/v1/collector/probe-cycles`.

The probe is authoritative only for reachability and the public-query online
player count. Ping, capacity, version, MOTD, process uptime, and raw payloads are
not ingested.

## Runtime

- Targets: `GET /api/v1/collector/targets`
- Cycle sink: `POST /api/v1/collector/probe-cycles`
- Default cadence: 600 seconds
- Default concurrency: 50
- Default timeout: 5 seconds

## Environment

- `API_COLLECTOR_KEY`
- `COLLECTOR_API_BASE_URL`
- `COLLECTOR_INSTANCE_ID` (required and unique per running replica)
- `COLLECTOR_PROBE_INTERVAL_SECONDS`
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
Cycle requests use a per-attempt submission UUID: exact retries dedupe, while a
different replica reusing the same instance id and slot fails with HTTP 409.
