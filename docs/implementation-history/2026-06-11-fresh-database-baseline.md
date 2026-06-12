# Fresh Database Baseline

Date: 2026-06-11

## Goal

Reset the non-production database history to one coherent MVP baseline and make
the API/web contracts match the cleaned schema.

## Planned Scope

- Replace drifted migration history with one clean Drizzle baseline.
- Make migrations own schema and country seed data.
- Replace `online_mode`/`is_cracked` with `auth_mode`.
- Use `country_code` in API responses.
- Add embedded admin server metadata support.

## Completed Work

- Rebaselined Drizzle migrations to `0000_tidy_outlaw_kid.sql` with extension
  setup, generated schema SQL, and full country seed data.
- Updated runtime schema and schema design for DB UUID defaults, composite
  metadata keys, `auth_mode`, and corrected consent timestamp names.
- Removed Docker schema/seed init SQL and stale TTY Drizzle helper.
- Updated API server catalog routes for `auth_mode`, `country_code`, metadata
  create/update replacement semantics, and public metadata responses.
- Updated collector responses, API tests, web server API types, discover cards,
  landing cards, and public server detail.

## Validation

- `corepack pnpm --dir packages/database run generate`: passed, no schema changes.
- `corepack pnpm --filter @firstspawn/database typecheck`: passed.
- `corepack pnpm --filter @firstspawn/api lint`: passed.
- `corepack pnpm --filter @firstspawn/api typecheck`: passed.
- `corepack pnpm --filter @firstspawn/api build`: passed.
- `corepack pnpm --filter @firstspawn/web typecheck`: passed.
- `corepack pnpm --filter @firstspawn/web lint:i18n`: blocked because the
  package script points at missing `apps/web/scripts/lint-i18n.mjs`.
- `corepack pnpm --filter @firstspawn/api test`: blocked by local PostgreSQL
  refusing connections on `localhost:5432`; non-DB tests still ran before the
  integration setup failures.

## Notes

- Existing database data is intentionally not preserved.
- Chart read endpoints remain deferred; hourly/daily rollup tables are the
  prepared chart data source.
