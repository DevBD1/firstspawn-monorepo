# Phase 1: Product Planning - FirstSpawn

**Status:** ✅ Requirements Captured  
**Date:** 2026-02-20  
**Based On:** User requirements + Hytale Early Access research

---

## 1. Executive Summary

### 1.1 Product Vision
FirstSpawn is the **ultimate discovery ecosystem for Hytale servers** (Minecraft support planned post-MVP). It bridges the gap between server discovery and player engagement through verified playtime, social features, and gamification.

### 1.2 Strategic Positioning
- **Primary Game:** Hytale (Early Access launched Jan 13, 2026)
- **Target Audience:** Hytale players and server owners during the Early Access hype wave
- **Key Differentiator:** Verified playtime reviews via server plugin integration
- **Business Model:** Subscription tiers for server owners + badge marketplace for everyone

---

## 2. MVP Scope (Phase 1)

### 2.1 Core Features

| Feature | Priority | Description |
|---------|----------|-------------|
| **Server Discovery** | P0 | Browse, search, filter Hytale servers |
| **Server Profiles** | P0 | Detailed server pages with stats, tags, reviews |
| **User Authentication** | P0 | Email/Password + OAuth (Discord, Google) |
| **User Profiles** | P0 | Public profiles with reputation, badges, reviews |
| **Review System** | P0 | Star ratings + text reviews (verified/unverified) |
| **Favorites** | P0 | Save/bookmark servers |
| **Server Registration** | P0 | Owners can claim/register servers |
| **Plugin Verification** | P0 | Hytale plugin for verified playtime |
| **Basic Search** | P1 | PostgreSQL full-text search (Elasticsearch later) |
| **Reputation System** | P1 | Points for engagement, verified reviews worth more |

### 2.2 Post-MVP Features (Phase 2+)

| Feature | Phase | Description |
|---------|-------|-------------|
| Guild System | P2 | Player clans/communities |
| Badge Economy | P2 | Earned + purchased badges |
| Daily Puzzles | P2 | Minigames with in-game prizes |
| Prize Pools | P2 | Servers can offer redemption codes |
| Elasticsearch | P2 | Advanced search with aggregations |
| Minecraft Support | P3 | Expand to Minecraft servers |
| Mobile App | P3 | React Native/Expo |
| Steam/Epic OAuth | P3 | Additional identity providers |

---

## 3. Business Model

### 3.1 Revenue Streams

#### 3.1.1 Server Owner Subscriptions

| Tier | Monthly Price | Features |
|------|---------------|----------|
| **Free** | $0 | Basic listing, 3 tags, standard analytics |
| **Premium** | $9.99 | Featured placement, 10 tags, detailed analytics, webhook notifications, priority support |
| **Pro** | $29.99 | Top placement, unlimited tags, custom branding, API access, dedicated support |

#### 3.1.2 Badge Marketplace
- **User Badges:** Cosmetic profile decorations (one-time purchase)
- **Server Badges:** Visual indicators for servers (earned through activity or purchased)
- **Price Range:** $0.99 - $4.99 per badge

### 3.2 Value Proposition by User Type

| User Type | Primary Value | Monetization |
|-----------|---------------|--------------|
| **Players** | Find quality Hytale servers, verified reviews | Badge purchases |
| **Server Owners** | Get discovered, build trust via verification | Subscription tiers |
| **Guilds** | (Phase 2) Community building, recruitment | Premium guild features |

---

## 4. Hytale-Specific Considerations

### 4.1 Hytale Early Access Context

**Current State (Feb 2026):**
- Early Access launched Jan 13, 2026
- Server-side modding only (Java .jar plugins)
- No client mods required to join servers
- Plugin API is nascent but functional
- Documentation still being developed by Hypixel Studios

**Strategic Advantage:**
- First-mover advantage in Hytale server discovery
- Early Access hype = high demand for server discovery
- Community is forming, looking for tools

### 4.2 Hytale Plugin Architecture

Based on Hytale's modding strategy:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Hytale Server Plugin (Java)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ Playtime     │───▶│ FirstSpawn   │───▶│ FirstSpawn   │      │
│  │ Tracker      │    │ API Client   │    │ Backend API  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Hytale Server Events                  │   │
│  │  • Player join/leave    • Server start/stop              │   │
│  │  • Playtime tracking    • AFK detection                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Plugin Distribution Channels:**
1. CurseForge
2. Modrinth
3. BuiltByBit
4. GitHub Releases

---

## 5. User Personas

### 5.1 Primary Personas

#### Player: "Alex" (Explorer Type)
- **Age:** 18-25
- **Plays:** Hytale 5-10 hours/week
- **Pain Points:** Hard to find quality servers, fake reviews everywhere
- **Needs:** Trustworthy server listings, verified reviews
- **Goals:** Find a long-term community to join

#### Server Owner: "Jordan"
- **Age:** 20-30
- **Runs:** Hytale server with 50-500 players
- **Pain Points:** Difficult to get discovered, no verified player feedback
- **Needs:** Exposure, reputation building, player analytics
- **Goals:** Grow server community sustainably

### 5.2 User Flows

#### Player Journey
```
Landing Page ──▶ Browse Servers ──▶ View Server Detail ──▶ Join Server
                    │                    │
                    ▼                    ▼
              Filter/Search        Leave Review (after playtime)
                    │                    │
                    ▼                    ▼
              Favorite Server      Build Reputation
```

#### Server Owner Journey
```
Register ──▶ Claim Server ──▶ Install Plugin ──▶ Verification
                                            │
                                            ▼
                              Customize Listing ──▶ Analytics Dashboard
```

---

## 6. Competitive Analysis

### 6.1 Direct Competitors

| Competitor | Weakness | FirstSpawn Advantage |
|------------|----------|---------------------|
| **HytaleTop100** | No verification system | Verified playtime reviews |
| **Server lists** | Pay-to-win ranking | Algorithmic + reputation ranking |
| **Discord communities** | Hard to discover | Centralized discovery + social |

### 6.2 Key Differentiators

1. **Verified Playtime:** Plugin-based verification prevents fake reviews
2. **Cross-Platform Identity:** Link Discord, Steam, Epic (future)
3. **Reputation System:** Trust built over time, not bought
4. **Gamification:** Puzzles, badges, guilds create engagement loops

---

## 7. Success Metrics

### 7.1 MVP Success Criteria

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| Registered Servers | 500+ |
| Registered Users | 10,000+ |
| Verified Reviews | 1,000+ |
| Active Plugins | 300+ servers running plugin |
| Premium Conversions | 5% of server owners |

### 7.2 Leading Indicators

- Server registration rate
- Plugin installation rate
- User retention (D7, D30)
- Review quality score
- Search-to-join conversion

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hytale API changes | High | High | Abstract plugin API, version compatibility layer |
| Low server adoption | Medium | High | Early adopter incentives, free premium trial |
| Competition from bigger platforms | Medium | Medium | Focus on verification/social features |
| Hytale game struggles | Low | Critical | Plan for Minecraft expansion |

---

## 9. Timeline Recommendation

Since you mentioned "not determined," here's a suggested phased approach:

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Alpha** | 6-8 weeks | Core platform, auth, server CRUD, basic search |
| **Beta** | 4-6 weeks | Plugin verification, reviews, favorites |
| **Launch Prep** | 2-4 weeks | Polish, performance, marketing site |
| **Public Launch** | - | MVP release |
| **Post-Launch** | Ongoing | Iterate based on feedback, Phase 2 planning |

**Total MVP Timeline:** 3-4 months (with 1-2 developers)

---

## 10. Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| Exact timeline? | ⏳ Pending | Set target launch date |
| Initial marketing budget? | ⏳ Pending | Affects growth strategy |
| Solo or team? | ⏳ Pending | Resource planning |

---

## Related Documents

- [Frontend Planning](../02-frontend-planning/FRONTEND_PLANNING.md)
- [Frontend Design](../03-frontend-design/FRONTEND_DESIGN.md)
- [Database Design](../04-database-design/DATABASE_DESIGN.md)
- [Webservices](../05-webservices/WEBSERVICES.md)
- [Backend Architecture](../06-backend/BACKEND_ARCHITECTURE.md)
