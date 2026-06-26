# Day-1 Vote Loop — Shared API Contract

> The integration glue between the **API/DB** side (Codex) and the **web** side
> (Claude). Both sides build to these exact shapes. Changes here must be agreed by
> both. All JSON is `snake_case`. All responses use the existing envelope
> (`apps/api/src/lib/envelope.ts`): success `{ data, meta:{request_id}, error:null }`,
> error `{ data:null, meta, error:{ code, message, details } }`.

## 1. Cast a vote

`POST /api/v1/servers/:slug/vote`

**Routing (decided after repo recon):** the browser cannot call the API directly — the
API sits behind basic auth and the web mutates via **Next.js Server Actions** (see
`apps/web/src/app/actions/`). So the vote goes: browser → Next Server Action
`castVote` (BFF) → API. The BFF:
- authenticates to the API with basic auth (existing `getApiBasicAuthHeader()` pattern),
- forwards the real client IP via `X-Forwarded-For` (read from the BFF's own incoming
  request `headers()`), which the API's **existing** `trustProxy` config
  (`apps/api/src/server.ts`, `TRUSTED_PROXY_CIDRS`) resolves to `request.ip`.

Per §12.3 the **API** performs Turnstile Siteverify (validates action + hostname,
single-use, ≤5min) and computes the daily IP-HMAC from the resolved `request.ip`. The
web only renders the widget using `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; the
`TURNSTILE_SECRET_KEY` lives on the **API** side. The web egress IP must be in
`TRUSTED_PROXY_CIDRS` for XFF to be honored.

**Request body**
```json
{ "username": "Notch", "turnstile_token": "0.abc..." }
```

**Success `201`** — `data`:
```json
{
  "vote": {
    "server_slug": "hypixel",
    "username_normalized": "notch",
    "voted_on": "2026-06-27",
    "votes_this_month": 1421,
    "votes_all_time": 33890
  }
}
```

**Errors** (HTTP status + `error.code`):
| Status | code | When |
|--------|------|------|
| 400 | `INVALID_USERNAME` | fails MC Java username format / profanity deny-list |
| 400 | `TURNSTILE_REQUIRED` | token missing |
| 403 | `TURNSTILE_FAILED` | Siteverify failed / action or hostname mismatch / token reused or >5min |
| 404 | `SERVER_NOT_FOUND` | no active server for slug |
| 409 | `ALREADY_VOTED_TODAY` | either UTC-day uniqueness rule hit (IP-HMAC or username) |
| 422 | `SERVER_NOT_VOTABLE` | server suspended/archived |
| 429 | `RATE_LIMITED` | rate/velocity limit |

`409` is the normal "you already voted" path — the web treats it as a soft, friendly
state, not an error toast.

## 2. Vote-count ranking on the public list

Extend `GET /api/v1/servers` (existing handler in `apps/api/src/routes/v1/servers.ts`):

- Add `sort=most_voted` and **make it the default** (`PublicServerSort` becomes
  `"most_voted" | "players" | "ping"`). Public label: **"Most voted this month."**
- Add to every `PublicServerListItem` **and** `PublicServerDetail`:
  ```json
  "votes_this_month": 1421,
  "votes_all_time": 33890
  ```
- Also add to `PublicServerDetail` only: `"votifier_enabled": false` — a public-safe
  boolean (the existing `servers.votifier_enabled` column, **not** the private config)
  that drives the §12.4 "in-game reward delivery is not enabled" note on the vote form.
- Ranking = valid votes in current UTC month, desc. Tie → server that reached the count
  earlier, then stable deterministic fallback. Zero-vote servers → deterministic
  UTC-day + server-id rotation (§8.1).
- **Offline gate:** servers with `freshness_status="offline"` are excluded from the
  `most_voted` ranked surface **only**. They remain in search, filters, other sorts, and
  their detail page (§8.1/§8.2). (Day 1 uses existing `probe_status='offline'`; the full
  3-of-12 health state machine is deferred.)

## 3. Per-server voter leaderboard

`GET /api/v1/servers/:slug/leaderboard?month=current|previous` (default `current`).

**Success `200`** — `data`:
```json
{
  "month": "2026-06",
  "finalized": false,
  "entries": [
    { "rank": 1, "username": "notch", "votes": 42 }
  ]
}
```
- Top 10 only. `finalized=true` for the previous, closed month.
- `username` is the normalized MC name; the **web** labels every entry "Unverified
  Minecraft name." Format validation + profanity filter applied before it is returned.
- `404 SERVER_NOT_FOUND` for unknown/non-public slug.

## 4. Owner dashboard vote totals

Extend `GET /api/v1/listings/mine` (the owner's servers). Add to each owned server:
```json
"votes_this_month": 1421,
"votes_all_time": 33890
```
(Votifier delivery status is added here on Day 2.)

## Web ownership notes (Claude)
- New web API client fns live in `apps/web/src/lib/servers-api.ts` (`castVote`,
  `fetchLeaderboard`) and extend `PublicServerListItem`/`PublicServerDetail` with the two
  vote fields. The leaderboard component (background agent) uses its **own** file
  `apps/web/src/features/server/lib/leaderboard-api.ts` to avoid editing `servers-api.ts`
  concurrently; integrated at the Day-1 checkpoint.
- i18n keys (en/tr/de + `schema.ts`) are owned by the main thread to avoid concurrent
  edits; components take display strings via props/dictionary at integration.
