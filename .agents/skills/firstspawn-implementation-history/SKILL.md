---
name: firstspawn-implementation-history
description: Use after meaningful FirstSpawn implementation work to record concise continuation notes in docs/implementation-history, including plan, implementation, verification, risks, and follow-ups.
---

# FirstSpawn Implementation History

Use this after meaningful planned work that future agents should understand. Do not create entries for typo-only or tiny mechanical changes.

## Source Files

- History folder: `docs/implementation-history/`
- Entry template: `templates/entry.md`
- Repo router: `AGENTS.md`
- Product truth: `PRODUCT.md`
- Roadmap truth: `PLAN.md`
- UI/UX truth: `DESIGN.md`
- Service runtime truth: nearest service README

## Rules

- Keep entries factual and short.
- Use one file per meaningful change: `docs/implementation-history/YYYY-MM-DD-short-title.md`.
- Use `templates/entry.md` as the required entry format.
- Record what changed, why it matters, and how it was verified.
- Mention failed or skipped verification when relevant.
- Do not turn implementation history into a task list. Put roadmap/future standards in `PLAN.md`.
- Do not duplicate product, UI, API, database, or runtime rulebooks here.

## Entry Shape

- `# Title`
- `Date: YYYY-MM-DD`
- `## Goal`
- `## Planned Scope`
- `## Completed Work`
- `## Validation`
- `## Notes`

## Workflow

1. Choose a short lowercase filename that matches the change.
2. Start from `templates/entry.md`.
3. Read nearby docs only when needed to avoid conflicting truth.
4. Write the entry with concrete scope, completed work, commands, and decisions.
5. If the change updates repo truth, update the owning source-of-truth file too.
6. Run Markdown formatting when available.
