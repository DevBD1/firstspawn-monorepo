# Collector & Scheduler Optimization

Date: 2026-06-16

## Goal

Optimize the heartbeat collector, API ingest endpoints, and SQL scheduler jobs to reduce network and database load significantly, preventing the `server_heartbeats` table from becoming a performance bottleneck.

## Planned Scope

- Implement **Batch Ingestion**: Accumulate probe results in the collector and send them in a single bulk payload to a new `POST /api/v1/collector/batch-ingest` endpoint.
- Implement **Smart Polling Cadence (Decaying Intervals)**: Decrease target probing frequency for offline/unreachable servers.
- Implement **State-Change / Delta Ingestion**: Only write raw heartbeats to Postgres if status changes, player count changes significantly (5% or +/- 2 players), or at least 1 hour passes, utilizing Redis cache for state tracking.
- Reduce default retention window of raw heartbeats from 14 days to 7 days.

## Completed Work

- Added PG interval check inside `/api/v1/collector/targets` to decay polling frequency (5 minutes for online/unknown/recently offline, 30 minutes for offline >1h, 6 hours for offline >24h).
- Added `POST /api/v1/collector/batch-ingest` endpoint in Fastify API, performing bulk DB existence checks, bulk Redis MGET checks, conditional heartbeat SQL inserts using `.onConflictDoNothing()`, and bulk updating of the `servers` table in a single statement.
- Refactored `CollectorService` in `apps/collector` to run concurrently but delay ingestion, sending all collected pings and failures in one batch payload at the end of each cycle.
- Updated `InMemoryRedisClient` mock inside tests to support string storage, pipelines, and MGET capabilities.
- Changed default value of `RETENTION_DAYS` from `14` to `7` in `infrastructure/ops/cron/aggregate-retention.sh`.

## Validation

- `pnpm --filter @firstspawn/collector test`: passed (all 15 unit tests).
- `pnpm --filter @firstspawn/api test`: passed (all 60 integration and unit tests, including new batch-ingest conditional write integration test).
