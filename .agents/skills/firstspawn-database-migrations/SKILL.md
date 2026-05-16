---
name: firstspawn-database-migrations
description: Use for FirstSpawn database work, schema-design alignment, Drizzle schema updates, SQL migrations, migration review, exact match checks between design and SQL, retention jobs, rollups, archive jobs, and database mutation safety.
---

# FirstSpawn Database Migrations

Use this for work under `packages/database` or DB-backed API changes.

## Source Files

- Canonical design: `packages/database/schema-design.md`
- Runtime schema mirror: `apps/api/src/db/schema.ts`
- Migration history: `packages/database/migrations/`
- Drizzle config: `packages/database/drizzle.config.ts`
- SQL jobs: `packages/database/jobs/`
- Operational scripts: `.infras/ops/cron/`

## Rules

- `packages/database/schema-design.md` is the canonical schema design source.
- `apps/api/src/db/schema.ts` must stay aligned with the design.
- When schema intent changes, update `packages/database/schema-design.md` in the same change.
- Generated migrations must match the intended schema change.
- Do not hand-wave exactness. Say exact match vs structural alignment clearly.
- Use transactions for multi-step database writes that must not leave partial state.
- Keep business rules centralized. Do not duplicate DB rules across routes and jobs.
- Raw heartbeat retention and rollup jobs stay in `packages/database/jobs/`.
- Scheduler container runs existing SQL-backed archive, rollup, and purge scripts from `.infras/ops/cron/`.

## Migration Workflow

1. Read the design section being changed.
2. Update `packages/database/schema-design.md` when schema intent changes.
3. Update `apps/api/src/db/schema.ts`.
4. Generate migration SQL:

```bash
pnpm --dir packages/database run generate
```

5. Review generated SQL against `schema-design.md`.
6. Apply only when needed:

```bash
pnpm --dir packages/database run migrate
```

7. Run impacted API tests.

## Safety Notes

- Collector silence, failed probes, DNS failures, and stale `last_ping_at` must not archive catalog rows.
- Public list and detail visibility rules must stay aligned with API behavior.
- Use UUID server ids for admin and collector write paths.
- Use slug for public server detail.

## Validation

```bash
pnpm --filter @firstspawn/api typecheck
pnpm --filter @firstspawn/api test
pnpm --dir packages/database run generate
```

Use migrate only when the task requires applying migrations.
