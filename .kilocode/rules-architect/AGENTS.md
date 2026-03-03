# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Architecture Rules (Non-Obvious Only)

### Monorepo Structure
- npm workspaces + Turborepo for task orchestration
- Shared packages use source TS exports (no build/compile step)
- `@firstspawn/ui` exports directly from `src/` - consuming apps transpile

### API Strategy
- Current `@firstspawn/api` is TypeScript placeholder only
- Production API planned as Python service (`firstspawn/api-py`)
- Keep API contracts clean for future Python migration

### i18n Architecture
- Deep-merge fallback: target locale merged into English base
- Allows partial translations without breaking UI
- Route param: `lang` (e.g., `/tr/page` not `/tr-TR/page`)

### OG Image Edge Runtime
- Uses Next.js `ImageResponse` with edge runtime
- Font loading requires `fetch(new URL(..., import.meta.url))` pattern
- Fonts stored in `assets/fonts/`, loaded at request time

### Mobile Strategy
- `firstspawn/mobile` is Expo placeholder - requires initialization
- Shared UI components in `packages/ui` designed for cross-platform reuse

### Future Python Backend
- Planned for `firstspawn/api-py`
- Will handle: auth, servers, reviews, telemetry, data science jobs
- TypeScript API workspace is scaffolding only
