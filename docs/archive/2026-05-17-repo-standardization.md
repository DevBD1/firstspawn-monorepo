# Repo Standardization

Date: 2026-05-17

## Goal

Standardize the root repository documentation and configuration surface while preserving FirstSpawn-specific source-of-truth rules and aligning with Next.js 16 requirements.

## Planned Scope

- Standardize root documentation files (`PRODUCT.md`, `PLAN.md`).
- Centralize implementation history by migrating legacy documentation.
- Update repository routing and orientation for agents.
- Align Node engine and package dependencies with Next.js 16.

## Completed Work

- Renamed `PRD.md` to `PRODUCT.md` to match project standards.
- Created `PLAN.md` for roadmap tracking and recommended next standards.
- Added `apps/collector/README.md` to define collector runtime and validation rules.
- Migrated legacy `docs/superpowers` content into `docs/implementation-history`.
- Updated `AGENTS.md`, `README.md`, and the `firstspawn-repo-orientation` skill routing.
- Aligned the root Node engine version with the Next.js 16 requirement.
- Updated `@firstspawn/ui` peer dependency metadata to support Next.js 16.

## Validation

- Verified file presence and naming: `PRODUCT.md`, `PLAN.md`, `apps/collector/README.md`.
- Checked documentation formatting:
  ```bash
  pnpm exec prettier --check AGENTS.md README.md PRODUCT.md PLAN.md apps/collector/README.md docs/implementation-history/2026-04-24-vertical-reactive-discovery-fork.md docs/implementation-history/2026-05-17-repo-standardization.md .agents/skills/firstspawn-repo-orientation/SKILL.md package.json packages/ui/package.json pnpm-lock.yaml
  ```
- Performed `git diff --check` to ensure no whitespace errors or conflicts.

## Notes

- This standardization establishes the baseline for the multi-gateway refactor and future Next.js 16 application development.
