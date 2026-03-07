# @firstspawn/api

FastAPI production API with SQLAlchemy 2.0 + Alembic migrations.

## Quickstart

```bash
cd src/api
pip install -e .[dev]

# Start database (requires Docker)
docker-compose up -d postgres redis

# Run migrations
alembic upgrade head

# Start API
uvicorn app.main:app --reload --port 8000
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

## Initial Endpoints

- `GET /healthz`
- `GET /api/v1/health`
