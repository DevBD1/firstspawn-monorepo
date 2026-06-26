---
name: firstspawn-git-release-flow
description: Use for FirstSpawn git workflow tasks, branch creation, worktree setup, preserving dirty or staged work, pre-commit hook fixes, lint-staged failures, commit and push requests, release tagging and CHANGELOG updates, and release handoff summaries.
---

# FirstSpawn Git Release Flow

Use this for branch, commit, push, and hook-fix work.

## First Check

```bash
git status --short
git branch --show-current
```

If there are existing changes, assume they are user work unless proven otherwise.

## Dirty Work Rules

- Never reset, checkout, or remove user changes unless the user clearly asks.
- Preserve dirty or staged work when branching.
- If the user wants new work from `main` without touching current changes, use a separate worktree.
- If staged work should follow to a new branch, `git switch -c <branch>` is usually enough.
- Do not mix unrelated file cleanup into a commit.

## Worktree Pattern

Use this when current branch has work that must stay untouched:

```bash
git worktree add /path/to/new-worktree -b <branch-name> main
```

Then verify both trees before editing.

## Hook Fix Rules

- If commit is blocked by Husky or lint-staged, fix only the hook-blocking issues first.
- Common blockers seen in this repo:
  - `react/no-unescaped-entities`
  - Prettier parse errors
  - i18n copy drift
  - generated style drift
- Prefer targeted validation before broad `pnpm ci`.

## Commit Flow

1. Confirm intended file scope with `git diff --stat` and `git status --short`.
2. Run targeted validation.
3. Stage only intended files.
4. Commit with a concise semantic message.
5. Push only when the user asked for push.

## Release Publishing

The release lifecycle (`draft → frozen → shipped → superseded`) and the full
publish process are canonical in `PRODUCT.md` §5.3–§5.4. This skill covers only
the git-side actions when a version ships:

- A new version is a new `docs/releases/<version>.md` file, never an edit to a
  shipped one; it must be `frozen` before building.
- On ship: set the release file to `shipped`, then tag the release with an
  annotated tag that matches it (e.g. `git tag -a v1-mvp -m "v1 MVP"`).
- Append a dated entry to `CHANGELOG.md` linking the frozen release file, and
  mark the prior release `superseded`.
- Push the branch and tags only when asked: `git push --follow-tags`.
- Refactors, trims, and production plumbing are implementation, not a release:
  they never touch `PRODUCT.md` or a frozen release file — track them in
  `PLAN.md`.

## Useful Commands

```bash
pnpm --filter @firstspawn/web lint:i18n
pnpm --filter @firstspawn/ui check:styles
pnpm --filter @firstspawn/web typecheck
pnpm --filter @firstspawn/api test
pnpm exec lint-staged --concurrent false
```
