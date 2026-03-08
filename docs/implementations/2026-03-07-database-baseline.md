# Database Baseline Implementation

**Date:** 2026-03-07  
**Context:** Database schema + migrations from docs/06-data-model-v1.md

## What Changed

**Repository Structure:**

- Renamed `firstspawn/` → `src/` for cleaner monorepo organization
- Renamed `api-py/` → `api/` (removed redundant suffix)
- Deleted old TypeScript `api/` placeholder
- Updated all paths in AGENTS.md and package.json workspaces

**Infrastructure:**

- Added docker-compose.yml with PostgreSQL 16, Redis 7, and FastAPI services
- Created infrastructure/postgres/init/01-init.sql for extensions (uuid-ossp, citext)
- Added .env.example with all required environment variables

**Database Schema:**

- Implemented 14 tables per docs/06-data-model-v1.md using SQLAlchemy 2.0
- Created domain-specific models: user, server, plugin, moderation, agent
- Added custom CIText type for case-insensitive fields (email, username, slugs)
- All tables include audit columns (created_at, updated_at)
- Enums implemented as TEXT + CHECK constraints for flexibility

**Migrations:**

- Initialized Alembic in src/api/
- Created 001_initial_schema migration with all tables, indexes, and constraints
- Configured env.py to use app.config for database URL
- Migration uses UUID primary keys with gen_random_uuid()

**Configuration:**

- Updated environment variables to use API\_\* prefix (API_DATABASE_URL, API_REDIS_URL, etc.)
- Maintains backward compatibility during transition
- Updated README.md with migration commands

## Migration Commands

```bash
cd src/api
alembic upgrade head           # Run migrations
alembic revision --autogenerate -m "desc"  # Create new
alembic history                # View history
```

## Key Design Decisions

- **Enums:** TEXT + CHECK constraints instead of native PostgreSQL ENUMs
- **Case-insensitive:** Custom CIText SQLAlchemy type for email/username/slug fields
- **Soft delete:** deleted_at column on servers table
- **Audit trail:** created_at/updated_at on all tables via AuditMixin
- **UUIDs:** gen_random_uuid() for all primary keys

## Files Created

```
docker-compose.yml
.env.example
infrastructure/postgres/init/01-init.sql
src/api/alembic.ini
src/api/migrations/ (env.py, script.py.mako, versions/)
src/api/migrations/versions/001_initial_schema.py
src/api/app/models/base.py
src/api/app/models/types.py
src/api/app/models/user.py
src/api/app/models/server.py
src/api/app/models/plugin.py
src/api/app/models/moderation.py
src/api/app/models/agent.py
src/api/app/models/__init__.py
```

## Files Moved

```
firstspawn/api-py/* → src/api/*
firstspawn/mobile/* → src/mobile/*
firstspawn/web/* → src/web/*
```

## Files Modified

```
package.json (workspaces: "src/*")
AGENTS.md (all path references updated)
src/api/app/config.py (API_* env vars)
src/api/README.md (migration docs)
```

## Status

✅ Migration created: 001_initial_schema  
⏳ Pending: Execute migration after starting PostgreSQL with `docker-compose up -d postgres`

## Next Steps

1. Start infrastructure: `docker-compose up -d postgres redis`
2. Execute migration: `cd src/api && alembic upgrade head`
3. Implement auth endpoints from docs/05-api-v1-contract.md
