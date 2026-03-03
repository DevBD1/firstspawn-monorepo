# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Coding Rules (Non-Obvious Only)

### i18n Pattern
- Always use `getDictionary()` from `firstspawn/web/lib/get-dictionary.ts` for translations
- Dictionary merges target locale into English base - incomplete translations still work
- Import dictionary type: `type Locale = (typeof i18n)["locales"][number]`

### Component Structure
- Use `'use client'` directive for client components (Next.js App Router pattern)
- Shared UI components in `packages/ui` are source exports - no build step required

### OG Image Requirements
- Fonts MUST be loaded via `fetch(new URL(..., import.meta.url))` in edge runtime
- Custom font files are in `firstspawn/web/assets/fonts/`

### API Placeholder
- `@firstspawn/api` is TypeScript-only placeholder
- Do NOT expand this - production API will be Python in `firstspawn/api-py`

### Tailwind v4 Syntax
- Use `@import "tailwindcss"` in CSS (not `@tailwind` directives)
- Custom properties defined with `@theme inline` in `globals.css`
