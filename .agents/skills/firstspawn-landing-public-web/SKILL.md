---
name: firstspawn-landing-public-web
description: Use for FirstSpawn marketing pages, landing page, public web routes, signup/discover CTAs, public navigation, SEO, sitemap, robots, OG images, landing scene assets, and public asset audits. Use firstspawn-product-ux for page hierarchy and product-flow decisions.
---

# FirstSpawn Landing And Public Web

Use this for landing, marketing routes, public navigation, assets, and public-facing web infrastructure. Use `firstspawn-product-ux` for hierarchy, CTAs, and product-flow decisions.

## Source Files To Check

- Marketing routes: `apps/web/src/app/[lang]/(marketing)/`
- Auth routes: `apps/web/src/app/[lang]/(auth)/`
- Landing feature: `apps/web/src/features/landing/`
- Dictionaries: `apps/web/src/lib/dictionaries/`
- Sitemap: `apps/web/src/app/sitemap.ts`
- Robots: `apps/web/src/app/robots.ts`
- OG images: route-level OG files under `apps/web/src/app`
- Public assets: `apps/web/public/`
- Product UI/UX source: `DESIGN.md`

## Routing Rules

- Marketing pages with global chrome go under `apps/web/src/app/[lang]/(marketing)/`.
- Auth pages without global chrome go under `apps/web/src/app/[lang]/(auth)/`.
- Admin routes stay under `apps/web/src/app/admin/` and are English-only.
- Public signup route is `/${lang}/signup`.
- Avoid old register-route copy or broken `/${lang}/auth/register` CTAs unless the current route tree proves otherwise.

## Landing Scene Rules

- Treat landing art as a modular parallax scene kit, not one final illustration.
- Keep headline/search center area open.
- Existing scene layers live under `apps/web/public/landing-scene`.
- Web scene rendering should preserve pixel art clarity.
- Use generated bitmap or real assets when visual assets are required.

## Workflow

1. Read current route and feature files before designing.
2. Keep page composition in the route file unless there is a real feature entry boundary.
3. Put landing-specific UI in `apps/web/src/features/landing`.
4. Put repeated web primitives in `apps/web/src/components`.
5. Put cross-app primitives in `packages/ui`.
6. Wire copy through dictionaries and typed content builders.
7. Check CTA destinations explicitly.
8. Update SEO, OG, sitemap, or robots only when route behavior changes.

## Validation

```bash
pnpm --filter @firstspawn/web lint:i18n
pnpm --filter @firstspawn/web typecheck
pnpm --filter @firstspawn/web lint
pnpm --filter @firstspawn/web build
```
