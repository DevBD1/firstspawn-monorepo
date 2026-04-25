# FirstSpawn Database Schema Design

## MVP Schema (v1)

v1 is intentionally focused:

- Email/password auth
- Admin-populated server list
- Server heartbeat freshness and retention rollups
- Soft-delete with delayed purge and restore flow

```mermaid
erDiagram
    users {
        uuid id PK
        citext email UK "stored lowercase"
        citext username UK

        text password_hash "nullable"
        timestamptz email_confirmed_at "nullable"

        varchar status "active | suspended | deleted"
        varchar locale "en|tr|de|ru|es|fr"
        timestamptz terms_accepted "nullable"
        timestamptz privacy_accepted "nullable"
        timestamptz marketing_consent "nullable"

        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }

    user_sessions {
        uuid id PK
        uuid user_id FK

        text refresh_token_hash
        timestamptz expires_at
        timestamptz revoked_at

        inet ip
        text user_agent
        text device_fingerprint_hash
        varchar device_type
        varchar os_name
        varchar client_name
        timestamptz last_seen_at

        timestamptz created_at
        timestamptz updated_at
    }

    verification_tokens {
        uuid id PK
        uuid user_id FK

        text token_hash UK
        varchar purpose "email_verification | password_reset | account_restore"
        timestamptz expires_at

        timestamptz created_at
        timestamptz updated_at
    }

    user_deletion_requests {
        uuid id PK
        uuid user_id FK

        timestamptz requested_at
        timestamptz purge_after

        timestamptz cancelled_at "nullable"
        timestamptz purged_at "nullable"

        timestamptz expedite_requested_at "nullable"
        text expedite_note "nullable"
        text reason "nullable"

        timestamptz created_at
        timestamptz updated_at
    }

    servers {
        uuid id PK
        citext slug UK

        varchar name
        text description
        varchar host "domain or ip"
        int port

        varchar game "mc_java | mc_bedrock | hytale"
        varchar status "active | suspended | archived"

        boolean online_mode
        varchar region

        varchar website_url
        varchar discord_url

        timestamptz last_ping_at
        timestamptz last_probe_attempt_at
        timestamptz last_probe_success_at
        timestamptz last_probe_failure_at
        int consecutive_probe_failures
        varchar last_probe_error_code
        varchar probe_status "online | offline | unknown | unreachable"
        timestamptz created_at
        timestamptz updated_at
    }

    server_heartbeats {
        uuid id PK
        uuid server_id FK

        timestamptz occurred_at
        timestamptz collected_at
        text idempotency_key "optional dedupe key"

        int uptime_seconds
        smallint ping_ms
        int online_players
        int max_players

        jsonb payload
        int protocol_version
        varchar minecraft_version

        timestamptz created_at
        timestamptz updated_at
    }

    server_heartbeat_hourly {
        uuid server_id PK,FK
        timestamptz bucket_start PK "UTC"
        int sample_count
        int payload_count
        smallint ping_min_ms
        smallint ping_max_ms
        numeric ping_avg_ms
        int uptime_max_seconds
        int players_peak
        int max_players_peak
        timestamptz last_occurred_at
        timestamptz created_at
        timestamptz updated_at
    }

    server_heartbeat_daily {
        uuid server_id PK,FK
        date bucket_date PK "UTC date"
        int sample_count
        int payload_count
        smallint ping_min_ms
        smallint ping_max_ms
        numeric ping_avg_ms
        int uptime_max_seconds
        int players_peak
        int max_players_peak
        timestamptz last_occurred_at
        timestamptz created_at
        timestamptz updated_at
    }

    users ||--o{ user_sessions : "has sessions"
    users ||--o{ verification_tokens : "has verification tokens"
    users ||--o{ user_deletion_requests : "has deletion requests"
    servers ||--o{ server_heartbeats : "receives pings"
    servers ||--o{ server_heartbeat_hourly : "rollup"
    servers ||--o{ server_heartbeat_daily : "rollup"
```

## Constraints And Policies

- Use `varchar + CHECK` (not PostgreSQL enums) for constrained fields.
- `users.username` is DB-constrained to `^[A-Za-z0-9_]{3,32}$`.
- `servers.slug` is globally unique and never reused.
- `server_heartbeats` dedupe uniqueness is scoped by `(server_id, idempotency_key)`.
- `servers.status` is catalog/moderation state only: `active`, `suspended`, or `archived`.
- Collectors target active `mc_java` rows regardless of heartbeat freshness or probe confidence.
- Probe confidence is tracked separately with `servers.probe_status` and the `last_probe_*` columns.
- `users.status = 'deleted'` means pending purge, not yet hard-deleted.

## Retention And Lifecycle

- Raw `server_heartbeats` retention: 14 days for all servers.
- Server archive policy:
  - Archive only from explicit catalog/admin evidence.
  - Collector silence, stale `last_ping_at`, failed probes, DNS failures, or network reachability failures must not archive rows.
- User soft-delete policy:
  - Default purge window: 30 days.
  - Expedite request window: 24 hours.
  - Restore allowed until final purge.

## New Tables Close-Up (Phase 2)

The following tables are intentionally out of MVP scope.

### Engagement And Trust

- `reviews`
- `review_votes`
- `review_moderation_actions`
- `server_reputation_snapshots`
- `favorites`

### Moderation

- `reports`

### Plugin And Telemetry

- `plugin_keys`
- `playtime_events`

### Agentic Ops

- `agent_runs`
- `action_proposals`
- `decision_logs`

## Notes

- Keep `servers` admin-populated in v1.
- Ping and payload jobs run only for active servers.
- Suggested heartbeat cadence:
  - Ping every 5 minutes
  - Payload every 30 minutes
