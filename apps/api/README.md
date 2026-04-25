# @firstspawn/api

Fastify production API with Zod validation, Drizzle-backed PostgreSQL access,
and database migrations managed from `packages/database`.

## Current Status (2026-04-10)

### Implemented

- Health endpoint:
  - `GET /healthz`
- Auth endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/delete/request`
  - `POST /api/v1/auth/restore/confirm`
  - `POST /api/v1/auth/restore/expedite-delete`
- Auth/session behavior:
  - Email or username login via `identifier`
  - Access + refresh token issuance
  - Refresh token rotation
  - Redis-backed auth rate limits for register, login, and refresh
  - Logout revocation (idempotent)
  - Registration consent persistence (`terms_accepted`, `privacy_accepted`, `marketing_consent`)
  - Deleted-account login returns `AUTH_RESTORE_REQUIRED` and sends restore email token
  - Soft-delete flow (30-day default purge window, 24-hour expedite window)
  - Restore token flow reactivates deleted account before purge
  - Session metadata persistence (`user_agent`, `device_fingerprint_hash`, `device_type`, `os_name`, `client_name`, `last_seen_at`)
- Standard API response envelope for success/errors + per-request `request_id`
- OpenAPI/Swagger output via Fastify Swagger
- DB-backed integration and concurrency tests for auth flows
- Admin server catalog endpoints (`mc_java`)
- Public server list/detail endpoints (slug detail)
- Collector target, heartbeat ingestion, and probe-failure ingestion endpoints
- Freshness derived from probe state plus `servers.last_ping_at` (15 minute online window)
- Heartbeat idempotency by `(server_id, idempotency_key)`

### Not Implemented Yet

- Live end-to-end probe validation against a real external Minecraft target in this environment

### Out Of Scope For MVP

- Reviews, review votes, and review moderation
- Favorites
- Reports / moderation queue
- Plugin telemetry and verification keys
- Agentic audit / approval tables

## Quickstart

```bash
# Start database (requires Docker)
docker compose up -d postgres redis

# Install dependencies
pnpm install

# Run migrations
pnpm --dir packages/database run migrate

# Start API
pnpm --filter @firstspawn/api dev
```

## Environment

Set these in repo root `.env` (see root `.env.example`):

```bash
API_ENV=development
API_DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
API_REDIS_URL=redis://localhost:6379/0
API_JWT_SECRET=change_me_to_a_long_random_secret
API_TOKEN_HASH_SECRET=change_me_to_a_long_random_secret_for_hmac
API_JWT_ISSUER=firstspawn-api
API_ACCESS_TOKEN_EXPIRE_MINUTES=15
API_REFRESH_TOKEN_EXPIRE_DAYS=30
API_TEST_DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
API_ADMIN_EMAIL_ALLOWLIST=admin@firstspawn.com
API_COLLECTOR_KEY=change_me_collector_key
```

`DB_USER`, `DB_PASSWORD`, and `DB_NAME` are shared with `docker-compose.yml`.

Collector and scheduler companion env values are documented in root `.env.example`:

- `COLLECTOR_API_BASE_URL`
- `COLLECTOR_PING_INTERVAL_SECONDS`
- `COLLECTOR_PAYLOAD_INTERVAL_SECONDS`
- `COLLECTOR_CONCURRENCY`
- `COLLECTOR_TARGET_PAGE_SIZE`
- `COLLECTOR_PROBE_TIMEOUT_MS`
- `SCHEDULE_ARCHIVE_INACTIVE`
- `SCHEDULE_ROLLUP_RETENTION`
- `SCHEDULE_PURGE_DELETED_USERS`

## Contract Sources

- `../../packages/database/schema-design.md`
- `src/db/schema.ts`

## Database Migrations

Migration tool: **Drizzle**

### Commands

```bash
# Run all pending migrations
pnpm --dir packages/database run migrate

# Create new migration SQL from schema changes
pnpm --dir packages/database run generate
```

## Testing and Validation

```bash
pnpm --filter @firstspawn/api lint
pnpm --filter @firstspawn/api typecheck
pnpm --filter @firstspawn/api test
```

Integration tests currently cover:

- Register -> me flow
- Login with email and username
- Refresh token rotation and old-token rejection
- Logout revocation behavior
- Duplicate registration validation
- Validation envelope behavior
- Concurrent refresh/logout behavior
- Deleted-account restore flow
- Restore-token expedite delete flow

Test isolation uses per-test PostgreSQL schemas via `search_path` (no create-database privilege required).

## Endpoints

- `GET /healthz`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/delete/request`
- `POST /api/v1/auth/restore/confirm`
- `POST /api/v1/auth/restore/expedite-delete`
- `GET /api/v1/admin/servers`
- `POST /api/v1/admin/servers`
- `GET /api/v1/admin/servers/:id`
- `PATCH /api/v1/admin/servers/:id`
- `POST /api/v1/admin/servers/:id/status`
- `GET /api/v1/servers`
- `GET /api/v1/servers/:slug`
- `GET /api/v1/collector/targets`
- `POST /api/v1/collector/heartbeats`
- `GET /docs`
- `GET /openapi.json`
