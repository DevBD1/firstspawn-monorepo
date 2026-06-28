# Changelog

> **What this answers** — Which FirstSpawn versions have shipped, and when.
>
> **Open when** — You want to know what's been released.

Shipped FirstSpawn versions, newest first. Each entry links the frozen scope
file in `docs/releases/`. This is the append-only ledger of what shipped; the
*plan* for current work lives in `PLAN.md`, and durable product governance lives
in `PRODUCT.md` (§5).

## [Unreleased] — v1 MVP

- Scope: [`docs/releases/v1-mvp.md`](docs/releases/v1-mvp.md) — frozen
  2026-06-22, amended 2026-06-24.
- Status: building toward the public-beta launch gate (see the release file's
  §19). Not yet shipped.

### Added

- Live API health surfacing in the web UI: `/healthz` now performs real Postgres
  + Redis dependency checks (`ok` / `degraded` / `down`), polled via a Next.js
  proxy route and surfaced through the footer status indicator and a new
  app-wide connection banner. Silent API failures on the Discover feed now show
  an inline retry. (Unplanned mid-sprint work — see
  [`docs/sprints/2026-06-27-mvp-completion-sprint.md`](docs/sprints/2026-06-27-mvp-completion-sprint.md).)

### Fixed

- The API no longer crashes when Postgres drops a connection: `createDatabase()`
  now attaches a `pg.Pool` `'error'` handler, so an idle-client error is logged
  and recovered instead of taking down the process.
