---
name: firstspawn-ui-design-system
description: Use for FirstSpawn UI execution, frontend components, shared UI primitives, token changes, CSS, Tailwind classes, motion implementation, visual audits, and component quality checks. Root DESIGN.md is the only product UI/UX source of truth.
---

# FirstSpawn UI Design System

Use this for UI execution workflow. Read `DESIGN.md` first; it owns all product UI/UX truth.

## Source Files

- Product UI/UX truth: `DESIGN.md`
- Canonical tokens: `packages/ui/src/branding/tokens.ts`
- Generated CSS: `packages/ui/src/styles/brand.css`
- Web Tailwind mapping and utilities: `apps/web/src/app/globals.css`
- Cross-app UI primitives: `packages/ui/src/`
- Shared web primitives: `apps/web/src/components/`

## Workflow

1. Read the relevant section of `DESIGN.md`.
2. Find the existing component, token, or utility pattern before adding new UI.
3. Keep visuals token-backed and in the correct shared layer.
4. If implementation and `DESIGN.md` disagree, fix the implementation or update `DESIGN.md` in the same change.
5. Run the smallest relevant validation command.

## Token Workflow

- Use token-backed Tailwind classes or CSS variables.
- Do not edit generated `brand.css` by hand.
- If token values change, update `packages/ui/src/branding/tokens.ts`, then run:

```bash
pnpm --filter @firstspawn/ui generate:styles
pnpm --filter @firstspawn/ui check:styles
```

- If adding, removing, or renaming tokens, update `packages/ui/scripts/generate-brand-css.cjs`.
- If web code needs a new generated CSS variable exposed to Tailwind, update `apps/web/src/app/globals.css` under `@theme inline`.

## Component Audit Checklist

- Uses `DESIGN.md` as the source for appearance, motion, and UX rules.
- Uses existing tokens before adding new ones.
- Uses the right layer: `packages/ui`, web shared components, or feature-local.
- Covers relevant default, hover, pressed, disabled, loading, empty, and error states.
- Keeps props and variants clear, without duplicating an existing component.
- Includes platform accessibility behavior.
- Avoids hardcoded user-facing copy.
- Explains the user problem when adding a new pattern.

## Validation

```bash
pnpm --filter @firstspawn/ui check:styles
pnpm --filter @firstspawn/web lint
pnpm --filter @firstspawn/web typecheck
```
