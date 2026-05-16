---
name: firstspawn-web-app-patterns
description: Use for FirstSpawn apps/web React and Next.js implementation patterns, including client/server component boundaries, forms, custom controls, keyboard and ARIA behavior, focus management, loading/error/empty states, hooks, local state, memoization, lazy loading, and long-list performance.
---

# FirstSpawn Web App Patterns

Use this for React and Next.js implementation details in `apps/web`. Pair it with `firstspawn-ui-design-system` for visuals and `firstspawn-web-i18n` for copy.

## Source Files

- Routes: `apps/web/src/app/`
- Features: `apps/web/src/features/`
- Shared web UI: `apps/web/src/components/`
- Dictionaries: `apps/web/src/lib/dictionaries/`
- I18n lint: `apps/web/scripts/lint-i18n.mjs`
- Web package scripts: `apps/web/package.json`

## Next And React Boundaries

- Keep components server-rendered by default.
- Add `"use client"` only for browser APIs, hooks, event handlers, local interactive state, or Framer Motion.
- Do not import server-only modules into client components.
- Keep route composition in `page.tsx` unless a real feature entry boundary exists.
- Put feature-owned logic in `apps/web/src/features/<feature>`.
- Put repeated web primitives in `apps/web/src/components`.

## State And Hooks

- Keep state local first.
- Extract hooks only when stateful behavior is reused or the orchestration is non-trivial.
- Use context only when multiple components in a subtree share real behavior.
- Avoid global state for route-local filters, panels, drawers, and temporary UI state.
- Memoize only expensive derived values or stable props passed to memoized children.

## Forms

- Labels, placeholders, helper text, validation errors, and submit-state copy must come from dictionaries.
- Prefer native form controls before custom controls.
- Show pending, success, error, disabled, and validation states intentionally.
- Do not add English fallback strings inside components.
- Keep validation rules centralized when shared across routes or features.

## Accessibility

- Use semantic HTML before custom ARIA.
- Custom controls must support keyboard operation, visible focus, and correct ARIA state.
- Menus, drawers, dialogs, popovers, and combobox-like controls must handle Escape when open.
- Dialog-like surfaces should move focus into the surface and restore focus when closed.
- Icon-only buttons need accessible labels.
- Do not hide focus outlines unless replacing them with a clear token-backed focus style.

## Loading, Error, And Empty States

- Loading, empty, and error states are part of the component contract.
- Use dictionary-driven user-facing text.
- Keep retry actions explicit when recovery is possible.
- Avoid blank panels, layout jumps, or silent failures.

## Performance

- Use API-level pagination, filtering, and sorting before client-side slicing for server data.
- Use virtualization only for large client-rendered lists and only when the dependency already exists or is clearly justified.
- Lazy-load heavy optional client-only UI when it is not needed for first interaction.
- Avoid adding memoization, dynamic imports, or Suspense boundaries without a concrete cost or UX reason.

## Validation

```bash
pnpm --filter @firstspawn/web lint:i18n
pnpm --filter @firstspawn/web lint
pnpm --filter @firstspawn/web typecheck
pnpm --filter @firstspawn/web build
```
