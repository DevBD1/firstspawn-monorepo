# Worldlight Visual Identity Overhaul

Date: 2026-06-12

## Goal

Migrate FirstSpawn's design system from the retired retro-terminal ("Pixel") motif to the warm, calm, and technically disciplined "Worldlight" dusk/day editorial design system, rebuilding all layout primitives, onboarding flows, profiles, and dashboards.

## Planned Scope

- Integrate Worldlight tokens, color modes, and fonts into `packages/ui` and `apps/web`.
- Upgrade button, card, and page container shared primitives to conform to Worldlight shapes and resting shadows.
- Rebuild main routes (discover, homepage, navigation bar) to use the new tokens.
- Rebuild server profile pages (`/server/[slug]`) with dynamic signal tabs and comments.
- Rebuild owner console dashboards (`/console`) with profile forms, screenshot managers, and the trailer studio rendering wizard.
- Rebuild listing onboarding wizard flows (`/list`) with trust-first checklist pings.

## Completed Work

- Updated design system core (`tokens.ts` and style generation script) to compile brand-specific variables.
- Overhauled `PixelButton` and `PixelCard` in `@firstspawn/ui` to adopt rounded corners, brightness states, and hairline shadows.
- Overhauled local `PixelCard`, `PagePrimitives` (containers, backdrops, surfaces, and status tags), and the captcha verification modal in `apps/web`.
- Implemented client-side `WLServerPageClient` client component and updated the server profile page route to fetch similar servers of the same game category.
- Implemented client-side `WLOwnerConsoleClient` controller with forms, screenshot blocks, list health checks, and the step-by-step trailer rendering animation.
- Implemented client-side `WLListFlowClient` onboarding wizard which saves newly registered servers directly to local console catalogs.
- Configured a React `ThemeProvider` in Next.js `layout.tsx` to handle Dusk/Day theme toggles client-side and persist settings in local storage.

## Validation

- `pnpm --filter @firstspawn/ui generate:styles`: passed.
- `pnpm --filter @firstspawn/web typecheck`: passed.
- `pnpm --filter @firstspawn/web build`: passed.
- Verified that all pages render dynamically and correctly bundle in production builds.
