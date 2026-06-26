# FirstSpawn Plan — Execution Tracker

Live now/next/later for the **active release**. Derived from the current release
scope; it rolls forward each cycle and is never frozen. For *what a version is*,
see the release file; for *what has shipped*, see `CHANGELOG.md`; for product
principles and governance, see `PRODUCT.md` (§5).

**Active release:** [`docs/releases/v1-mvp.md`](docs/releases/v1-mvp.md) (v1 MVP)

## Now

- Verify real external Minecraft (`mc_java`) probe behavior end to end against a
  live target.
- Finish web Discover integration on top of the public server API.
- Keep collector silence, failed probes, DNS failures, and stale pings from
  archiving catalog rows (health is separate from catalog status).

## Next

- Complete the backend MVP around auth, public catalog, admin catalog, collector
  targets, heartbeat ingestion, and freshness state.
- Build the offline health gate on the ranked Discover surface (release §8.1).
- Owner Dashboard workflows once reliable heartbeat and catalog data exist.

## Later

- Add the net-new discovery surfaces — "New & rising" and editorial "Featured"
  (release §8.6).
- Keep API contracts, schema design, and service READMEs aligned as endpoints
  change.

## Recommended Next Standards

- Add `apps/web/README.md` when web-specific runtime, env, or route behavior
  outgrows the root README.
- Add `apps/mobile/README.md` when the Expo scaffold becomes an active app.
