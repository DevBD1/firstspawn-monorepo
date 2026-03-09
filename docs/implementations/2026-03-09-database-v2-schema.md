# Handover - 2026-03-09

## Session Summary

### What Changed

**Part A — Fixed existing model gaps (4 files modified):**
- `src/api/app/models/user.py`: Added `from __future__ import annotations`, `reports_submitted`/`reports_resolved`/`reviews`/`game_accounts` relationships, `CheckConstraint` for `status` and `locale`, `UniqueConstraint` on `UserOAuthIdentity`.
- `src/api/app/models/server.py`: Added `search_vector` tsvector column with GIN index for FTS, `platforms`/`plugin_keys`/`heartbeats`/`playtime_events`/`reviews`/`reputation_snapshots` relationships, `CheckConstraint` for `game` and `status`.
- `src/api/app/models/plugin.py`: Added `CheckConstraint` for `plugin_keys.status` and `playtime_events.event_type`. Replaced TODO comments with actual partial unique indexes for idempotency.
- `src/api/app/models/moderation.py`: Added `CheckConstraint` for `target_type` (expanded with `'review'`) and `status`.

**Part B — Created 6 new tables (4 new model files):**
- `src/api/app/models/review.py`: `reviews`, `review_votes`, `review_moderation_actions` tables.
- `src/api/app/models/reputation.py`: `server_reputation_snapshots` table (daily materialized trust scores).
- `src/api/app/models/game_account.py`: `user_game_accounts` table (Mojang + Hytale OAuth2 identity linking).
- `src/api/app/models/server_platform.py`: `server_platforms` table (Java/Bedrock/Pocket edition support).

**Part C — Migration:**
- `src/api/migrations/versions/002_schema_v2_fixes_and_reviews.py`: Complete forward + backward migration with FTS trigger, partial unique indexes, all 6 new tables, updated CHECK constraints.

**Part D — Documentation:**
- Updated `docs/plans/06-data-model-v1.md` (title, FTS status, V2 table definitions).

### Key Decisions
- `user_game_accounts` is separate from `user_oauth_identities` — game identity verification ≠ social login.
- `server_platforms` is a junction table (not array column) for better queryability and future extensibility.
- FTS uses weighted tsvector: `name` = weight A, `description` = weight B. Auto-update trigger on INSERT/UPDATE.
- `reviews` are 1-per-user-per-server with `is_verified` flag backed by playtime data.
- `server_reputation_snapshots` is daily-materialized (not a view) for performant ranked discovery queries.

## Validation Performed

- All 21 model exports import successfully ✅
- `ruff check .` → 0 errors ✅
- Migration `002_schema_v2` compiles and chains correctly to `001_initial_schema` ✅

## What is next?

1. Start infrastructure: `docker-compose up -d postgres redis`
2. Execute migrations: `cd src/api && alembic upgrade head`
3. Implement auth endpoints per `docs/plans/05-api-v1-contract.md`
