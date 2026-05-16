---
name: firstspawn-api-catalog-auth
description: Use for FirstSpawn API work in apps/api, including Fastify routes, Zod contracts, auth and session behavior, server catalog endpoints, collector endpoints, Swagger/OpenAPI registration, validation envelopes, API tests, and backend service logic.
---

# FirstSpawn API Catalog And Auth

Use this for backend work under `apps/api`.

## Source Files

- API README: `apps/api/README.md`
- Routes: `apps/api/src/routes/`
- Route registry: `apps/api/src/routes/index.ts`
- Shared auth and collector checks: `apps/api/src/lib/`
- Service logic: `apps/api/src/services/`
- Runtime schema: `apps/api/src/db/schema.ts`
- Canonical DB design: `packages/database/schema-design.md`
- Tests: `apps/api/tests/`

## API Rules

- Keep route contracts in Zod.
- Keep Fastify Swagger/OpenAPI complete.
- New backend route slices must register through `apps/api/src/routes/index.ts`.
- Use the standard API response envelope and per-request `request_id`.
- Use explicit return types on exported functions unless the framework surface makes the type obvious.
- Shared bearer auth and collector-key checks belong under `apps/api/src/lib/`.
- Passwords are hashed with scrypt.
- Refresh tokens are hashed at rest.
- Prefer transactions for session mutations that revoke or rotate refresh tokens.

## Current API Areas

- Auth routes: `apps/api/src/routes/v1/auth.ts`
- Server catalog routes: `apps/api/src/routes/v1/servers.ts`
- Collector routes: `apps/api/src/routes/v1/collector.ts`
- Public server detail uses slug.
- Admin and collector write paths use UUID server ids.

## Catalog Rules

- MVP support is `mc_java`.
- Public list hides archived rows by default.
- Public list never exposes suspended rows.
- Public detail returns `404` for suspended or missing rows.
- Online/offline is derived from freshness, not a user-provided flag.
- Freshness window is 15 minutes unless current code says otherwise.
- Collector accepts only successful heartbeat samples.
- Offline is absence, not an explicit event.
- Heartbeat dedupe is scoped by `(server_id, idempotency_key)`.
- Late or out-of-order successful samples may be accepted, but `servers.last_ping_at` must stay monotonic.

## Validation

```bash
pnpm --filter @firstspawn/api lint
pnpm --filter @firstspawn/api typecheck
pnpm --filter @firstspawn/api test
```

For DB-backed tests, use `API_TEST_DATABASE_URL` when provided.
