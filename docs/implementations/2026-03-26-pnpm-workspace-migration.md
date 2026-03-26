# Handover - 2026-03-26

## Session Summary

### 18:55 - pnpm workspace migration

- Replaced npm workspace plus Turborepo root wiring with native pnpm workspace metadata: updated [package.json](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/package.json), added [pnpm-workspace.yaml](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/pnpm-workspace.yaml), added [.npmrc](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/.npmrc), generated [pnpm-lock.yaml](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/pnpm-lock.yaml), and removed `turbo.json` plus `package-lock.json`.
- Moved shared database assets into the new [packages/database](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/packages/database) workspace: PostgreSQL init SQL now lives under `packages/database/init/`, and Alembic config plus revisions now live under `packages/database/alembic.ini` and `packages/database/migrations/`.
- Updated workspace package references to pnpm-native `workspace:*` ranges in [apps/web/package.json](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/apps/web/package.json), [apps/mobile/package.json](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/apps/mobile/package.json), and [packages/ui/package.json](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/packages/ui/package.json).
- Updated root-level shared workflow/config references to keep the repo DRY: [.husky/pre-commit](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/.husky/pre-commit), [docker-compose.yml](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/docker-compose.yml), [README.md](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/README.md), [AGENTS.md](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/AGENTS.md), [docs/DEPENDENCY_POLICY.md](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/docs/DEPENDENCY_POLICY.md), [docs/plans/02-architecture-and-stack.md](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/docs/plans/02-architecture-and-stack.md), [docs/plans/03-execution-and-ops.md](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/docs/plans/03-execution-and-ops.md), and GitHub workflow/templates under `.github/`.
- Important assumption: historical handover logs in `docs/implementations/` were left intact even where they reference old paths or npm/Turbo commands, because they describe past sessions rather than current source-of-truth repo structure.
- Known risks/incomplete items: repo-level `pnpm lint` and `pnpm typecheck` still fail due pre-existing issues in `apps/web`; database migration status command still depends on a reachable database host from current env configuration.

### 19:20 - apps directory rename

- Moved workspace roots from `src/*` to `apps/*`: API now lives in [apps/api](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/apps/api), web in [apps/web](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/apps/web), and mobile in [apps/mobile](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/apps/mobile).
- Standardized app source roots under the new layout: Python code now lives directly in `apps/api/src`, and web source now lives under `apps/web/src/` with Next routes in `apps/web/src/app/`.
- Updated active path-sensitive config and docs for the new layout, including [pnpm-workspace.yaml](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/pnpm-workspace.yaml), [docker-compose.yml](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/docker-compose.yml), [packages/database/alembic.ini](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/packages/database/alembic.ini), [apps/api/pyproject.toml](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/apps/api/pyproject.toml), [apps/web/tsconfig.json](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/apps/web/tsconfig.json), [README.md](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/README.md), and [AGENTS.md](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/AGENTS.md).

### 19:35 - api src flattening

- Flattened the Python API source root from `apps/api/src/app` to `apps/api/src` so the source root is the actual code root, per the updated layout preference.
- Rewrote API imports and runtime entrypoints to remove the fake `app.` package namespace. FastAPI now boots via `main:app`, tests import `main` directly, and Alembic uses `config` and `models` from the `apps/api/src` root.
- Updated packaging metadata in [apps/api/pyproject.toml](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/apps/api/pyproject.toml) so editable installs understand the flattened source layout.

### 19:45 - nginx infrastructure move

- Moved Nginx runtime assets from the repository root into [infrastructure/nginx](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/infrastructure/nginx) so they live with the rest of the deployment infrastructure instead of the repo root.
- Updated [docker-compose.yml](/Users/burak/Repository/Projects/DevBD1/firstspawn-monorepo/docker-compose.yml) bind mounts to point at `./infrastructure/nginx/...`.

## Validation Performed

- `pnpm import`
- `pnpm install`
- `pnpm -r list --depth -1`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm --dir packages/database run migrate:status`

## What is next?

1. Fix the existing `apps/web` lint/typecheck failures so the new root pnpm scripts pass end-to-end.
2. Point local API/database env vars at a reachable PostgreSQL host before running Alembic status or migrations outside Docker networking.
3. Optionally update historical handover docs if you want old path references normalized for search consistency.
