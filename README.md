# FirstSpawn

Discovery and trust platform for game servers, starting with Hytale and Minecraft.

[![CI](https://github.com/devbd1/firstspawn-monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/devbd1/firstspawn-monorepo/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

FirstSpawn is a pnpm workspace monorepo with:

- `apps/api`: Fastify API in TypeScript
- `apps/mobile`: Expo scaffold
- `apps/web`: Next.js 16 web app
- `packages/config`: shared ESLint config
- `packages/database`: Drizzle config and SQL migrations
- `packages/typescript-config`: shared TypeScript configs
- `packages/ui`: shared UI source package

The repository is being actively refactored around the Fastify + TypeScript +
Drizzle stack. The current baseline is:

- Web app is the primary shipped surface
- API auth + deletion/restore foundation is implemented
- Admin/public server catalog routes are implemented
- Collector target + heartbeat ingestion routes are implemented
- `apps/collector` now drives heartbeat polling for `mc_java`
- Docker scheduler now runs archive / rollup retention / delete purge jobs
- Reviews, favorites, moderation, plugin telemetry, and agent workflows are
  Phase 2

## Backend MVP Status

Current backend is **not fully complete for MVP** yet.

Implemented:

- Auth endpoints (`register`, `login`, `refresh`, `logout`, `me`)
- Soft-delete flow (`delete/request`, `restore/confirm`, `restore/expedite-delete`)
- Admin catalog endpoints for `mc_java` servers
- Public server list/detail endpoints
- Collector target and heartbeat ingestion endpoints
- New `apps/collector` service with `/healthz` and `/metrics`
- Docker scheduler container for daily archive / rollup / purge jobs
- Rebaselined Drizzle migration history
- MVP schema foundation (`users`, `sessions`, `verification_tokens`, `user_deletion_requests`, `servers`, `server_heartbeats`, hourly/daily rollups)

Pending for MVP completion:

- Live end-to-end probe verification against a real Minecraft target
- Web discover integration on top of the new public server API
- Any post-MVP expansion beyond `mc_java`

## Quick Start

### Prerequisites

- Node.js `>=20.9.0`
- pnpm `>=10`
- Docker CLI + Docker Compose
- Docker daemon running (Docker Desktop or alternative)

### Setup

```bash
git clone https://github.com/devbd1/firstspawn-monorepo.git
cd firstspawn-monorepo
pnpm install
cp .env.example .env
```

### Local Development

```bash
docker compose up -d postgres redis
pnpm --dir packages/database run migrate
pnpm --filter @firstspawn/api dev
pnpm --filter @firstspawn/collector dev
pnpm --filter @firstspawn/web dev
```

If Docker daemon is not running yet:

```bash
docker ps
# if it says "Cannot connect to the Docker daemon", start Docker Desktop first
```

Local endpoints:

- Web: `http://localhost:3000`
- API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

Run all containers (including API, collector, scheduler, and edge tools):

```bash
docker compose up -d
```

### Local Docker Stack (Browser)

If you run full stack with Docker (`docker compose up -d`), use these URLs:

- Nginx entrypoint: `http://localhost`
- API (via Nginx): `http://api.localhost`
- pgAdmin (via Nginx): `http://db.localhost`
- Dozzle logs (via Nginx): `http://logs.localhost`
- pgAdmin direct port: `http://localhost:5050`
- PostgreSQL direct port: `localhost:5432`

Notes:

- `api.localhost` and `logs.localhost` are protected with Basic Auth.
- `api.localhost` has one exception: `/api/v1/auth/me` skips Basic Auth because it must use Bearer auth in `Authorization` header.
- Nginx reads `NGINX_AUTH_USER` and `NGINX_AUTH_PASS` from `.env` and
  auto-generates `.htpasswd` on container start.
- In Docker mode, API is **not** published on `localhost:8000`; it is internal and
  exposed through Nginx.
- Collector and scheduler run on the internal Docker network and are not exposed on host ports by default.
- In this mode set `API_BASE_URL=http://api.localhost/api/v1` in `.env` for web -> API calls.

Set up Basic Auth once on your machine:

```bash
# set credentials in .env
NGINX_AUTH_USER=admin
NGINX_AUTH_PASS=change_me

# apply
docker compose up -d --force-recreate nginx
```

Quick checks:

```bash
curl -I http://localhost
curl -I http://api.localhost/healthz
curl -I http://db.localhost
curl -I http://logs.localhost
```

## MVP Runtime Environment

New backend MVP services require the following environment values in `.env`:

- API admin and collector auth:
  - `API_ADMIN_EMAIL_ALLOWLIST`
  - `API_COLLECTOR_KEY`
- Scheduler (UTC cron, daily defaults):
  - `SCHEDULE_ARCHIVE_INACTIVE`
  - `SCHEDULE_ROLLUP_RETENTION`
  - `SCHEDULE_PURGE_DELETED_USERS`
- Collector runtime:
  - `COLLECTOR_API_BASE_URL`
  - `COLLECTOR_PING_INTERVAL_SECONDS`
  - `COLLECTOR_PAYLOAD_INTERVAL_SECONDS`
  - `COLLECTOR_CONCURRENCY`
  - `COLLECTOR_TARGET_PAGE_SIZE`
  - `COLLECTOR_PROBE_TIMEOUT_MS`

### Backend VPS IPv6 (Step By Step)

To run backend services on an IPv6 VPS, complete all steps below:

1. Enable Docker daemon IPv6 in daemon config (not only Compose network).
2. Set Compose network `enable_ipv6: true` and define an IPv6 subnet in `ipam`.
3. Enable host kernel/sysctl IPv6 forwarding.
4. Ensure services listen on IPv6 (`::`) and not only `0.0.0.0`.
5. Open IPv6 in VPS firewall/security group.
6. Add DNS `AAAA` records for your domains.
7. Bind reverse proxy (nginx/caddy) for IPv6 listeners.
8. Verify from outside using an IPv6 client.

## Common Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm ci
```

Targeted commands:

```bash
pnpm --filter @firstspawn/web dev
pnpm --filter @firstspawn/api dev
pnpm --filter @firstspawn/collector dev
pnpm --dir packages/database run migrate
pnpm --dir packages/database run generate
```

## Documentation

- [`docs/implementation-history/`](docs/implementation-history): completed or accepted implementation notes
- [`PRODUCT.md`](PRODUCT.md): product scope, users, non-goals, and success criteria
- [`PLAN.md`](PLAN.md): roadmap and recommended next standards
- [`DESIGN.md`](DESIGN.md): UI/UX design system baseline (visual language, tokens, component style)
- [`apps/api/README.md`](apps/api/README.md): API runtime, endpoints, and tests
- [`apps/collector/README.md`](apps/collector/README.md): collector runtime, env, and validation
- [`packages/database/README.md`](packages/database/README.md): database
  migration workflow

## Repository Layout

```text
firstspawn-monorepo/
├── apps/
│   ├── api/
│   ├── collector/
│   ├── mobile/
│   └── web/
├── docs/
│   └── implementation-history/
├── infrastructure/
└── packages/
    ├── config/
    ├── database/
    ├── typescript-config/
    └── ui/
```
