# @firstspawn/database

Database workspace for the Drizzle runtime schema, shared database client,
migrations, and local PostgreSQL bootstrap assets.

## Files

- `schema-design.md`: working ERD and design notes
- `src/schema.ts`: Drizzle runtime schema and inferred database record types
- `src/client.ts`: shared Drizzle and `pg` database context helpers
- `migrations/`: generated SQL migration history
- `init/`: local Docker extension bootstrap SQL only
- `seeds/`: optional local demo data SQL
- `drizzle.config.ts`: Drizzle config
- `jobs/`: SQL jobs for rollup, retention, and active-server selection

## Source Of Truth

- Canonical schema design: `packages/database/schema-design.md`
- Canonical Drizzle runtime schema: `packages/database/src/schema.ts`

## Commands

```bash
pnpm --filter @firstspawn/database build
pnpm --filter @firstspawn/database typecheck
pnpm --dir packages/database run generate
pnpm --dir packages/database run migrate
```

## Local Bootstrap

Docker init SQL only enables required PostgreSQL extensions. Tables,
constraints, indexes, and country seed data are owned by Drizzle migrations.
During development the migration history is intentionally squashed to one
clean baseline; existing local databases must be recreated when that baseline
is replaced.
After creating or recreating a local database, run:

```bash
pnpm --dir packages/database run migrate
```

Optional demo data can be applied after migrations:

```bash
psql "$API_DATABASE_URL" -f packages/database/seeds/0001_demo_server.sql
```

The larger scraped-server seed remains optional and is not part of the default
local reset flow.

## Operational Jobs

Refresh closed hourly and daily chart buckets:

```bash
API_DATABASE_URL=postgresql://... ROLLUP_LAG_MINUTES=10 \
  ROLLUP_LOOKBACK_HOURS=3 \
  bash ./infrastructure/ops/cron/refresh-probe-rollups.sh
```

Finalize rollups and apply tiered retention:

```bash
API_DATABASE_URL=postgresql://... RETENTION_DAYS=2 \
  HOURLY_RETENTION_DAYS=90 DAILY_RETENTION_DAYS=730 \
  ./infrastructure/ops/cron/aggregate-retention.sh
```

The scheduler refreshes chart rollups every 10 minutes and runs retention once
per day. Raw observations remain for 48 hours, hourly buckets for 90 days, and
daily buckets for 730 days.

Archive inactive servers:

```bash
API_DATABASE_URL=postgresql://... ARCHIVE_AFTER_HOURS=168 \
  ./infrastructure/ops/cron/archive-inactive-servers.sh
```

This job is currently a no-op safety guard. Collector silence, failed probes,
DNS failures, and stale probe observations must not archive catalog rows.

Purge deleted users:

```bash
API_DATABASE_URL=postgresql://... \
  ./infrastructure/ops/cron/purge-deleted-users.sh
```

Collector target query (active servers only):

```bash
psql "$API_DATABASE_URL" -f packages/database/jobs/select_active_servers.sql
```
