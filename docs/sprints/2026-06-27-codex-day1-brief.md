# Codex Brief — Day 1 Backend (Vote Loop)

Paste this into Codex. It is self-contained. You own **DB + API only**
(`packages/database` + `apps/api`). Do **not** touch `apps/web` — the web side is built
in parallel. Work on a branch off `main`.

## Context
FirstSpawn is a Minecraft-Java server discovery + voting platform (pnpm monorepo:
`apps/api` Fastify, `packages/database` Drizzle). The anonymous-voting loop does not
exist yet — you are building it. Scope source of truth: `docs/releases/v1-mvp.md` (§8.1,
§12, §14). Shapes you must match exactly: `docs/sprints/2026-06-27-api-contract.md`.

Conventions to reuse (do not reinvent):
- Response envelope: `apps/api/src/lib/envelope.ts` (`successEnvelope`/`errorEnvelope`).
- Errors: throw `ApiError` from `apps/api/src/lib/api-error.ts` ({statusCode, code, message}).
- HMAC/hashing: follow `apps/api/src/lib/security.ts` (`hashToken` uses
  `API_TOKEN_HASH_SECRET`). Config + env validation: `apps/api/src/lib/config.ts` (zod).
- Schema: `packages/database/src/schema.ts`; migrations via
  `pnpm --dir packages/database run generate` then `run migrate`.
- Gate every change with `pnpm lint && pnpm typecheck && pnpm test`.

## Tasks (in order)

**0 — Seed script (do first; unblocks everyone).** There is no admin panel, so the
admin publish flow can't run. Add a controlled, idempotent seed script (e.g.
`packages/database/src/seed-catalog.ts`, runnable via a package script) that inserts a
handful of `active` `mc_java` servers with realistic data: **one** owned by a seeded
test owner account (email-verified) so the owner dashboard has data, the rest with
`owner_id = null`. Use real reachable hosts where possible so the collector can probe
them. Print what it created. §5.2 permits this.

**1 — `votes` table + migration.** New table `votes`:
- `id` uuid pk, `server_id` → servers (cascade), `username_normalized` citext/text,
  `voted_on` date (UTC), `created_at`.
- `ip_hmac` text — daily HMAC of resolved client IP (use a daily-rotating key derived
  from `API_TOKEN_HASH_SECRET` + UTC date, mirroring `security.ts`). Store for 48h max.
- Passive fraud-signal columns (recorded, **not** enforced): `asn`, `country_code`,
  `user_agent` (nullable).
- **Two independent unique constraints** (§12.2):
  1. `unique(server_id, voted_on, ip_hmac)`
  2. `unique(server_id, voted_on, username_normalized)`
- Add monthly counters: either a `server_vote_counters(server_id, month, count)` table
  or computed aggregates — your call, but `votes_this_month`/`votes_all_time` must be
  cheap to read for the list endpoint. Document the choice in the API README.

**2 — `POST /api/v1/servers/:slug/vote`** per contract §1:
- Require Cloudflare Turnstile token; server-side Siteverify (add `TURNSTILE_SECRET_KEY`
  to `apps/api` config — note the *web* already has its own copy for a different flow;
  votes verify on the API); validate action + hostname; treat token single-use, ≤5 min →
  `TURNSTILE_*`. (Reference siteverify call shape:
  `apps/web/src/app/actions/auth.ts` ~L259.)
- **The vote arrives from the trusted Next.js BFF**, not the raw browser (API is behind
  basic auth). The BFF forwards the client IP via `X-Forwarded-For`. The API ALREADY has
  `trustProxy: [...TRUSTED_PROXY_CIDRS]` in `apps/api/src/server.ts` and resolves IP with
  the `getClientIp(request.ip)` pattern (`auth.ts` ~L170) — reuse that; do **not** parse
  raw XFF yourself. Ensure the web/nginx egress CIDR is in `TRUSTED_PROXY_CIDRS` so the
  forwarded client IP is honored; never trust XFF from outside that set.
- Normalize + format-validate username (MC Java rules) + profanity deny-list →
  `INVALID_USERNAME`.
- **Commit-and-count exactly once** in one transaction; rely on the two unique indexes
  for dedupe → `409 ALREADY_VOTED_TODAY`. Suspended/archived → `422 SERVER_NOT_VOTABLE`.
- Votifier delivery is **out of scope today** — leave a clearly-marked no-op
  `enqueueVotifierDelivery(voteId)` stub to be implemented Day 2.
- Apply rate limiting (reuse `apps/api/src/lib/rate-limit.ts`) → `429 RATE_LIMITED`.

**3 — Retention.** Daily IP-HMAC: a deletion/anonymization job (or documented cron
target) that drops `ip_hmac` after 48h (§17.3). Fraud-signal columns retained 90d
(document; job can be a follow-up).

**4 — Ranking** per contract §2: extend `GET /api/v1/servers` with `sort=most_voted` as
the new default; add `votes_this_month`/`votes_all_time` to list + detail; offline
servers excluded from the `most_voted` ranked surface only (use existing
`probe_status='offline'`); tie-break + zero-vote rotation per §8.1. Also surface the two
vote fields in `GET /api/v1/listings/mine` (contract §4) and add
`GET /api/v1/servers/:slug/leaderboard` (contract §3).

**8 — Tests** (critical-path, §18.4): vote uniqueness both rules; UTC-day reset boundary;
Turnstile failure = no vote; commit-once under duplicate submit; offline server excluded
from `most_voted` but present in search.

## Definition of done
- Migration applies cleanly; seed script populates a votable catalog.
- All endpoints match `2026-06-27-api-contract.md` exactly (field names, codes, statuses).
- `pnpm lint && pnpm typecheck && pnpm test` green.
- Update `apps/api/README.md` + `packages/database/schema-design.md` for the new
  table/endpoints (the repo requires docs stay aligned).
