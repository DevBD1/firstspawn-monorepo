# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

FirstSpawn is a discovery and trust platform for game servers, starting with Hytale and expanding to Minecraft. It's a monorepo using npm workspaces + Turborepo with a pixel-retro design aesthetic.

**Core Thesis:**
- Discovery should be relevance-driven, not pay-to-win
- Trust should be earned through verified activity and reputation
- Retention should come from meaningful loops (favorites, reviews, guilds, daily participation)

## Monorepo Structure

```
firstspawn-monorepo/
├── firstspawn/
│   ├── web/              # Next.js 16 web app (production-ready)
│   ├── api/              # TypeScript placeholder (will be Python)
│   └── mobile/           # Expo/React Native scaffold (needs init)
├── packages/
│   ├── ui/               # Shared UI components (no build step)
│   ├── typescript-config/# Shared TS configs (base, nextjs, react-library, react-native)
│   └── config/           # Shared ESLint config
├── docs/                 # Product documentation
│   ├── 01-product-and-strategy.md
│   ├── 02-architecture-and-stack.md
│   ├── 03-execution-and-ops.md
│   └── 04-agentic-ecosystem-implementation-guide.md
└── implementations/      # Reserved for future implementations
```

## Technology Stack

### Frontend (Production)
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + Framer Motion
- **UI Library:** React 19
- **Icons:** Lucide React
- **Fonts:** Press Start 2P (pixel), VT323 (retro), Geist Sans/Mono

### Planned Backend
- **Language:** Python
- **Framework:** Django + DRF or FastAPI
- **Database:** PostgreSQL (source of truth)
- **Cache/Queue:** Redis
- **Search:** PostgreSQL FTS (MVP), Elasticsearch (future scale)

### Shared Packages
- `@firstspawn/ui`: Source TypeScript files exported directly (no build)
- `@firstspawn/typescript-config`: Shared TypeScript configurations
- `@firstspawn/config`: Shared ESLint configuration

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development (runs all dev servers)
npm run dev

# Target specific workspace
npx turbo run dev --filter=@firstspawn/web

# Build all
npm run build

# Lint all
npm run lint

# Format code
npm run format

# Clean all build artifacts
npm run clean
```

## Critical Project-Specific Information

### i18n System
- Translations use a **custom deep-merge fallback system** in `firstspawn/web/lib/get-dictionary.ts`
- Always merge target locale into English base (see `mergeDictionaries()` function)
- Dictionary files are JSON, located in `firstspawn/web/lib/dictionaries/`
- Supported locales: `en`, `tr`, `de`, `ru`, `es`, `fr`
- Locale route param is `lang` (not `locale`)
- Default locale is `en`

### Pixel-Retro Design System
- Custom CSS variables in `firstspawn/web/app/globals.css` define the palette
- Primary accent color: `--fs-diamond: #22d3ee` (cyan-400)
- Available utility classes:
  - `.pixel-border` - Light pixel-style border
  - `.pixel-border-dark` - Dark pixel-style border
  - `.pixel-shadow` - Pixel shadow effect
  - `.crt-overlay` - CRT scanline effect
  - `.pixel-font` - Press Start 2P font
  - `.font-retro` - VT323 monospace font

### Tailwind v4 Configuration
- Uses `@import "tailwindcss"` syntax (not `@tailwind` directives)
- Configured in `globals.css` with `@theme inline` for custom properties
- PostCSS config uses `@tailwindcss/postcss` plugin
- Custom colors mapped to CSS variables (see `@theme inline` block)

### OpenGraph Image Generation
- Uses **edge runtime** (`export const runtime = 'edge'`)
- Custom font loading from `firstspawn/web/assets/fonts/`
- Always load fonts via `fetch(new URL(..., import.meta.url))`
- Font used: Press Start 2P
- Size: 1200x630px

### SEO/Robots Behavior
- `robots.ts` checks `VERCEL_ENV === 'production'`
- **Automatically blocks indexing on preview deployments**
- Add new protected routes to the `disallow` array in `robots.ts`
- Sitemap generated dynamically from `i18n.locales`

### AI-Powered Captcha
- Located in `firstspawn/web/app/actions/captcha.ts`
- Uses Gemini 2.0 Flash with OpenAI fallback
- Generates retro-futuristic access messages
- Requires `GEMINI_API_KEY` or `OPENAI_API_KEY` env vars

### Newsletter System
- Server action: `firstspawn/web/app/actions/newsletter.ts`
- Uses Resend for email delivery
- JWT tokens for confirmation links
- PostHog tracking for analytics
- Confirmation email component in `firstspawn/web/components/emails/`

### Analytics (PostHog)
- Client-side: `firstspawn/web/instrumentation-client.ts`
- Server-side: `firstspawn/web/lib/posthog-server.ts`
- Requires `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
- Automatic exception capture enabled

## Code Organization

### Web App Structure (`firstspawn/web/`)
```
app/
├── [lang]/              # i18n route groups
│   ├── layout.tsx       # Root layout with fonts, metadata
│   ├── page.tsx         # Landing page
│   ├── opengraph-image.tsx  # Dynamic OG image
│   └── debug-og/        # OG image debug route
├── actions/             # Server actions
│   ├── captcha.ts
│   └── newsletter.ts
├── api/                 # API routes
│   └── newsletter/
├── globals.css          # Global styles + Tailwind config
├── robots.ts            # Dynamic robots.txt
└── sitemap.ts           # Dynamic sitemap.xml

components/
├── captcha/             # Newsletter captcha components
├── emails/              # React Email components
├── landing/             # Landing page sections
├── layout/              # Navbar, Footer, CookieConsent, LocaleSwitcher
├── pixel/               # Pixel-styled UI components
└── providers/           # PostHogProvider, PostHogPageView

lib/
├── dictionaries/        # i18n JSON files (en, tr, de, ru, es, fr)
├── get-dictionary.ts    # i18n loader with deep-merge
├── i18n-config.ts       # Locale configuration
├── links.ts             # External links config
└── posthog-server.ts    # Server-side PostHog client

assets/
└── fonts/               # PressStart2P-Regular.ttf for OG images

public/                  # Static assets
```

### Shared UI Package (`packages/ui/`)
- Exports source TypeScript files directly (no build step)
- Components are simple React components with TypeScript
- Current components: `Button.tsx`
- Import pattern: `import { Button } from '@firstspawn/ui'`

## Environment Variables Required

### Required for Web App
```
NEXT_PUBLIC_SITE_URL          # For canonical URLs and OG images
NEXT_PUBLIC_POSTHOG_KEY       # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST      # PostHog host URL
```

### Required for Newsletter
```
RESEND_API_KEY                # Resend API key for emails
JWT_SECRET                    # Secret for newsletter confirmation tokens
RESEND_AUDIENCE_ID            # Resend audience ID (optional)
```

### Required for AI Captcha
```
GEMINI_API_KEY                # Google Gemini API key (primary)
OPENAI_API_KEY                # OpenAI API key (fallback)
```

### Deployment
```
VERCEL_ENV                    # Set automatically by Vercel
NODE_ENV                      # development | production
```

## Workspace Notes

### @firstspawn/web
- **Status:** Production-ready
- **Port:** 3000
- **Deployment:** Vercel (configured to deploy only this app)
- **Runtime:** Node.js >= 18

### @firstspawn/api
- **Status:** TypeScript placeholder
- **Note:** Production API will be Python (planned in `firstspawn/api-py`)
- Current workspace is for prototyping only

### @firstspawn/mobile
- **Status:** Scaffold only, requires initialization
- **To initialize:** `npx create-expo-app@latest . --template`
- Dependencies reference `@firstspawn/ui` for shared components

### @firstspawn/ui
- **Status:** Active
- **Important:** Exports source TS files directly (no build step)
- Uses `@firstspawn/typescript-config/react-library` for TS config

## Testing

- **Status:** Not yet implemented
- `npm test` exists in turbo config but no test runner installed
- Add Vitest or Jest before writing tests
- Recommended location: `firstspawn/web/tests/` or co-located `*.test.ts` files

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Use type imports: `import type { Locale } from "..."`
- Prefer interfaces over type aliases for object shapes
- Use explicit return types on exported functions

### Components
- Use "use client" directive for client components
- Keep server components as default (no directive)
- Props interfaces should be exported
- Use Tailwind utility classes, avoid inline styles

### i18n
- All user-facing strings must use dictionary values
- Never hardcode text in components
- Add new keys to `en.json` first, then other locales
- Use `dictionary.category.key` pattern for nested access

### Styling
- Use CSS variables from `globals.css` for colors
- Prefer `fs-diamond` (cyan-400) for primary accents
- Use `.pixel-font` for headings, `.font-retro` for body text
- Maintain pixel-retro aesthetic with utility classes

## Security Considerations

### Authentication
- JWT tokens for newsletter confirmation (1-hour expiry)
- Password hashing will use Argon2id (backend not yet implemented)

### API Protection
- Rate limiting planned by actor category (guest, user, owner/plugin)
- HMAC signatures for plugin verification
- Replay-window checks for plugin API

### Environment
- Never commit `.env` files
- Use `.env.local` for local development
- All secrets must be server-side only (no `NEXT_PUBLIC_` prefix)

## Deployment

### Web (Vercel)
- Production branch: `main`
- Environment variables configured in Vercel dashboard
- OG images use edge runtime
- Automatic preview deployments for PRs

### Future API (Python)
- Planned for managed container runtime
- PostgreSQL + Redis managed services
- Independent deployment from web

## Documentation

Active documentation lives in `docs/`:
- `01-product-and-strategy.md` - Vision, users, loops, monetization
- `02-architecture-and-stack.md` - Tech decisions, security, deployment
- `03-execution-and-ops.md` - Roadmap, quality gates, workflow
- `04-agentic-ecosystem-implementation-guide.md` - Autonomous agents

Legacy docs archived in `archive/markdown-legacy-2026-03-03/`

## Common Tasks

### Adding a New Locale
1. Add locale code to `i18n.locales` in `firstspawn/web/lib/i18n-config.ts`
2. Create new dictionary file `firstspawn/web/lib/dictionaries/[locale].json`
3. Copy from `en.json` and translate
4. Add dictionary loader in `firstspawn/web/lib/get-dictionary.ts`
5. Update `opengraph-image.tsx` if locale-specific OG images needed
6. Update `sitemap.ts` to include new locale routes

### Adding a New Page
1. Create route directory under `firstspawn/web/app/[lang]/`
2. Add `page.tsx` with proper i18n setup
3. Update `Navbar.tsx` if navigation needed
4. Add route to `robots.ts` disallow list if protected
5. Update sitemap if public page

### Adding a New Component
1. Determine if shared or app-specific
2. Shared: Add to `packages/ui/src/`, export in `index.ts`
3. App-specific: Add to appropriate `firstspawn/web/components/` subdirectory
4. Use existing component patterns for consistency

### Adding a Server Action
1. Create in `firstspawn/web/app/actions/` (or extend existing)
2. Add `'use server'` directive at top
3. Use Zod for input validation
4. Return typed response objects
5. Add error handling with logging
