# Discovery-First Homepage

Date: 2026-05-21

## Goal

Make the localized homepage behave like FirstSpawn's discovery entry point instead of a static marketing hero.

## Planned Scope

- Replace the first viewport with a discovery console that supports text search, live stats, server previews, and owner onboarding.
- Initialize Discover from homepage search query parameters.
- Keep all new user-facing homepage copy dictionary-driven.
- Defer regional leaderboards and keep full filtering owned by Discover.

## Completed Work

- Reworked the landing hero into a discovery console backed by `fetchServers` and `fetchServerStats`.
- Removed the duplicate lower server proof module from the homepage stack.
- Added `q` handling to the Discover route and initialized the Discover search box from that query.
- Added typed `landing.discoveryConsole` copy across supported dictionaries.
- Added a post-comparison return CTA that jumps users back to the homepage discovery console, with a secondary path to full Discover.

## Validation

- `corepack pnpm --filter @firstspawn/web typecheck` passed.
- `corepack pnpm --filter @firstspawn/web lint` passed.
- `corepack pnpm --filter @firstspawn/web build` passed with network access for Google Fonts.
- `node -e "..."` dictionary parsing passed after the return CTA copy was added.
- `corepack pnpm --filter @firstspawn/web lint:i18n` could not run because `apps/web/scripts/lint-i18n.mjs` is missing.

## Notes

- The production build logged local API connection refusals during page generation and rendered the planned degraded empty state.
- Regional/local leader modules remain a future enhancement once catalog density and ranking rules support them.
