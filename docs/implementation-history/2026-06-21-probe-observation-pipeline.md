# Probe Observation Pipeline

Date: 2026-06-21

## Goal

Replace unbounded, metadata-heavy heartbeat ingestion with a small factual
model for server liveness and unverified public-query player counts.

## Planned Scope

- Probe every active Minecraft Java server on fixed ten-minute UTC slots.
- Persist atomic cycles, online/offline/unknown observations, and fleet-failure quarantine.
- Provide coverage-aware availability and player-history APIs and charts.
- Retain raw observations for 48 hours, hourly rollups for 90 days, and daily rollups for 730 days.
- Remove synthetic public and owner-console KPIs.
- Keep future FSVotifier telemetry outside the external probe model.

## Completed Work

- Added collector cycle and observation tables, hourly/daily rollups, one destructive clean-start baseline migration, and address-change monitoring resets.
- Replaced heartbeat, failure, batch, Redis-sampling, adaptive-backoff, ping, capacity, version, uptime, and payload ingestion with one atomic probe-cycle route.
- Added warm-up handling, trailing fleet baseline quarantine, two-failure offline confirmation, out-of-order protection, and 30-minute stale-to-unknown reads.
- Removed the 2,000-observation request ceiling, made collector instance ids mandatory, and added per-submission UUIDs so exact retries dedupe while replica slot collisions fail loudly.
- Made warmup outcomes symmetric and usable, made every quarantined outcome unknown, and corrected ingest metrics to count requests rather than observations.
- Added availability/coverage calculations and `24h`, `7d`, `30d`, `90d`, and `1y` analytics data.
- Added a shared accessible SVG history chart with separate availability, player, and coverage series to public server profiles and owner analytics.
- Reworked landing, discover, quick peek, listing probe, server profile, and owner console to use measured facts without fabricated rank, votes, trust, verification, or uptime.
- Updated all locale dictionaries, runtime configuration, scheduler jobs, seeds, DESIGN, PRODUCT, service docs, and database design.

## Validation

- Database, API, collector, and web typechecks passed.
- Drizzle reported no schema drift after generating the single baseline.
- A fresh local PostgreSQL volume migrated successfully and the demo seed produced 251 country rows, 250 geocoded rows, one probe cycle, and one observation.
- API integration passed all 45 tests; collector passed all 8 tests; web passed all 15 tests.
- API, collector, and web lint completed without errors; web retains one unrelated landing-page warning.
- Analytics smoke requests returned HTTP 200 for `24h`, `7d`, `30d`, `90d`, and `1y`.
- The configured `lint:i18n` command remains unavailable because the pre-existing `apps/web/scripts/lint-i18n.mjs` file is absent.

## Notes

- Availability is `online / (online + offline)`; unknown is excluded and coverage is separate.
- The 30-day headline is withheld below 80% coverage.
- Warmup observations count normally. Every quarantined-cycle observation is unknown and quarantined cycles never refresh public liveness.
- Baseline foreign keys remain search-path-relative so DB-backed tests can migrate isolated PostgreSQL schemas.
- The configured host port `55432` is reserved by Windows on this machine, so the verified local Postgres container is published on `5432`; Compose-internal connectivity remains unchanged.
- FSVotifier remains a product boundary only; plugin ingestion was intentionally not implemented.
