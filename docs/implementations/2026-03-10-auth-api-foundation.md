# Handover - 2026-03-10

## Session Summary

### 11:15 EET - Auth API foundation

- Implemented API v1 auth endpoints in `src/api/app/api/v1/endpoints/auth.py`: `register`, `login`, `refresh`, `logout`, `me`.
- Added DB session wiring in `src/api/app/db.py` and shared auth dependencies in `src/api/app/api/deps.py`.
- Added security primitives in `src/api/app/security.py`: scrypt password hashing, token hashing, signed JWT-style access/refresh tokens, token decode/validation.
- Added envelope/error scaffolding: `src/api/app/errors.py`, `src/api/app/schemas/common.py`, `src/api/app/schemas/auth.py`, and request-id middleware/handlers in `src/api/app/main.py`.
- Router updated to include auth routes in `src/api/app/api/v1/router.py`.
- Added security unit tests in `src/api/tests/test_security.py`.
- Important assumptions:
  - Login accepts `identifier` (email or username).
  - Logout is idempotent and returns success even if refresh token is already invalid.
  - Default JWT secret is development-only and must be overridden in real environments.
- Known gaps:
  - Integration tests rely on `API_TEST_DATABASE_URL`/`API_DATABASE_URL` and skip when PostgreSQL is unavailable.
  - JWT implementation is in-house HMAC (works for MVP, but moving to a maintained JWT library is recommended for long-term hardening).

### 11:55 EET - DB-backed auth integration tests

- Added PostgreSQL-backed integration fixtures in `src/api/tests/conftest.py`:
  - Creates isolated temp schema per test (`test_auth_<uuid>`)
  - Ensures `citext` extension exists
  - Creates `users` + `user_sessions` tables in the temp schema
  - Overrides FastAPI `get_db_session` dependency for request-scoped DB sessions
  - Drops schema after test completion
- Added auth integration tests in `src/api/tests/test_auth_integration.py`:
  - register -> me flow
  - login by email and by username
  - refresh rotation + old token rejection
  - logout revokes refresh session
  - duplicate registration returns `VALIDATION_ERROR`
- Updated docs/env hints:
  - `src/api/README.md` now notes `API_TEST_DATABASE_URL`
  - `.env.example` now includes `API_TEST_DATABASE_URL`

### 12:05 EET - Integration test runtime hardening (live DB)

- Ran integration suite against a live local PostgreSQL container (`docker compose up -d postgres`) instead of skip-only mode.
- Fixed DB fixture URL mutation bug in `src/api/tests/conftest.py`:
  - Preserved real password when rendering SQLAlchemy URL (`hide_password=False`)
  - Included `public` in search path (`schema,public`) so `citext` type is resolvable.
- Fixed API behavior exposed by integration tests in `src/api/app/api/v1/endpoints/auth.py`:
  - `INET` column safety: only store client IP when `request.client.host` parses as a valid IP.
  - Refresh expiry check: normalized DB-returned naive datetime to UTC-aware before comparison.
- Result: auth integration tests now execute against DB and pass.

### 21:04 EET - Web auth UX + navbar gating

- Implemented frontend auth server actions in `src/web/app/actions/auth.ts`:
  - `registerAction`, `loginAction`, `logoutAction`
  - Calls FastAPI auth endpoints (`/auth/register`, `/auth/login`, `/auth/logout`)
  - Stores/clears auth cookies (`fs_access_token`, `fs_refresh_token`, `fs_user`)
- Added web auth utilities in `src/web/lib/auth.ts`:
  - API base URL helper (`API_BASE_URL` with localhost fallback)
  - Locale guard
  - Cookie-based auth state for server-rendered navbar/page gating
- Updated navbar behavior in `src/web/components/layout/Navbar.tsx`:
  - If unauthenticated: show `DISCOVER`, `SIGN UP`, `LOG IN`
  - If authenticated: show `DISCOVER`, `MY LOOT`, `CONSOLE`, `LOG OUT`
  - Wired `LOG OUT` as a functional server action
- Updated root layout (`src/web/app/[lang]/layout.tsx`) to pass auth state into navbar.
- Added new web routes/pages:
  - `src/web/app/[lang]/signup/page.tsx`
  - `src/web/app/[lang]/login/page.tsx`
  - `src/web/app/[lang]/discover/page.tsx`
  - `src/web/app/[lang]/loot/page.tsx` (auth-gated)
  - `src/web/app/[lang]/console/page.tsx` (auth-gated)
- Added new auth UI components:
  - `src/web/components/auth/AuthShell.tsx`
  - `src/web/components/auth/SignupForm.tsx`
  - `src/web/components/auth/LoginForm.tsx`
- Updated dictionary keys in `src/web/lib/dictionaries/en.json` for navbar auth labels and auth page copy.
- Updated root env example (`.env.example`) with `API_BASE_URL`.
- Important assumptions:
  - Cookie presence (`fs_refresh_token`) is the source for navbar/page auth state in web UI.
  - API base URL defaults to `http://localhost:8000/api/v1` unless `API_BASE_URL` is set.
- Known gaps:
  - Web session state currently does not auto-refresh access tokens in the background.
  - Locale-specific auth translations are currently fallback-to-English unless localized keys are added.

### 21:58 EET - Signup consent checkboxes + legal placeholders

- Added required signup consent checkboxes in `src/web/components/auth/SignupForm.tsx`:
  - Terms of Service acceptance (required)
  - Privacy Policy acceptance (required)
- Added optional marketing/product updates consent checkbox in the same signup form.
- Added Zod-level server action validation in `src/web/app/actions/auth.ts` for the two required legal consents.
- Extended shared action field-error typing in `src/web/lib/auth-action-state.ts` for consent error mapping.
- Added legal placeholder pages for consent links:
  - `src/web/app/[lang]/terms/page.tsx`
  - `src/web/app/[lang]/privacy/page.tsx`
- Important assumptions:
  - Legal consent values are currently validated at signup time but not yet persisted in backend user profile fields.
  - Marketing consent is currently optional and UI-captured; persistence/integration is pending future backend support.

### 22:22 EET - Font centralization + auth layout cohesion

- Replaced prior font stack with `Press Start 2P` (display) + `VT323` (UI/body) in web font loading (`src/web/app/[lang]/layout.tsx`).
- Centralized typography via root font tokens in `src/web/app/globals.css`:
  - `--font-family-display`
  - `--font-family-ui`
  - `--font-family-body`
- Updated utility classes to consume centralized tokens (`.pixel-font`, `.font-ui`) and switched body default to `--font-family-body`.
- Refactored auth shell into a single cohesive split container with an internal divider (left info + right form), replacing two disconnected floating panels:
  - `src/web/components/auth/AuthShell.tsx`
- Updated auth copy defaults to remove technical/internal tone and keep end-user language plain:
  - `src/web/lib/dictionaries/en.json`
  - `src/web/app/[lang]/login/page.tsx`
  - `src/web/app/[lang]/signup/page.tsx`
- Updated `AGENTS.md` conventions for centralized typography and current font stack (VT323 UI/body).

### 22:36 EET - Navbar/Footer rhythm + font-family cleanup sweep

- Applied typography rhythm pass to navbar/footer and adjacent UI copy:
  - Pixel font for primary headings/brand/buttons
  - VT323 (`.font-ui`) for helper/body/meta text
  - Removed technical labels in navbar drawer (`NAV_TERMINAL`, `Environment.Locale`) in favor of user-facing language
- Replaced remaining `font-sans`/`font-mono` class usage in `src/web` with `.font-ui` to enforce one UI font system.
- Removed non-approved UI fallback font mention (`Segoe UI`) from `src/web/app/globals.css`.
- Verified `src/web`, `AGENTS.md`, `README.md`, and `HANDOVER.md` no longer mention removed font families from the active typography system.

## Validation Performed

- `cd src/api && ruff check .` -> passed.
- `cd src/api && pytest -q` -> `5 passed, 5 skipped` (when DB not reachable from sandbox).
- `cd src/api && API_TEST_DATABASE_URL=... pytest -q tests/test_auth_integration.py -rs` -> `5 passed` (live DB).
- `cd src/web && npx eslint components/layout/Navbar.tsx app/actions/auth.ts 'app/[lang]/signup/page.tsx' 'app/[lang]/login/page.tsx' 'app/[lang]/discover/page.tsx' 'app/[lang]/loot/page.tsx' 'app/[lang]/console/page.tsx' components/auth/AuthShell.tsx components/auth/LoginForm.tsx components/auth/SignupForm.tsx lib/auth.ts` -> passed.
- `cd src/web && npx tsc --noEmit` -> passed.
- `cd src/web && npx eslint components/auth/SignupForm.tsx app/actions/auth.ts lib/auth-action-state.ts 'app/[lang]/terms/page.tsx' 'app/[lang]/privacy/page.tsx'` -> passed.
- `cd src/web && npx tsc --noEmit` -> passed.
- `cd src/web && npx eslint 'app/[lang]/layout.tsx' components/auth/AuthShell.tsx components/auth/LoginForm.tsx components/auth/SignupForm.tsx 'app/[lang]/login/page.tsx' 'app/[lang]/signup/page.tsx'` -> passed.
- `cd src/web && npx tsc --noEmit` -> passed.
- `cd src/web && npx tsc --noEmit` -> passed.

## What is next?

1. Add web-side refresh-token flow (silent access token renewal + cookie update) to avoid expiry-related UX drops.
2. Localize auth dictionary keys (`auth.*`, `nav.signUp/logIn/logOut`) for launch locales (`en`, `tr`, `de`).
3. Replace placeholder Discover/Loot/Console content with real API-backed data as endpoints become available.
