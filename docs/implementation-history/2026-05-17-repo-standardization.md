# Repo Standardization

Date: 2026-05-17

## Summary

Standardized the root repo documentation surface around the repo bootstrap
checklist while preserving FirstSpawn-specific source-of-truth rules.

## Changes

- Renamed `PRD.md` to `PRODUCT.md`.
- Added `PLAN.md` for roadmap and recommended next standards.
- Added `apps/collector/README.md` for collector runtime and validation.
- Migrated old `docs/superpowers` content into `docs/implementation-history`.
- Updated `AGENTS.md`, `README.md`, and `firstspawn-repo-orientation` routing.
- Aligned the root Node engine with the Next.js 16 requirement.
- Aligned `@firstspawn/ui` peer dependency metadata with Next.js 16.

## Validation

Expected checks:

```bash
pnpm exec prettier --check AGENTS.md README.md PRODUCT.md PLAN.md apps/collector/README.md docs/implementation-history/2026-04-24-vertical-reactive-discovery-fork.md docs/implementation-history/2026-05-17-repo-standardization.md .agents/skills/firstspawn-repo-orientation/SKILL.md package.json packages/ui/package.json pnpm-lock.yaml
git diff --check
```
