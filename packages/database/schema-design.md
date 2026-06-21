# FirstSpawn Database Schema Design

## MVP Schema (v1)

v1 is intentionally focused:

- Email/password auth
- Admin-populated server list
- Server liveness observations and retention rollups
- Soft-delete with delayed purge and restore flow

```mermaid
erDiagram
    users {
        uuid id PK "uuidv7"
        citext email UK "stored lowercase"
        citext username UK
        varchar(2048) avatar_url "nullable"

        text password_hash "nullable"

        varchar(20) status "active | suspended | deleted"
        varchar(20) role "user | moderator | admin"
        varchar(10) locale "nullable"
        varchar(2) country_code FK "nullable" 

        timestamptz email_confirmed_at "nullable"
        timestamptz marketing_consent_at "nullable"
        timestamptz privacy_accepted_at "nullable"
        timestamptz terms_accepted_at "nullable"

        timestamptz last_login_at "nullable"

        timestamptz created_at
        timestamptz updated_at
    }

    user_sessions {
        uuid id PK "uuidv4"
        uuid user_id FK "indexed"

        text refresh_token_hash
        timestamptz expires_at "indexed"
        timestamptz revoked_at "nullable"

        inet ip "nullable"
        text user_agent "nullable"
        text device_fingerprint_hash "nullable"

        varchar(50) device_type "nullable"
        varchar(100) os_name "nullable"
        varchar(100) client_name "nullable"

        timestamptz last_seen_at "nullable, indexed"

        timestamptz created_at
        timestamptz updated_at
    }

    user_consent_audit_logs {
        uuid id PK "uuidv7"
        uuid user_id FK "indexed, cascade"

        inet ip "nullable"
        text user_agent "nullable"

        varchar(20) action "opt_in | opt_out"
        varchar(50) consent_type "marketing | privacy | terms"
        varchar(20) policy_version

        timestamptz created_at
    }

    user_deletion_requests {
        uuid id PK "uuidv4"
        uuid user_id FK "indexed, cascade"

        timestamptz requested_at
        timestamptz purge_after "indexed"

        timestamptz cancelled_at "nullable"
        timestamptz purged_at "nullable"

        timestamptz expedite_requested_at "nullable"
        text expedite_note "nullable"
        text reason "nullable"

        timestamptz created_at
        timestamptz updated_at
    }

    user_moderation_logs {
        uuid id PK "uuidv4"
        uuid user_id FK "nullable, indexed"
        uuid admin_id FK "nullable, indexed"

        varchar(20) action "suspended | unsuspended | warned"
        text reason "nullable"

        timestamptz expires_at "nullable"

        timestamptz created_at
        timestamptz updated_at
    }

    verification_tokens {
        uuid id PK "uuidv4"
        uuid user_id FK "indexed"

        text token_hash UK
        varchar(50) purpose "email_verification | password_reset | account_restore"

        timestamptz expires_at

        timestamptz created_at
        timestamptz updated_at
    }

    countries {
        varchar(2) iso_a_2 PK "ISO 3166-1 alpha-2"
        varchar(3) iso_a_3 "ISO 3166-1 alpha-3"
        varchar(100) name UK
    }

    servers {
        uuid id PK "uuidv4"
        citext slug UK
        varchar(64) name UK

        uuid owner_id FK "nullable, indexed"

        text description
        text long_description "nullable"
        varchar(255) host "domain or ip"
        int port
        varchar(255) votifier_host "nullable"
        int votifier_port "nullable"
        text votifier_public_key "nullable"
        boolean votifier_enabled
        varchar(10) verification_method "nullable, motd | dns"
        varchar(80) verification_token "nullable"
        timestamptz verified_at "nullable"

        varchar(20) game "mc_java | mc_bedrock | hytale, indexed"
        varchar(20) status "active | suspended | archived, indexed"

        varchar(20) auth_mode "official | offline_allowed | unknown"
        varchar(2) country_code FK "ISO 3166-1 alpha-2"

        varchar(2048) logo_url "nullable"
        varchar(2048) banner_url "nullable"

        timestamptz monitoring_started_at
        timestamptz last_probe_attempt_at "nullable"
        timestamptz last_probe_success_at "nullable"
        timestamptz last_probe_failure_at "nullable"
        int consecutive_probe_failures
        varchar(80) last_probe_error_code "nullable"
        varchar(20) probe_status "online | offline | unknown, indexed"

        timestamptz created_at
        timestamptz updated_at
    }

    server_media {
        uuid id PK "uuidv4"
        uuid server_id FK "indexed, cascade"
        varchar(2048) url
        varchar(20) kind "build | banner | screenshot | logo"
        int display_order

        timestamptz created_at
        timestamptz updated_at
    }

    server_socials {
        uuid server_id PK,FK "indexed, cascade"
        varchar(50) platform PK "website | discord | youtube | twitter | instagram | tiktok | facebook"

        varchar(2048) url
        int display_order

        timestamptz created_at
        timestamptz updated_at
    }

    server_supported_clients {
        uuid server_id PK,FK "indexed, cascade"

        varchar(20) client_name PK "mc_java | mc_bedrock | hytale"
        varchar(50) client_version PK

        timestamptz created_at
        timestamptz updated_at
    }

    collector_probe_cycles {
        uuid id PK "uuidv4"
        uuid submission_id UK "retry identity"
        varchar(64) collector_instance_id
        timestamptz slot_start "UTC, unique per collector"
        timestamptz started_at
        timestamptz completed_at
        int target_count
        int success_count
        int failure_count
        varchar(20) classification "accepted | warmup | quarantined"
        int baseline_success_median "nullable"
        varchar(80) quarantine_reason "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    server_probe_observations {
        uuid cycle_id PK,FK "cascade"
        uuid server_id PK,FK "cascade"
        timestamptz slot_start "indexed"
        timestamptz observed_at "indexed"
        varchar(20) outcome "online | offline | unknown"
        int online_players "online only, unverified"
        varchar(80) error_code "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    server_probe_hourly {
        uuid server_id PK,FK "cascade"
        timestamptz bucket_start PK "UTC, indexed"
        int sample_count
        int online_count
        int offline_count
        int unknown_count
        int player_sample_count
        numeric(12, 2) players_avg "nullable"
        int players_peak "nullable"
        timestamptz last_observed_at
        timestamptz created_at
        timestamptz updated_at
    }

    server_probe_daily {
        uuid server_id PK,FK "cascade"
        date bucket_date PK "UTC date, indexed"
        int sample_count
        int online_count
        int offline_count
        int unknown_count
        int player_sample_count
        numeric(12, 2) players_avg "nullable"
        int players_peak "nullable"
        timestamptz last_observed_at
        timestamptz created_at
        timestamptz updated_at
    }

    server_moderation_logs {
        uuid id PK "uuidv4"
        uuid server_id FK "nullable, indexed"
        uuid admin_id FK "nullable, indexed"
        varchar(20) action "suspended | unsuspended | warned"
        text reason "nullable"
        timestamptz expires_at "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    users ||--o{ servers : "owns"
    users ||--o{ user_sessions : "has sessions"
    users ||--o{ verification_tokens : "has verification tokens"
    users ||--o{ user_deletion_requests : "has deletion requests"
    users ||--o{ user_moderation_logs : "receives moderation"
    users ||--o{ user_moderation_logs : "performs moderation (admin)"
    users ||--o{ server_moderation_logs : "performs moderation (admin)"
    users ||--o{ user_consent_audit_logs : "gives consent"
    countries ||--o{ users : "resides in"
    servers ||--o{ server_moderation_logs : "receives moderation"
    collector_probe_cycles ||--o{ server_probe_observations : "contains"
    servers ||--o{ server_probe_observations : "is observed"
    servers ||--o{ server_probe_hourly : "rollup"
    servers ||--o{ server_probe_daily : "rollup"
    servers ||--o{ server_media : "has media"
    servers ||--o{ server_supported_clients : "supports clients"
    countries ||--o{ servers : "hosts"
```

## Constraints And Policies

- Use `varchar + CHECK` (not PostgreSQL enums) for constrained fields.
- `users.username` is DB-constrained to `^[A-Za-z0-9_]{3,32}$`.
- `servers.slug` is globally unique and never reused.
- `servers.auth_mode` is DB-constrained to `official`, `offline_allowed`, or `unknown`.
- `servers.votifier_port` is nullable; when present it is constrained to `1..65535`.
- `servers.verification_method` is nullable; when present it is constrained to `motd` or `dns`.
- Exact retries dedupe by `submission_id`; a different submission reusing `(collector_instance_id, slot_start)` is rejected as a replica/configuration conflict. Observations dedupe by `(server_id, cycle_id)`.
- Warmup cycles record online and offline outcomes symmetrically. Quarantined cycles record every outcome as unknown and never update current probe state.
- Availability excludes unknown observations; coverage is reported separately and headline availability requires 80% coverage.
- Raw observations are retained 48 hours, hourly rollups 90 days, and daily rollups 730 days.
- `server_media.kind` is constrained to `build`, `banner`, `screenshot`, or `logo`.
- `server_socials` primary key is `(server_id, platform)`.
- `server_supported_clients` primary key is `(server_id, client_name, client_version)`.
- `user_moderation_logs.action` and `server_moderation_logs.action` are constrained to `suspended`, `unsuspended`, or `warned`.
- `servers.status` is catalog/moderation state only: `active`, `suspended`, or `archived`.
- Collectors target active `mc_java` rows on every fixed ten-minute slot.
- Probe confidence is tracked separately with `servers.probe_status` and the `last_probe_*` columns.
- `users.status = 'deleted'` means pending purge, not yet hard-deleted.

## Retention And Lifecycle

- Closed UTC observation hours are refreshed into hourly rollups every 10 minutes.
- Closed UTC days are derived from hourly rollups in the same refresh job.
- Probe history retention tiers:
  - Raw `server_probe_observations`: 2 days.
  - `server_probe_hourly`: 90 days.
  - `server_probe_daily`: 730 days.
- Retention deletes raw and hourly rows only after a newer next-resolution rollup exists.
- Server archive policy:
  - Archive only from explicit catalog/admin evidence.
  - Collector silence, stale observations, failed probes, DNS failures, or network reachability failures must not archive rows.
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
- External probes record only liveness and unverified public-query player counts.
- Owner-authoritative metadata and future FSVotifier telemetry must remain separate from probe observations.
