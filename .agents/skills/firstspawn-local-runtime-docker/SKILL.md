---
name: firstspawn-local-runtime-docker
description: Use for FirstSpawn local Docker runtime work, docker compose services, Postgres and Redis containers, API/collector/scheduler/nginx/mailserver runtime wiring, Dockerfiles, docker-data handling, container logs, health checks, and local runtime debugging.
---

# FirstSpawn Local Runtime Docker

Use this for local Docker and compose work. Keep Dockerfile optimization separate from product, API, DB, or UX decisions.

## Source Files

- Runtime overview: `README.md`
- Compose stack: `docker-compose.yml`
- API runtime: `apps/api/README.md`, `apps/api/Dockerfile`
- Collector runtime: `apps/collector/README.md`, `apps/collector/Dockerfile`
- Scheduler runtime: `infrastructure/ops/scheduler/Dockerfile`
- Cron scripts: `infrastructure/ops/cron/`
- Example persistent data: `docker-data.example/`
- Live persistent data: `docker-data/` ignored, do not commit

## Rules

- Read `docker-compose.yml` before changing service names, ports, volumes, profiles, or env wiring.
- Service READMEs own setup commands and runtime details.
- Use `docker-data.example/` for templates only. Never commit live `docker-data/`.
- Keep secrets out of committed env files. Only publish-safe values may use `NEXT_PUBLIC_`.
- Prefer targeted compose commands over broad resets.
- Do not delete volumes or data unless the user clearly asks.
- For Dockerfile optimization, use multi-stage build best practices as a checklist, but keep FirstSpawn runtime behavior grounded in this repo.

## Common Commands

```bash
docker compose ps
docker compose up -d postgres redis
docker compose up -d
docker compose logs api
docker compose logs collector
docker compose logs scheduler
docker compose --profile mail up -d mailserver
docker compose up -d --force-recreate nginx
```

## Workflow

1. Check `git status --short` and avoid unrelated dirty work.
2. Read the relevant service README and `docker-compose.yml`.
3. Identify whether the task is runtime setup, service debugging, Dockerfile optimization, or persistent data handling.
4. Make the smallest change in the owning file.
5. Validate with the narrowest useful compose command or service test.

## Dockerfile Checklist

- Separate build and runtime stages when optimizing production images.
- Copy only runtime artifacts into the final image.
- Keep dependency install layers before app source copies for cache reuse.
- Use pinned official base images.
- Avoid root runtime users when practical.
- Add health checks only when they match the service contract.
