# Data Model V1

## 1. Purpose

This document defines the initial PostgreSQL schema baseline for MVP implementation.

Scope:
- Auth + discovery entities.
- Favorites and moderation baseline.
- Plugin verification and telemetry entities.
- Agentic runtime audit entities for Tier 0/1.

Out of scope in v1:
- Public review tables and review moderation workflow tables.

## 2. Conventions

- Primary keys: `uuid` (`gen_random_uuid()`).
- Audit columns on core tables:
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- Soft delete: `deleted_at timestamptz null` where required.
- Enum values are lowercase snake_case.

## 3. Core Identity Tables

### `users`
- `id uuid pk`
- `email citext unique not null`
- `username citext unique not null`
- `password_hash text null` (nullable for OAuth-only accounts)
- `status text not null` (`active`, `suspended`, `deleted`)
- `locale text not null default 'en'`
- `last_login_at timestamptz null`
- audit columns

Indexes:
- unique `users_email_key`
- unique `users_username_key`

### `user_sessions`
- `id uuid pk`
- `user_id uuid not null fk -> users.id`
- `refresh_token_hash text not null`
- `expires_at timestamptz not null`
- `revoked_at timestamptz null`
- `ip inet null`
- `user_agent text null`
- audit columns

Indexes:
- `idx_user_sessions_user_id`
- `idx_user_sessions_expires_at`

### `user_oauth_identities`
- `id uuid pk`
- `user_id uuid not null fk -> users.id`
- `provider text not null` (`google`, `discord`, `github`, etc.)
- `provider_user_id text not null`
- `provider_email citext null`
- audit columns

Constraints:
- unique `(provider, provider_user_id)`

## 4. Discovery Tables

### `servers`
- `id uuid pk`
- `owner_user_id uuid null fk -> users.id`
- `slug citext unique not null`
- `name text not null`
- `description text not null`
- `game text not null` (`minecraft`, `hytale`)
- `status text not null` (`draft`, `active`, `archived`)
- `website_url text null`
- `discord_url text null`
- `ip_or_host text not null`
- `port int not null`
- `is_verified boolean not null default false`
- `last_seen_online_at timestamptz null`
- audit columns
- `deleted_at timestamptz null`

Indexes:
- unique `servers_slug_key`
- `idx_servers_game_status`
- `idx_servers_last_seen_online_at`

### `tags`
- `id uuid pk`
- `slug citext unique not null`
- `name text not null`
- audit columns

### `server_tags`
- `server_id uuid not null fk -> servers.id`
- `tag_id uuid not null fk -> tags.id`
- `created_at timestamptz not null default now()`

Constraints:
- pk `(server_id, tag_id)`

### `favorites`
- `user_id uuid not null fk -> users.id`
- `server_id uuid not null fk -> servers.id`
- `created_at timestamptz not null default now()`

Constraints:
- pk `(user_id, server_id)`

Indexes:
- `idx_favorites_server_id`

## 5. Plugin Verification And Telemetry Tables

### `plugin_keys`
- `id uuid pk`
- `server_id uuid not null fk -> servers.id`
- `key_id text unique not null`
- `secret_hash text not null`
- `status text not null` (`active`, `revoked`)
- `last_used_at timestamptz null`
- `expires_at timestamptz null`
- audit columns

### `server_heartbeats`
- `id uuid pk`
- `server_id uuid not null fk -> servers.id`
- `plugin_key_id uuid not null fk -> plugin_keys.id`
- `occurred_at timestamptz not null`
- `uptime_seconds int null`
- `online_players int null`
- `payload jsonb not null default '{}'::jsonb`
- `idempotency_key text null`
- audit columns

Indexes:
- `idx_server_heartbeats_server_occurred`
- unique partial `(plugin_key_id, idempotency_key)` where `idempotency_key is not null`

### `playtime_events`
- `id uuid pk`
- `server_id uuid not null fk -> servers.id`
- `plugin_key_id uuid not null fk -> plugin_keys.id`
- `external_player_id text not null`
- `event_type text not null` (`join`, `leave`, `session`)
- `duration_seconds int null`
- `occurred_at timestamptz not null`
- `payload jsonb not null default '{}'::jsonb`
- `idempotency_key text null`
- audit columns

Indexes:
- `idx_playtime_events_server_occurred`
- `idx_playtime_events_external_player`
- unique partial `(plugin_key_id, idempotency_key)` where `idempotency_key is not null`

## 6. Moderation Baseline

### `reports`
- `id uuid pk`
- `reporter_user_id uuid null fk -> users.id`
- `target_type text not null` (`server`, `user`, `content`)
- `target_id uuid not null`
- `reason_code text not null`
- `details text null`
- `status text not null` (`open`, `triaged`, `resolved`, `dismissed`)
- `resolved_by_user_id uuid null fk -> users.id`
- `resolved_at timestamptz null`
- audit columns

Indexes:
- `idx_reports_target`
- `idx_reports_status_created`

## 7. Agentic Audit Tables (MVP Tier 0/1)

### `agent_runs`
- `run_id uuid pk`
- `agent_id text not null`
- `pod text not null`
- `task_type text not null`
- `status text not null`
- `confidence numeric(4,3) null`
- `risk_class text not null`
- `input_ref text null`
- `output_summary text null`
- `evidence_ref text null`
- `rollback_ref text null`
- `started_at timestamptz not null`
- `ended_at timestamptz null`

### `action_proposals`
- `proposal_id uuid pk`
- `run_id uuid not null fk -> agent_runs.run_id`
- `action_type text not null`
- `target_system text not null`
- `target_ref text null`
- `policy_decision text not null` (`allow`, `deny`, `needs_approval`)
- `required_approver_role text null`
- `estimated_impact jsonb not null default '{}'::jsonb`
- `max_blast_radius text null`
- `expires_at timestamptz null`
- `created_at timestamptz not null default now()`

### `decision_logs`
- `decision_id uuid pk`
- `proposal_id uuid not null fk -> action_proposals.proposal_id`
- `human_approver text null`
- `decision text not null` (`approved`, `denied`, `auto_allowed`, `auto_denied`)
- `reason text null`
- `executed_at timestamptz null`
- `result_status text null`
- `result_metrics jsonb not null default '{}'::jsonb`
- `incident_flag boolean not null default false`
- `created_at timestamptz not null default now()`

## 8. Search Baseline

- MVP search uses PostgreSQL FTS over `servers.name`, `servers.description`, and tag names.
- Add generated `tsvector` column and GIN index in migration sequence.
- Elasticsearch remains future optimization, not part of v1 required schema.

## 9. Migration Rules

- Migration tool: Alembic.
- All schema changes must be forward and backward compatible within a release window.
- Destructive migrations require:
  - feature flag or read-path migration plan,
  - backfill plan,
  - rollback note in PR.

## 10. Future Phase Tables (Not In V1)

Planned for next phase:
- `reviews`
- `review_votes`
- `review_moderation_actions`
- reputation materialization tables derived from reviews + telemetry
