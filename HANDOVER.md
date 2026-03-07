# Project Handover

**Repository:** firstspawn-monorepo  
**Last Updated:** 2026-03-07

This document consolidates all substantial work sessions for the FirstSpawn
project.

---

## Session 1: Documentation Hardening + Initial Scaffold (2026-03-03)

### Summary

Completed documentation consolidation, resilience implementation for
newsletter/captcha systems, and Python API scaffold setup.

### 1. Documentation Consolidation and Scope Lock

- Confirmed `docs/` as the single active documentation source
- Removed stale `new-docs` references
- Locked MVP scope to `auth + discovery` (reviews deferred)
- Set MVP launch locales to `en`, `tr`, `de`
- Added resilience policy for optional third-party services (AI/email should
  degrade, not fail app)

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

- Replaced `NEXT_PUBLIC_APP_URL` usage with canonical `NEXT_PUBLIC_SITE_URL` and
  request-origin fallback
- Removed build-time provider crash risk by lazily creating `Resend` clients
- Added safe telemetry capture wrappers so PostHog failures do not break flow
- Updated newsletter confirm route to degrade gracefully if Resend contact sync
  fails
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

Implemented complete database schema per `docs/06-data-model-v1.md`, including
SQLAlchemy models, Alembic migrations, infrastructure setup, and repository
restructure.

### 1. Repository Restructure

Restructured monorepo for cleaner organization and better naming conventions:

- **Renamed `firstspawn/` → `src/`** - Aligns with standard monorepo conventions
- **Renamed `api-py/` → `api/`** - Consolidated naming (removed redundant "-py"
  suffix)
- **Deleted old TypeScript `api/` placeholder** - No longer needed
- **Updated all path references** in `AGENTS.md` (28 occurrences)
- **Updated `package.json` workspaces** from `"firstspawn/*"` to `"src/*"`

**Rationale:** The `firstspawn/` prefix was redundant in a repo already named
`firstspawn-monorepo`. The `src/` structure is standard for monorepos.

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

1. **Enums as TEXT + CHECK constraints** - More flexible than native PostgreSQL
   ENUMs
2. **Custom CIText type** - SQLAlchemy UserDefinedType for case-insensitive
   fields (email, username, slugs)
3. **Audit columns on all tables** - `created_at`, `updated_at` via AuditMixin
4. **UUID primary keys** - Using `gen_random_uuid()` (requires uuid-ossp)
5. **Soft delete support** - `deleted_at` column where applicable (servers)
6. **Foreign key cascades** - Appropriate ON DELETE behavior for each
   relationship

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

## Session 3: Repository Hygiene Implementation (2026-03-07)

### Summary

Implemented comprehensive repository hygiene and maintenance guardrails to keep
the repo clean, predictable, and cheap-to-maintain. This includes editor
configuration, formatting/linting consistency, CI/CD pipeline, and housekeeping
automation.

### 1. Editor Configuration

**Added `.editorconfig`:**

- Consistent encoding (UTF-8), line endings (LF), and indentation
- Language-specific rules (Python: 4 spaces, JS/TS: 2 spaces)
- Markdown trailing whitespace preservation
- Max line length: 100 characters

### 2. Code Formatting & Linting

**Prettier Configuration (`prettier.config.mjs`):**

- Consistent formatting for TS/TSX, JSON, YAML, Markdown, Python
- 100 character line width, semicolons, double quotes
- Override rules for specific file types

**`.prettierignore`:**

- Build outputs, dependencies, lockfiles
- Auto-generated files (migrations)
- Archive directory

**Updated `package.json` scripts:**

```json
{
  "format": "prettier --write \"**/*.{ts,tsx,md,json,yml,yaml}\"",
  "format:check": "prettier --check \"**/*.{ts,tsx,md,json,yml,yaml}\"",
  "ci": "npm run format:check && npm run lint && npm run typecheck && npm run build"
}
```

**Added devDependencies:**

- `husky`: ^9.1.7 (git hooks)
- `lint-staged`: ^15.4.3 (staged file linting)

### 3. Git Hooks (Husky)

**`.husky/pre-commit`:**

- Runs `lint-staged` on staged files
- Basic secret detection (warns on API_KEY, SECRET, etc.)

**`.husky/prepare-commit-msg`:**

- Auto-prepends issue numbers from branch names (e.g., `feature/123-xyz` →
  `[123] message`)

**`.lintstagedrc.json`:**

- Formats and lints staged files by type
- TS/TSX: Prettier → ESLint
- Python: Ruff format → Ruff check

### 4. CI/CD Pipeline

**`.github/workflows/ci.yml`:**

- **Jobs:** lint-and-format, typecheck, build, python-lint, security, test
- **Fail-fast:** Lint/format checks run first
- **Caching:** npm and pip caching for speed
- **Concurrency:** Cancels redundant runs
- **Security:** npm audit with lockfile validation
- **Python checks:** Ruff lint/format + MyPy type checking

**Workflow features:**

- Node.js 20, Python 3.11
- Dummy build-time env vars
- Continues on test failures (placeholder)
- Separate job for Python in `src/api/`

### 5. Repository Housekeeping

**Pull Request Template (`.github/pull_request_template.md`):**

- Description, type of change, testing checklist
- Environment details, contribution guidelines
- Checklist for code quality

**CODEOWNERS (`.github/CODEOWNERS`):**

- Global fallback: `@firstspawn/maintainers`
- Per-path ownership (web, api, infrastructure, docs)
- Auto-review assignment

**Stale Automation:**

`.github/workflows/stale.yml`:

- Issues: Stale after 60 days, close after 7 more
- PRs: Stale after 30 days, close after 14 more
- Exempt labels: `keep-open`, `bug`, `critical`, `roadmap`, `wip`, `blocked`

`.github/workflows/stale-branches.yml`:

- Weekly scan for branches >90 days old
- Skips branches with open PRs
- Currently in dry-run mode

**Label Configuration (`.github/labels.yml`):**

- Priority (critical, high, medium, low)
- Type (bug, feature, docs, refactor, test, chore, security)
- Status (blocked, wip, needs-review, needs-testing, stale)
- Component (api, web, mobile, ui, infra, database, docs)
- Special (good-first-issue, help-wanted, dependencies)

### 6. Documentation

**Enhanced README.md:**

- Quick start with prerequisites
- Installation and local development
- Environment variables setup
- Available scripts reference
- Project structure overview
- Testing placeholder (not yet implemented)
- Release process and versioning
- Contributing guidelines with commit conventions
- Technology stack summary

**Dependency Policy (`docs/DEPENDENCY_POLICY.md`):**

- Update cadence: Weekly (patch), Bi-weekly (minor), Quarterly (major)
- Version constraints for npm and Python
- Lockfile rules and security scanning
- Adding new dependencies process
- Emergency update procedures

### 7. AGENTS.md Updates

Added new section **"Repository Hygiene"**:

- `.editorconfig` conventions
- Prettier and ESLint workflow
- Husky pre-commit hooks
- CI pipeline structure
- Dependency management with Dependabot

Updated **Build and Development Commands**:

- Added `format:check`, `typecheck`, `ci`, `prepare` scripts

### Files Changed

**New files (17):**

```
.editorconfig
.prettierignore
prettier.config.mjs
.lintstagedrc.json
.husky/pre-commit
.husky/prepare-commit-msg
.github/workflows/ci.yml
.github/workflows/stale.yml
.github/workflows/stale-branches.yml
.github/pull_request_template.md
.github/CODEOWNERS
.github/labels.yml
docs/DEPENDENCY_POLICY.md
```

**Modified files (2):**

```
package.json (added scripts and dependencies)
README.md (comprehensive rewrite)
AGENTS.md (added hygiene section)
```

### Validation Performed

1. ✅ `.editorconfig` syntax validated
2. ✅ `prettier.config.mjs` exports valid config
3. ✅ `.lintstagedrc.json` is valid JSON
4. ✅ CI workflow YAML syntax validated
5. ✅ All GitHub workflow files syntax checked
6. ✅ `package.json` scripts are valid

**Note:** `npm install` required to install new dependencies (husky,
lint-staged)

---

## Session 4: GitHub Repository Configuration (2026-03-08)

### Summary

Completed GitHub repository configuration by applying labels and enabling branch
protection with required CI checks.

### 1. GitHub Labels Applied

Created 28 labels from `.github/labels.yml`:

**Priority (4):**

- `priority/critical`, `priority/high`, `priority/medium`, `priority/low`

**Type (7):**

- `type/bug`, `type/feature`, `type/docs`, `type/refactor`, `type/test`,
  `type/chore`, `type/security`

**Status (6):**

- `status/blocked`, `status/wip`, `status/needs-review`, `status/needs-testing`,
  `status/stale`, `status/keep-open`

**Component (7):**

- `component/api`, `component/web`, `component/mobile`, `component/ui`,
  `component/infra`, `component/database`, `component/docs`

**Automation (2):**

- `automation`, `dependencies`

**Special (4):**

- `good-first-issue`, `help-wanted`, `question`, `duplicate`, `invalid`,
  `wontfix`

### 2. Branch Protection Enabled

**Protected branch:** `main`

**Required status checks:**

- ✅ Lint & Format Check
- ✅ Type Check
- ✅ Build
- ✅ Python Lint & Format

**Pull request requirements:**

- 1 approving review required
- Stale reviews dismissed on new commits
- Up-to-date branch required before merging

**Protection settings:**

- Force pushes: disabled
- Branch deletion: disabled
- Admin enforcement: disabled (allows admins to bypass if needed)

**Note:** `develop` branch does not exist yet. Create and protect it when needed
using the same settings.

### 3. Supporting Files

**Created `.github/branch-protection.json`:**

- Backup of branch protection configuration
- Can be reused for `develop` branch or other repos

### Validation Performed

1. ✅ All 28 labels created successfully (existing default labels preserved)
2. ✅ Branch protection API call successful
3. ✅ Protection settings verified via GitHub API
4. ✅ Required status checks configured correctly

---

## What is Next?

### Immediate (Next Session):

1. **Run `npm install`** to install new dependencies
2. **Initialize Husky:** `npx husky install` (or let `prepare` script handle it)
3. **Test pre-commit hooks:** Make a test commit to verify hooks work
4. **Start infrastructure:** `docker-compose up -d postgres redis`
5. **Execute migration:** `cd src/api && alembic upgrade head`

### Short-term:

6. **Implement auth endpoints** from `docs/05-api-v1-contract.md`
7. **Integration tests** for database operations
8. **Stale branch cleanup:** Review and enable actual deletion (currently
   dry-run)

### Medium-term:

11. Implement discovery endpoints (servers, tags, favorites)
12. Plugin verification and telemetry endpoints
13. Agentic runtime audit integration
14. Add Renovate for automated dependency updates
15. Set up Snyk for additional security scanning

---

## Notes

- **Pre-commit hooks:** Will auto-format and lint on every commit
- **CI pipeline:** Runs on every PR and push to main/develop
- **Lockfile:** Must commit `package-lock.json` after `npm install`
- **Husky:** Hooks are installed automatically via `prepare` script
- **Stale automation:** Requires write permissions (configured in workflows)
- **CODEOWNERS:** Update with actual team names when organization is ready
