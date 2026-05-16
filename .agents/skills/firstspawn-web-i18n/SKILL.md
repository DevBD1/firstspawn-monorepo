---
name: firstspawn-web-i18n
description: Use for FirstSpawn web copy, locale dictionaries, dictionary schema changes, lang routing, localized URLs, typed copy selectors, view-model copy builders, or any user-facing text in apps/web. Enforces no hardcoded UI copy and validates locale structure.
---

# FirstSpawn Web I18n

Use this for every web change that adds, edits, moves, or renders user-facing text.

## Source Files

- Dictionaries: `apps/web/src/lib/dictionaries/*.json`
- Typed schema: `apps/web/src/lib/dictionaries/schema.ts`
- Dictionary loader: `apps/web/src/lib/get-dictionary.ts`
- Locale config: `apps/web/src/lib/i18n-config.ts`
- I18n lint: `apps/web/scripts/lint-i18n.mjs`
- Route param: `lang`

## Rules

- All user-facing strings must come from dictionaries.
- English baseline copy also belongs in dictionaries.
- Do not add component-level fallback copy like `|| "Label"` or `?? "Label"`.
- Dictionary keys must be semantic and domain-based.
- Prefer typed selectors or typed view-model builders over scattered raw key access.
- Keep all locale JSON files structurally aligned.
- Supported locales are `en`, `tr`, `de`, `ru`, `es`, `fr`.
- MVP locales are `en`, `tr`, `de`.
- Always merge target dictionaries into English through `get-dictionary.ts`.
- Use `lang`, not `locale`, in routes and route helpers.

## Workflow

1. Find the owning feature or route.
2. Add or update the schema first.
3. Add matching keys to every locale JSON file.
4. Wire copy through a selector, view model, or page prop.
5. Keep route URLs localized with the current `lang`.
6. Run i18n validation.

## Naming

Good:

```text
landing.hero.title
landing.discovery.demo
auth.login.form
serverDetail.labels
common.aiBar
```

Avoid:

```text
feature_1_title
step_2_desc
notify_btn
popular_label
```

## Validation

```bash
pnpm --filter @firstspawn/web lint:i18n
pnpm --filter @firstspawn/web typecheck
pnpm --filter @firstspawn/web lint
```
