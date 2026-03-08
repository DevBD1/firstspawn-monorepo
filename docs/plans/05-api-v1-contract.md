# API V1 Contract

## 1. Purpose

This document defines the implementation contract for the first production API version.

Scope:
- Auth + discovery MVP APIs.
- Plugin verification and telemetry ingestion APIs.
- Favorites and moderation baseline.
- Agentic control-plane APIs required for Tier 0/1 rollout.

Explicitly out of scope in v1:
- Public review CRUD (moved to next phase).

## 2. Versioning And Base Paths

- Public API base path: `/api/v1`.
- Breaking changes require `/api/v2`.
- Non-breaking additions are allowed in v1.

## 3. Transport And Formats

- Protocol: HTTPS only.
- Payload format: `application/json`.
- Time format: ISO-8601 UTC timestamps.
- IDs: UUID v4 unless stated otherwise.

## 4. Response Envelope

Successful response:
```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Error response:
```json
{
  "data": null,
  "meta": {
    "request_id": "uuid"
  },
  "error": {
    "code": "STRING_CODE",
    "message": "Human-readable summary",
    "details": {}
  }
}
```

## 5. Authentication Modes

### User Auth
- Bearer JWT access token for protected user endpoints.
- Refresh token rotation required.

### Plugin Auth
- Per-plugin key pair with HMAC signature.
- Required headers:
  - `X-FS-Key-Id`
  - `X-FS-Timestamp`
  - `X-FS-Signature`
- Replay window enforced (for example 5 minutes).

## 6. Pagination, Filtering, Sorting

- Query params:
  - `page` (default `1`)
  - `page_size` (default `20`, max `100`)
  - `sort` (for example `-created_at`)
- List responses include:
  - `meta.page`
  - `meta.page_size`
  - `meta.total`
  - `meta.total_pages`

## 7. Endpoint Catalog (MVP)

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Discovery
- `GET /api/v1/servers`
- `GET /api/v1/servers/{server_id}`
- `GET /api/v1/servers/{server_id}/status`
- `GET /api/v1/tags`

### Favorites
- `POST /api/v1/servers/{server_id}/favorite`
- `DELETE /api/v1/servers/{server_id}/favorite`
- `GET /api/v1/users/me/favorites`

### Moderation Baseline
- `POST /api/v1/reports`

### Plugin Verification And Telemetry
- `POST /api/v1/plugin/heartbeat`
- `POST /api/v1/plugin/playtime-events`
- `GET /api/v1/plugin/keys/{key_id}/status`

### Agentic Control Plane (MVP Tier 0/1)
- `GET /api/v1/agents/runs`
- `GET /api/v1/agents/runs/{run_id}`
- `GET /api/v1/agents/proposals`
- `POST /api/v1/agents/proposals/{proposal_id}/approve`
- `POST /api/v1/agents/proposals/{proposal_id}/deny`

## 8. Error Codes (Baseline)

- `AUTH_INVALID_CREDENTIALS`
- `AUTH_TOKEN_EXPIRED`
- `AUTH_FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `RATE_LIMITED`
- `PLUGIN_SIGNATURE_INVALID`
- `PLUGIN_REPLAY_DETECTED`
- `POLICY_DENIED`
- `INTERNAL_ERROR`

## 9. Rate Limits (Initial)

- Guest: `60 req/min`.
- Authenticated user: `120 req/min`.
- Plugin: `600 req/min` per key with burst controls.
- High-risk endpoints may have stricter limits.

## 10. Idempotency Rules

- Telemetry ingestion endpoints must support idempotency keys:
  - header: `Idempotency-Key`
- Duplicate keys in replay window return prior outcome.

## 11. Observability Requirements

Each request must capture:
- `request_id`
- endpoint and method
- status code and latency
- actor type (`guest`, `user`, `plugin`, `agent`)

Sensitive fields must be redacted from logs.

## 12. Documentation And Contract Governance

- FastAPI OpenAPI spec is the machine-readable contract source.
- This markdown is the human-readable policy layer.
- Any endpoint or schema change requires:
  - OpenAPI update,
  - this document update,
  - changelog entry in the implementation PR.
