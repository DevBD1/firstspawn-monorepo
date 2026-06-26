# Database Package Boundary

Date: 2026-06-06

## Goal

Move Drizzle runtime ownership out of the API app and into the compiled
`@firstspawn/database` package without changing schema behavior.

## Planned Scope

- Move the Drizzle schema and low-level database client into `packages/database/src`.
- Export compiled package entrypoints for schema and client consumers.
- Update API imports, build flow, Docker build, and database docs.
- Verify that no unintended migration SQL is produced.

## Completed Work

- Added compiled `@firstspawn/database` exports for package root, `./schema`, and `./client`.
- Moved Drizzle schema and database context helpers from `apps/api/src/db` into `packages/database/src`.
- Updated API routes, request auth, server startup, and integration tests to import from package exports.
- Updated database and API docs plus the database migration skill instructions for the new boundary.

## Validation

- `pnpm --filter @firstspawn/database typecheck`: passed.
- `pnpm --filter @firstspawn/database build`: passed.
- `pnpm --filter @firstspawn/api typecheck`: passed.
- `pnpm --filter @firstspawn/api build`: passed.
- `pnpm --filter @firstspawn/api test`: blocked by local PostgreSQL not listening on `localhost:5432`; non-DB tests passed before integration tests failed with `ECONNREFUSED`.
- `pnpm --dir packages/database run generate`: no migration files were written, but Drizzle hit a non-interactive rename-conflict prompt and did not complete cleanly.

## Notes

This is a package boundary refactor only. `packages/database/schema-design.md`
remains the canonical schema design source, and `packages/database/src/schema.ts`
is now the canonical Drizzle runtime schema.
