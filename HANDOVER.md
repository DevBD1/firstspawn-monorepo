# Project Handover

**Repository:** firstspawn-monorepo
**Last Updated:** 2026-03-08

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

## Current State

| Area | Status |
|---|---|
| Web app (`src/web`) | Beta — deployed on Vercel |
| API (`src/api`) | Scaffold + V1 DB schema done; auth endpoints not yet implemented |
| DB migration | `001_initial_schema` created, **not yet executed** (needs running Postgres) |
| CI pipeline | Active on `main` + PRs |
| Pre-commit hooks | Configured via Husky / lint-staged |
| Testing | Not implemented (placeholder only) |

---

## Known Limitations

- Partial unique indexes for idempotency (`idx_server_heartbeats_idempotency`, `idx_playtime_events_idempotency`) — TODO in migration
- PostgreSQL FTS not yet added (tsvector + GIN index on `servers`)
- All tables in `public` schema — future: split into `auth`, `discovery`, `plugin`, `agent`
- Redis not yet integrated into API code

---

## What is Next?

### Immediate:
1. Start infrastructure: `docker-compose up -d postgres redis`
2. Execute migration: `cd src/api && alembic upgrade head`
3. Implement auth endpoints per `docs/plans/05-api-v1-contract.md`

### Short-term:
4. Integration tests for DB operations
5. Enable stale-branch deletion (currently dry-run)

### Medium-term:
6. Discovery endpoints (servers, tags, favorites)
7. Plugin verification + telemetry endpoints
8. Agentic runtime audit integration
9. Add Renovate / Snyk for dependency/security automation
