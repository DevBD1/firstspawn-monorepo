# FirstSpawn Plan

FirstSpawn is a discovery and trust platform for game servers, starting with
Hytale and Minecraft. The current implementation focus is the backend MVP and
the web discovery surface.

## Current Focus

- Keep the web app as the primary shipped surface.
- Complete the backend MVP around auth, public catalog, admin catalog,
  collector targets, heartbeat ingestion, and freshness state.
- Keep `mc_java` as the first live collector platform.
- Integrate Discover with the public server API.
- Validate live end-to-end probe behavior against a real Minecraft target.

## Roadmap

### P0: MVP Completion

- Verify real external Minecraft probe behavior end to end.
- Finish web Discover integration on top of the public server API.
- Keep collector silence, failed probes, DNS failures, and stale pings from
  archiving catalog rows.
- Keep API contracts, schema design, and service READMEs aligned as endpoints
  change.

### P1: Product Expansion

- Add player trust loops and reputation primitives after the discovery MVP is
  stable.
- Add server-owner dashboard workflows after reliable heartbeat and catalog data
  exist.
- Add reviews, favorites, and moderation only after the core discovery path is
  dependable.

### P2: Ecosystem Expansion

- Add plugin telemetry and verification keys after the first collector flow is
  proven.
- Expand beyond `mc_java` only after the first platform has stable data quality.
- Revisit agent workflows after the human moderation and trust model is clear.

## Recommended Next Standards

- P1: Add `apps/web/README.md` when web-specific runtime, env, or route behavior
  outgrows the root README.
- P1: Add `apps/mobile/README.md` when the Expo scaffold becomes an active app.
