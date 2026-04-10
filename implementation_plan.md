# FirstSpawn MVP Gap — Implementation Plan

## Background

Three gaps block the MVP from being shippable. This plan addresses them in priority order.
The agent executing this plan should make no changes outside the files listed per gap.

---

## Gap 1 — Discover Page: Replace Mock Data with Real API + Build Server Detail Page

### Context

`DiscoverClient.client.tsx` renders 730 lines of UI against a hardcoded `mockServers` array.
The page route (`apps/web/src/app/[lang]/(marketing)/discover/page.tsx`) is a server component
but passes no data down — `DiscoverClient` is fully self-contained with mock data.

There is no server detail page (`/[lang]/server/[slug]` or similar) anywhere in the app.
Card links currently point to `/server/${server.id}` which is a dead route.

The backend contract is already stable. The public list endpoint returns:

```
GET /api/v1/servers?q=...&freshness_status=online|offline&limit=20&cursor=<uuid>
```

Each item in `.data.servers[]`:
```ts
{
  slug: string
  name: string
  description: string
  game: "mc_java"
  catalog_status: "active" | "archived"
  freshness_status: "online" | "offline"
  region: string | null
  last_ping_at: string | null   // ISO datetime
  latest_metrics: {
    ping_ms: number | null
    online_players: number | null
    max_players: number | null
    minecraft_version: string | null
    occurred_at: string | null
  }
}
```

The public detail endpoint:
```
GET /api/v1/servers/:slug
```
Returns `.data.server` — the full `serverBaseSchema` shape (includes `host`, `port`, `id`,
`online_mode`, `website_url`, `discord_url`, `created_at`, `updated_at`) plus `latest_metrics`.

API base URL for server-side fetch: `getApiBaseUrl()` from `apps/web/src/lib/auth-config.ts`
resolves to `process.env.API_BASE_URL` (default `http://localhost:8000/api/v1`).

### Step 1.1 — Create a typed API client for public server endpoints

**[NEW]** `apps/web/src/lib/servers-api.ts`

- Export `PublicServerListItem` and `PublicServerDetail` TypeScript interfaces matching the API contract above.
- Export `fetchServers(params: { q?: string; freshness_status?: string; limit?: number; cursor?: string }): Promise<{ servers: PublicServerListItem[]; pagination: { next_cursor: string | null; limit: number } }>`.
  - Uses `getApiBaseUrl()` + `/servers` for the URL.
  - Uses `getApiBasicAuthHeader()` for the auth header (same pattern as `proxy.ts` line 90–98).
  - `cache: "no-store"` — live freshness data, never cache.
  - On HTTP error, throw with a human-readable message.
- Export `fetchServerDetail(slug: string): Promise<PublicServerDetail | null>`.
  - Returns `null` on 404.
  - Throws on other non-OK status.

### Step 1.2 — Convert `DiscoverPage` to a server component that fetches data

**[MODIFY]** `apps/web/src/app/[lang]/(marketing)/discover/page.tsx`

- Import and call `fetchServers({ limit: 20 })` from `servers-api.ts` inside the server component.
- Pass the result as a `initialServers` prop and `initialPagination` prop to `DiscoverClient`.
- Add `export const revalidate = 60;` so Next.js ISR re-fetches every 60 seconds.
- Keep the dictionary and `lang` props exactly as they are.
- Add a `try/catch` around `fetchServers` — on failure, pass `initialServers: []` so the page degrades gracefully (empty state, no crash).

### Step 1.3 — Refactor `DiscoverClient` to consume real data with client-side search/filter

**[MODIFY]** `apps/web/src/features/discover/components/DiscoverClient.client.tsx`

This is the largest change. The mock data and its baked-in type must be replaced.

#### Remove entirely:
- `interface Server { ... }` (lines 10–27) — replace with `import type { PublicServerListItem } from "@/lib/servers-api"`.
- `const mockServers: Server[] = [...]` (lines 30–166) — delete entirely.
- `const tierConfig` and `const statusConfig` — keep and adapt (see below).

#### New props interface:
```ts
interface DiscoverClientProps {
  lang: string;
  dictionary: { [key: string]: unknown };
  initialServers: PublicServerListItem[];
  initialPagination: { next_cursor: string | null; limit: number };
}
```

#### State and derived data:
- Replace `mockServers` references with `useState<PublicServerListItem[]>` seeded from `initialServers`.
- Add `useState<string | null>` for `nextCursor` seeded from `initialPagination.next_cursor`.
- Add `useState<boolean>` for `isLoadingMore`.
- The existing `selectedGame`, `selectedTier`, `searchQuery`, `sortBy` filter state stays,
  but filtering and sort are now purely client-side over the fetched list.

#### Data mapping — API → UI:
The API shape is simpler than the mock. Map it as follows:

| Mock field | API field | Notes |
|---|---|---|
| `name` | `name` | direct |
| `status` | `freshness_status` === `"online"` → `"online"`, else `"offline"` | only two UI states for real data |
| `players.current` | `latest_metrics.online_players ?? 0` | |
| `players.max` | `latest_metrics.max_players ?? 0` | |
| `version` | `latest_metrics.minecraft_version ?? "—"` | |
| `description` | `description` | direct |
| `game` | always `"mc_java"` → render as `"MINECRAFT"` | |
| `tier` | **drop** — derive from player count: `>10,000` → legendary, `>1,000` → epic, `>100` → rare, else common | |
| `uptime` | **drop** — not in API | remove uptime bar |
| `rating` / `reviews` | **drop** — Phase 2 reviews | remove rating block |
| `verified` / `rewards` / `peakRank` | **drop** | remove badges |
| `tags` | **drop** — not in API | remove tag list |
| `gamemode` | **drop** | remove game mode label |

#### "Load more" button:
- Add a "LOAD MORE" `PixelButton` below the grid, visible only when `nextCursor !== null`.
- On click: call `/api/servers?cursor=<nextCursor>&limit=20` client-side via `fetch`, append results, update cursor.
- Show a loading state on the button during the fetch.

#### Card link:
- Change `href={`/server/${server.id}`}` → `href={`/${lang}/server/${server.slug}`}`.

#### Stats bar:
- `onlineServers` = servers state filtered by `freshness_status === "online"`.
- `totalPlayers` = sum of `latest_metrics.online_players ?? 0`.

#### Game filter tabs:
- "ALL WORLDS" and "MINECRAFT" work as-is (all real data is `mc_java` / Minecraft).
- "HYTALE" tab: when selected and no servers match, show the empty state. Do not remove the tab.

#### Sort:
- Remove `"newest"` sort case (no `created_at` on list items). Add `created_at` order to `"newest"` only if the field is available — otherwise just remove that option.
- `"uptime"` sort: remove (field gone). Replace with `"ping"` sort by `latest_metrics.ping_ms`.

### Step 1.4 — Build the server detail page

**[NEW]** `apps/web/src/app/[lang]/(marketing)/server/[slug]/page.tsx`

- Server component. Calls `fetchServerDetail(slug)` from `servers-api.ts`.
- If `null` is returned, call `notFound()` from `next/navigation`.
- Add `export const revalidate = 60`.
- Render a detail view. Use the pixel-retro design system (no hardcoded hex, use Tailwind
  token classes from `DESIGN.md`). Required sections:
  - **Header**: server name (`font-display`), `freshness_status` badge with pulse dot, `catalog_status` badge.
  - **Metrics row**: online players / max players, ping_ms, minecraft_version, last_ping_at (relative time, e.g. "2 min ago").
  - **Description**: full text, `font-body`.
  - **Info panel**: host, port, region, website_url (external link), discord_url (external link), `online_mode` toggle label.
  - **Back button**: `PixelButton` → `href={`/${lang}/discover`}`.
- No client component needed — this page is fully static/SSR data. Only add `"use client"` if
  animation is required, and even then extract a thin wrapper.
- Register nothing in `robots.ts` (public route, indexable).
- Add a `generateMetadata` export: `title = server.name + " — FirstSpawn"`,
  `description = server.description.slice(0, 155)`.

---

## Gap 2 — Redis Rate-Limiting on Auth Endpoints

### Context

`API_REDIS_URL` is already in `config.ts` (line 31). Redis is running in Docker.
`server.ts` does not import or use Redis at all. No Redis client module exists in `apps/api/src/`.
The API uses in-memory maps for nothing today; rate-limiting is only in the web middleware (`proxy.ts`).

The goal: basic sliding-window rate limiting on auth mutation endpoints to prevent brute force.
Do **not** over-engineer. One Redis client, one helper, applied to three endpoint groups.

### Step 2.1 — Add a Redis client to the API

**[NEW]** `apps/api/src/lib/redis.ts`

- Import `ioredis` (already in `package.json`? — **check first**: run `grep -r "ioredis" apps/api/package.json packages/`. If missing, the agent must add it with `pnpm add ioredis --filter @firstspawn/api`).
- Export `createRedisClient(url: string): Redis` — creates a lazy IORedis client with `lazyConnect: true`, `enableOfflineQueue: false` (non-blocking, fail-open design).
- Export the `Redis` type for use in `FastifyInstance` declaration.

**[MODIFY]** `apps/api/src/server.ts`

- Add `redis: Redis` to the `FastifyInstance` declaration block (lines 25–31).
- In `buildApp`, construct `const redis = createRedisClient(config.API_REDIS_URL)` and call `app.decorate("redis", redis)`.
- In `onClose` hook (line 93), add `await app.redis.quit().catch(() => {})` before `db.pool.end()`.
- The Redis client must fail gracefully: if the Redis server is unreachable, the API must still
  start and serve routes (rate limiting simply won't apply — the `INCR` will throw, and the
  middleware should catch and allow the request).

### Step 2.2 — Create a rate-limit helper

**[NEW]** `apps/api/src/lib/rate-limit.ts`

```ts
// Sliding window using Redis INCR + EXPIRE.
// Returns true if the request is allowed, false if rate-limited.
export async function checkRateLimit(
  redis: Redis,
  key: string,         // e.g. "rl:auth_login:127.0.0.1"
  maxRequests: number,
  windowSeconds: number
): Promise<boolean>
```

Implementation:
1. `const count = await redis.incr(key)`.
2. If `count === 1`, call `await redis.expire(key, windowSeconds)` (set TTL on new key).
3. Return `count <= maxRequests`.
4. Wrap in `try/catch` — on any Redis error, return `true` (fail-open, never block on Redis outage).

### Step 2.3 — Apply rate limiting in auth routes

**[MODIFY]** `apps/api/src/routes/v1/auth.ts`

Apply `checkRateLimit` at the **start** of the handler for these three endpoints only:

| Endpoint | Key prefix | Limit | Window |
|---|---|---|---|
| `POST /api/v1/auth/login` | `rl:auth_login:<ip>` | 10 req | 15 min |
| `POST /api/v1/auth/register` | `rl:auth_register:<ip>` | 5 req | 60 min |
| `POST /api/v1/auth/refresh` | `rl:auth_refresh:<ip>` | 30 req | 15 min |

IP extraction: `request.ip` (Fastify fills this from `X-Forwarded-For` if `trustProxy` is set,
otherwise the socket address). Add `trustProxy: true` to the `Fastify({ ... })` constructor in
`server.ts` if not already present.

On rate-limit exceeded: throw `new ApiError({ statusCode: 429, code: "RATE_LIMITED", message: "Too many requests. Please try again later." })`.

Do **not** apply rate limiting to `/refresh` calls coming from the web proxy's automatic token
rotation — the limit of 30 req / 15 min is high enough that normal use is unaffected.

---

## Gap 3 — Live Collector Probe Verification

> [!IMPORTANT]
> Gap 3 is **an ops/verification task**, not a code task. No source files change.
> The agent should execute these steps and report the results.

### Step 3.1 — Add a real `mc_java` server via the admin API

```bash
# Confirm the stack is up
curl -s http://localhost:8000/healthz

# Add a well-known public server (Hypixel, always online)
curl -s -X POST http://localhost:8000/api/v1/admin/servers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Hypixel Network",
    "slug": "hypixel",
    "host": "mc.hypixel.net",
    "port": 25565,
    "game": "mc_java",
    "status": "active",
    "online_mode": true
  }'
# Save the returned server UUID as SERVER_ID
```

To get an admin token:
```bash
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "<admin_email>", "password": "<admin_password>"}'
```

### Step 3.2 — Run one collector cycle and verify

```bash
# Trigger one probe (collector is already running, or start manually):
pnpm --filter @firstspawn/collector dev

# After one ping interval (~5 min, or set COLLECTOR_PING_INTERVAL_SECONDS=30 in .env for this test),
# query the public detail endpoint to verify last_ping_at updated:
curl -s http://localhost:8000/api/v1/servers/hypixel | jq '.data.server | {freshness_status, last_ping_at, latest_metrics}'
```

**Pass criteria:**
- `freshness_status` = `"online"`
- `last_ping_at` is within the last 15 minutes
- `latest_metrics.online_players` is a non-null integer
- `latest_metrics.ping_ms` is a non-null non-negative integer

```bash
# Also verify via the public list:
curl -s "http://localhost:8000/api/v1/servers?freshness_status=online" | jq '.data.servers | length'
# Should be >= 1
```

### Step 3.3 — Verify the Discover page shows live data

```bash
pnpm --filter @firstspawn/web dev
# Open http://localhost:3000/en/discover
# Confirm Hypixel appears with real player count, not mock data
```

---

## File Change Summary

| File | Action | Gap |
|---|---|---|
| `apps/web/src/lib/servers-api.ts` | NEW | 1 |
| `apps/web/src/app/[lang]/(marketing)/discover/page.tsx` | MODIFY | 1 |
| `apps/web/src/features/discover/components/DiscoverClient.client.tsx` | MODIFY | 1 |
| `apps/web/src/app/[lang]/(marketing)/server/[slug]/page.tsx` | NEW | 1 |
| `apps/api/src/lib/redis.ts` | NEW | 2 |
| `apps/api/src/lib/rate-limit.ts` | NEW | 2 |
| `apps/api/src/server.ts` | MODIFY | 2 |
| `apps/api/src/routes/v1/auth.ts` | MODIFY | 2 |

---

## Execution Order

Execute gaps in the following order. Gap 3 (verification) must come **after** Gap 1 so the
end-to-end web → API → DB path can be verified live.

```
Gap 2 (Redis/API) → Gap 1 (Web) → Gap 3 (Verification)
```

Gap 2 first because the auth route changes are isolated and testable immediately with
`pnpm --filter @firstspawn/api test`. Gap 1 depends on the API being stable.

---

## Verification Commands

```bash
# After Gap 2:
pnpm --filter @firstspawn/api typecheck
pnpm --filter @firstspawn/api test

# After Gap 1:
pnpm --filter @firstspawn/web typecheck
pnpm --filter @firstspawn/web build   # catches missing imports, bad types

# End-to-end (Gap 3):
# Follow Step 3.1 → 3.3 manually
```

---

## Constraints and Rules for the Executing Agent

- Never hardcode hex values — use Tailwind token classes from `DESIGN.md`.
- All user-facing strings on the server detail page must use `dictionary` values or be added
  to all six dictionary files (`en`, `tr`, `de`, `es`, `fr`, `ru`) under a new `discover.server_detail` key suffix.
- The `DiscoverClient` refactor must not break the existing filter/sort/search UI — only the
  data source changes.
- Redis rate-limiting must be fail-open. If Redis is down, requests must still succeed.
- Do not touch `packages/database/schema-design.md`, the DB schema, or the collector source.
- Do not add any new environment variables — all required env vars already exist.
