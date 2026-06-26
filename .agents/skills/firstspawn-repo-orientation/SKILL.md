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

1. `PRODUCT.md`: product constitution — vision, principles, identity, governance
   (apex; nothing may contradict its principles).
2. `docs/releases/<active>.md`: current version feature scope (active:
   `docs/releases/v1-mvp.md`).
3. `DESIGN.md`: product UI/UX source of truth.
4. Service READMEs: service runtime, setup, commands, and endpoint state.
5. `packages/database/schema-design.md`: canonical database design.
6. `PLAN.md`: live execution sequencing for the active release.
7. `CHANGELOG.md`: shipped-version history.
8. `.agents/skills/*`: task workflows and checklists.
9. Root `README.md`: repo overview and shared setup.

Each domain doc is authoritative within its domain; if one contradicts a
`PRODUCT.md` principle, `PRODUCT.md` wins. See `PRODUCT.md` §5.

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
