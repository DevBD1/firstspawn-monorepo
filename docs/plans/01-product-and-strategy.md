# Product And Strategy

## 1. Product Thesis

FirstSpawn is a discovery and trust platform for game servers, starting with Hytale and expanding to Minecraft.

The core thesis:
- Discovery should be relevance-driven, not pay-to-win.
- Trust should be earned through verified activity and reputation.
- Retention should come from meaningful loops (favorites, reviews, guilds, daily participation).

## 2. Target Users

### Players
- Need trustworthy server discovery.
- Want active communities, not dead listings.
- Value social proof, verified reviews, and progression/badges.

### Server Owners
- Need visibility and fair ranking.
- Need tools to prove server quality and operational reliability.
- Need growth analytics and conversion loops.

## 3. Core Product Loops

### Discovery Loop
Search or filter -> open server -> join or favorite -> return to discover more.

### Trust Loop
Playtime tracked by plugin -> verified trust signals -> higher confidence for other users -> better ranking quality.

### Retention Loop
Daily return behavior (puzzles/events/badges) -> social engagement (guilds/reviews/favorites) -> stronger identity and stickiness.

### Owner Loop
Claim/register server -> verify plugin -> improve listing -> gain reviews/favorites -> convert to premium owner tools.

## 4. MVP Scope (Locked For Implementation Start)

### In Scope
- Server listing and detail pages.
- User auth and profiles.
- Favorites.
- Search and filtering with PostgreSQL-first strategy.
- Plugin-based verification and heartbeat/playtime sync.
- Basic reputation and moderation foundations.
- Agentic program rollout in MVP:
  - Tier 0 for analysis and recommendation,
  - Tier 1 for draft outputs (tickets/content/proposals),
  - tightly guarded Tier 2 pilots for low-risk action classes with rollback.
- Launch locales: English (`en`), Turkish (`tr`), German (`de`).

### Out Of Scope For MVP
- Reviews (verified and unverified) as a public feature.
- Full badge marketplace economy.
- Full guild social stack.
- Daily puzzle economy and prize pools at full depth.
- Advanced recommendation models in production.
- Any R3 high-risk autonomous action classes.

## 5. Positioning And Differentiation

Primary differentiators:
- Verified playtime-backed trust signals (reviews in next phase).
- Identity graph and trust-aware social profiles.
- Discovery + social + gamification in one product surface.

## 6. Monetization Direction

Revenue model:
- Server owner subscriptions (visibility, analytics, advanced tools).
- Badge/cosmetic economy (phased, not blocking MVP).

Pricing strategy:
- Free entry tier for discovery and onboarding.
- Premium and Pro tiers for server owners.

## 7. Autonomous Agent Program (Product Side)

Autonomy objective:
- Continuously improve acquisition, retention, trust, and shipping quality.

Pod model:
- Growth and marketing.
- Product and retention.
- Software development.
- Data science and intelligence.
- User support and community.
- Security and integrity.

Autonomy rollout:
- Tier 0: recommend only.
- Tier 1: draft actions and PR/ticket outputs.
- Tier 2: guardrailed low-risk execution with rollback.

## 8. External Dependency Resilience

Policy:
- Product must degrade gracefully when third-party AI services are unavailable, rate-limited, or out of credits.
- Missing keys or provider outages must never block core app availability or deployment.
- AI-enhanced UX (for example witty captcha copy) is optional and should be disabled/fallback when providers fail.

## 9. Success Metrics

### North-Star
- Sustainable growth of active trusted community participation.

### Acquisition
- Qualified signups.
- Server-owner registrations.
- Organic discovery traffic.

### Engagement
- D1/D7/D30 retention.
- Favorites, reviews, guild participation.
- Session depth and return frequency.

### Trust And Safety
- Verified telemetry coverage ratio (heartbeat/playtime integrity).
- Fraud detection precision.
- Moderation quality and false-positive rate.

### Business
- Owner conversion to paid tiers.
- Revenue per active server owner.
