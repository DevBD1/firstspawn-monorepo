# Project Handover

**Repository:** firstspawn-monorepo  
**Last Updated:** 2026-03-07

This document consolidates all substantial work sessions for the FirstSpawn project.

---

## Session 1: Documentation Hardening + Initial Scaffold (2026-03-03)

### Summary

Completed documentation consolidation, resilience implementation for newsletter/captcha systems, and Python API scaffold setup.

### 1. Documentation Consolidation and Scope Lock

- Confirmed `docs/` as the single active documentation source
- Removed stale `new-docs` references
- Locked MVP scope to `auth + discovery` (reviews deferred)
- Set MVP launch locales to `en`, `tr`, `de`
- Added resilience policy for optional third-party services (AI/email should degrade, not fail app)

**Updated docs:**

- `docs/01-product-and-strategy.md`
- `docs/02-architecture-and-stack.md`
- `docs/03-execution-and-ops.md`
- `README.md`
- `AGENTS.md`

**New docs:**

- `docs/05-api-v1-contract.md`
- `docs/06-data-model-v1.md`

### 2. Newsletter + Captcha Resilience Implementation

- Replaced `NEXT_PUBLIC_APP_URL` usage with canonical `NEXT_PUBLIC_SITE_URL` and request-origin fallback
- Removed build-time provider crash risk by lazily creating `Resend` clients
- Added safe telemetry capture wrappers so PostHog failures do not break flow
- Updated newsletter confirm route to degrade gracefully if Resend contact sync fails
- Added provider timeout/fallback logic in captcha AI response generation

**Changed files:**

- `firstspawn/web/app/actions/captcha.ts`
- `firstspawn/web/app/actions/newsletter.ts`
- `firstspawn/web/app/api/newsletter/confirm/route.ts`
- `firstspawn/web/components/landing/LandingPage.tsx`

### 3. Python API Scaffold in Monorepo

- Created `firstspawn/api-py` scaffold using:
  - FastAPI
  - SQLAlchemy 2.x
  - Alembic
  - Pydantic settings
- Added baseline app/router/health endpoint and initial tests

**Added files:**

- `firstspawn/api-py/pyproject.toml`
- `firstspawn/api-py/app/`
- `firstspawn/api-py/tests/`
- `firstspawn/api-py/.env.example`
- `firstspawn/api-py/README.md`

### 4. Repo Hygiene

- Added Python ignore patterns to `.gitignore`
- `package-lock.json` changed due to dependency installation

### Validation Performed

- `npx turbo run build --filter=@firstspawn/web` → passed
- `python3 -m compileall firstspawn/api-py/app` → passed

**Known issues:**

- Repo-wide lint is still not fully green (pre-existing issues)

---

## Session 2: Database Baseline Implementation (2026-03-07)

### Summary

Implemented complete database schema per `docs/06-data-model-v1.md`, including SQLAlchemy models, Alembic migrations, infrastructure setup, and repository restructure.

### 1. Repository Restructure

Restructured monorepo for cleaner organization and better naming conventions:

- **Renamed `firstspawn/` → `src/`** - Aligns with standard monorepo conventions
- **Renamed `api-py/` → `api/`** - Consolidated naming (removed redundant "-py" suffix)
- **Deleted old TypeScript `api/` placeholder** - No longer needed
- **Updated all path references** in `AGENTS.md` (28 occurrences)
- **Updated `package.json` workspaces** from `"firstspawn/*"` to `"src/*"`

**Rationale:** The `firstspawn/` prefix was redundant in a repo already named `firstspawn-monorepo`. The `src/` structure is standard for monorepos.

### 2. Infrastructure Setup

Created Docker Compose infrastructure for local development:

**`docker-compose.yml`:**

- PostgreSQL 16 with persistent volume
- Redis 7 for caching/queues
- FastAPI service with hot reload
- Health checks for all services
- Shared network `firstspawn-network`

**`infrastructure/postgres/init/01-init.sql`:**

- Enables `uuid-ossp` extension (UUID generation)
- Enables `citext` extension (case-insensitive text)
- Prepared for future schema separation (commented role setup)

**`.env.example`:**

- All API environment variables with `API_*` prefix
- Database and Redis connection strings
- Web app configuration
- Newsletter and AI captcha settings (optional)

### 3. Database Schema Implementation

Implemented complete V1 schema from `docs/06-data-model-v1.md`:

**Models created** (`src/api/app/models/`):

| Domain     | File                  | Tables                                          |
| ---------- | --------------------- | ----------------------------------------------- |
| Identity   | `user.py`             | users, user_sessions, user_oauth_identities     |
| Discovery  | `server.py`           | servers, tags, server_tags, favorites           |
| Plugin     | `plugin.py`           | plugin_keys, server_heartbeats, playtime_events |
| Moderation | `moderation.py`       | reports                                         |
| Agentic    | `agent.py`            | agent_runs, action_proposals, decision_logs     |
| Base       | `base.py`, `types.py` | AuditMixin, CIText custom type                  |

**Key design decisions:**

1. **Enums as TEXT + CHECK constraints** - More flexible than native PostgreSQL ENUMs
2. **Custom CIText type** - SQLAlchemy UserDefinedType for case-insensitive fields (email, username, slugs)
3. **Audit columns on all tables** - `created_at`, `updated_at` via AuditMixin
4. **UUID primary keys** - Using `gen_random_uuid()` (requires uuid-ossp)
5. **Soft delete support** - `deleted_at` column where applicable (servers)
6. **Foreign key cascades** - Appropriate ON DELETE behavior for each relationship

**Indexes created:**

- `idx_user_sessions_user_id`, `idx_user_sessions_expires_at`
- `idx_servers_game_status`, `idx_servers_last_seen_online_at`
- `idx_favorites_server_id`
- `idx_server_heartbeats_server_occurred`
- `idx_playtime_events_server_occurred`, `idx_playtime_events_external_player`
- `idx_reports_target`, `idx_reports_status_created`

### 4. Alembic Migration System

Initialized and configured Alembic in `src/api/`:

**Setup:**

- `alembic.ini` - Configuration with placeholders
- `migrations/env.py` - Custom env using app.config settings
- `migrations/script.py.mako` - Migration template

**Initial migration: `001_initial_schema`**

- All 14 tables with proper constraints
- CHECK constraints for all enum fields
- Foreign key relationships
- Indexes for query optimization
- Comments on all tables

### 5. Configuration Updates

**Environment variables** (now use `API_*` prefix):

```python
API_ENV=development
API_HOST=0.0.0.0
API_PORT=8000
API_DATABASE_URL=postgresql+psycopg://...
API_REDIS_URL=redis://...
```

Updated `app/config.py`:

- Changed from lowercase to uppercase env vars
- Added `env_prefix=""` to support both old and new naming
- Maintains backward compatibility during transition

**Documentation updates:**

- `README.md` - Added migration commands and quickstart
- `AGENTS.md` - Updated all 28 path references from `firstspawn/` to `src/`

---

## Files Changed (Both Sessions)

### Session 1 Files:

- `docs/01-product-and-strategy.md`
- `docs/02-architecture-and-stack.md`
- `docs/03-execution-and-ops.md`
- `docs/05-api-v1-contract.md` (new)
- `docs/06-data-model-v1.md` (new)
- `README.md`
- `AGENTS.md`
- `firstspawn/web/app/actions/captcha.ts`
- `firstspawn/web/app/actions/newsletter.ts`
- `firstspawn/web/app/api/newsletter/confirm/route.ts`
- `firstspawn/web/components/landing/LandingPage.tsx`
- `firstspawn/api-py/` (new scaffold)

### Session 2 Files:

**New files (24):**

```
docker-compose.yml
.env.example
infrastructure/postgres/init/01-init.sql
src/api/alembic.ini
src/api/migrations/
src/api/app/models/ (8 files)
src/api/migrations/versions/001_initial_schema.py
```

**Moved files (68):**

```
firstspawn/api-py/* → src/api/*
firstspawn/mobile/* → src/mobile/*
firstspawn/web/* → src/web/*
```

**Modified:**

```
package.json (workspaces path)
AGENTS.md (all path references)
src/api/app/config.py (env var names)
src/api/README.md (migration docs)
```

**Deleted:**

```
firstspawn/api/ (TypeScript placeholder)
firstspawn/ (entire directory after moves)
```

---

## Validation Performed

### Session 1:

- `npx turbo run build --filter=@firstspawn/web` → passed
- `python3 -m compileall firstspawn/api-py/app` → passed

### Session 2:

1. **Model registration**: All 14 tables registered correctly
2. **Migration file**: Migration compiles without syntax errors
3. **Docker Compose**: Configuration validated
4. **Package installation**: All dependencies installed successfully

---

## Migration Commands Quick Reference

```bash
cd src/api

# Run all pending migrations
alembic upgrade head

# Create new migration after model changes
alembic revision --autogenerate -m "Description"

# Rollback one migration
alembic downgrade -1

# View current revision
alembic current

# View full history
alembic history
```

### To Execute Initial Migration:

```bash
# Start database
docker-compose up -d postgres redis

# Run migrations
cd src/api && alembic upgrade head

# Verify
alembic current  # Should show 001_initial_schema
```

---

## Known Limitations / Future Improvements

### Not yet implemented (by design):

1. **Partial unique indexes for idempotency** - TODO comments in migration
   - `idx_server_heartbeats_idempotency`
   - `idx_playtime_events_idempotency`

2. **PostgreSQL FTS search** - Will add generated tsvector column
   - GIN index on servers.name, servers.description
   - Elasticsearch remains future optimization

3. **Separate schemas** - Currently all in `public`
   - Future: auth, discovery, plugin, agent schemas
   - Migration notes included in 001_initial_schema

4. **Domain-by-domain migrations** - Single migration for V1 baseline
   - Future: split migrations by domain for better rollback granularity

5. **CI workflow** - Not yet implemented
   - Lint, build, test gates from `docs/03-execution-and-ops.md`

### Dependencies:

- PostgreSQL must be running for migration execution
- Redis for caching (not yet integrated into API code)
- Docker Compose for local development

---

## Migration Status

**Current revision:** `001_initial_schema` (head)  
**Status:** Created, not yet executed (requires running PostgreSQL)

---

## What is Next?

### Immediate (Next Session):

1. Start infrastructure: `docker-compose up -d postgres redis`
2. Execute migration: `cd src/api && alembic upgrade head`
3. Verify schema: Connect to PostgreSQL and verify tables created

### Short-term:

4. Implement auth endpoints from `docs/05-api-v1-contract.md`
5. Add CI workflow for lint/build/test gates
6. Integration tests for database operations

### Medium-term:

7. Implement discovery endpoints (servers, tags, favorites)
8. Plugin verification and telemetry endpoints
9. Agentic runtime audit integration

---

## Notes

- **Naming convention:** All new environment variables use `API_*` prefix
- **Backward compatibility:** Config supports both old and new env var names during transition
- **Type safety:** SQLAlchemy 2.0 with full type annotations
- **Documentation:** All tables have comments, migration includes TODOs for future work
- **Security:** Password hashes use Text (bcrypt/Argon2), secret_hash for plugin keys
- **Monorepo structure:** `src/` pattern is standard for monorepos, eliminates redundant prefix
