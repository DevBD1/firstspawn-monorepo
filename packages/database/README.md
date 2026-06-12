# @firstspawn/database

Database workspace for the Drizzle runtime schema, shared database client,
migrations, and local PostgreSQL bootstrap assets.

## Files

- `schema-design.md`: working ERD and design notes
- `src/schema.ts`: Drizzle runtime schema and inferred database record types
- `src/client.ts`: shared Drizzle and `pg` database context helpers
- `migrations/`: generated SQL migration history
- `init/`: local Docker extension bootstrap SQL only
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
After creating or recreating a local database, run:

```bash
pnpm --dir packages/database run migrate
```

## Operational Jobs

Retention + rollup SQL:

```bash
API_DATABASE_URL=postgresql://... RETENTION_DAYS=14 \
  ./infrastructure/ops/cron/aggregate-retention.sh
```

Archive inactive servers:

```bash
API_DATABASE_URL=postgresql://... ARCHIVE_AFTER_HOURS=168 \
  ./infrastructure/ops/cron/archive-inactive-servers.sh
```

This job is currently a no-op safety guard. Collector silence, failed probes,
DNS failures, and stale `last_ping_at` must not archive catalog rows.

Purge deleted users:

```bash
API_DATABASE_URL=postgresql://... \
  ./infrastructure/ops/cron/purge-deleted-users.sh
```

Collector target query (active servers only):

```bash
psql "$API_DATABASE_URL" -f packages/database/jobs/select_active_servers.sql
```
