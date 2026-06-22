# FirstSpawn Product

> Status: approved MVP scope, frozen on 2026-06-22.
>
> This document defines the target product. It does not claim that every
> requirement is implemented. Service READMEs describe current runtime and
> endpoint state; `packages/database/schema-design.md` describes the current
> canonical database design. `PLAN.md` must be derived from this scope and must
> not silently redefine it.

## 1. Product Direction

FirstSpawn is a discovery and trust platform for game servers. The first public
release is a web-first Minecraft Java server discovery and voting platform.
Other games and platforms come only after the first discovery loop is reliable.

The product should help players find communities worth joining and help server
owners earn attention through useful, transparent signals instead of purchased
rank.

### 1.1 Core Principles

- Discovery rank is not for sale.
- Votes measure current community engagement and popularity; they are not a
  claim of identity, quality, or trust.
- Trust comes from separate evidence: verified control, measured uptime,
  moderation history, and later optional plugin telemetry.
- Measured data and owner-declared data must remain visibly distinct.
- Familiar low-friction server-list behavior is more important than forcing
  account creation.
- Public, owner, admin, and operational concerns must remain separate.
- Available features must be concrete; future features must not masquerade as
  working product.

## 2. MVP Outcome

The MVP must provide one complete loop:

1. A server enters the catalog through admin curation or verified owner listing.
2. An admin reviews public catalog content before publication.
3. The collector measures current availability, player count, uptime, and
   supported Minecraft client versions.
4. A player discovers and evaluates the server.
5. The player copies the address or submits a low-friction anonymous vote.
6. FirstSpawn records the valid vote and attempts Votifier delivery when the
   server has configured it.
7. The owner sees catalog, vote, and delivery results in the Owner Dashboard.

### 2.1 MVP Users

- **Anonymous player:** browses, filters, evaluates, copies an address, and
  votes without a FirstSpawn account.
- **Server owner:** uses an email-verified account to list or claim one or more
  servers and manage approved server data.
- **Admin:** curates the catalog, moderates requests, manages controlled data,
  and handles operational support.

There is one owner per server in the MVP. Staff accounts, team roles, and
account-to-account server transfers are not included.

## 3. Platform, Locales, and Product Surfaces

### 3.1 Supported Platform

- Web is the only shipped client.
- Minecraft Java (`mc_java`) is the only supported game platform.
- Mobile apps, Minecraft Bedrock, Hytale, and other games are post-MVP.

### 3.2 Locales

- Public web and Owner Dashboard: English (`en`), Turkish (`tr`), and German
  (`de`).
- Admin panel: English only.
- Other structurally available locales remain unpublished until translation
  and QA are complete.

### 3.3 MVP Navigation

Navigation exposes only working surfaces:

- Discover
- List Your Server
- Owner Dashboard
- Authentication and account controls

Community, Loot, forum, social, and other future sections do not appear in the
MVP navigation.

## 4. Identity and Access

### 4.1 Owner Authentication

- Email and password only.
- Google, Discord, Microsoft, and other OAuth providers are out of scope.
- Email verification is required before listing or claiming a server.
- Owner signup and server-management actions require an 18+ self-attestation.
- Public browsing does not collect age information.
- Anonymous voting does not create a child profile or collect date of birth.
- Legal review before public beta determines whether voting requires an
  additional age confirmation in launch jurisdictions.

### 4.2 Account and Ownership Constraints

- A user cannot submit an account deletion request while owning a server.
- The MVP exit path is: delisting request, admin approval, archive, removal of
  `owner_id`, then account deletion.
- A server cannot be transferred to another account in the MVP. Exceptional
  cases use manual support until a future transfer system exists.
- Hard deletion of a server is an exceptional admin operation for a verified
  legal or data requirement, not an owner-facing feature.

## 5. Catalog and Server Lifecycle

### 5.1 Catalog States

The product needs lifecycle states that distinguish unpublished work,
moderation, public catalog status, and measured health.

- `draft`: incomplete owner or admin work; not public.
- `pending_review`: technically verified content awaiting admin review; not
  public.
- `active`: publicly discoverable and collected.
- `suspended`: removed from discovery and voting by moderation; not collected.
- `archived`: deliberately removed from the live catalog; not collected.

Measured health (`online`, `degraded`, `offline`) is separate from catalog
status. Collector failures never archive or suspend a server.

### 5.2 Admin-Curated Server Flow

Admin-created servers follow:

1. Create draft.
2. Enter public metadata.
3. Confirm collector reachability.
4. Explicitly publish.
5. Set `owner_id = null`, making the server claimable.

Bulk-import UI is not included. A controlled, auditable internal seed/import
script may be used to establish the launch catalog.

### 5.3 Owner Listing Flow

Owner-created servers follow:

1. Verified owner account starts a listing.
2. Owner proves technical control through MOTD or DNS verification.
3. Successful technical verification creates a moderation request.
4. Admin reviews public content.
5. Approval activates the listing; rejection includes an owner-facing reason.

Technical control verification and public-content moderation are distinct
decisions. Successful technical verification does not publish content.

### 5.4 Claim Flow

- Only an active or otherwise eligible catalog server with `owner_id = null`
  can be claimed.
- The claimant completes MOTD or DNS technical verification.
- Verification creates a claim request for admins; it does not assign ownership
  automatically.
- Admin approval assigns the owner.
- Claimed content remains subject to the normal moderation rules.

### 5.5 Public Profile Edits

- The current approved revision remains live while an owner edits.
- A server may have only one active pending public edit draft.
- The owner may update that draft before review.
- Every save creates a new immutable revision number.
- Admin reviews revision `N` and approves with `expected_revision = N`.
- If the owner has created `N+1`, the API transaction rejects the stale
  approval with `409 REVIEW_STALE`.
- Admin must reload and review the newest revision.
- Previous revisions are retained for audit.

Public fields include name, descriptions, logo, cover image, gallery/media,
animated banner, owner-declared base version, hosting country, tags, and other
catalog content. Owners may declare at most three server languages from a
controlled language list.

### 5.6 Address Changes

- Host or port changes use a separate request.
- The candidate address must pass MOTD or DNS control verification again.
- Admin reviews the change.
- The currently approved address remains live until the new address is
  approved.

### 5.7 Delisting, Suspension, and Archive UX

- Owners may request delisting but cannot directly archive or delete a server.
- Admin approval archives the server and preserves vote and audit history.
- `suspended` detail routes return a custom informational HTTP 404 with
  `noindex`, a generic listing-unavailable message, no join/vote action, and no
  public moderation reason. The owner sees the real reason in the dashboard.
- `archived` detail routes return a custom informational HTTP 410 Gone page. It
  may show the server name, archived status, and a Discover link, but not join
  or vote actions.
- Draft and pending listings behave as public 404s.
- Appeals use the support system. A formal appeal product is post-MVP.

## 6. Owner Dashboard

The Owner Dashboard is part of the MVP and includes:

- Owned servers and their catalog/moderation status.
- Current measured online player count.
- Current health and last measurement time.
- Seven-day uptime score.
- Current-month and all-time vote totals.
- Votifier configuration and delivery status.
- Listing, claim, edit, address-change, and delisting request state.
- Public profile editing through moderated drafts.
- Private founding-partner status when applicable.
- Support requests and replies.

Advanced historical charts, growth analytics, ping charts, staff management,
and owner-to-owner transfers are not included.

## 7. Admin Panel and Moderation

### 7.1 Architecture and Access

- The admin panel may run on a different host from the API and database.
- It communicates only through authenticated API endpoints and never connects
  directly to the database.
- MVP has a single `admin` role. A moderator/RBAC matrix is post-MVP.
- Admin MFA is mandatory through TOTP or passkey.
- All critical admin actions produce immutable audit entries with actor, time,
  reason, and before/after values.
- Admins cannot edit or delete audit entries.

### 7.2 Admin Responsibilities

- Create, review, publish, suspend, unsuspend, and archive listings.
- Review new listings, claims, public edits, address changes, and delisting
  requests.
- Manage the allowed probe-version catalog through API-backed settings.
- Manage the controlled tag catalog. Owners select at most four tags; free-text
  tags are not allowed.
- Manage support requests and verified data-rights requests.
- View operational delivery failures and notification history.

An admin may directly correct an owned public listing only for moderation or
data-quality reasons. The action requires a reason, before/after audit, and an
owner transactional email.

### 7.3 Moderation Decisions and Email

Admin decisions use structured fields rather than a free-form outbound email:

- approve or reject
- reason category
- required owner-facing note for rejection
- optional internal note

The API transaction records the decision and creates an email-outbox item. A
worker sends and retries the message. The Owner Dashboard remains the detailed
source of truth; email may simply state that the request was resolved and link
to the dashboard.

## 8. Discovery and Ranking

### 8.1 Default Ranking

- Default discovery order is valid vote count in the current UTC calendar
  month.
- The public label is **Most voted this month**, never “most trusted.”
- Counts reset for ranking at 00:00 UTC on the first day of each month.
- The previous month finalizes automatically at the boundary; there is no
  provisional admin review window.
- All-time vote totals remain available.
- Online, degraded, offline, uptime, partner status, plugin usage, and paid
  placement do not boost or penalize this rank.
- A tie is won by the server that reached the tied count earlier, followed by a
  stable deterministic fallback.
- Zero-vote servers use a deterministic UTC-day plus server-ID rotation. The
  order is stable within a day and changes daily to avoid permanent cold-start
  placement.

### 8.2 Filters and Search

- Most-voted sorting can be combined with region and measured supported-version
  filters.
- Region is derived from the owner-declared hosting country and is explicitly
  labeled as owner-declared.
- There is no automatic geolocation or geo-personalized ranking in the MVP.
- Version filters use collector-measured supported client versions.
- A server without a measured version matrix remains in general Discover but
  is excluded from a specific version filter.
- Controlled tags are filterable, with at most four tags per server.
- Up to three server languages are owner-declared from a controlled list and
  displayed as owner-declared metadata.
- Search zero-result events are measured for product improvement.

### 8.3 Discovery Surfaces

- Discover result rows show the information needed to choose a server and may
  play the animated banner only while visible in the viewport.
- Quick Peek uses a static poster and provides a compact decision surface.
- Server Detail shows full catalog information, current health, last
  measurement, uptime, version provenance, copy/join action, voting, and the
  server-specific voter leaderboard.
- `prefers-reduced-motion` always receives static media.

### 8.4 Active Tonight

Active Tonight is a future paid event-placement product. It will eventually
allow servers with active or upcoming limited-time events to rent clearly
disclosed sponsored slots without changing Discover rank.

The MVP contains only passive, non-clickable unrevealed teaser cards. Payments,
checkout, reservations, event verification, inventory, and admin sales tooling
are not implemented.

### 8.5 Founding Partners

- Database status: `partnership_status`, including `none` and
  `founding_partner`.
- Status is visible privately in the Owner Dashboard during the MVP.
- A public partner badge is post-MVP.
- Partner status never changes discovery rank.

## 9. Server Data and Provenance

### 9.1 Owner-Declared Data

- Server name and descriptions.
- Hosting country and derived region.
- Base Minecraft version.
- Up to three server languages.
- Tags and public media.
- Other approved profile content.

### 9.2 Collector-Measured Data

- Current online, degraded, or offline state.
- Current and maximum player counts when available.
- Last measurement time.
- Seven-day uptime.
- Supported Minecraft client versions.

The owner-declared base version and measured supported versions are separate.
A server may run one base version while accepting newer or older clients. A
future Community Notes system may challenge incorrect owner declarations; it is
not part of the MVP.

Ping is explicitly excluded until the GlobalPing implementation can provide
healthy, comparable measurements.

## 10. Collector, Health, and Uptime

### 10.1 Probe Cadence

- Probe every active catalog server every five minutes, including currently
  offline servers.
- Do not use adaptive backoff in the MVP.
- Suspended and archived servers are not probed.
- Run the supported-version matrix at publication, every 24 hours, after an
  approved address change, and after an admin version-catalog update.

### 10.2 Health State

- One valid success sets the server directly to `online`.
- Three consecutive valid server-side failures set it to `degraded`.
- Twelve consecutive valid server-side failures set it to `offline`.
- Later valid success returns it directly to `online`.
- FirstSpawn collector or infrastructure failures do not increase the server's
  failure counter.
- The UI always shows the last measurement time.

### 10.3 Uptime Score

- Rolling window: last seven days.
- Minimum: one valid probe, allowing a new listing to show uptime immediately.
- Before 24 valid probes, show a trailing conventional footnote, for example
  `100%*`, with a tooltip such as “Early data — N valid probes; fewer than 24.”
- Remove the footnote after 24 valid probes.
- Real server-side failures count as downtime, including maintenance, timeout,
  refused connection, and DNS failure.
- FirstSpawn collector/infrastructure failures are excluded.
- Uptime remains visible while a server is offline and never changes discovery
  rank.

The data model must retain valid probe observations, including failures.
Success-only heartbeats plus a current failure summary are not sufficient for
an auditable uptime score.

## 11. Media

### 11.1 Upload Model

- Owners upload media directly to FirstSpawn-controlled object storage.
- The API issues a presigned upload URL; the browser uploads directly to an
  S3-compatible store.
- The API validates, finalizes, and attaches the object to a moderated draft.
- The API does not proxy media bytes.
- External image URLs are not accepted as profile media.

### 11.2 Media Types

- `logo`: static.
- `cover_image`: static responsive cover for card/detail composition.
- Gallery/media: static supporting images.
- `animated_banner`: separate conventional server-list banner.

Static formats are JPEG, PNG, and WebP. SVG is rejected.

Animated banners:

- MP4 only; GIF and SVG are rejected.
- Maximum file size: 500 KB.
- No user-facing duration limit.
- No audio track.
- Bounded resolution and maximum 30 FPS.
- Safe codec validation/transcoding with processing time and memory limits.
- A static poster is always generated.

Animated banner playback is limited to viewport-visible Discover results and
the Server Detail page. Quick Peek and landing surfaces use the poster. Playback
pauses outside the viewport.

## 12. Anonymous Voting

### 12.1 Player Flow

- No FirstSpawn login is required.
- The player enters a Minecraft Java username and presses Vote.
- Minecraft/Microsoft account ownership is not verified in the MVP.
- A verified player identity is a future member feature.

### 12.2 UTC-Day Uniqueness

One valid vote per server per UTC calendar day is enforced by two independent
unique rules:

1. server + UTC date + daily HMAC of resolved client IP
2. server + UTC date + normalized Minecraft username

The limit resets at 00:00 UTC, not after a rolling 24-hour duration.

### 12.3 Turnstile and Client IP

- Every anonymous vote requires Cloudflare Turnstile.
- The API performs server-side Siteverify and validates action and hostname.
- Tokens are treated as single-use and valid for no more than five minutes.
- A failed Turnstile check creates no vote.
- Client IP is resolved only through a configured trusted proxy chain.
- Arbitrary `X-Forwarded-For` values are never trusted.

### 12.4 Vote Commit and Delivery

- A valid vote is committed and counted exactly once before Votifier delivery.
- Votifier delivery is asynchronous through an idempotent outbox/queue with
  bounded retries.
- Delivery failure does not remove or recount the vote and does not ask the
  player to vote again.
- Servers without Votifier still receive FirstSpawn votes; the UI states that
  in-game reward delivery is not enabled.

### 12.5 Vote Integrity Position

Anonymous votes are not described as trusted identities. MVP enforcement is
limited to deterministic input rules, Turnstile, rate limits, and the two daily
uniqueness constraints.

There is no complex fraud decision engine, provisional monthly review, or
routine manual suspicious-vote invalidation in the MVP. Exceptional legal or
data-correction operations require an audited admin action.

The platform passively records signals for future fraud design:

- rate and velocity
- Turnstile and rate-limit rejection patterns
- rotating pseudonymous HMAC patterns
- ASN and country concentration
- repeated usernames
- deviations from the server's baseline

These signals do not automatically invalidate votes in the MVP.

## 13. Votifier

### 13.1 Compatibility

- Support Votifier v1 RSA payloads and v2 token payloads.
- Existing VotifierPlus/NuVotifier-compatible plugins must work.
- One FirstSpawn server listing has one active Votifier endpoint.
- Network forwarding and downstream server topology remain the owner's
  responsibility.

### 13.2 Configuration

- Votifier host, port, protocol, public key/token, and delivery details are
  private and never public catalog data.
- Private integration settings do not require content moderation.
- The owner saves a candidate configuration and FirstSpawn sends a test vote.
- Only a successful test atomically replaces the active configuration.
- A failed candidate never breaks a working configuration.
- Configuration changes are audited.
- V2 tokens are encrypted at rest and are not displayed again after saving.

### 13.3 Delivery Data

Votifier payload compatibility requires the voter's address. FirstSpawn does
not retain permanent raw vote IPs:

- Raw IP is encrypted inside the delivery job only.
- It is deleted immediately after successful delivery.
- It is deleted after the bounded retry window, no later than 24 hours, on
  terminal failure.
- The permanent vote record contains no raw IP.

Critical delivery failures notify admins and remain visible to the owner.

### 13.4 FirstSpawn Plugin Fork

A FirstSpawn-branded Votifier fork is a separate post-MVP deliverable and is not
a public-beta blocker. It should launch only with genuine differentiation, such
as easier setup/test flows, optional telemetry, and richer dashboard data.

Using the FirstSpawn plugin may unlock a telemetry indicator or richer private
dashboard, but it never grants a direct ranking boost.

## 14. Server-Specific Voter Leaderboard

Each Server Detail page exposes two public lists for that server only:

- current UTC month, live
- previous UTC month, finalized

Each list contains the top 10 normalized Minecraft names and vote counts. There
is no global player leaderboard, pagination, or older public month archive in
the MVP.

- Every name is labeled as an **Unverified Minecraft name**.
- The product does not claim that the voter owns that Minecraft identity.
- Username format validation and a deny/profanity filter apply before public
  display.
- Admin may hide an abusive entry through an audited action.
- Complaints use the support channel.
- Identifiable voter names are anonymized after 90 days; anonymous aggregates
  may remain.

The leaderboard supports owner-run monthly rewards but does not prove reward
eligibility or identity.

## 15. Notifications, Email, and Support

### 15.1 Owner Email

Transactional email includes:

- email verification and account recovery
- moderation outcome
- support-ticket update
- one consolidated monthly recap for all owned servers

The monthly recap includes monthly valid votes, finalized rank, all-time total,
Votifier delivery summary, and a dashboard link. Utility email has an opt-out
where legally appropriate. Promotional content requires the relevant marketing
consent.

There is no generic owner notification center in the MVP; detailed workflow
state lives in the Owner Dashboard.

### 15.2 Admin Notifications

Every owner moderation request creates an admin notification:

- new listing
- claim
- public profile edit
- address change
- delisting

Critical Votifier delivery failures also notify admins.

Admins may enable Telegram routing per event type. Telegram is outbound-only
and contains a summary plus a secure admin-panel link. Approval and other admin
actions never happen inside Telegram.

### 15.3 Email Infrastructure

- Use a managed outbound email provider; do not operate a production mail
  server.
- `support@firstspawn.com` is a managed/forwarded external address for account
  access, security, privacy, and legal requests.
- Email sending uses an outbox and retry worker.

### 15.4 Database-Backed Support

- Authenticated owners open and read support requests in the dashboard.
- Admins manage the queue and reply from the admin panel.
- Ticket messages and state live in the FirstSpawn database.
- Email only announces that a ticket changed and links back to the dashboard.
- File attachments, live chat, SLA automation, and a standalone appeal product
  are out of scope.

## 16. Analytics and Growth Measurement

### 16.1 Tooling Boundary

- GA4 is the MVP web analytics tool.
- PostHog is not part of the MVP analytics stack.
- Google Ads conversions may use GA4 key events and attribution.
- Basic Consent Mode is used: GA4 and Ads tags do not run before analytics
  consent.
- GA4 measures consented behavior and trends; it is not an operational ledger.
- FirstSpawn never creates an essential first-party tracking identifier to
  bypass a user's analytics choice.

### 16.2 Primary KPI

**Weekly Unique Server Intent** is one unique combination of:

- consented visitor
- server ID
- UTC week

The qualifying action is either server-address copy or valid vote. If the same
visitor performs both or repeats either action for the same server in the same
week, it still counts as one intent. The metric is directional because
non-consenting traffic is intentionally absent.

### 16.3 Supporting Measurements

- Unique visitors and page views.
- Landing/Discover to Quick Peek or Server Detail.
- Server Detail to address copy.
- Vote form to valid vote.
- D7 and D30 return for consented traffic.
- Verified owner signup.
- Listing and claim start/completion.
- Approved listings.
- Admin decision time.
- Votifier delivery success.
- Fresh catalog and collector coverage.
- Search zero-result rate.

`new_signup` alone is not a primary success metric; owner verification and
listing/claim conversion provide the useful context.

### 16.4 Acquisition Taxonomy

All forum, partner, newsletter, social, and campaign links use a shared UTM
standard:

- lowercase `snake_case`
- required `utm_source`
- required `utm_medium`
- required `utm_campaign`
- `utm_content` only when a creative or placement must be distinguished

GA4 is used to compare acquisition, activation, retention, supply growth, and
marketing efficiency across SEO, referral, forum, partner, direct, and paid
channels.

### 16.5 GA4 Versus FirstSpawn Data

| Measurement | GA4 role | FirstSpawn database role | Authority |
| --- | --- | --- | --- |
| Traffic source, SEO, referrals, UTM | Channel analysis | Not required | GA4, directional |
| Page views and product funnels | Consented behavior | Not stored as product ledger | GA4, directional |
| Address copy | Consented event | Not stored | GA4, directional |
| Weekly Unique Server Intent | Consented deduplication | Exact valid-vote component only | GA4, directional |
| Valid votes and monthly totals | Funnel event | Vote record and exact counters | Database |
| Vote uniqueness and fraud signals | Never sent | HMAC rules and protected signals | Database |
| Signup, listing, and claim | Funnel analysis | Exact state and counts | Database |
| Votifier delivery | Optional summary event | Queue, retry, and result | Database |
| Uptime and collector state | Not sent | Probe history and score | Database |
| Moderation | Optional anonymous funnel | Decision and immutable audit | Database |
| D7/D30 return | Consented behavior | Not an MVP retention warehouse | GA4, directional |

GA4 never receives email, IP, Minecraft username, server address, Votifier
credentials, or other direct identifiers. It receives only anonymous behavior,
opaque server IDs, locale, filter, and acquisition context.

## 17. Privacy, Legal, and Data Lifecycle

### 17.1 Public-Beta Legal Gate

Public beta requires jurisdiction-appropriate, professionally reviewed:

- Terms of Service
- Privacy Policy
- Cookie and analytics consent notice
- Server listing and content rules
- Abuse, copyright, security, and data-request process

The MVP does not include child profiles, messaging, gamified rewards, or onsite
behavioral advertising.

### 17.2 Data Subject Requests

- Account deletion follows the ownership constraints in this document.
- Access, export, correction, objection, and exceptional deletion requests use
  `support@firstspawn.com` and a verified admin operation.
- There is no self-service “download my data” feature in the MVP.
- Identity verification, action, deadline, and result are recorded in the admin
  panel.

### 17.3 Retention Baseline

Retention must be category-specific and enforced through automated deletion or
anonymization jobs. “Keep forever” is not the default.

| Data category | MVP retention rule |
| --- | --- |
| Encrypted raw IP in Votifier job | Delete on success or terminal failure; maximum 24 hours |
| Daily vote-uniqueness IP HMAC | 48 hours |
| Detailed pseudonymous fraud signals | 90 days, then anonymous aggregates only |
| Public voter Minecraft names | 90 days, then anonymize |
| Unused or rejected media | 30 days |
| Email delivery logs | 90 days |
| Security/authentication logs | 180 days |
| Closed support tickets and messages | 24 months |
| Vote aggregates, archived listings, required audit | Preserve without unnecessary personal data while operationally or legally required |

Verified legal holds and mandatory legal retention may suspend the normal
deletion job for the affected record only.

## 18. Production Readiness

### 18.1 Environment and Security

- Staging and production are isolated.
- TLS is mandatory for public and administrative traffic.
- Secrets remain server-side and use managed secret storage/rotation.
- Services and database credentials follow least privilege.
- Public and authenticated endpoints use appropriate rate limits.
- Admin MFA is mandatory.
- No unresolved critical security finding or known data-loss path may ship.

### 18.2 Backups and Recovery

- PostgreSQL backups are encrypted.
- Point-in-time recovery is available.
- Public-beta targets: recovery point objective no worse than one hour and
  recovery time objective no worse than four hours.
- Restore drills are scheduled and must prove that backups are usable.

### 18.3 Observability and Alerting

- Web, API, collector, queue workers, and email jobs emit centralized logs and
  health/error signals.
- Critical failures alert admins and may route to Telegram.
- Product analytics remains separate from operational observability.

### 18.4 Delivery Quality Gates

CI must pass before deployment:

- lint
- typecheck
- tests
- production build
- migration validation

Automated critical-path coverage includes:

- signup and email verification
- listing verification and moderation
- claim
- vote uniqueness, Turnstile, commit, and outbox
- Votifier configuration test and delivery
- stale moderation revision rejection
- media upload/finalization
- suspension and archive behavior

## 19. Public-Beta Launch Gate

Public beta opens only when all of the following are true:

- More than 50 active Minecraft Java servers from founding partners and
  controlled admin curation are published.
- Every launch-gate server has completed at least one valid collector success.
- Discover, detail, address copy, anonymous voting, Votifier, owner listing,
  claim, moderation, Owner Dashboard, admin panel, support, and email critical
  paths pass acceptance tests.
- Required legal documents and consent behavior are approved.
- Backup/restore, monitoring, alerting, and security gates are satisfied.
- Production has no known critical security issue or data-loss risk.

### 19.1 Success Measurement

The primary product KPI is Weekly Unique Server Intent. Supporting launch health
uses:

- valid vote volume
- address-copy conversion
- D7/D30 return
- verified owner signup and listing/claim completion
- admin decision time
- Votifier delivery success
- collector freshness and uptime coverage
- search zero-result rate
- page and API reliability

## 20. Explicitly Out of MVP

- Mobile app, Minecraft Bedrock, Hytale, and other games.
- Forum, social graph, direct messaging, community feed, and Loot surfaces.
- Gamified vote rewards and verified player identity.
- Reviews, favorites, Community Notes, and a general public report queue.
- Owner teams, staff roles, and account-to-account server transfer.
- Google/Discord/Microsoft OAuth.
- GlobalPing and public ping measurements.
- Advanced owner charts and analytics warehouse features.
- Geo-personalized discovery.
- Adaptive collector backoff.
- Complex fraud scoring, automatic fraud invalidation, and routine manual
  suspicious-vote review.
- Global player leaderboard, leaderboard pagination, and older public monthly
  archives.
- Paid Active Tonight sales, payments, reservations, or event verification.
- Public founding-partner badges or any partner/plugin ranking advantage.
- Generic badge system.
- Bulk-import admin UI.
- Full RBAC/moderator role matrix.
- Formal appeal workflow and live support.
- FirstSpawn Votifier fork as a launch dependency.
- FirstSpawn-native plugin telemetry as a launch dependency.
- AI-assisted discovery as a required MVP workflow.
- Permanent server deletion by owners.

## 21. Scope Governance

This scope is frozen before sprint planning.

- New ideas enter the post-MVP backlog by default.
- A new item enters the MVP only when it fixes a production blocker or replaces
  equivalent approved work.
- No roadmap, sprint, or implementation task may silently broaden this scope.
- Necessary technical work that directly enables an approved requirement is in
  scope even when it is not a public-facing feature.
- Product changes must update this document; UI/UX changes must also update
  `DESIGN.md`, and schema/runtime changes must update their higher-priority
  canonical sources.
