---
name: firstspawn-component-lab
description: Use for FirstSpawn dev-only component lab work, experimental UI prototypes, tmp imports, prototype evaluation, lab app design, component inventory, adapter patterns, and deciding whether experimental UI is ready to promote into shared production UI.
---

# FirstSpawn Component Lab

Use this for dev-only UI experiments and component evaluation.

## Purpose

The component lab is for testing and comparing UI ideas before they become shared production UI. It should feel like FirstSpawn, not like a neutral internal tool.

## Known Direction

- Preferred app shape: `apps/lab` with package name `@firstspawn/lab`.
- Useful route shape:
  - `/`
  - `/components`
  - `/components/[slug]`
  - `/tokens`
  - `/motion`
- Use a source-of-truth inventory plus adapters for component demos.
- Keep overview, components, tokens, and motion separate.

## Rules

- Do not promote experiments into `packages/ui` or production web flows until they pass the quality bar.
- Keep one-off experiments local to the lab or `tmp/`.
- When importing from `tmp/`, verify Next config, client boundaries, and TypeScript declaration needs.
- Do not let prototype syntax or JS/TS mismatch leak into production code.
- Preserve dirty landing or product work when starting lab work. Use a separate worktree when needed.
- Lab visuals must follow root `DESIGN.md`; lab experiments cannot define competing FirstSpawn UI/UX truth.

## Prototype Review Checklist

- Does it fit root `DESIGN.md`?
- Does it work at desktop and mobile sizes if it will be promoted?
- Does it use dictionary copy if rendered in the real web app?
- Does it avoid page-specific side palettes?
- Does it reuse tokens or show a clear token gap?
- Does the interaction add real product clarity, not just decoration?

## Validation

For web imports or promotion:

```bash
pnpm --filter @firstspawn/web typecheck
pnpm --filter @firstspawn/web build
pnpm --filter @firstspawn/ui check:styles
```

For lab-only work, run the lab package commands if the package exists.
