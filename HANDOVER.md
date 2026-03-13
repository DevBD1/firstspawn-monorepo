# Project Handover

**Repository:** firstspawn-monorepo
**Last Updated:** 2026-03-12

> Source of truth for directory layout and conventions is **`AGENTS.md`**.
> This file records what was done, by whom (session), and what is next.

---

## Session Log

### Session 1 — Documentation Hardening + API Scaffold (2026-03-03)

**What changed:**
- Locked docs in `docs/`, removed stale `new-docs` references
- Locked MVP scope: `auth + discovery` (reviews deferred); MVP locales: `en`, `tr`, `de`
- Newsletter/captcha made resilient: lazy `Resend` init, PostHog safe wrappers, AI fallbacks
- Created Python API scaffold at `src/api/` (FastAPI + SQLAlchemy + Alembic + Pydantic)

**Key decisions:** Third-party services (AI/email) must degrade gracefully, never crash the app.

**Validation:** `npx turbo run build --filter=@firstspawn/web` ✅

---

### Session 2 — Database Baseline Implementation (2026-03-07)

**What changed:**
- Renamed `firstspawn/` → `src/`, `api-py/` → `api/` (updated 28 path refs in `AGENTS.md`)
- Created `docker-compose.yml` (PostgreSQL 16 + Redis 7 + FastAPI + health checks)
- Implemented full V1 schema (14 tables): `user`, `server`, `plugin`, `moderation`, `agent` domains
- Initialized Alembic; migration `001_initial_schema` created (not yet executed)
- Env vars standardized to `API_*` prefix

**Key decisions:** Enums as TEXT + CHECK (not native PG enums); UUIDs via `gen_random_uuid()`; `AuditMixin` on all tables; `CIText` custom type for email/username/slugs.

**Validation:** 14 models registered ✅, migration compiles ✅, Docker Compose validated ✅

---

### Session 3 — Repository Hygiene (2026-03-07)

**What changed:**
- Added `.editorconfig`, `prettier.config.mjs`, `.prettierignore`, `.lintstagedrc.json`
- Added Husky hooks: `pre-commit` (lint-staged + secret detection), `prepare-commit-msg` (issue # prefix)
- Added CI pipeline (`.github/workflows/ci.yml`): lint, typecheck, build, python-lint, security, test
- Added stale automation, PR template, CODEOWNERS, label config
- Added `docs/DEPENDENCY_POLICY.md`; rewrote README with full quick-start

**Validation:** All config files syntax-validated ✅

---

### Session 4 — GitHub Configuration (2026-03-08)

**What changed:**
- Applied 28 GitHub labels from `.github/labels.yml`
- Enabled branch protection on `main`: required checks (Lint, Typecheck, Build, Python Lint), 1 review, stale review dismissal
- Created `.github/branch-protection.json` backup

**Note:** `develop` branch not yet created. Apply same protection when ready.

**Validation:** Labels ✅, branch protection API ✅, required checks ✅

---

### Session 5 — Ruff Linter Fixes (2026-03-08)

**What changed:**
- Fixed F821 (forward references) in `src/api/app/models/moderation.py` and `plugin.py` — added `from __future__ import annotations` + `TYPE_CHECKING` blocks
- Fixed E501 (line too long) in `src/api/migrations/versions/001_initial_schema.py`

**Validation:** `ruff check .` → 0 errors ✅

---

### Session 6 — Vercel Deployment Fix (2026-03-08)

**What changed:**
- Vercel was still pointing to old `firstspawn/web` root after the Session 2 restructure
- Fix: set **Root Directory** to `src/web` in Vercel Dashboard (Project Settings → General)
- Note: `rootDirectory` in `vercel.json` is NOT a valid property — dashboard-only setting

**No code changes.** Updated PR #9 with fix description.

---

### Session 7 — Database V2 Schema + Environment Consolidation (2026-03-09)

**What changed:**
- Fixed V1 model gaps: added missing relationships on `User` and `Server`, CHECK constraints on all enum-like columns, partial unique indexes for idempotency, FTS tsvector + GIN index + auto-update trigger on `servers`
- Created 6 new tables (4 new model files): `reviews`, `review_votes`, `review_moderation_actions`, `server_reputation_snapshots`, `user_game_accounts`, `server_platforms`
- Created migration `002_schema_v2_fixes_and_reviews.py` with full forward + backward support
- **Executed both migrations** on local PostgreSQL — 20 tables live
- Created root `.env.example` (single source of truth); consolidated from 3 per-service files to 1
- Fixed `config.py` default DB URL to match `docker-compose.yml` credentials (`firstspawn:firstspawn`)
- Updated `docs/plans/06-data-model-v1.md` with V2 table definitions
- Updated `.gitignore` to track `.env.example` files

**Key decisions:**
- `user_game_accounts` (Mojang/Hytale OAuth2) kept separate from `user_oauth_identities` (social login) — game identity ≠ auth method
- `server_platforms` junction table for Minecraft editions (Java/Bedrock/Pocket) — not an array column, for queryability
- `reviews` are 1-per-user-per-server with `is_verified` flag backed by playtime data
- `server_reputation_snapshots` is daily-materialized (not a view) for ranked discovery performance
- Single root `.env.example` for local dev; per-host env vars in production dashboards (Vercel, VPS)

**Validation:** 21 model exports ✅, `ruff check .` → 0 errors ✅, both migrations executed ✅

---

### Session 8 — Auth API Foundation (2026-03-10)

**What changed:**
- Implemented auth endpoints under `src/api/app/api/v1/endpoints/auth.py`: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`
- Added API dependency layer (`src/api/app/api/deps.py`) with bearer token user resolution
- Added DB session management (`src/api/app/db.py`)
- Added security helpers (`src/api/app/security.py`) for password hashing (scrypt), token hashing, and signed access/refresh tokens
- Added envelope/error schemas and structured error class (`src/api/app/schemas/*`, `src/api/app/errors.py`)
- Added request ID middleware and error/validation envelope handlers in `src/api/app/main.py`
- Added auth/security tests in `src/api/tests/test_security.py`

**Key decisions:**
- Login supports `identifier` (email or username)
- Refresh token rotation revokes prior session on successful refresh
- Logout is idempotent (returns success for already-invalid refresh tokens)

**Validation:** `cd src/api && ruff check .` ✅, `cd src/api && pytest -q` → 5 passed ✅

**Follow-up (same day):**
- Added DB-backed auth integration tests with temporary schema isolation:
  - `src/api/tests/conftest.py`
  - `src/api/tests/test_auth_integration.py`
- Integration tests currently skip when `API_TEST_DATABASE_URL`/`API_DATABASE_URL` is not available.
- Updated `.env.example` and `src/api/README.md` with integration test DB env hints.
- Later same day, validated against live local PostgreSQL and fixed runtime issues found by integration tests:
  - fixed test DB URL rendering bug (password masking) and `search_path` (`schema,public`) handling in `src/api/tests/conftest.py`
  - fixed `INET` persistence for non-IP test hosts and timezone-safe refresh expiry comparison in `src/api/app/api/v1/endpoints/auth.py`
- Integration auth suite now runs and passes against DB (`5 passed`).

---

### Session 9 — Auth UI Port + Auth Route UX (2026-03-12)

**What changed:**
- Ported login/signup UI direction from `references/` concept into web auth pages (`src/web/components/auth/*`, `src/web/app/[lang]/{login,signup}`)
- Added concept-style auth button component and Discord icon component
- Kept email flows wired to existing server actions/API (`loginAction`/`registerAction`), with Discord + passkey intentionally dummy for now
- Added localized `/[lang]/register` alias route that redirects to `/[lang]/signup`
- Updated auth copy to FirstSpawn/community language (removed “The Stash” wording)
- Fixed close behavior on auth pages: top-right `X` now respects `next` return path when present
- Hid global chrome on auth routes (`login`, `signup`, `register`): navbar/footer/cookie-consent are not rendered on those screens

**Key decisions:**
- Keep both `/signup` (real page) and `/register` (alias) temporarily for compatibility
- Keep social/passkey actions as placeholders until backend/provider integration starts
- Preserve focus by removing site chrome from auth screens

**Validation:**
- Targeted ESLint run for changed auth/layout files passed ✅

---

## Current State

| Area | Status |
|---|---|
| Web app (`src/web`) | Beta — deployed on Vercel |
| API (`src/api`) | Auth foundation + V2 DB schema done; discovery/plugin endpoints pending |
| DB migrations | `001_initial_schema` + `002_schema_v2` **executed** — 20 tables live |
| CI pipeline | Active on `main` + PRs |
| Pre-commit hooks | Configured via Husky / lint-staged |
| Testing | Basic API tests present (`health`, `security`); broader integration coverage pending |

---

## Known Limitations

- All tables in `public` schema — future: split into `auth`, `discovery`, `plugin`, `agent`
- Redis not yet integrated into API code
- Hytale OAuth2 API not yet public — `user_game_accounts` table ready but integration gated
- Reputation snapshot computation job not yet implemented (table exists, no background worker)
- SQLAlchemy warning remains for `CIText` custom type (`cache_ok` not set); low-priority cleanup to suppress warnings and improve query-plan caching.
- consent is currently validated at signup time, but not yet persisted in backend user profile fields.

---

## What is Next?

### Immediate:
1. Implement auth endpoints per `docs/plans/05-api-v1-contract.md` (register, login, refresh, logout, me)
2. Pydantic request/response schemas for API contract

### Short-term:
3. Discovery endpoints (servers, tags, search via FTS, favorites)
4. Plugin verification + telemetry ingestion endpoints
5. Integration tests for DB operations

### Medium-term:
6. Review CRUD endpoints
7. Reputation snapshot background job
8. Mojang OAuth2 game account linking
9. Agentic runtime audit integration
10. Add Renovate / Snyk for dependency/security automation
