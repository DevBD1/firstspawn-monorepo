# FirstSpawn Project Planning Document

**Status:** Planning Phase  
**Last Updated:** 2026-02-20  
**Document Owner:** Development Team

---

## Executive Summary

FirstSpawn is a comprehensive discovery ecosystem for Minecraft and Hytale servers, positioned as a social network rather than just a server list. It features verified playtime reviews, cross-platform identity sync, guilds, badges, daily puzzles with prizes, and a plugin-based verification system.

### Current State
- **Web (Next.js 16):** Landing page with newsletter signup, i18n (6 languages), pixel-art design system, PostHog analytics
- **API:** Placeholder only (needs full implementation)
- **Mobile:** Placeholder only (Expo scaffold)
- **Shared Packages:** Basic UI package with Button component only

### Existing Infrastructure
- Monorepo with npm workspaces + Turborepo
- Tailwind CSS v4 + Framer Motion for animations
- PostHog for analytics
- Resend for emails
- Custom "Screw Mechanic" CAPTCHA implemented

---

## Phase 1: Product Planning Questions

### 1.1 MVP Scope & Priorities

**Q1.1.1 - Core Features for MVP:**
The BACKEND.md defines MVP (Phase 1) as:
- User authentication (Discord OAuth)
- User profiles & linked identities
- Server registration & listing
- Basic search (PostgreSQL FTS first)
- Reviews with verified/unverified status
- Plugin verification system
- Playtime tracking
- Basic reputation system
- Favorites

**Questions:**
1. Do you agree with this MVP scope, or should we trim/add features?
2. Should we support BOTH Minecraft AND Hytale in MVP, or focus on Minecraft first?
3. What's the timeline target for MVP launch?

**Q1.1.2 - Post-MVP Priorities:**
From the documentation, Phase 2+ includes:
- Elasticsearch integration
- Guild system (full)
- Badge economy
- Puzzle system with prizes
- Steam & Epic OAuth
- Stripe payments
- Webhooks

**Questions:**
1. What is your priority order for Phase 2 features?
2. Is the mobile app a priority for MVP or post-MVP?

---

### 1.2 Business Model & Monetization

**Q1.2.1 - Revenue Streams:**
The documentation mentions:
- Premium badges (server/user)
- Premium subscriptions (isPremium flag on User model)
- Tebex integration for payments

**Questions:**
1. What is the primary monetization model? (Premium subscriptions, badge purchases, server promotions, ads?)
2. What premium features should be gated behind subscription?
3. What's the expected pricing tier structure?

---

### 1.3 Competitive Differentiation

**Q1.3.1 - Unique Value Propositions:**
Current differentiators:
- Verified playtime reviews (via plugin)
- Cross-platform identity sync
- Daily puzzles with in-game prizes
- Guild system
- Reputation-based trust system

**Questions:**
1. What is the ONE key differentiator we should emphasize in marketing?
2. Are there specific competitors you're positioning against?

---

## Phase 2: Front-End Planning Questions

### 2.1 Architecture Decisions

**Q2.1.1 - State Management:**
Current: Server Actions + React state

**Questions:**
1. Should we use React Query/TanStack Query for server state management?
2. Do you prefer Zustand, Redux Toolkit, or Context for client state?
3. How should we handle real-time updates? (WebSocket, SSE, or polling?)

**Q2.1.2 - Component Architecture:**
Current: Components organized by feature (landing/, layout/, captcha/, pixel/)

**Questions:**
1. Do you want to adopt a specific component pattern? (Container/Presentational, Compound Components, etc.)
2. Should we use Storybook for component documentation?

### 2.2 Key Pages & Routes

**Q2.2.1 - MVP Page List:**
Based on requirements:

| Page | Priority | Description |
|------|----------|-------------|
| `/[lang]/` | ✅ Done | Landing page |
| `/[lang]/servers` | High | Server discovery grid with filters |
| `/[lang]/servers/[slug]` | High | Server detail page |
| `/[lang]/auth/login` | High | Authentication page |
| `/[lang]/auth/register` | High | Registration page |
| `/[lang]/dashboard` | Medium | User dashboard |
| `/[lang]/dashboard/servers` | Medium | Server owner dashboard |
| `/[lang]/guilds` | Low | Guild listing (post-MVP) |
| `/[lang]/guilds/[slug]` | Low | Guild detail (post-MVP) |

**Questions:**
1. Are there any critical pages missing from this MVP list?
2. Should server owners have a separate subdomain (e.g., `owner.firstspawn.com`) or path-based routing?

### 2.3 Design System

**Q2.3.1 - Current Design Direction:**
- Pixel-art retro gaming aesthetic
- Colors: Gold (#FFD700), Orange (#FF6B00), Cyan (#2EBCDA), Green (#4ADE80)
- Fonts: Press Start 2P (pixel), VT323 (terminal), Geist (modern)

**Questions:**
1. Should we maintain the pixel-art aesthetic for the ENTIRE application, or transition to a cleaner UI for dashboard/functional areas?
2. Do you have a component library preference? (shadcn/ui, Radix, Headless UI?)
3. Should the design be dark-mode only or support light mode?

---

## Phase 3: Front-End Design Questions

### 3.1 User Experience Flows

**Q3.1.1 - User Onboarding Flow:**
**Questions:**
1. What should the new user onboarding flow look like?
   - Option A: Immediate server discovery (browse first, auth later)
   - Option B: Auth-gated experience (sign up before browsing)
2. Should we include the "Player Type Quiz" (Killer, Achiever, Socializer, Explorer) in onboarding?

**Q3.1.2 - Server Owner Flow:**
**Questions:**
1. What should the server registration flow be?
   - Option A: Register server → Install plugin → Verify
   - Option B: Install plugin first → Plugin auto-registers server
2. How should server verification status be displayed to owners?

### 3.2 Key UI Components Needed

**Q3.2.1 - Component Inventory:**
Based on MVP requirements:

| Component | Priority | Notes |
|-----------|----------|-------|
| ServerCard | High | Grid/list display of servers |
| ServerFilters | High | Tag, region, version filters |
| ReviewCard | High | Review with verified badge |
| StarRating | High | 5-star rating input/display |
| AuthForms | High | Login/register with OAuth |
| UserMenu | High | Dropdown with profile/logout |
| ServerStats | Medium | Player count, uptime charts |
| NotificationBell | Medium | Real-time notifications |
| SearchBar | High | Autocomplete search |

**Questions:**
1. Are there any UI components that need special attention or custom design?
2. Should we implement infinite scroll or pagination for server lists?

---

## Phase 4: Database Design Questions

### 4.1 Schema Validation

**Q4.1.1 - Current Schema Review:**
The BACKEND.md contains a comprehensive Prisma schema with models for:
- User, RefreshToken, LinkedIdentity, ReputationLog
- GameServer, Tag, ServerTag, UptimeLog
- Review, ReviewVote
- PluginInstance, PlaytimeRecord
- PrizePool, Prize, RedemptionCode
- Puzzle, PuzzleSubmission, PuzzleProgress, PuzzleReward
- Guild, GuildMembership, GuildInvite
- Badge, UserBadge, ServerBadge, GuildBadge
- Transaction, Favorite, Notification, Webhook

**Questions:**
1. Is there anything in the schema you'd like to simplify for MVP?
2. The schema supports both Minecraft and Hytale - should we launch with one first?
3. Do you need any additional fields for analytics/tracking?

### 4.2 Data Retention & Archival

**Q4.2.1 - Data Lifecycle:**
**Questions:**
1. How long should we retain:
   - Uptime logs? (forever, 90 days, 1 year?)
   - Review votes? (forever)
   - Notification history? (30 days, 90 days?)
   - Puzzle submissions? (forever, 1 year?)
2. Should we implement soft deletes for reviews/servers?

---

## Phase 5: Webservices/API Questions

### 5.1 API Architecture

**Q5.1.1 - Technology Choice:**
Current API is a placeholder. BACKEND.md suggests NestJS.

**Questions:**
1. Do you confirm NestJS + Prisma + PostgreSQL stack?
2. Should we use REST, GraphQL, or tRPC for the API?
3. Should the API be a separate service or Next.js API routes initially?

**Q5.1.2 - Real-time Communication:**
**Questions:**
1. Do we need WebSocket support for MVP? (notifications, live player counts)
2. Or can we defer to polling for MVP?
3. If WebSockets, should we use Socket.io or native WS?

### 5.2 Third-Party Integrations

**Q5.2.1 - OAuth Providers Priority:**
**Questions:**
1. What OAuth providers should be in MVP?
   - Discord (essential for gaming audience)
   - Steam (for playtime verification)
   - Google (general audience)
   - Epic Games (future Hytale integration)
2. Should we support traditional email/password login in MVP?

**Q5.2.2 - External Services:**
**Questions:**
1. Which services are MUST-HAVE for MVP?
   - [ ] Elasticsearch (or PostgreSQL FTS for MVP?)
   - [ ] Redis (caching, sessions, rate limiting)
   - [ ] Cloudflare R2 (file storage)
   - [ ] Stripe (payments - post-MVP?)
   - [ ] Sentry (error tracking)

### 5.3 Plugin API Design

**Q5.3.1 - Plugin Communication:**
The plugin needs to:
- Report heartbeats
- Sync playtime records
- Check/execute prize redemptions
- Verify plugin authenticity

**Questions:**
1. Should the plugin API be REST or gRPC?
2. How should we distribute the plugin? (SpigotMC, GitHub, direct download?)
3. What Minecraft versions should the plugin support?

---

## Phase 6: Backend Questions

### 6.1 Authentication & Security

**Q6.1.1 - Auth Strategy:**
The documentation describes a hybrid approach:
- Primary: Email + Password
- Secondary: OAuth (Discord, Steam, Epic, Google)
- JWT access tokens (15 min) + refresh tokens (7 days)

**Questions:**
1. Should we use a third-party auth service? (Auth0, Clerk, or roll our own?)
2. Do we need 2FA/MFA support in MVP or post-MVP?
3. Should we implement "Sign in with Discord" as the primary method for this audience?

### 6.2 Background Jobs

**Q6.2.1 - Job Processing:**
Proposed jobs in BACKEND.md:
- Uptime monitoring checks
- Elasticsearch sync
- Nightly data aggregation
- Puzzle winner calculation
- Expired redemption cleanup

**Questions:**
1. Should we use BullMQ with Redis, or a simpler solution for MVP?
2. What's the desired uptime check frequency? (1 min, 5 min, 15 min?)

### 6.3 Search Implementation

**Q6.3.1 - Search Strategy:**
Options:
1. **MVP:** PostgreSQL Full-Text Search (simpler, no extra infra)
2. **Phase 2:** Elasticsearch (better performance, advanced features)

**Questions:**
1. Should we start with PostgreSQL FTS and migrate to Elasticsearch later?
2. What are the key search filters needed at launch? (tags, game type, region, player count?)

### 6.4 Hosting & Infrastructure

**Q6.4.1 - Deployment:**
**Questions:**
1. What's the preferred hosting platform?
   - Vercel (frontend) + Railway/Render (backend) + Supabase (DB)
   - AWS/GCP/Azure
   - All-in-one (Fly.io, Railway)
2. Do you have budget constraints for infrastructure?
3. What's the expected initial traffic volume?

---

## Decisions Summary (Based on Your Answers)

### Product Decisions
| Question | Decision |
|----------|----------|
| MVP Games | **Hytale only** (leverage Early Access hype, Minecraft later) |
| Timeline | Not fixed - flexible milestone-based approach |
| Monetization | Subscriptions for server owners, badges for everyone |

### Technical Decisions
| Question | Decision |
|----------|----------|
| API Framework | **NestJS** (structured, excellent for learning, scalable) |
| Search | **PostgreSQL Full-Text Search** (MVP), Elasticsearch later |
| Real-time | **WebSocket with Socket.io** |
| Auth Primary | **Email/Password** (with OAuth as alternative) |
| Database Hosting | **Supabase** (500MB+ free tier, upgrade to Pro when needed) |

### Design Decisions
| Question | Decision |
|----------|----------|
| Aesthetic | **Pixel-art everywhere** |
| Dark Mode | **Dark mode primary**, light mode foundation for later |
| Component Library | **shadcn/ui** with custom pixel-art styling |

### Infrastructure Decisions
| Question | Decision |
|----------|----------|
| Hosting | **Supabase** (DB) + **Railway/VDS** (API) + **Vercel** (Web) |
| Must-have Services | **Redis** (essential), Sentry (monitoring), skip Elasticsearch for MVP |
| Hytale Plugin | **Java .jar** (server-side), distributed via CurseForge, Modrinth, etc. |

---

## Quick Reference: File Locations

| Document Type | Path | Status |
|--------------|------|--------|
| Product Planning | `./docs/01-product/PRODUCT_PLANNING.md` | ✅ Complete |
| Frontend Planning | `./docs/02-frontend-planning/FRONTEND_PLANNING.md` | ✅ Complete |
| Frontend Design | `./docs/03-frontend-design/FRONTEND_DESIGN.md` | ✅ Complete |
| Database Design | `./docs/04-database-design/DATABASE_DESIGN.md` | ✅ Complete |
| Webservices | `./docs/05-webservices/WEBSERVICES.md` | ✅ Complete |
| Backend | `./docs/06-backend/BACKEND_ARCHITECTURE.md` | ✅ Complete |
| Implementation Roadmap | `./docs/IMPLEMENTATION_ROADMAP.md` | ✅ Complete |
| Implementation Logs | `./implementations/CHANGELOG.md` | ✅ Initialized |

---

## Next Steps

1. ✅ **Planning Complete** - All 6 phases documented
2. ⏳ **Review Phase** - Review documents, provide feedback
3. ⏳ **Environment Setup** - Docker, Node.js, IDE
4. ⏳ **Begin Implementation** - Start Milestone 1: Foundation

---

## Resource Summary

### Infrastructure Costs (MVP)
| Service | Provider | Monthly Cost |
|---------|----------|--------------|
| Database | Supabase (Pro) | $25 |
| API Hosting | Railway / Hetzner | $5-20 |
| Web Hosting | Vercel (Pro) | $20 |
| Redis | Upstash (Free) | $0 |
| Image Storage | Cloudflare R2 | ~$5 |
| **Total** | | **~$60-75/month** |

### Estimated Timeline
- **MVP Duration:** 12-14 weeks (solo developer)
- **Target Launch:** Q2 2026
- **Post-MVP:** Phase 2 features (guilds, puzzles, badges)

---

*Planning completed on 2026-02-20. Ready for review and implementation.*
