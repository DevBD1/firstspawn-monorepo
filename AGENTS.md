# AGENTS.md

Repository guidance for AI agents working in `firstspawn-monorepo`.

## Project Snapshot

FirstSpawn is a discovery and trust platform for game servers, starting with
Hytale and expanding to Minecraft.

Core thesis:
- Discovery should be relevance-driven, not pay-to-win.
- Trust should be earned through verified activity and reputation.
- Retention should come from repeatable discovery and trust loops.

## Monorepo Layout

```text
firstspawn-monorepo/
├── apps/
│   ├── api/              # Fastify API (TypeScript, code in apps/api/src)
│   ├── collector/        # Heartbeat collector service (TypeScript, code in apps/collector/src)
│   ├── web/              # Next.js 16 app (code in apps/web/src)
│   └── mobile/           # Expo scaffold
├── packages/
│   ├── database/         # Drizzle config + SQL migrations
│   ├── ui/               # Shared UI source package
│   ├── config/           # Shared ESLint config
│   └── typescript-config/# Shared TS configs
├── docs/
│   └── idea-pool.md      # Parked future ideas only
└── .infras/              # Operational scripts and infra notes
```

## Current Stack

- Web: Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Framer Motion
- API: Fastify 5, Zod, Drizzle ORM, PostgreSQL, Redis
- Collector: Node/TypeScript service polling `mc_java` targets and posting heartbeats
- Shared UI: `@firstspawn/ui` exports source TypeScript directly
- Tooling: pnpm workspaces, ESLint, Prettier, Vitest

## Source Of Truth

- Root overview and shared setup: `README.md`
- Product UI/UX design system baseline: `DESIGN.md`
- API runtime, endpoints, and validation commands: `apps/api/README.md`
- Database migration workflow: `packages/database/README.md`
- Parked future ideas: `docs/idea-pool.md`

## Documentation Rules

- Keep `docs/` minimal.
- Use `docs/idea-pool.md` only for parked future ideas.
- Keep UI/UX design language in `DESIGN.md` (not in `docs/`).
- Put service-specific runtime details in the nearest service README instead of
  `docs/`.
- Avoid stale status docs, duplicate setup instructions, and speculative
  roadmaps.
- If information belongs in the product baseline, put it in `README.md` or the
  relevant service README instead of creating another doc.

## Shared Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm typecheck
pnpm test
pnpm ci
```

Useful targeted commands:

```bash
pnpm --filter @firstspawn/web dev
pnpm --filter @firstspawn/api dev
pnpm --filter @firstspawn/collector dev
pnpm --dir packages/database run migrate
pnpm --dir packages/database run generate
```

## Web Rules

### i18n

- Dictionary files live in `apps/web/src/lib/dictionaries/`.
- Supported locales: `en`, `tr`, `de`, `ru`, `es`, `fr`.
- MVP locales: `en`, `tr`, `de`.
- Route param is `lang`, not `locale`.
- Always merge the target dictionary into English via
  `apps/web/src/lib/get-dictionary.ts`.
- All user-facing strings must come from dictionaries.
- Do not hardcode user-facing copy in pages, components, hooks, or view-model
  builders. English baseline copy also belongs in dictionaries.

### Design System

- The site uses a pixel-retro visual language.
- Global tokens and utility classes live in
  `apps/web/src/app/globals.css`.
- Primary accent is `--fs-diamond: #22d3ee`.
- Typography tokens:
  - `--font-family-display`
  - `--font-family-ui`
  - `--font-family-body`

### Routing

- Marketing pages with global chrome go under
  `apps/web/src/app/[lang]/(marketing)/`.
- Auth pages without global chrome go under
  `apps/web/src/app/[lang]/(auth)/`.
- Admin routes stay under `apps/web/src/app/admin/` and are English-only.

### SEO And OG

- `apps/web/src/app/robots.ts` blocks indexing on preview deployments.
- Add new protected routes to the `disallow` list in `robots.ts`.
- `apps/web/src/app/sitemap.ts` is generated from configured locales.
- OG image generation uses edge runtime and loads fonts with
  `fetch(new URL(..., import.meta.url))`.

### Graceful Degradation

- AI-enhanced captcha copy must not hard-fail when provider keys or credits are
  missing.
- Newsletter, analytics, and optional third-party integrations must fail
  safely.

## API Rules

- Keep route contracts in Zod and use Fastify Swagger/OpenAPI as the
  machine-readable contract source.
- Keep schema changes aligned between `packages/database/schema-design.md`,
  `apps/api/src/db/schema.ts`, and generated migrations.
- Use explicit return types on exported functions unless the framework surface
  makes the type obvious.
- Prefer transactions for auth/session mutations that revoke or rotate refresh
  tokens.
- Passwords are hashed with scrypt and refresh tokens are hashed at rest.
- Shared bearer auth and collector-key checks live under `apps/api/src/lib/`.
- New backend slices should register through `apps/api/src/routes/index.ts` so
  `/openapi.json` stays complete.

### Current API Surface

- Auth routes remain under `apps/api/src/routes/v1/auth.ts`.
- Server catalog routes live under `apps/api/src/routes/v1/servers.ts`.
- Collector routes live under `apps/api/src/routes/v1/collector.ts`.
- Public server detail uses slug.
- Admin and collector write paths use UUID server ids.

### Catalog And Freshness Rules

- MVP support is `mc_java` only for admin writes, collector targets, and public
  freshness.
- Public list hides archived rows by default and never exposes suspended rows.
- Public detail returns `404` for suspended or missing rows.
- Online/offline is derived from `servers.last_ping_at` with a 15 minute window.
- Collector accepts only successful heartbeat samples. Offline is absence, not
  an explicit event.
- Heartbeat dedupe is scoped by `(server_id, idempotency_key)`.
- Late/out-of-order successful samples are accepted, but `servers.last_ping_at`
  must stay monotonic.

### API Validation

- API tests live in `apps/api/tests/`.
- `pnpm test` runs workspace suites, including the API Vitest suite.
- DB-backed API tests should use `API_TEST_DATABASE_URL` when provided.
- API test harness uses schema-level isolation per test run.

## Database Rules

- `packages/database` owns Drizzle config and SQL migration history.
- The canonical design source of truth is `packages/database/schema-design.md`.
- Runtime schema is derived into `apps/api/src/db/schema.ts`.
- Generate migrations from schema changes, then apply them through the database
  workspace scripts.
- Raw heartbeat retention and rollup jobs stay in `packages/database/jobs/`.
- Scheduler container runs existing SQL-backed archive / rollup / purge scripts
  from `.infras/ops/cron/`.

## Collector Rules

- Collector source lives in `apps/collector/src/`.
- Collector fetches paginated targets from `GET /api/v1/collector/targets`.
- Collector posts one heartbeat event per request to
  `POST /api/v1/collector/heartbeats`.
- Auth uses `API_COLLECTOR_KEY` through the `x-collector-key` header.
- Probe cadence defaults to 5 minute pings and 30 minute raw payload storage.
- Collector exposes `/healthz` and `/metrics`.
- Keep collector logic platform-agnostic; Docker runtime is wired through
  `apps/collector/Dockerfile` and `docker-compose.yml`.

## Environment Rules

- Never commit `.env` files.
- Copy `.env.example` to `.env` for local development.
- Secrets stay server-side only.
- Only publish-safe values may use the `NEXT_PUBLIC_` prefix.

Important env groups:
- Web: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_KEY`,
  `NEXT_PUBLIC_POSTHOG_HOST`
- API: `API_DATABASE_URL`, `API_REDIS_URL`, `API_JWT_SECRET`,
  `API_TOKEN_HASH_SECRET`, `API_ADMIN_EMAIL_ALLOWLIST`, `API_COLLECTOR_KEY`
- Collector: `COLLECTOR_API_BASE_URL`, `COLLECTOR_PING_INTERVAL_SECONDS`,
  `COLLECTOR_PAYLOAD_INTERVAL_SECONDS`, `COLLECTOR_CONCURRENCY`,
  `COLLECTOR_TARGET_PAGE_SIZE`, `COLLECTOR_PROBE_TIMEOUT_MS`
- Scheduler: `SCHEDULE_ARCHIVE_INACTIVE`, `SCHEDULE_ROLLUP_RETENTION`,
  `SCHEDULE_PURGE_DELETED_USERS`
- Optional integrations: `RESEND_API_KEY`, `GEMINI_API_KEY`,
  `OPENAI_API_KEY`

## Common Tasks

### Add A Locale

1. Update `apps/web/src/lib/i18n-config.ts`.
2. Add the dictionary JSON file.
3. Add the loader in `apps/web/src/lib/get-dictionary.ts`.
4. Update sitemap or OG handling if the change affects public routing.

### Add A Page

1. Choose the correct route group.
2. Add the page with dictionary-driven copy.
3. Update navigation only if the route is user-facing.
4. Update `robots.ts` if the page is protected.

### Add A Shared Component

1. Put cross-app primitives in `packages/ui/src/`.
2. Put shared web-only primitives in `apps/web/src/components/`.
3. Put feature-owned logic in `apps/web/src/features/<feature>/`.

## Current Workspace Status

- `@firstspawn/web`: Beta app deployed via Vercel
- `@firstspawn/api`: Auth/session/soft-delete/restore plus server catalog and
  collector ingestion routes implemented
- `@firstspawn/collector`: Active heartbeat collector for `mc_java` targets
- `@firstspawn/mobile`: Scaffold only
- `@firstspawn/ui`: Active shared component package
