# Phase 4: Database Design - FirstSpawn

**Status:** ✅ Schema Defined  
**Date:** 2026-02-20  
**Database:** PostgreSQL 15+  
**ORM:** Prisma  
**Migration Strategy:** Incremental with Prisma Migrate

---

## 1. Architecture Decisions

### 1.1 Database Choice: PostgreSQL

**Why PostgreSQL:**
- ✅ Full-text search built-in (for MVP, before Elasticsearch)
- ✅ JSONB support for flexible metadata
- ✅ Excellent Prisma integration
- ✅ Row-level security support
- ✅ Proven at scale
- ✅ ACID compliance for critical operations (transactions, reviews)

### 1.2 Sizing Considerations

Based on your Supabase/self-host question:

| Metric | Estimate | Notes |
|--------|----------|-------|
| Initial Users | 10,000 | First 6 months |
| Initial Servers | 500 | Registered servers |
| Reviews | 50,000 | Conservative estimate |
| Avg Row Size | ~2KB | With indexes |
| **Initial DB Size** | ~200MB | With room to grow |
| **1-Year Projection** | ~1-2GB | With growth |

**Recommendation:** 
- **Start with Supabase** (managed PostgreSQL)
- Free tier: 500MB (sufficient for MVP, ~6 months)
- Pro tier: 8GB ($25/month) - plenty of room
- **Self-host later** when you need full control or >8GB

---

## 2. Prisma Schema

### 2.1 Complete Schema Definition

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENUMS
// ============================================================================

enum GameType {
  HYTALE
  MINECRAFT // For future expansion
}

enum Platform {
  DISCORD
  STEAM
  EPIC_GAMES
  GOOGLE
  HYTALE
}

enum SubscriptionTier {
  FREE
  PREMIUM
  PRO
}

enum PluginStatus {
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
  REVOKED
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}

enum BadgeType {
  EARNED
  PURCHASED
}

enum BadgeCategory {
  USER
  SERVER
}

enum ReputationAction {
  REVIEW_POSTED
  REVIEW_UPVOTED
  REVIEW_DOWNVOTED
  REVIEW_VERIFIED
  SERVER_REGISTERED
  SERVER_VERIFIED
  ACCOUNT_VERIFIED
  PUZZLE_SOLVED
  MANUAL_ADJUSTMENT
}

// ============================================================================
// USER DOMAIN
// ============================================================================

model User {
  id                String    @id @default(cuid())
  
  // Authentication
  email             String    @unique
  emailVerified     Boolean   @default(false)
  emailVerifiedAt   DateTime?
  passwordHash      String    // Argon2id hash
  
  // Profile
  username          String    @unique
  displayName       String?
  avatarUrl         String?
  bio               String?   @db.Text
  
  // Status
  isBanned          Boolean   @default(false)
  bannedAt          DateTime?
  banReason         String?
  
  // Reputation & Engagement
  reputation        Int       @default(0)
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastActiveAt      DateTime?
  lastLoginAt       DateTime?
  
  // Relations
  identities        Identity[]
  ownedServers      Server[]
  reviews           Review[]
  favorites         Favorite[]
  badges            UserBadge[]
  reputationLogs    ReputationLog[]
  refreshTokens     RefreshToken[]
  
  @@index([email])
  @@index([username])
  @@index([reputation])
  @@index([createdAt])
  @@map("users")
}

model RefreshToken {
  id          String    @id @default(cuid())
  userId      String
  token       String    @unique // Hashed
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  revokedAt   DateTime?
  userAgent   String?
  ipAddress   String?
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

model Identity {
  id               String    @id @default(cuid())
  userId           String
  platform         Platform
  platformUserId   String
  platformUsername String?
  email            String?
  avatarUrl        String?
  accessToken      String?   // Encrypted
  refreshToken     String?   // Encrypted
  tokenExpiresAt   DateTime?
  metadata         Json?     // Platform-specific data
  verifiedAt       DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([platform, platformUserId])
  @@unique([userId, platform])
  @@index([userId])
  @@map("identities")
}

// ============================================================================
// SERVER DOMAIN
// ============================================================================

model Server {
  id               String           @id @default(cuid())
  ownerId          String
  
  // Basic Info
  gameType         GameType         @default(HYTALE)
  name             String
  slug             String           @unique
  description      String?          @db.Text
  shortDescription String?          @db.VarChar(280)
  
  // Connection
  ip               String           // Hytale server IP
  port             Int              @default(25565)
  
  // Links
  websiteUrl       String?
  discordUrl       String?
  bannerUrl        String?
  logoUrl          String?
  
  // Status
  isOnline         Boolean          @default(false)
  isVerified       Boolean          @default(false)  // Plugin verified
  isFeatured       Boolean          @default(false)
  isActive         Boolean          @default(true)
  
  // Subscription
  subscriptionTier SubscriptionTier @default(FREE)
  subscriptionExpiresAt DateTime?
  
  // Stats (cached from plugin/query)
  playerCount      Int              @default(0)
  maxPlayers       Int?
  uptimePercent    Float            @default(0)  // Last 30 days
  averageRating    Float            @default(0)
  reviewCount      Int              @default(0)
  favoriteCount    Int              @default(0)
  
  // Metadata
  region           String?          // EU, NA, ASIA, etc.
  language         String?          // Primary language
  version          String?          // Hytale version
  
  // Verification
  verificationToken String?         @unique
  verifiedAt       DateTime?
  
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  
  // Relations
  owner            User             @relation(fields: [ownerId], references: [id])
  tags             ServerTag[]
  reviews          Review[]
  favorites        Favorite[]
  uptimeChecks     UptimeCheck[]
  plugin           Plugin?
  badges           ServerBadge[]
  
  @@index([gameType])
  @@index([isOnline])
  @@index([isVerified])
  @@index([subscriptionTier])
  @@index([averageRating])
  @@index([playerCount])
  @@index([createdAt])
  @@index([slug])
  @@fulltext([name, description])  // For search
  @@map("servers")
}

model Tag {
  id          String      @id @default(cuid())
  name        String      @unique
  slug        String      @unique
  category    TagCategory // gamemode, feature, region
  color       String      @default("#2EBCDA") // Hex color
  description String?
  isActive    Boolean     @default(true)
  sortOrder   Int         @default(0)
  
  servers     ServerTag[]
  
  @@index([category])
  @@index([isActive])
  @@map("tags")
}

enum TagCategory {
  GAMEMODE
  FEATURE
  REGION
  VERSION
}

model ServerTag {
  id        String   @id @default(cuid())
  serverId  String
  tagId     String
  createdAt DateTime @default(now())
  
  server    Server   @relation(fields: [serverId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([serverId, tagId])
  @@index([serverId])
  @@index([tagId])
  @@map("server_tags")
}

model UptimeCheck {
  id          String   @id @default(cuid())
  serverId    String
  isOnline    Boolean
  playerCount Int?
  latency     Int?     // ms
  checkedAt   DateTime @default(now())
  
  server      Server   @relation(fields: [serverId], references: [id], onDelete: Cascade)
  
  @@index([serverId])
  @@index([checkedAt])
  @@map("uptime_checks")
}

// ============================================================================
// REVIEW DOMAIN
// ============================================================================

model Review {
  id               String       @id @default(cuid())
  serverId         String
  userId           String
  
  // Content
  rating           Int          // 1-5
  title            String?      @db.VarChar(100)
  content          String       @db.Text
  
  // Verification
  isVerified       Boolean      @default(false)  // Playtime verified
  verifiedPlaytime Int?         // Minutes played (from plugin)
  
  // Moderation
  status           ReviewStatus @default(PENDING)
  moderatedAt      DateTime?
  moderatedBy      String?      // Admin user ID
  moderatorNote    String?
  
  // Engagement
  helpfulCount     Int          @default(0)
  unhelpfulCount   Int          @default(0)
  
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  
  server           Server       @relation(fields: [serverId], references: [id], onDelete: Cascade)
  user             User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  helpfulMarks     ReviewHelpful[]
  
  @@unique([serverId, userId])  // One review per user per server
  @@index([serverId])
  @@index([userId])
  @@index([rating])
  @@index([status])
  @@index([createdAt])
  @@map("reviews")
}

model ReviewHelpful {
  id        String   @id @default(cuid())
  reviewId  String
  userId    String   // User who marked helpful/unhelpful
  isHelpful Boolean  // true = helpful, false = unhelpful
  createdAt DateTime @default(now())
  
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  @@unique([reviewId, userId])
  @@index([reviewId])
  @@map("review_helpful")
}

// ============================================================================
// PLUGIN DOMAIN
// ============================================================================

model Plugin {
  id              String       @id @default(cuid())
  serverId        String       @unique
  
  // Credentials
  apiKey          String       @unique // Hashed
  apiSecret       String       // Encrypted, for HMAC
  
  // Status
  status          PluginStatus @default(PENDING_VERIFICATION)
  lastHeartbeat   DateTime?
  verifiedAt      DateTime?
  
  // Plugin Info
  pluginVersion   String?
  serverVersion   String?
  
  // Stats (from last heartbeat)
  activePlayers   Int          @default(0)
  
  // IP Whitelist (optional security)
  allowedIps      String[]     // CIDR notation
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  server          Server       @relation(fields: [serverId], references: [id], onDelete: Cascade)
  playtimeRecords PlaytimeRecord[]
  
  @@index([apiKey])
  @@index([status])
  @@map("plugins")
}

model PlaytimeRecord {
  id              String   @id @default(cuid())
  pluginId        String
  
  // Player identification
  playerUuid      String   // Hytale player UUID
  playerUsername  String?
  
  // Playtime data
  playtimeMinutes Int      @default(0)
  lastSeenAt      DateTime
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  plugin          Plugin   @relation(fields: [pluginId], references: [id], onDelete: Cascade)
  
  @@unique([pluginId, playerUuid])
  @@index([pluginId])
  @@index([playerUuid])
  @@index([lastSeenAt])
  @@map("playtime_records")
}

// ============================================================================
// FAVORITES DOMAIN
// ============================================================================

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  serverId  String
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  server    Server   @relation(fields: [serverId], references: [id], onDelete: Cascade)
  
  @@unique([userId, serverId])
  @@index([userId])
  @@index([serverId])
  @@map("favorites")
}

// ============================================================================
// BADGE DOMAIN
// ============================================================================

model Badge {
  id          String        @id @default(cuid())
  
  name        String        @unique
  slug        String        @unique
  description String
  iconUrl     String?
  color       String        @default("#FFD700")
  
  category    BadgeCategory
  type        BadgeType
  
  // For earned badges
  criteria    Json?         // { type: "reviews", count: 10 }
  
  // For purchased badges
  price       Int?          // In cents
  
  isActive    Boolean       @default(true)
  sortOrder   Int           @default(0)
  createdAt   DateTime      @default(now())
  
  userBadges  UserBadge[]
  serverBadges ServerBadge[]
  
  @@index([category])
  @@index([type])
  @@index([isActive])
  @@map("badges")
}

model UserBadge {
  id          String   @id @default(cuid())
  userId      String
  badgeId     String
  
  isFeatured  Boolean  @default(false)
  earnedAt    DateTime @default(now())
  purchasedAt DateTime?
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge       Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  @@unique([userId, badgeId])
  @@index([userId])
  @@index([badgeId])
  @@map("user_badges")
}

model ServerBadge {
  id          String   @id @default(cuid())
  serverId    String
  badgeId     String
  
  isFeatured  Boolean  @default(false)
  earnedAt    DateTime @default(now())
  purchasedAt DateTime?
  expiresAt   DateTime? // For time-limited badges
  
  server      Server   @relation(fields: [serverId], references: [id], onDelete: Cascade)
  badge       Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  @@unique([serverId, badgeId])
  @@index([serverId])
  @@index([badgeId])
  @@map("server_badges")
}

// ============================================================================
// REPUTATION DOMAIN
// ============================================================================

model ReputationLog {
  id          String           @id @default(cuid())
  userId      String
  action      ReputationAction
  delta       Int              // Can be positive or negative
  reason      String?
  metadata    Json?            // Additional context
  createdAt   DateTime         @default(now())
  createdBy   String?          // Admin user ID if manual
  
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
  @@index([action])
  @@map("reputation_logs")
}
```

---

## 3. Key Design Decisions

### 3.1 Simplified from Original BACKEND.md

| Original | MVP Change | Rationale |
|----------|------------|-----------|
| Prize pools & redemptions | Removed | Phase 2 feature |
| Puzzles | Removed | Phase 2 feature |
| Guilds | Removed | Phase 2 feature |
| Transactions table | Removed | Add when payments implemented |
| Elasticsearch | PostgreSQL FTS | Simpler MVP, migrate later |
| Multiple game types | Hytale only | Focus on hype |

### 3.2 Data Types Explained

| Type | Usage |
|------|-------|
| `cuid()` | Primary keys - sortable, unique, non-sequential |
| `Json` | Flexible metadata (criteria, plugin data) |
| `@db.Text` | Long text (descriptions, reviews) |
| `@db.VarChar(n)` | Constrained strings |
| `@fulltext()` | PostgreSQL text search index |

### 3.3 Indexing Strategy

**Automatic Indexes:**
- All `@id` fields
- All `@unique` fields
- All relation foreign keys

**Manual Indexes (Performance):**
- Search fields: `slug`, `name`
- Filter fields: `isOnline`, `isVerified`, `gameType`
- Sort fields: `createdAt`, `averageRating`, `playerCount`
- Fulltext: `Server.name`, `Server.description`

---

## 4. Data Lifecycle & Retention

### 4.1 Retention Policies

| Data Type | Retention | Action |
|-----------|-----------|--------|
| Uptime checks | 90 days | Auto-delete old records |
| Refresh tokens | Until expiry | Revoked on logout |
| Review helpful marks | Forever | Aggregate counts stored on Review |
| Playtime records | Forever | Core feature data |
| Inactive servers | 1 year | Soft delete, then purge |

### 4.2 Soft Delete Strategy

For servers and reviews, use `isActive` flag rather than hard delete:

```typescript
// Instead of: prisma.server.delete({ where: { id } })
// Use: prisma.server.update({ where: { id }, data: { isActive: false } })
```

This preserves:
- Review history integrity
- User reputation calculations
- Analytics data

---

## 5. Search Implementation

### 5.1 PostgreSQL Full-Text Search

```typescript
// Server search with filters
const servers = await prisma.server.findMany({
  where: {
    // Text search
    OR: [
      { name: { search: query } },
      { description: { search: query } },
    ],
    // Filters
    isOnline: filters.online ?? undefined,
    isVerified: filters.verified ?? undefined,
    gameType: GameType.HYTALE,
    // Tags filter
    tags: filters.tags ? {
      some: {
        tag: {
          slug: { in: filters.tags }
        }
      }
    } : undefined,
  },
  orderBy: [
    { isFeatured: 'desc' },
    { averageRating: 'desc' },
  ],
  take: 20,
  skip: (page - 1) * 20,
});
```

### 5.2 Search Performance Optimization

**Database Configuration:**
```sql
-- GIN index for full-text search
CREATE INDEX idx_servers_search ON servers USING GIN (
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- Composite index for common queries
CREATE INDEX idx_servers_filtered ON servers (
  gameType, isOnline, isVerified, averageRating DESC
);
```

### 5.3 Migration to Elasticsearch (Phase 2)

When ready to upgrade:

1. **Keep PostgreSQL as source of truth**
2. **Sync to Elasticsearch** via Prisma middleware or change data capture
3. **Use Elasticsearch for:**
   - Complex aggregations (tag counts, region distribution)
   - Fuzzy search
   - Geo-distance queries
   - Autocomplete suggestions

---

## 6. Security Considerations

### 6.1 Data Encryption

| Data | Encryption | Notes |
|------|------------|-------|
| Passwords | Argon2id | Industry standard |
| API secrets | AES-256 | Application-level encryption |
| OAuth tokens | AES-256 | Application-level encryption |
| Connection strings | Environment variables | Never commit to repo |

### 6.2 Row-Level Security (RLS)

Supabase/PostgreSQL RLS policies for:

```sql
-- Users can only read their own refresh tokens
CREATE POLICY "users_own_tokens" ON refresh_tokens
  FOR ALL
  USING (user_id = auth.uid());

-- Reviews are readable by all, writable by owner only
CREATE POLICY "reviews_readable" ON reviews
  FOR SELECT
  USING (true);

CREATE POLICY "reviews_writable" ON reviews
  FOR ALL
  USING (user_id = auth.uid());
```

### 6.3 Data Access Patterns

**Always use Prisma Client with proper where clauses:**

```typescript
// ✅ Good - scoped to user
const myServers = await prisma.server.findMany({
  where: { ownerId: session.user.id }
});

// ❌ Bad - could expose other users' data
const allServers = await prisma.server.findMany();
```

---

## 7. Migration Strategy

### 7.1 Initial Migration

```bash
# Initialize Prisma
cd firstspawn/api
npx prisma init

# Generate migration
npx prisma migrate dev --name init

# Generate client
npx prisma generate
```

### 7.2 Future Migrations

```bash
# After schema changes
npx prisma migrate dev --name descriptive_name

# Deploy to production
npx prisma migrate deploy
```

### 7.3 Seeding

```typescript
// prisma/seed.ts
const tags = [
  { name: 'PvE', slug: 'pve', category: 'GAMEMODE' },
  { name: 'PvP', slug: 'pvp', category: 'GAMEMODE' },
  { name: 'Survival', slug: 'survival', category: 'GAMEMODE' },
  { name: 'Roleplay', slug: 'roleplay', category: 'GAMEMODE' },
  { name: 'Economy', slug: 'economy', category: 'FEATURE' },
  { name: 'Quests', slug: 'quests', category: 'FEATURE' },
];

await prisma.tag.createMany({ data: tags });
```

---

## 8. Scaling Considerations

### 8.1 Read Replicas

When traffic grows:

```
Primary DB (Write) ──▶ Read Replica 1 ──▶ Analytics queries
                  ──▶ Read Replica 2 ──▶ Search queries
```

### 8.2 Caching Strategy

| Data | Cache Layer | TTL |
|------|-------------|-----|
| Server list | Redis | 30 seconds |
| Server details | Redis | 60 seconds |
| User session | Redis | Session duration |
| Search results | Redis | 60 seconds |
| Tag list | Redis | 5 minutes |

### 8.3 Database Partitioning (Future)

When uptime_checks table grows:

```sql
-- Partition by month
CREATE TABLE uptime_checks_2026_01 PARTITION OF uptime_checks
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

---

## 9. Monitoring & Maintenance

### 9.1 Key Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Query latency (p95) | < 100ms | > 200ms |
| Connection pool | < 80% | > 90% |
| Disk usage | < 70% | > 85% |
| Slow queries | 0 | Any > 1s |

### 9.2 Maintenance Tasks

**Daily:**
- Check error logs
- Monitor connection pool

**Weekly:**
- Analyze query performance
- Check index usage

**Monthly:**
- Vacuum/analyze tables
- Review and archive old uptime checks
- Update statistics

---

## Related Documents

- [Product Planning](../01-product/PRODUCT_PLANNING.md)
- [Frontend Planning](../02-frontend-planning/FRONTEND_PLANNING.md)
- [Frontend Design](../03-frontend-design/FRONTEND_DESIGN.md)
- [Webservices](../05-webservices/WEBSERVICES.md)
- [Backend Architecture](../06-backend/BACKEND_ARCHITECTURE.md)
