# @firstspawn/database

> **What this answers** — The database package: migration workflow and commands.
>
> **Open when** — You're generating or running migrations.

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
After creating or recreating a local database, run:

```bash
pnpm --dir packages/database run migrate
```

Optional demo data can be applied after migrations:

```bash
psql "$API_DATABASE_URL" -f packages/database/seeds/0001_demo_server.sql
```

The Day-1 catalog seed creates active `mc_java` listings and one email-verified
test owner account for local owner-dashboard work:

```bash
pnpm --dir packages/database run seed:catalog
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

Clear vote IP HMACs after the 48-hour vote-retention window:

```bash
psql "$API_DATABASE_URL" -f packages/database/jobs/purge_vote_ip_hmacs.sql
```

Collector target query (active servers only):

```bash
psql "$API_DATABASE_URL" -f packages/database/jobs/select_active_servers.sql
```
