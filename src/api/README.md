# @firstspawn/api

FastAPI production API with SQLAlchemy 2.0 + Alembic migrations.

## Current Status (2026-03-10)

### Implemented

- Health endpoints:
  - `GET /healthz`
  - `GET /api/v1/health`
- Auth endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`
- Auth/session behavior:
  - Email or username login via `identifier`
  - Access + refresh token issuance
  - Refresh token rotation
  - Logout revocation (idempotent)
  - Registration consent persistence (`terms_accepted`, `privacy_accepted`, `marketing_consent`)
- Standard API response envelope for success/errors + per-request `request_id`
- DB-backed integration tests for auth flows

### Not Implemented Yet

- Discovery endpoints (`servers`, `tags`, favorites)
- Plugin telemetry and verification endpoints
- Moderation/report endpoints
- Review CRUD endpoints
- Redis-backed runtime features

## Quickstart

```bash
cd src/api
pip install -e .[dev]

# Start database (requires Docker)
cd ../..
docker compose up -d postgres redis
cd src/api

# Run migrations
alembic upgrade head

# Start API
uvicorn app.main:app --reload --port 8000
```

## Environment

Set these in repo root `.env` (see root `.env.example`):

```bash
API_ENV=development
API_DATABASE_URL=postgresql+psycopg://firstspawn:firstspawn@localhost:5432/firstspawn
API_REDIS_URL=redis://localhost:6379/0
API_JWT_SECRET=change_me_to_a_long_random_secret
API_JWT_ISSUER=firstspawn-api
API_ACCESS_TOKEN_EXPIRE_MINUTES=15
API_REFRESH_TOKEN_EXPIRE_DAYS=30
API_TEST_DATABASE_URL=postgresql+psycopg://firstspawn:firstspawn@localhost:5432/firstspawn
```

## Contract Sources

- `../../docs/05-api-v1-contract.md`
- `../../docs/06-data-model-v1.md`

## Database Migrations

Migration tool: **Alembic**

### Commands

```bash
# Run all pending migrations
alembic upgrade head

# Create new migration (after modifying models)
alembic revision --autogenerate -m "Description of changes"

# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade 001_initial_schema

# View current revision
alembic current

# View migration history
alembic history
```

### Schema Notes

- Initial migration: `001_initial_schema`
- All tables use UUID primary keys (`gen_random_uuid()`)
- Audit columns: `created_at`, `updated_at` on all tables
- Soft delete: `deleted_at` where required
- Enums implemented as TEXT + CHECK constraints (flexibility)
- Single `public` schema for MVP (separate schemas planned for future)

## Testing and Validation

### Lint

```bash
cd src/api
ruff check .
```

### Unit + Integration Tests

```bash
cd src/api
pytest -q
```

### Force Live DB Integration Tests

```bash
cd src/api
API_TEST_DATABASE_URL='postgresql+psycopg://firstspawn:firstspawn@localhost:5432/firstspawn' \
pytest -q tests/test_auth_integration.py -rs
```

Integration tests currently cover:

- Register -> me flow
- Login with email and username
- Refresh token rotation and old-token rejection
- Logout revocation behavior
- Duplicate registration validation

## Endpoints

- `GET /healthz`
- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
