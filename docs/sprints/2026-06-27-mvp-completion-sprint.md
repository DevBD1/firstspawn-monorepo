# Sprint: MVP Completion — Jun 27–28, 2026

> Working sprint doc (execution sequencing, not scope). Scope source of truth is
> [`docs/releases/v1-mvp.md`](../releases/v1-mvp.md). This file may go stale — do
> not treat it as canonical. Audited against the repo on 2026-06-26.

**Dates:** Sat Jun 27 → Sun Jun 28, 2026 (2 full days) | **Team:** Burak, solo, with
Claude + Codex running in parallel.

**Sprint Goal:** Make the *complete MVP loop demoable end to end* — a player discovers
a server, copies its address, casts a valid anonymous vote, the vote counts and
attempts Votifier delivery, and the owner sees it in the dashboard. Today the catalog
and collector exist but **the voting loop does not**, so the headline MVP outcome
(`v1-mvp.md` §2 steps 5–7) cannot be demonstrated at all.

---

## Reality check (read this first)

Completing **100% of v1-mvp.md scope in 2 days is not realistic.** The audit below
shows roughly half the MVP is unbuilt, and the unbuilt half includes the hardest,
highest-risk systems (voting integrity, Votifier protocol, async delivery, media
pipeline, admin MFA, retention jobs). That is multi-week work.

What *is* realistic in 2 days with two agents working in parallel: take **one vertical
slice to 100%** — the anonymous voting loop and the surfaces that depend on it. That
slice is the literal core of the product and is currently the biggest hole. The plan at
the bottom commits to that slice and explicitly defers the rest.

Legend: ✅ done · 🟡 partial / needs verification · ❌ not started · ⛔ out of MVP

---

## Full MVP scope checklist (audited against repo)

### §4 Identity & Access
- ✅ Email+password auth — register/login/logout/refresh/me (`apps/api/src/routes/v1/auth.ts`)
- ✅ Email verification tokens (`verificationTokens` table; `auth.ts`)
- ✅ Account deletion request + restore + expedite (`auth.ts`, `user_deletion_requests`)
- ✅ Consent audit logging (`user_consent_audit_logs`)
- 🟡 18+ self-attestation on owner signup / server actions — verify it is enforced, not just UI
- ❌ "Cannot request account deletion while owning a server" guard (§4.2) — verify/enforce

### §5 Catalog & Server Lifecycle
- 🟡 Server CRUD + public read (`servers.ts`: list, `:slug`, geo, stats)
- ❌ Catalog states `draft` / `pending_review` (§5.1) — schema `servers.status` only has
  `active|suspended|archived`; no draft/pending_review
- ❌ Health state `degraded` (§5.1/§10.2) — schema `probe_status` is
  `online|offline|unknown|unreachable`, no `degraded`; 3/12 consecutive-failure state
  machine not implemented
- 🟡 Admin-curated server flow (`admin/servers` create/get/status) — no explicit
  publish→`owner_id=null` claimable step verified
- 🟡 Owner listing flow + MOTD/DNS verification (`listings.ts` verification/token, /check)
- ❌ Claim flow (§5.4) — "claim" hits are JWT claims, not the server-claim request→admin-approve path
- ❌ Public profile edits via immutable revisions + `expected_revision` / `409 REVIEW_STALE` (§5.5) — no revision system
- ❌ Address change requests (§5.6)
- ❌ Delisting / suspended-404 / archived-410 UX (§5.7)

### §6 Owner Dashboard
- 🟡 Owner console exists (`features/console/WLOwnerConsoleClient.client.tsx`) — single client component; verify which data is live vs. mocked
- ❌ Live vote totals (depends on votes), Votifier delivery status, 7-day uptime, request states surfaced

### §7 Admin Panel & Moderation
- ❌ **No admin panel exists** — `features/admin/components/` is empty. A few
  `/api/v1/admin/servers*` endpoints exist but there is no UI to drive them, so the
  admin-curated publish flow (§5.2) **cannot be executed by hand this weekend.**
  Workaround: seed the catalog with a controlled internal script (§5.2 permits this).
- ❌ Admin MFA (TOTP/passkey) (§7.1, §18.1) — no totp/mfa anywhere
- ❌ Immutable audit entries with actor/time/reason/before-after (§7.1) — only basic moderation logs
- ❌ Controlled tag catalog management + probe-version catalog (§7.2)
- ❌ Structured moderation decision → email-outbox item (§7.3)

### §8 Discovery & Ranking
- 🟡 Discover UI + filters (`features/discover`) — verify it reads live public API
- ❌ Default ranking by valid monthly vote count (§8.1) — no votes to rank by
- ❌ Offline-exclusion gate on "Most voted" (§8.1)
- 🟡 Region/version/tag filters — verify against measured data
- ❌ "New & rising" (last 14 days) surface (§8.6)
- ❌ Editorial "Featured" surface w/ audited admin action (§8.6) — `featured` is UI copy only
- ❌ `partnership_status` / founding partner (§8.5) — not in schema
- 🟡 Active Tonight teaser cards (passive, non-clickable) (§8.4) — verify UI-only

### §9 Server Data & Provenance
- ✅ Owner-declared fields (name, desc, country, tags, media, base version) in schema
- 🟡 Collector-measured data (players, version matrix) — heartbeats stored; provenance separation in UI to verify
- ✅ Ping correctly excluded (§9) — `ping_ms` stored but not surfaced as comparable metric

### §10 Collector, Health, Uptime
- ✅ Heartbeat ingestion + idempotency (`collector.ts`, `serverHeartbeats`, hourly/daily rollups)
- ✅ Probe service (`apps/api/src/services/minecraft-probe.ts`, `apps/collector/src/probe.ts`)
- 🟡 5-min cadence, no backoff (§10.1) — verify cadence config
- ❌ Health state machine: 1 success→online, 3→degraded, 12→offline (§10.2)
- ❌ Collector/infra failures excluded from failure counter (§10.2) — **this was the original PLAN.md P0**
- 🟡 7-day uptime score + `100%*` early-data footnote (§10.3) — verify computation & footnote

### §11 Media
- ❌ Presigned S3 upload, validation/finalize, attach to draft (§11.1) — no presigned flow
- ❌ Animated banner MP4 validation/transcode + poster generation (§11.2)

### §12 Anonymous Voting — **CORE LOOP, NOT BUILT**
- ❌ Vote endpoint + `votes` table — no votes table in schema, no endpoint
- ❌ UTC-day uniqueness: IP-HMAC + normalized-username dual unique rules (§12.2)
- 🟡 Turnstile — `features/captcha` exists; ❌ server-side Siteverify wired to a vote (§12.3)
- ❌ Trusted-proxy IP resolution for votes (§12.3)
- ❌ Commit-once-then-deliver semantics (§12.4)
- ❌ Passive fraud-signal recording (§12.5)

### §13 Votifier — NOT BUILT
- ❌ v1 RSA + v2 token protocol support (§13.1)
- 🟡 Votifier config columns on `servers` exist; ❌ candidate test-vote → atomic swap (§13.2)
- ❌ Encrypted-at-rest v2 token, write-only (§13.2)
- ❌ Async idempotent delivery outbox + bounded retries (§13.3)
- ❌ Raw-IP encrypt-in-job + delete-on-delivery (§13.3)

### §14 Voter Leaderboard — NOT BUILT (depends on votes)
- ❌ Per-server top-10 current + previous month
- ❌ "Unverified Minecraft name" labeling, profanity filter, admin hide, 90-day anonymize

### §15 Notifications, Email, Support
- 🟡 Mailer exists (`apps/api/src/services/mailer.ts`); ❌ outbox + retry worker (§15.3)
- ❌ Monthly recap email (§15.1)
- ❌ Telegram admin routing (§15.2)
- ❌ Database-backed support tickets (§15.4) — no support table

### §16 Analytics
- 🟡 Consent table exists; ❌ GA4 + Consent Mode wiring, Weekly Unique Server Intent KPI events (§16)

### §17 Privacy / Legal / Retention
- 🟡 Privacy/terms pages exist (routes); ❌ professionally-reviewed legal docs (launch gate)
- ❌ Automated retention/anonymization jobs (§17.3) — IP-HMAC 48h, names 90d, media 30d, etc.

### §18–19 Production Readiness & Launch Gate
- ✅ CI gates available (`pnpm ci`: lint/typecheck/test/build)
- ❌ Critical-path automated coverage (§18.4) — most paths above don't exist yet
- ❌ Backups/PITR, observability/alerting, restore drills (§18.2–3)
- ❌ 50+ published servers, legal sign-off, security gate (§19)

⛔ Out of MVP (§20): mobile/Bedrock/Hytale, forum/social, reviews/favorites, OAuth,
GlobalPing, advanced analytics, RBAC matrix, Votifier fork, AI discovery — **do not build.**

---

## The 2-day plan

**Goal:** ship the complete anonymous-voting loop *with real Votifier delivery* — the
entire missing middle of §2 (steps 5–7). Day 1 builds and proves the vote loop;
Day 2 makes votes actually reach the game server.

**Capacity:** ~14 working hours (≈7h/day), solo, orchestrating Claude + Codex in
parallel. Split ownership to avoid file collisions: **Codex owns DB + API, Claude owns
web/UX.** The human integrates and reviews at each checkpoint — that's the real
bottleneck, so the plan leaves ~25% slack per day.

**Unblocker (do this first, before anything else):** there is **no admin panel**, so the
admin publish flow (§5.2) can't be run by hand. Use a controlled internal seed script
(§5.2 explicitly permits this) to create a handful of `active` `mc_java` servers — one
owned by a test owner account so the Owner Dashboard has live data, the rest
owner-less. Without this there is nothing to vote on and no dashboard to populate.

### Day 1 (Sat 27) — The vote loop, end to end (no Votifier yet)
| # | Task | Agent | §ref |
|---|------|-------|------|
| 0 | Branch off `main`. Seed script: create active `mc_java` servers (1 owned by a test owner, rest owner-less) to stand in for the absent admin publish flow | Codex | §5.2 |
| 1 | `votes` table + dual UTC-day unique indexes (daily IP-HMAC, normalized MC username) + migration | Codex | §12.2 |
| 2 | `POST /api/v1/servers/:slug/vote`: Turnstile Siteverify, trusted-proxy IP resolution, username normalize/validate, **commit-once-and-count** (Votifier enqueue is a no-op stub today, wired Day 2) | Codex | §12.3–4 |
| 3 | Daily IP-HMAC storage w/ 48h retention; passive fraud-signal columns (no enforcement) | Codex | §12.2/5, §17.3 |
| 4 | Monthly + all-time vote counters; **"Most voted this month"** ranking on public servers list; exclude `offline` servers from the ranked surface only | Codex | §8.1 |
| 5 | Wire `features/captcha` Turnstile widget into a real vote form on Server Detail; success/duplicate/error states | Claude | §12.1/3 |
| 6 | Per-server top-10 leaderboard (current + previous UTC month) with **"Unverified Minecraft name"** labels + username format/profanity filter | Claude | §14 |
| 7 | Owner Dashboard: live monthly + all-time vote totals for owned servers | Claude | §6 |
| 8 | Critical-path tests: vote uniqueness (both rules), UTC-day reset, Turnstile fail = no vote, commit-once | both | §18.4 |

**Day-1 checkpoint (must be green before Day 2):**
- Discover → Server Detail → copy address → vote (Turnstile) → counted exactly once per UTC day
- Second vote same day (same IP **or** same username) is rejected cleanly
- Vote reorders "Most voted this month"; offline servers drop from that surface but stay in search/detail
- Leaderboard + Owner Dashboard totals render live
- `pnpm ci` green

### Day 2 (Sun 28) — Votifier, for real (§13)
| # | Task | Agent | §ref |
|---|------|-------|------|
| 9 | Votifier **v1 RSA** + **v2 token** wire protocol (use/verify against an existing NuVotifier-compatible plugin) | Codex | §13.1 |
| 10 | Config flow: owner saves candidate → FirstSpawn sends **test vote** → only success atomically swaps active config; failed candidate never breaks the working one | Codex | §13.2 |
| 11 | v2 token **encrypted at rest**, write-only (never returned after save); config changes audited | Codex | §13.2 |
| 12 | Async **idempotent delivery outbox** + bounded retries; raw IP **encrypted inside the job only**, deleted on success or after the retry window (≤24h) | Codex | §13.3 |
| 13 | Wire Day-1 vote commit → enqueue delivery job (replace the stub from task 2); servers without Votifier still count votes + show "in-game reward not enabled" | Codex | §12.4/13 |
| 14 | Owner Dashboard: Votifier config UI + test-vote button + delivery status / last-failure surface | Claude | §6, §13.3 |
| 15 | E2E: vote → delivery job → real test plugin receives it; tests for test-vote swap + delivery idempotency/retry | both | §18.4 |

**Day-2 checkpoint / Definition of Done:**
- [ ] Owner saves a Votifier config; a failed candidate leaves the live config untouched
- [ ] A real vote is delivered to a NuVotifier-compatible test plugin (v1 **and** v2)
- [ ] Delivery is async + idempotent with bounded retries; raw IP never persists past delivery/retry window
- [ ] v2 token is encrypted and never re-displayed
- [ ] Servers without Votifier still count votes and say so in the UI
- [ ] Owner Dashboard shows live vote totals **and** Votifier delivery status
- [ ] `pnpm ci` green; new tests passing; merged via PR off `main`

### Explicitly deferred (NOT this sprint)
Admin panel + admin-driven publish/moderation (§5.2, §7) — **blocked, no UI**; health
state machine degraded/offline 3-of-12 (§10.2 — Day-1 offline gate uses existing
`probe_status='offline'`); server revisions/edit moderation (§5.5); address change
(§5.6); claim flow (§5.4); media upload (§11); support tickets (§15.4); admin MFA (§7.1);
audit system (§7.1); featured/new-rising surfaces (§8.6); email outbox/recap (§15.1/3);
retention jobs beyond the 48h IP-HMAC (§17.3); GA4 (§16); backups/observability (§18.2–3).

### Risks
| Risk | Mitigation |
|------|------------|
| No admin panel = nothing to vote on | Seed script (task 0) is the **first** thing built; everything depends on it |
| Votifier protocol depth eats all of Day 2 | Day 1 is a complete, demoable loop on its own (votes count, rank, leaderboard). If Votifier slips, Day 1 still ships value; delivery worker can degrade to test-vote-only |
| Two agents collide on `schema.ts` / `servers.ts` | Codex owns DB+API, Claude owns web; sync at each checkpoint, not continuously |
| Vote integrity subtle (UTC reset, HMAC, trusted proxy) | Write the uniqueness/Turnstile tests (task 8) as you build, not after |
| Human review is the bottleneck, not agent output | ~25% slack/day; if behind, drop the leaderboard (task 6) before the vote loop or Votifier |
