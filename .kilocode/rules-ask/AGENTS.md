# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Documentation Rules (Non-Obvious Only)

### Active Documentation
- Current docs live in `/docs/` (not `archive/`)
- Legacy files moved to `archive/markdown-legacy-2026-03-03/`
- Do not reference archived docs as current truth

### i18n Dictionary Structure
- English in `firstspawn/web/lib/dictionaries/en.json` is the source of truth
- Other locales are shallow-merged into English (missing keys fall back to English)
- Nested object structure: `common`, `nav`, `footer`, etc.

### Pixel Design System
- Design tokens in `firstspawn/web/app/globals.css` as CSS variables
- Retro aesthetic with accessibility constraints
- Key color: `#22d3ee` (cyan-400 / `--fs-diamond`)

### Workspace Purposes
- `firstspawn/web` - Next.js 16 landing/marketing site
- `firstspawn/api` - TypeScript placeholder (not production)
- `firstspawn/mobile` - Expo placeholder (uninitialized)
- `packages/ui` - Shared React components (source exports)

### Environment Variables for Features
- Newsletter: requires `RESEND_API_KEY`, `JWT_SECRET`, `RESEND_AUDIENCE_ID`
- Captcha AI: requires `GEMINI_API_KEY` or `OPENAI_API_KEY`
- OG Images: requires `NEXT_PUBLIC_SITE_URL`
