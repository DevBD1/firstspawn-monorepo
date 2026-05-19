# TypeScript BaseUrl Deprecation Fix

Date: 2026-05-19

## Goal

Resolve the TypeScript deprecation warning for the `baseUrl` option which is scheduled for removal in TypeScript 7.0.

## Planned Scope

- Identify all `tsconfig.json` files using the deprecated `baseUrl` option.
- Remove `baseUrl` where it is unnecessary (e.g., in `NodeNext` or `bundler` resolution modes with relative imports).
- Apply the `ignoreDeprecations: "5.0"` compiler option to the base TypeScript configuration to silence remaining warnings across the monorepo.

## Completed Work

- Removed `"baseUrl": "."` from `apps/api/tsconfig.json` and `apps/collector/tsconfig.json`.
- Removed `"baseUrl": "."` from the root `tsconfig.json`.
- Added `"ignoreDeprecations": "5.0"` to `packages/typescript-config/base.json`.

## Validation

- Verified that `pnpm -r typecheck` passes for all projects in the workspace.
- Confirmed that removing `baseUrl` did not break module resolution for `apps/api` and `apps/collector`.

## Notes

- `baseUrl` is being discouraged in modern TypeScript configurations in favor of relative paths or specific `paths` aliases.
- The `ignoreDeprecations: "5.0"` flag is used as a fallback to ensure stability during the transition to TypeScript 7.0.
