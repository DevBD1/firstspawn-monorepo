---
name: firstspawn-product-ux
description: Use for FirstSpawn product UX workflow decisions, feature placement, page structure, information hierarchy, navigation, CTAs, user journeys, and deciding what belongs on the first screen or secondary surfaces. Root DESIGN.md is the product UX source of truth.
---

# FirstSpawn Product UX

Use this for product flow and placement workflow. Read `DESIGN.md` first; it owns the product UX rules.

Pair with:

- `firstspawn-ui-design-system` for visual execution.
- `firstspawn-web-app-patterns` for React/Next implementation.
- `firstspawn-web-i18n` for user-facing copy.

## UX Questions To Answer

- Who is using this surface: player, server owner, admin, or anonymous visitor?
- What is the primary job on this screen?
- What should be visible in the first useful viewport?
- What is the main action, and what is secondary?
- Which trust, activity, or freshness signal helps the user decide?
- Which content should be hidden, delayed, collapsed, or moved to detail?
- Is the feature available now, coming soon, or internal-only?

## Placement Review

- Does the page structure follow `DESIGN.md` product UX rules?
- Is the primary CTA obvious and correctly routed?
- Are public, admin, and internal concepts separated?
- Are decision signals close to the decision point?
- Is this reusing an existing shared pattern instead of creating a parallel one?
- Is any section only decorative or internal? Remove or move it.
- Is copy dictionary-driven and understandable in MVP locales?

## Validation

Use the checks for the touched implementation area:

```bash
pnpm --filter @firstspawn/web lint:i18n
pnpm --filter @firstspawn/web typecheck
pnpm --filter @firstspawn/web lint
```
