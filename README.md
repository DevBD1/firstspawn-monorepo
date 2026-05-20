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

- Public Web (Placeholder): `http://localhost`
- Private Gateway (API/DB/Logs): `http://localhost:8080`
- Mail Gateway (Webmail): `http://localhost:8081`

Run services by profile:

```bash
docker compose --profile backend up -d
docker compose --profile frontend up -d
docker compose --profile workers up -d
docker compose --profile mail up -d
```

Run all Docker profiles on one local machine with non-conflicting gateway ports:

```bash
NGINX_PUBLIC_HOST_PORT=8082 \
NGINX_PRIVATE_HOST_PORT=8080 \
NGINX_MAIL_HOST_PORT=8081 \
docker compose --profile backend --profile frontend --profile workers --profile mail up -d
```

PowerShell:

```powershell
$env:NGINX_PUBLIC_HOST_PORT='8082'
$env:NGINX_PRIVATE_HOST_PORT='8080'
$env:NGINX_MAIL_HOST_PORT='8081'
docker compose --profile backend --profile frontend --profile workers --profile mail up -d
```

Profiles:

- `backend`: `postgres`, `redis`, `api`, `pgadmin`, `nginx-private`
- `frontend`: `public-webapp` (Next.js app), `nginx-public`
- `mail`: `mailserver`, `roundcube`, `nginx-mail`
- `workers`: `collector`, `scheduler`

`dozzle` is a default service and starts without a profile.

### Local Docker Stack (Browser)

The stack uses three separate Nginx gateways for isolation:

**1. Public Gateway (`http://localhost`)**
- Main Web: `http://web.localhost` locally, `http://firstspawn.com` in production-style routing
- Admin Web: reserved as `http://admin.localhost` locally and `http://admin.firstspawn.com` in production-style routing. It returns `503` until an admin webapp service exists.

**2. Private Gateway (`http://localhost:8080`)**
- API: `http://api.localhost:8080` or `http://api.firstspawn.com`
- pgAdmin: `http://db.localhost:8080`
- Dozzle logs: `http://logs.localhost:8080`

**3. Mail Gateway (`http://localhost:8081`)**
- Roundcube Webmail: `http://webmail.firstspawn.com`

When overriding local gateway ports, include the chosen port in browser URLs.
For example, with `NGINX_PUBLIC_HOST_PORT=8082`, use
`http://web.localhost:8082`.

The frontend profile serves `apps/web` through the `public-webapp` Next.js
container. Admin aliases are reserved and intentionally do not route to the
public app. In Docker, the web container uses `WEB_DOCKER_API_BASE_URL` and
`WEB_DOCKER_SITE_URL` overrides so host-only `.env` values do not leak into
container networking.

Notes:

- `api.localhost` and `logs.localhost` are protected with Basic Auth via `nginx-private`.
- `api.localhost` has one exception: `/api/v1/auth/me` skips Basic Auth because it must use Bearer auth in `Authorization` header.
- Nginx reads `NGINX_AUTH_USER` and `NGINX_AUTH_PASS` from `.env` and
  auto-generates `.htpasswd` on container start.
- In Docker mode, API is **not** published on `localhost:8000`; it is internal and
  exposed through `nginx-private`.
- Collector and scheduler run on the internal `backend-net` and are not exposed on host ports by default.

Set up Basic Auth once on your machine:

```bash
# set credentials in .env
NGINX_AUTH_USER=admin
NGINX_AUTH_PASS=change_me

# apply
docker compose up -d --force-recreate nginx-private
```

Quick checks:

```bash
curl -I http://localhost
curl -I http://localhost:8080
curl -I http://api.localhost:8080/healthz
curl -I http://db.localhost:8080
curl -I http://logs.localhost:8080
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

### Optional Mail Server Profile

The app stack and mail stack can run on separate servers. Services are grouped
behind Compose profiles, so plain `docker compose up -d` does not start them.

On the app server:

```bash
MAIL_SERVER=mail.firstspawn.com
MAIL_PORT=587
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
docker compose --profile backend --profile workers up -d
```

On the mail server:

```bash
docker compose --profile mail up -d mailserver
```

You can also target only a profiled service:

```bash
docker compose up -d mailserver
```

Keep live mail data in ignored `docker-data/`. Use `docker-data.example/` only
as a publish-safe template.

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
