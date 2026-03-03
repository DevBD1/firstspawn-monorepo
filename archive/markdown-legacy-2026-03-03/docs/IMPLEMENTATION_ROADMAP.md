# FirstSpawn Implementation Roadmap

**Version:** MVP (v0.1.0)  
**Start Date:** TBD  
**Estimated Duration:** 12-14 weeks (solo developer)  
**Target:** Hytale-focused server discovery platform

---

## Executive Summary

This roadmap breaks down the implementation into 4 milestones, each delivering a working increment. The approach prioritizes:

1. **Foundation first** - Backend API and database
2. **User-facing features** - Web interface for discovery
3. **Verification system** - Plugin integration for trust
4. **Polish & launch** - Performance, monitoring, marketing

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | NestJS, TypeScript, Prisma |
| **Database** | PostgreSQL (Supabase for ease) |
| **Cache/Jobs** | Redis |
| **Real-time** | Socket.io |
| **Search** | PostgreSQL FTS (MVP), Elasticsearch later |
| **Hosting** | Supabase (DB) + Railway/VDS (API) + Vercel (Web) |

---

## Milestone 1: Foundation (Weeks 1-4)

**Goal:** Working backend API with authentication and basic CRUD

### Week 1: Project Setup & Database

**Backend Setup:**
- [ ] Initialize NestJS project
- [ ] Setup Prisma with PostgreSQL
- [ ] Configure Docker Compose for local dev
- [ ] Setup environment configuration
- [ ] Add basic health checks

**Database:**
- [ ] Implement Prisma schema (users, servers, reviews)
- [ ] Create initial migration
- [ ] Seed database with tags
- [ ] Setup database indexes

**Deliverable:** `docker-compose up` starts API + DB successfully

---

### Week 2: Authentication System

**Backend:**
- [ ] Implement user registration (email/password)
- [ ] Implement login with JWT
- [ ] Setup refresh token rotation
- [ ] Add password reset flow
- [ ] Add email verification (Resend)
- [ ] Implement OAuth (Discord, Google)
- [ ] Add auth guards and decorators

**Testing:**
- [ ] Unit tests for auth service
- [ ] Integration tests for auth endpoints

**Deliverable:** Can register, login, and access protected routes via Swagger

---

### Week 3: Core API - Servers & Reviews

**Backend - Servers:**
- [ ] CRUD endpoints for servers
- [ ] Server search with filters
- [ ] Server claim/verification flow
- [ ] Image upload to R2 (banners, logos)
- [ ] Favorites system

**Backend - Reviews:**
- [ ] Create review endpoint
- [ ] List reviews with pagination
- [ ] Helpful/unhelpful voting
- [ ] Review moderation basics

**Testing:**
- [ ] E2E tests for server endpoints
- [ ] E2E tests for review endpoints

**Deliverable:** Full API for servers and reviews via Swagger

---

### Week 4: Plugin API & Background Jobs

**Plugin System:**
- [ ] HMAC verification middleware
- [ ] Heartbeat endpoint
- [ ] Playtime sync endpoint
- [ ] API key management

**Background Jobs:**
- [ ] Setup BullMQ with Redis
- [ ] Uptime checking job
- [ ] Statistics aggregation job
- [ ] Cleanup job for old data

**WebSocket:**
- [ ] Basic gateway setup
- [ ] Server status broadcasts
- [ ] Notification system

**Deliverable:** Plugin can authenticate and send heartbeats

---

## Milestone 2: Web Interface (Weeks 5-8)

**Goal:** Functional web interface for server discovery

### Week 5: Frontend Foundation

**Setup:**
- [ ] Add shadcn/ui to Next.js
- [ ] Create pixel-art component variants
- [ ] Setup React Query
- [ ] Setup Zustand stores
- [ ] Create API client

**Components:**
- [ ] PixelButton, PixelCard, PixelInput
- [ ] ServerCard component
- [ ] StarRating component
- [ ] TagBadge component

**Deliverable:** Component library ready in Storybook or docs

---

### Week 6: Public Pages

**Server Discovery:**
- [ ] Servers listing page
- [ ] Search and filters
- [ ] Pagination or infinite scroll
- [ ] Responsive layout

**Server Detail:**
- [ ] Server detail page
- [ ] Stats display
- [ ] Review list
- [ ] Similar servers

**API Integration:**
- [ ] Connect to backend API
- [ ] Error handling
- [ ] Loading states

**Deliverable:** Can browse and view servers

---

### Week 7: Auth & Dashboard

**Authentication:**
- [ ] Login page
- [ ] Register page
- [ ] OAuth buttons
- [ ] Auth context and persistence
- [ ] Protected routes

**Dashboard:**
- [ ] Dashboard layout with sidebar
- [ ] User profile page
- [ ] My servers page
- [ ] Add/edit server forms
- [ ] Favorites page

**Deliverable:** Can register, login, and manage servers

---

### Week 8: Polish & Integration

**Reviews:**
- [ ] Write review form
- [ ] Review display with verified badges
- [ ] Helpful voting

**UI Polish:**
- [ ] Animations (Framer Motion)
- [ ] Toast notifications
- [ ] Error boundaries
- [ ] Skeleton loaders

**Real-time:**
- [ ] WebSocket connection
- [ ] Live server status updates
- [ ] Notification bell

**Deliverable:** Complete web experience, ready for testing

---

## Milestone 3: Verification System (Weeks 9-11)

**Goal:** Working Hytale plugin and verification flow

### Week 9: Plugin Development (Java)

**Note:** This is Java development, separate from the main stack

**Plugin Foundation:**
- [ ] Setup Hytale plugin project (Java)
- [ ] Configuration system
- [ ] HTTP client for API calls
- [ ] HMAC signature generation

**Core Features:**
- [ ] Player join/leave tracking
- [ ] Playtime calculation (with AFK detection)
- [ ] Heartbeat sender
- [ ] Playtime sync batch sender

**Deliverable:** Plugin JAR that can authenticate and send data

---

### Week 10: Verification Flow

**Backend:**
- [ ] Complete verification flow
- [ ] Plugin status tracking
- [ ] Verification badge logic
- [ ] Verified review marking

**Frontend:**
- [ ] Plugin installation guide
- [ ] Verification status UI
- [ ] API key display (secure)

**Testing:**
- [ ] End-to-end verification test
- [ ] Plugin + backend integration

**Deliverable:** Server owners can verify servers via plugin

---

### Week 11: Reputation & Badges (Foundation)

**Backend:**
- [ ] Reputation calculation
- [ ] Badge definitions and criteria
- [ ] Badge awarding logic
- [ ] Reputation log

**Frontend:**
- [ ] Reputation display
- [ ] Badge showcase on profiles
- [ ] Badges list page

**Deliverable:** Users earn reputation and badges for engagement

---

## Milestone 4: Launch Prep (Weeks 12-14)

**Goal:** Production-ready platform

### Week 12: Performance & Security

**Performance:**
- [ ] API response optimization
- [ ] Database query optimization
- [ ] Redis caching implementation
- [ ] Image optimization

**Security:**
- [ ] Security audit
- [ ] Rate limiting testing
- [ ] Input sanitization review
- [ ] CORS and headers verification

**Monitoring:**
- [ ] Sentry error tracking
- [ ] Application logging
- [ ] Health check endpoints
- [ ] Basic analytics

**Deliverable:** Passes security checklist, performance targets met

---

### Week 13: Production Setup

**Infrastructure:**
- [ ] Setup Supabase production database
- [ ] Deploy API to Railway/VDS
- [ ] Deploy web to Vercel
- [ ] Configure Redis (Upstash or self-hosted)
- [ ] Setup CDN for images (Cloudflare R2)
- [ ] Configure domain and SSL

**CI/CD:**
- [ ] GitHub Actions for testing
- [ ] Automated deployment pipeline
- [ ] Database migration workflow

**Deliverable:** Production environment live

---

### Week 14: Launch & Marketing

**Pre-launch:**
- [ ] SEO optimization (meta tags, sitemap)
- [ ] OpenGraph images
- [ ] Newsletter announcement
- [ ] Social media preparation

**Soft Launch:**
- [ ] Invite early adopters
- [ ] Monitor error rates
- [ ] Gather feedback
- [ ] Hotfix critical issues

**Documentation:**
- [ ] API documentation finalized
- [ ] Server owner guide
- [ ] Plugin installation guide
- [ ] FAQ page

**Deliverable:** Public launch! 🚀

---

## Post-MVP Roadmap

### Phase 2: Growth (Months 4-6)

| Feature | Priority | Description |
|---------|----------|-------------|
| Guild System | P1 | Player clans and communities |
| Badge Economy | P1 | Purchasable badges, marketplace |
| Daily Puzzles | P2 | Engagement minigames |
| Prize Pools | P2 | Server-sponsored rewards |
| Elasticsearch | P2 | Advanced search |
| Mobile App | P3 | React Native/Expo |

### Phase 3: Expansion (Months 7-9)

| Feature | Priority | Description |
|---------|----------|-------------|
| Minecraft Support | P1 | Expand to Minecraft servers |
| Steam/Epic OAuth | P2 | More identity options |
| Mobile Optimization | P2 | Better mobile web experience |
| Analytics Dashboard | P2 | Enhanced server owner analytics |
| Moderation Tools | P2 | Community moderation |

---

## Resource Requirements

### Development Resources

| Role | Time Required | Notes |
|------|---------------|-------|
| Full-stack Developer | 12-14 weeks | You! |
| Java Developer | 1 week | For plugin (or contract) |
| Designer | As needed | Pixel art assets |

### Infrastructure Costs (MVP)

| Service | Provider | Monthly Cost |
|---------|----------|--------------|
| Database | Supabase (Pro) | $25 |
| API Hosting | Railway / Hetzner | $5-20 |
| Web Hosting | Vercel (Pro) | $20 |
| Redis | Upstash (Free tier) | $0 |
| Image Storage | Cloudflare R2 | ~$5 |
| Email | Resend | Free tier |
| Domain | Namecheap/etc | ~$10/year |
| **Total** | | **~$60-75/month** |

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Hytale API changes | Medium | Abstract plugin interface, version compatibility |
| Solo developer burnout | Medium | Scope strictly to MVP, regular breaks |
| Plugin development delays | Medium | Start early, simplify v1 features |
| Hosting costs exceed budget | Low | Start with free tiers, monitor usage |
| Competition launches first | Low | Focus on verification differentiation |

---

## Success Criteria

### MVP Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Registered Servers | 100+ | Database count |
| Registered Users | 1,000+ | Database count |
| Verified Servers | 50+ | Plugin active |
| Average Rating | 4.0+ | User feedback |
| Uptime | 99.5%+ | Monitoring |

### Quality Gates

Each milestone must pass:

- [ ] All tests passing
- [ ] No critical security issues
- [ ] Performance benchmarks met
- [ ] Code review complete
- [ ] Documentation updated

---

## Quick Start Checklist

### Before You Begin:

- [ ] Read all planning documents
- [ ] Setup development environment
- [ ] Create project repositories
- [ ] Configure CI/CD basics
- [ ] Setup communication channels (Discord, etc.)

### Week 1 Checklist:

- [ ] Fork/clone monorepo
- [ ] Run `docker-compose up`
- [ ] Access Swagger at `localhost:3001/api/docs`
- [ ] Make first API request
- [ ] Commit initial setup

---

## Document References

- [Product Planning](./01-product/PRODUCT_PLANNING.md) - Features and scope
- [Frontend Planning](./02-frontend-planning/FRONTEND_PLANNING.md) - Web architecture
- [Frontend Design](./03-frontend-design/FRONTEND_DESIGN.md) - UI/UX specifications
- [Database Design](./04-database-design/DATABASE_DESIGN.md) - Schema and queries
- [Webservices](./05-webservices/WEBSERVICES.md) - API design
- [Backend Architecture](./06-backend/BACKEND_ARCHITECTURE.md) - NestJS structure

---

**Ready to start? Begin with Milestone 1, Week 1!**
