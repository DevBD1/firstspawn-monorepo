# FirstSpawn Product

> **What this answers** — FirstSpawn's durable vision, principles, identity, and
> the governance rules every other doc follows. The apex source of truth.
>
> **Open when** — You need to know what FirstSpawn always is, or which doc owns
> what (version scope, UI, schema, runtime all delegate out from §5). Read once;
> it changes rarely.

## 1. Product Direction

FirstSpawn is a discovery and trust platform for game servers. The first public
release is a web-first Minecraft Java server discovery and voting platform.
Other games and platforms come only after the first discovery loop is reliable.

The product should help players find communities worth joining and help server
owners earn attention through useful, transparent signals instead of purchased
rank.

### 1.1 Core Principles

- Discovery rank is not for sale: no payment, founding-partner status, or
  editorial action reorders the ranking. Editorial placement, where it exists,
  is clearly labeled, distinct from rank, and likewise never for sale.
- Votes measure current community engagement and popularity; they are not a
  claim of identity, quality, or trust. Vote rank reflects popularity and can be
  inflated by a determined live server — FirstSpawn does not claim it is
  fraud-proof.
- Trust comes from separate evidence: verified control, measured uptime,
  moderation history, and later optional plugin telemetry.
- Measured data and owner-declared data must remain visibly distinct.
- Familiar low-friction server-list behavior is more important than forcing
  account creation.
- Public, owner, admin, and operational concerns must remain separate.
- Available features must be concrete; future features must not masquerade as
  working product.

## 2. Who It's For

FirstSpawn serves three enduring roles. Version-specific constraints on each
(for example, how many servers an owner may hold) live in the active release
scope.

- **Anonymous player:** browses, filters, evaluates, copies a server address,
  and votes without a FirstSpawn account.
- **Server owner:** an email-verified account that lists or claims servers and
  manages their approved public data.
- **Admin:** curates the catalog, moderates requests, manages controlled data,
  and handles operational support.

## 3. Product Boundaries

These are identity-level boundaries — true in every version. Per-version
exclusions live in the active release's out-of-scope list.

- FirstSpawn is a discovery-and-trust platform, not a pay-for-rank server list.
  Placement and rank are never sold.
- It is not a social network, forum, or messaging product. It connects players
  to servers, not players to players.
- Measured data and owner-declared data are always kept visibly distinct;
  declarations are never presented as measurements.
- Trust is earned through evidence — verified control, measured uptime,
  moderation history — never purchased.
- Privacy is a default, not a feature: FirstSpawn prefers anonymous,
  low-friction participation, minimizes and time-bounds personal data, and never
  creates a tracking identifier to bypass a user's analytics choice.

## 4. How Success Is Measured

The primary product signal is **Weekly Unique Server Intent**: one unique
combination of a consented visitor, a server, and a UTC week, where the visitor
either copied the server address or cast a valid vote. It measures whether
discovery produces real intent to join — deduplicated, and directional because
non-consenting traffic is intentionally absent.

Supporting metrics, targets, and the analytics implementation are version
detail and live in the active release scope.

## 5. Documentation & Governance

`PRODUCT.md` is the **apex** source of truth: it owns vision, principles,
identity, and these governance rules, and nothing in the repository may
contradict its principles. It deliberately **delegates** everything else to the
document that owns that domain. This section is the authoritative ownership and
precedence map; for a task-oriented "where do I go" index, see the README's
Documentation section.

### 5.1 Document Map

| Document | Owns | Changes |
| --- | --- | --- |
| `PRODUCT.md` | Vision, principles, identity, success philosophy, governance | Rarely |
| `docs/releases/<version>.md` | A version's feature scope: in/out, flows, acceptance, launch gate | Frozen per release |
| `DESIGN.md` | Product UI/UX system and flows | Per feature work |
| Service READMEs | Service runtime, setup, endpoints | Per implementation |
| `packages/database/schema-design.md` | Canonical database design | Per schema change |
| `PLAN.md` | Live now/next/later execution for the active release | Rolls forward; never frozen |
| `CHANGELOG.md` | Append-only ledger of shipped versions | One entry per ship |

### 5.2 Canonical Hierarchy

When documents disagree, resolve in this order:

1. `PRODUCT.md` — principles and identity (apex).
2. `docs/releases/<active>.md` — current version scope.
3. `DESIGN.md` — UI/UX.
4. Service READMEs — runtime and endpoints.
5. `packages/database/schema-design.md` — database design.
6. `PLAN.md` — execution sequencing.
7. `CHANGELOG.md` — shipped history.

Each domain document is authoritative *within its domain*. If a domain document
contradicts a `PRODUCT.md` principle, `PRODUCT.md` wins and the domain document
is corrected. A change must not silently broaden scope: new scope lands in a
release file, not by accretion in derived docs.

### 5.3 Versioning and Release Lifecycle

- Each release has its own scope file under `docs/releases/` and moves through
  `draft → frozen → shipped → superseded`.
- A new version is a **new file**, never an edit to a shipped one; shipped scope
  files are immutable historical snapshots.
- Pure refactors, trims, and production plumbing do not touch `PRODUCT.md` or a
  frozen release file — they are implementation, tracked in `PLAN.md`.

### 5.4 Publishing a Version

1. Check the work against `PRODUCT.md` principles; only edit `PRODUCT.md` if a
   principle genuinely changes (rare, strategic).
2. Define scope in `docs/releases/<version>.md` (status `draft`): in/out,
   acceptance, launch gate.
3. Cascade derived docs: `DESIGN.md`, `packages/database/schema-design.md`,
   service READMEs.
4. Freeze the release file (`frozen`) before building; sequence the build in
   `PLAN.md`.
5. On ship: set the release `shipped`, tag the release in git, append a dated
   `CHANGELOG.md` entry, and mark the prior release `superseded`.

### 5.5 Amendments

A frozen release may take a corrective amendment without a full re-freeze when it
fixes a production blocker or a principle violation. Amendments are dated and
listed in the release file's header changelog — never applied silently.
