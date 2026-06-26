---
name: firstspawn-repo-orientation
description: Use at the start of non-trivial work in firstspawn-monorepo, especially when the task spans multiple apps, asks for repo guidance, asks for audits, or may touch docs, routing, design, API, database, collector, git branches, or shared packages. Orients the agent to the current repo state before edits.
---

# FirstSpawn Repo Orientation

Use this skill before broad or ambiguous work in this repo. Keep it short, then move to the task.

## First Check

1. Read root `AGENTS.md`.
2. Read `DESIGN.md` when touching UI, copy, frontend routing, or shared UI.
3. Read the nearest service README for the touched area:
   - Web: root `README.md` plus `apps/web/package.json`
   - API: `apps/api/README.md`
   - Database: `packages/database/README.md`
   - Collector: `apps/collector/README.md` plus `apps/collector/package.json`
4. Check current state:
   - `git status --short`
   - `git branch --show-current`
   - targeted `rg` or `rg --files` for the files involved

## Precedence Map

When docs disagree: `PRODUCT.md` principles are apex; every other doc is
authoritative only within its own domain (release scope, UI, runtime, schema).
If any doc contradicts a `PRODUCT.md` principle, `PRODUCT.md` wins.

The full ordered map is canonical in `PRODUCT.md` §5.2 and routed in `AGENTS.md`
under "Source Of Truth" — read it there rather than maintaining a third copy
here.

## Repo Boundaries

- `apps/web/src/app/[lang]`: route entrypoints and page composition.
- `apps/web/src/features/<feature>`: domain UI and logic.
- `apps/web/src/components/layout`: app chrome only.
- `apps/web/src/components/ui`: shared web primitives.
- `packages/ui/src`: cross-app shared primitives and token sources.
- `apps/api/src/routes`: API route registration and endpoint contracts.
- `apps/api/src/lib`: shared auth and collector-key checks.
- `apps/api/src/services`: backend service logic.
- `packages/database`: Drizzle config, migration history, schema design, and SQL jobs.
- `apps/collector/src`: platform-agnostic heartbeat collector.

## Default Behavior

- Implement directly when the user gives a clear change request.
- Do not create new docs unless repo rules say the information belongs there.
- Keep feature-specific code inside the owning feature until reuse is real.
- Move repeated behavior to the correct shared layer.
- Do not touch unrelated dirty work.
- Before finishing code changes, do a comment pass on touched files.

## Validation

Pick the smallest useful validation:

```bash
pnpm --filter @firstspawn/web lint:i18n
pnpm --filter @firstspawn/web typecheck
pnpm --filter @firstspawn/ui check:styles
pnpm --filter @firstspawn/api test
pnpm --filter @firstspawn/collector test
pnpm lint
pnpm typecheck
pnpm test
```
