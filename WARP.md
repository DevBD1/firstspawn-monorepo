# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository overview
This is a JavaScript/TypeScript monorepo using npm workspaces + Turborepo.

Workspaces:
- `firstspawn/web`: Next.js 16 (App Router) web app.
- `firstspawn/api`: Node/TypeScript API service (currently a placeholder entrypoint).
- `firstspawn/mobile`: React Native/Expo app scaffold (scripts are placeholders; see below).
- `packages/ui`: Shared React UI package consumed by web/mobile.
- `packages/typescript-config`: Shared `tsconfig` presets.
- `packages/config`: Shared config package (currently only exports an eslint config stub).

Turborepo pipeline is defined in `turbo.json`.

## Common commands (repo root)
Install deps:
- `npm install`

Run everything via Turborepo:
- Dev (all workspaces that define `dev`): `npm run dev`
- Build (all workspaces that define `build`): `npm run build`
- Lint (all workspaces that define `lint`): `npm run lint`
- Tests: `npm test` (note: currently no workspace defines a `test` script, so this will be a no-op/fail until added)

Formatting:
- Prettier: `npm run format` (writes `**/*.{ts,tsx,md}`)

Clean:
- `npm run clean` (runs each workspace `clean` via turbo, then removes root `node_modules/`)

### Run a single workspace
You can target a single workspace either via Turbo filters or npm workspaces.

Turbo (preferred when the script is part of the turbo pipeline):
- `npx turbo run dev --filter=@firstspawn/web`
- `npx turbo run lint --filter=@firstspawn/web`
- `npx turbo run build --filter=@firstspawn/web`

npm workspace (runs that package’s script directly):
- `npm --workspace @firstspawn/web run dev`
- `npm --workspace @firstspawn/api run dev`

### Run a single test
There is no test runner wired up yet (no `test` scripts in workspace `package.json` files). Once a workspace adds a `test` script, you can run it via:
- `npx turbo run test --filter=@firstspawn/web -- <test-runner-args>`
- or `npm --workspace @firstspawn/web test -- <test-runner-args>`

## Code architecture (big picture)
### `firstspawn/web` (Next.js App Router)
Entry layout & routing:
- Locale routing is implemented as a top-level dynamic segment: `firstspawn/web/app/[lang]/...`
- `firstspawn/web/app/[lang]/layout.tsx`:
  - Loads localized dictionaries server-side via `lib/get-dictionary.ts`.
  - Sets SEO metadata (`generateMetadata`) and static locale params (`generateStaticParams`).
  - Wraps the app in analytics providers (`components/providers/*`) and renders shared layout (`components/layout/*`).

Internationalization:
- Locale list is centralized in `firstspawn/web/lib/i18n-config.ts`.
- Translation JSON dictionaries live in `firstspawn/web/lib/dictionaries/*.json`.
- `firstspawn/web/lib/get-dictionary.ts` loads dictionaries and merges each locale onto English as a fallback.

Server Actions & API Routes:
- Server Actions live in `firstspawn/web/app/actions/*`.
  - `app/actions/newsletter.ts` implements newsletter sign-up: validate email (Zod) → issue a JWT token → send confirmation email via Resend → capture events in PostHog.
  - `app/actions/captcha.ts` generates short “access granted/denied” copy using Gemini first, then OpenAI as fallback.
- API routes live under `firstspawn/web/app/api/*`.
  - `app/api/newsletter/confirm/route.ts` verifies the JWT from the confirmation link and adds the user as a Resend contact, then tracks/identifies the user in PostHog.

SEO helpers:
- `firstspawn/web/app/robots.ts` blocks crawling unless `VERCEL_ENV === "production"`.
- `firstspawn/web/app/sitemap.ts` generates a simple locale-aware sitemap using `lib/i18n-config.ts`.

Shared UI package integration:
- `firstspawn/web/next.config.ts` sets `transpilePackages: ["@firstspawn/ui"]` so the Next.js app can import from the workspace package.

Path aliases:
- `firstspawn/web/tsconfig.json` defines `@/*` → `./*`.

### `packages/ui`
- Simple shared React component library exported from `packages/ui/src/index.ts`.
- Consumed by web (and intended for mobile) as `@firstspawn/ui`.

### `firstspawn/api`
- TypeScript Node service using `tsx watch src/index.ts` for dev.
- `firstspawn/api/src/index.ts` is currently a placeholder (no HTTP server/framework wired up yet).

### `firstspawn/mobile`
- Scaffolded workspace intended for Expo/React Native.
- `npm --workspace @firstspawn/mobile run dev` prints a hint to run `npx expo start` (no Expo config committed yet).

## Config & tooling notes
TypeScript:
- Shared configs are in `packages/typescript-config/*.json`.
- Workspaces extend these presets (e.g. `firstspawn/web/tsconfig.json` extends `@firstspawn/typescript-config/nextjs.json`).

ESLint:
- Each workspace uses flat config via `eslint.config.mjs`.
- `packages/config/eslint.config.mjs` exists as a shared config stub but is not currently imported by the other workspaces.

## Environment variables referenced in code (web)
If you’re debugging runtime issues locally, check these:
- Newsletter: `RESEND_API_KEY`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`
- PostHog: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- Captcha copy generation: `GEMINI_API_KEY` (or `GOOGLE_API_KEY` / `API_KEY` fallback), `OPENAI_API_KEY`
- Sitemap/metadata base URL: `NEXT_PUBLIC_SITE_URL`
- Robots: `VERCEL_ENV` (used to decide whether to allow indexing)
