# @firstspawn/database

Shared database workspace for PostgreSQL bootstrap SQL and Alembic migrations.

## Contents

- `init/`: Docker bootstrap SQL loaded by the local PostgreSQL container
- `migrations/`: Alembic environment and revision history
- `alembic.ini`: Alembic project configuration

## Usage

Run migrations from the repository root:

```bash
pnpm --dir packages/database run migrate
```

Generate a new migration from the repository root:

```bash
cd apps/api
alembic -c ../../packages/database/alembic.ini revision --autogenerate -m "describe change"
```
