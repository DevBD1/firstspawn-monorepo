# Backend Architecture for FirstSpawn

## Overview

This document outlines the backend architecture for **FirstSpawn** - the ultimate discovery ecosystem for Minecraft and Hytale. FirstSpawn is more than just a server list; it's a social network that connects players to active and upcoming communities with verified playtime reviews, cross-platform identity sync, guilds, badges, and daily puzzles with real in-game prizes.

---

## Technology Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| **API Framework** | NestJS | TypeScript-first, modular, scalable |
| **Database** | PostgreSQL | Relational + JSONB + complex queries |
| **ORM** | Prisma | Type safety, migrations, NestJS integration |
| **Search Engine** | Elasticsearch | Advanced filtering, full-text search at scale |
| **Cache/Sessions** | Redis | Performance, rate limiting, real-time state |
| **Auth** | Passport.js + JWT | OAuth, stateless authentication |
| **Validation** | class-validator | Request validation with decorators |
| **API Docs** | Swagger (OpenAPI) | Auto-generated documentation |
| **Background Jobs** | BullMQ | Uptime checks, puzzle rewards, scheduled tasks |
| **Real-time** | Socket.io (NestJS Gateway) | Live notifications, presence |
| **File Storage** | Cloudflare R2 | Server banners, avatars, cost-effective |
| **Payments** | Tebex | Paid badges, premium features |

---

## Recommended Project Structure

```
firstspawn-api/
├── src/
│   ├── modules/
│   │   ├── auth/                    # Authentication & OAuth
│   │   │   ├── strategies/          # Discord, Steam, Epic OAuth
│   │   │   ├── guards/
│   │   │   ├── dto/
│   │   │   └── auth.service.ts
│   │   ├── users/                   # User management
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   └── users.service.ts
│   │   ├── identities/              # Cross-platform identity sync
│   │   │   ├── entities/
│   │   │   └── identities.service.ts
│   │   ├── servers/                 # Game server registry
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   ├── services/
│   │   │   │   ├── server-discovery.service.ts
│   │   │   │   ├── server-uptime.service.ts
│   │   │   │   └── server-verification.service.ts
│   │   │   └── servers.controller.ts
│   │   ├── reviews/                 # Playtime-verified reviews/comments
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   └── reviews.service.ts
│   │   ├── tags/                    # Server tags/categories
│   │   │   ├── entities/
│   │   │   └── tags.service.ts
│   │   ├── guilds/                  # Guild/clan system
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   └── guilds.service.ts
│   │   ├── badges/                  # User & server badges
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   └── badges.service.ts
│   │   ├── puzzles/                 # Daily puzzles & minigames
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   └── puzzles.service.ts
│   │   ├── prizes/                  # Prize pool & redemption codes
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   └── prizes.service.ts
│   │   ├── favorites/               # User favorites
│   │   ├── transactions/            # Payment & transaction history
│   │   │   ├── entities/
│   │   │   └── transactions.service.ts
│   │   ├── reputation/              # Reputation tracking & logs
│   │   │   ├── entities/
│   │   │   └── reputation.service.ts
│   │   ├── plugins/                 # Plugin verification & communication
│   │   │   ├── guards/
│   │   │   ├── dto/
│   │   │   └── plugins.service.ts
│   │   ├── webhooks/                # Outgoing webhooks for server owners
│   │   ├── notifications/           # Real-time notifications
│   │   └── search/                  # Elasticsearch integration
│   │       └── search.service.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── utils/
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── elasticsearch.config.ts
│   │   └── stripe.config.ts
│   ├── database/
│   │   ├── prisma/
│   │   └── redis/
│   ├── gateways/                    # WebSocket gateways
│   │   └── notifications.gateway.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── elasticsearch/
│   └── mappings/
└── test/
```

---

## Core Enums

```prisma
enum GameType {
  MINECRAFT
  HYTALE
}

enum Platform {
  DISCORD
  STEAM
  EPIC_GAMES
  MINECRAFT    // Mojang account
  HYTALE       // Hytale account
}

enum GuildRole {
  OWNER
  ADMIN
  MODERATOR
  MEMBER
}

enum GuildVisibility {
  PUBLIC
  PRIVATE
  INVITE_ONLY
}

enum BadgeType {
  EARNED       // Achieved through activity
  PURCHASED    // Paid badges
}

enum BadgeCategory {
  USER
  SERVER
  GUILD
}

enum TransactionType {
  BADGE_PURCHASE
  PREMIUM_SUBSCRIPTION
  PRIZE_REDEMPTION
  REFUND
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum ReputationAction {
  REVIEW_UPVOTED
  REVIEW_DOWNVOTED
  REVIEW_FLAGGED_SPAM
  BADGE_EARNED
  GUILD_CONTRIBUTION
  PUZZLE_WIN
  ACCOUNT_VERIFIED
  MANUAL_ADJUSTMENT
}

enum PrizeStatus {
  AVAILABLE
  RESERVED
  REDEEMED
  EXPIRED
}

enum PluginStatus {
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
  REVOKED
}
```

---

## Data Model Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Core Entities                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  User ─────────────┬─► LinkedIdentity (Discord, Steam, Epic, MC, Hytale)│
│         │          ├─► UserBadge                                        │
│         │          ├─► Review (with optional verified playtime)         │
│         │          ├─► GuildMembership                                  │
│         │          ├─► Favorite                                         │
│         │          ├─► PuzzleProgress                                   │
│         │          ├─► ReputationLog                                    │
│         │          └─► Transaction                                      │
│                                                                         │
│  GameServer ───────┬─► ServerBadge (earned/purchased)                   │
│         │          ├─► Review                                           │
│         │          ├─► ServerTag (many-to-many with Tag)                │
│         │          ├─► UptimeLog                                        │
│         │          ├─► PluginInstance (verified plugin connection)      │
│         │          ├─► PrizePool                                        │
│         │          └─► ServerOwner (User)                               │
│                                                                         │
│  PrizePool ────────┬─► Prize                                            │
│                    └─► RedemptionCode                                   │
│                                                                         │
│  Guild ────────────┬─► GuildMembership                                  │
│                    ├─► GuildBadge                                       │
│                    └─► GuildInvite                                      │
│                                                                         │
│  Puzzle ───────────┬─► PuzzleSubmission                                 │
│                    └─► PuzzleReward ──► RedemptionCode                  │
│                                                                         │
│  Tag ──────────────┴─► ServerTag (many-to-many)                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Architecture

### Overview

FirstSpawn uses a **hybrid authentication** strategy:

1. **Primary Method**: Email & Password (traditional registration/login)
2. **Secondary Methods**: Passport.js OAuth (Discord, Steam, Epic Games, Google) for quick login

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Authentication Strategy                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    PRIMARY: Email & Password                        │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  Register ──► Email + Password + Username                           │    │
│  │              │                                                      │    │
│  │              ▼                                                      │    │
│  │         Hash password (bcrypt/argon2)                               │    │
│  │              │                                                      │    │
│  │              ▼                                                      │    │
│  │         Send verification email                                     │    │
│  │              │                                                      │    │
│  │              ▼                                                      │    │
│  │         User clicks link ──► emailVerified = true                   │    │
│  │                                                                     │    │
│  │  Login ──► Email + Password                                         │    │
│  │           │                                                         │    │
│  │           ▼                                                         │    │
│  │      Verify password hash                                           │    │
│  │           │                                                         │    │
│  │           ▼                                                         │    │
│  │      Issue JWT + Refresh Token                                      │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              SECONDARY: OAuth Quick Login                           │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  OAuth Login ──► Discord / Steam / Epic / Google                    │    │
│  │                  │                                                  │    │
│  │                  ▼                                                  │    │
│  │            Request email scope                                      │    │
│  │                  │                                                  │    │
│  │                  ▼                                                  │    │
│  │            Retrieve user profile (email, username, avatar)          │    │
│  │                  │                                                  │    │
│  │                  ▼                                                  │    │
│  │  ┌───────────────────────────────────────────────────────────┐      │    │
│  │  │ Check: Does email already exist in database?              │      │    │
│  │  │                                                           │      │    │
│  │  │  YES ──► Link OAuth identity to existing user             │      │    │
│  │  │         Issue JWT + Refresh Token                         │      │    │
│  │  │                                                           │      │    │
│  │  │  NO ───► Create new user with:                            │      │    │
│  │  │           • email from OAuth profile                      │      │    │
│  │  │           • emailVerified = true (OAuth verified)         │      │    │
│  │  │           • passwordHash = NULL (ghost password)          │      │    │
│  │  │           • username = generate from OAuth or prompt      │      │    │
│  │  │           • Link OAuth identity                           │      │    │
│  │  │         Issue JWT + Refresh Token                         │      │    │
│  │  └───────────────────────────────────────────────────────────┘      │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The "Ghost Password" Pattern

When users sign up via OAuth (Discord, Google, etc.), we need to handle the password field:

| Approach | Implementation | Notes |
|----------|----------------|-------|
| **Nullable Password** | `passwordHash = NULL` | User cannot login with email/password until they set one |
| **Random Hash** | `passwordHash = hash(uuid())` | Effectively locked, same result as null |

**Recommended**: Use `passwordHash = NULL` for clarity in code logic.

### Set Password Flow (OAuth → Email/Password)

If an OAuth-first user wants to enable email/password login:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    OAuth User → Set Password Flow                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. User clicks "Set Password" in account settings                      │
│     OR "Forgot Password?" on login screen                               │
│                    │                                                    │
│                    ▼                                                    │
│  2. Backend checks: User email exists AND emailVerified = true          │
│                    │                                                    │
│                    ▼                                                    │
│  3. Generate password reset token (secure random, hashed in DB)         │
│     Set passwordResetExpires = now + 1 hour                             │
│                    │                                                    │
│                    ▼                                                    │
│  4. Send email with reset link: /reset-password?token=xxx               │
│                    │                                                    │
│                    ▼                                                    │
│  5. User clicks link, enters new password                               │
│                    │                                                    │
│                    ▼                                                    │
│  6. Backend validates token, hashes new password                        │
│     passwordHash = hash(newPassword)                                    │
│     passwordResetToken = NULL                                           │
│                    │                                                    │
│                    ▼                                                    │
│  7. User can now login with email + password                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Token Strategy

| Token Type | Storage | Expiry | Purpose |
|------------|---------|--------|---------|
| **Access Token (JWT)** | Client memory / httpOnly cookie | 15 minutes | API authentication |
| **Refresh Token** | httpOnly cookie + DB | 7 days | Obtain new access tokens |

### Refresh Token Security

- Stored **hashed** in database (bcrypt)
- One-time use: Rotation on every refresh
- Device tracking: Store user agent + IP
- Revocation: Can revoke individual sessions or all sessions

### Password Requirements

| Requirement | Value |
|-------------|-------|
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Complexity | At least 1 uppercase, 1 lowercase, 1 number |
| Breached check | Optional: Check against HaveIBeenPwned API |
| Hashing algorithm | Argon2id (preferred) or bcrypt |

---

## Prisma Schema Draft


```prisma
// ============================================================================
// USER DOMAIN
// ============================================================================

model User {
  id                String            @id @default(cuid())
  
  // Authentication
  email             String            @unique
  passwordHash      String?           // Nullable for "ghost password" (OAuth-first users)
  emailVerified     Boolean           @default(false)
  emailVerifiedAt   DateTime?
  
  // Password Reset
  passwordResetToken    String?       // Hashed token
  passwordResetExpires  DateTime?
  
  // Profile
  username          String            @unique
  displayName       String?
  avatarUrl         String?
  bio               String?
  
  // Status
  reputation        Int               @default(0)
  isPremium         Boolean           @default(false)
  isVerified        Boolean           @default(false)
  isBanned          Boolean           @default(false)
  
  // Timestamps
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  lastActiveAt      DateTime?
  lastLoginAt       DateTime?

  // Relations
  identities        LinkedIdentity[]
  ownedServers      GameServer[]      @relation("ServerOwner")
  reviews           Review[]
  badges            UserBadge[]
  guildMemberships  GuildMembership[]
  ownedGuilds       Guild[]           @relation("GuildOwner")
  favorites         Favorite[]
  puzzleProgress    PuzzleProgress[]
  puzzleSubmissions PuzzleSubmission[]
  transactions      Transaction[]
  reputationLogs    ReputationLog[]
  notifications     Notification[]
  refreshTokens     RefreshToken[]
  
  @@index([email])
  @@index([username])
  @@index([reputation])
  @@index([createdAt])
}

model RefreshToken {
  id          String   @id @default(cuid())
  userId      String
  token       String   @unique  // Hashed
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  revokedAt   DateTime?
  userAgent   String?  // Browser/device info
  ipAddress   String?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}

model LinkedIdentity {
  id              String    @id @default(cuid())
  userId          String
  platform        Platform
  platformUserId  String
  platformUsername String?
  accessToken     String?   // Encrypted
  refreshToken    String?   // Encrypted
  tokenExpiresAt  DateTime?
  metadata        Json?     // Platform-specific data
  verifiedAt      DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([platform, platformUserId])
  @@unique([userId, platform])
  @@index([userId])
}

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
}

// ============================================================================
// SERVER DOMAIN
// ============================================================================

model GameServer {
  id              String          @id @default(cuid())
  ownerId         String
  gameType        GameType
  name            String
  slug            String          @unique
  description     String?
  shortDescription String?
  ip              String
  port            Int?
  websiteUrl      String?
  discordUrl      String?
  bannerUrl       String?
  logoUrl         String?
  
  // Status
  isOnline        Boolean         @default(false)
  isVerified      Boolean         @default(false)  // Plugin verified
  isFeatured      Boolean         @default(false)
  isActive        Boolean         @default(true)
  
  // Stats (cached, updated by background jobs)
  playerCount     Int             @default(0)
  maxPlayers      Int?
  uptime          Float           @default(0)      // Percentage
  totalPlaytime   Int             @default(0)      // Total hours across all players
  averageRating   Float           @default(0)
  reviewCount     Int             @default(0)
  favoriteCount   Int             @default(0)
  
  // Metadata
  version         String?
  region          String?
  language        String?
  launchDate      DateTime?
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Relations
  owner           User            @relation("ServerOwner", fields: [ownerId], references: [id])
  tags            ServerTag[]
  reviews         Review[]
  badges          ServerBadge[]
  favorites       Favorite[]
  uptimeLogs      UptimeLog[]
  pluginInstances PluginInstance[]
  prizePool       PrizePool?

  @@index([gameType])
  @@index([isOnline])
  @@index([averageRating])
  @@index([playerCount])
  @@index([createdAt])
}

model Tag {
  id          String      @id @default(cuid())
  name        String      @unique
  slug        String      @unique
  category    String?     // e.g., "gamemode", "feature", "community"
  color       String?     // Hex color for UI
  icon        String?     // Icon identifier
  description String?
  isActive    Boolean     @default(true)
  sortOrder   Int         @default(0)
  
  servers     ServerTag[]

  @@index([category])
  @@index([isActive])
}

model ServerTag {
  id        String     @id @default(cuid())
  serverId  String
  tagId     String
  createdAt DateTime   @default(now())

  server    GameServer @relation(fields: [serverId], references: [id], onDelete: Cascade)
  tag       Tag        @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([serverId, tagId])
  @@index([serverId])
  @@index([tagId])
}

model UptimeLog {
  id          String     @id @default(cuid())
  serverId    String
  isOnline    Boolean
  playerCount Int?
  latency     Int?       // ms
  checkedAt   DateTime   @default(now())

  server      GameServer @relation(fields: [serverId], references: [id], onDelete: Cascade)

  @@index([serverId])
  @@index([checkedAt])
}

// ============================================================================
// REVIEW DOMAIN (Reviews = Comments with ratings)
// ============================================================================

model Review {
  id              String     @id @default(cuid())
  serverId        String
  userId          String
  
  // Content
  rating          Int        // 1-5
  title           String?
  content         String
  
  // Verification
  isVerified      Boolean    @default(false)  // Has verified playtime
  verifiedPlaytime Int?      // Minutes of verified playtime
  
  // Moderation
  isApproved      Boolean    @default(true)
  isFlagged       Boolean    @default(false)
  flagReason      String?
  
  // Engagement
  upvotes         Int        @default(0)
  downvotes       Int        @default(0)
  
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  server          GameServer @relation(fields: [serverId], references: [id], onDelete: Cascade)
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  votes           ReviewVote[]

  @@unique([serverId, userId])  // One review per user per server
  @@index([serverId])
  @@index([userId])
  @@index([rating])
  @@index([createdAt])
}

model ReviewVote {
  id        String   @id @default(cuid())
  reviewId  String
  oderId    String   // User who voted
  isUpvote  Boolean
  createdAt DateTime @default(now())

  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@unique([reviewId, oderId])
  @@index([reviewId])
}

// ============================================================================
// PLUGIN VERIFICATION DOMAIN
// ============================================================================

model PluginInstance {
  id              String       @id @default(cuid())
  serverId        String
  gameType        GameType
  
  // Verification
  apiKey          String       @unique  // Hashed, used by plugin to authenticate
  apiSecret       String                // Encrypted, for HMAC signing
  lastHeartbeat   DateTime?
  status          PluginStatus @default(PENDING_VERIFICATION)
  
  // Plugin info
  pluginVersion   String?
  serverVersion   String?      // Minecraft/Hytale version
  
  // Stats reported by plugin
  totalPlaytime   Json?        // { [minecraftUUID]: playtimeMinutes }
  activePlayers   Int          @default(0)
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  verifiedAt      DateTime?

  server          GameServer   @relation(fields: [serverId], references: [id], onDelete: Cascade)
  playtimeRecords PlaytimeRecord[]

  @@index([serverId])
  @@index([apiKey])
  @@index([status])
}

model PlaytimeRecord {
  id              String         @id @default(cuid())
  pluginId        String
  playerUuid      String         // Minecraft UUID or Hytale ID
  playerUsername  String?
  playtimeMinutes Int            @default(0)
  lastSeen        DateTime
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  plugin          PluginInstance @relation(fields: [pluginId], references: [id], onDelete: Cascade)

  @@unique([pluginId, playerUuid])
  @@index([pluginId])
  @@index([playerUuid])
}

// ============================================================================
// PRIZE & PUZZLE DOMAIN
// ============================================================================

model PrizePool {
  id           String     @id @default(cuid())
  serverId     String     @unique
  
  // Configuration
  isActive     Boolean    @default(true)
  description  String?
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  server       GameServer @relation(fields: [serverId], references: [id], onDelete: Cascade)
  prizes       Prize[]
}

model Prize {
  id              String           @id @default(cuid())
  poolId          String
  
  name            String
  description     String?
  consoleCommand  String           // e.g., "give {player} diamond 64"
  quantity        Int              @default(1)  // How many can be given out
  quantityUsed    Int              @default(0)
  
  // Validity
  validFrom       DateTime?
  validUntil      DateTime?
  isActive        Boolean          @default(true)
  
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  pool            PrizePool        @relation(fields: [poolId], references: [id], onDelete: Cascade)
  redemptionCodes RedemptionCode[]

  @@index([poolId])
  @@index([isActive])
}

model RedemptionCode {
  id          String      @id @default(cuid())
  prizeId     String
  
  code        String      @unique  // The actual redemption code
  status      PrizeStatus @default(AVAILABLE)
  
  // Redemption details
  redeemedBy  String?     // User ID
  redeemedAt  DateTime?
  executedAt  DateTime?   // When plugin executed the command
  
  expiresAt   DateTime?
  createdAt   DateTime    @default(now())

  prize       Prize       @relation(fields: [prizeId], references: [id], onDelete: Cascade)

  @@index([prizeId])
  @@index([code])
  @@index([status])
  @@index([redeemedBy])
}

model Puzzle {
  id              String             @id @default(cuid())
  
  // Content
  title           String
  description     String?
  type            String             // e.g., "trivia", "word", "visual"
  difficulty      Int                @default(1)  // 1-5
  content         Json               // Puzzle data (questions, answers, etc.)
  
  // Scheduling
  publishDate     DateTime
  expiresAt       DateTime
  
  // Stats
  participantCount Int               @default(0)
  winnerCount     Int                @default(0)
  
  isActive        Boolean            @default(true)
  createdAt       DateTime           @default(now())

  submissions     PuzzleSubmission[]
  rewards         PuzzleReward[]

  @@index([publishDate])
  @@index([isActive])
}

model PuzzleSubmission {
  id          String   @id @default(cuid())
  puzzleId    String
  userId      String
  
  answer      Json     // User's submitted answer
  isCorrect   Boolean
  score       Int?     // Points earned
  timeSpent   Int?     // Seconds
  
  createdAt   DateTime @default(now())

  puzzle      Puzzle   @relation(fields: [puzzleId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([puzzleId, userId])
  @@index([puzzleId])
  @@index([userId])
  @@index([isCorrect])
}

model PuzzleProgress {
  id              String   @id @default(cuid())
  userId          String
  
  totalPoints     Int      @default(0)
  puzzlesSolved   Int      @default(0)
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastPlayedAt    DateTime?
  
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId])
}

model PuzzleReward {
  id              String          @id @default(cuid())
  puzzleId        String
  redemptionCodeId String?        @unique
  
  rank            Int             // 1st, 2nd, 3rd place etc.
  description     String?
  
  awardedTo       String?         // User ID
  awardedAt       DateTime?

  puzzle          Puzzle          @relation(fields: [puzzleId], references: [id], onDelete: Cascade)

  @@index([puzzleId])
}

// ============================================================================
// GUILD DOMAIN (Foundation)
// ============================================================================

model Guild {
  id              String            @id @default(cuid())
  ownerId         String
  
  name            String
  slug            String            @unique
  description     String?
  avatarUrl       String?
  bannerUrl       String?
  
  visibility      GuildVisibility   @default(PUBLIC)
  maxMembers      Int               @default(100)
  
  // Stats
  memberCount     Int               @default(1)
  reputation      Int               @default(0)
  
  isVerified      Boolean           @default(false)
  isActive        Boolean           @default(true)
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  owner           User              @relation("GuildOwner", fields: [ownerId], references: [id])
  members         GuildMembership[]
  badges          GuildBadge[]
  invites         GuildInvite[]

  @@index([name])
  @@index([visibility])
  @@index([memberCount])
}

model GuildMembership {
  id        String    @id @default(cuid())
  guildId   String
  userId    String
  role      GuildRole @default(MEMBER)
  joinedAt  DateTime  @default(now())

  guild     Guild     @relation(fields: [guildId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([guildId, userId])
  @@index([guildId])
  @@index([userId])
  @@index([role])
}

model GuildInvite {
  id          String   @id @default(cuid())
  guildId     String
  code        String   @unique
  maxUses     Int?
  uses        Int      @default(0)
  expiresAt   DateTime?
  createdBy   String   // User ID
  createdAt   DateTime @default(now())

  guild       Guild    @relation(fields: [guildId], references: [id], onDelete: Cascade)

  @@index([guildId])
  @@index([code])
}

// ============================================================================
// BADGE DOMAIN (Foundation)
// ============================================================================

model Badge {
  id              String        @id @default(cuid())
  
  name            String        @unique
  slug            String        @unique
  description     String
  iconUrl         String?
  color           String?       // Hex color
  
  category        BadgeCategory
  type            BadgeType
  
  // For earned badges
  criteria        Json?         // { type: "reviews", count: 100 }
  
  // For purchased badges
  price           Int?          // In cents
  
  isActive        Boolean       @default(true)
  sortOrder       Int           @default(0)
  createdAt       DateTime      @default(now())

  userBadges      UserBadge[]
  serverBadges    ServerBadge[]
  guildBadges     GuildBadge[]

  @@index([category])
  @@index([type])
  @@index([isActive])
}

model UserBadge {
  id          String   @id @default(cuid())
  userId      String
  badgeId     String
  
  isFeatured  Boolean  @default(false)  // Show on profile
  earnedAt    DateTime @default(now())
  purchasedAt DateTime?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge       Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@index([userId])
  @@index([badgeId])
}

model ServerBadge {
  id          String     @id @default(cuid())
  serverId    String
  badgeId     String
  
  isFeatured  Boolean    @default(false)
  earnedAt    DateTime   @default(now())
  purchasedAt DateTime?
  expiresAt   DateTime?  // For subscription badges

  server      GameServer @relation(fields: [serverId], references: [id], onDelete: Cascade)
  badge       Badge      @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([serverId, badgeId])
  @@index([serverId])
  @@index([badgeId])
}

model GuildBadge {
  id          String   @id @default(cuid())
  guildId     String
  badgeId     String
  
  earnedAt    DateTime @default(now())

  guild       Guild    @relation(fields: [guildId], references: [id], onDelete: Cascade)
  badge       Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([guildId, badgeId])
  @@index([guildId])
  @@index([badgeId])
}

// ============================================================================
// TRANSACTION DOMAIN
// ============================================================================

model Transaction {
  id                String            @id @default(cuid())
  userId            String
  
  type              TransactionType
  status            TransactionStatus @default(PENDING)
  
  amount            Int               // In cents
  currency          String            @default("USD")
  
  // Stripe
  stripePaymentId   String?
  stripeInvoiceId   String?
  
  // What was purchased
  itemType          String?           // "badge", "premium", etc.
  itemId            String?           // Reference to the item
  
  metadata          Json?
  
  createdAt         DateTime          @default(now())
  completedAt       DateTime?
  refundedAt        DateTime?

  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@index([status])
  @@index([createdAt])
}

// ============================================================================
// FAVORITES & NOTIFICATIONS
// ============================================================================

model Favorite {
  id        String     @id @default(cuid())
  userId    String
  serverId  String
  createdAt DateTime   @default(now())

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  server    GameServer @relation(fields: [serverId], references: [id], onDelete: Cascade)

  @@unique([userId, serverId])
  @@index([userId])
  @@index([serverId])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  
  type      String   // e.g., "review_reply", "badge_earned", "puzzle_won"
  title     String
  message   String
  data      Json?    // Additional context
  
  isRead    Boolean  @default(false)
  readAt    DateTime?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}

// ============================================================================
// WEBHOOK DOMAIN (For server owners)
// ============================================================================

model Webhook {
  id          String   @id @default(cuid())
  serverId    String
  
  url         String
  secret      String   // For HMAC signing
  events      String[] // ["review.created", "badge.earned"]
  
  isActive    Boolean  @default(true)
  lastTriggered DateTime?
  failureCount Int     @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([serverId])
  @@index([isActive])
}

model WebhookLog {
  id          String   @id @default(cuid())
  webhookId   String
  
  event       String
  payload     Json
  statusCode  Int?
  response    String?
  success     Boolean
  
  createdAt   DateTime @default(now())

  @@index([webhookId])
  @@index([createdAt])
}
```

---

## Plugin Verification System

### Security Architecture

To prevent manipulation from fake/cracked plugins, the system uses a **multi-layer verification** approach:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Plugin Verification Flow                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. REGISTRATION (Server Owner Dashboard)                               │
│     ┌──────────────┐                                                    │
│     │ Server Owner │ ──► Generates API Key + Secret in Dashboard        │
│     └──────────────┘     └──► Downloads official plugin with embedded   │
│                               credentials                               │
│                                                                         │
│  2. PLUGIN AUTHENTICATION (Every API Call)                              │
│     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐          │
│     │   Plugin     │────►│   Backend    │────►│   Validate   │          │
│     │   Request    │     │   Receives   │     │   HMAC Sig   │          │
│     └──────────────┘     └──────────────┘     └──────────────┘          │
│           │                                          │                  │
│           └─── Headers ──────────────────────────────┘                  │
│               X-FirstSpawn-Key: {apiKey}                                │
│               X-FirstSpawn-Timestamp: {unixTimestamp}                   │
│               X-FirstSpawn-Signature: HMAC-SHA256(payload+timestamp)    │
│                                                                         │
│  3. ADDITIONAL VERIFICATION LAYERS                                      │
│     ┌──────────────────────────────────────────────────────────┐        │
│     │ • Plugin version validation (must be official version)   │        │
│     │ • Request timestamp validation (±5 min tolerance)        │        │
│     │ • Rate limiting per API key                              │        │
│     │ • IP whitelist (optional, configured by server owner)    │        │
│     │ • Behavioral analysis (detect anomalous patterns)        │        │
│     │ • Plugin heartbeat (must ping every 5 min when active)   │        │
│     └──────────────────────────────────────────────────────────┘        │
│                                                                         │
│  4. PLAYTIME INTEGRITY                                                  │
│     ┌──────────────────────────────────────────────────────────┐        │
│     │ • Plugin tracks playtime independently (not server TPS)  │        │
│     │ • AFK detection built into plugin                        │        │
│     │ • Playtime increments must be reasonable (<24h/day)      │        │
│     │ • Cross-reference with server uptime logs                │        │
│     │ • Anomaly detection: flag sudden massive jumps           │        │
│     └──────────────────────────────────────────────────────────┘        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Plugin API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/plugin/heartbeat` | POST | Plugin alive check, reports active players |
| `/api/v1/plugin/playtime/sync` | POST | Bulk sync playtime records |
| `/api/v1/plugin/playtime/player` | POST | Single player playtime update |
| `/api/v1/plugin/redemption/check` | GET | Check if user has pending redemption |
| `/api/v1/plugin/redemption/execute` | POST | Mark redemption as executed |
| `/api/v1/plugin/verify` | POST | Initial plugin verification |

### HMAC Signature Example

```typescript
// Plugin side (Java/Kotlin pseudo-code)
const payload = JSON.stringify(requestBody);
const timestamp = Date.now();
const message = `${timestamp}.${payload}`;
const signature = HMAC_SHA256(message, apiSecret);

// Headers
X-FirstSpawn-Key: fs_pk_abc123...
X-FirstSpawn-Timestamp: 1704900000000
X-FirstSpawn-Signature: sha256=abc123def456...
```

---

## Rate Limiting Strategy

### Tiered Rate Limits

| Endpoint Category | Guest | User | Premium | Server Owner |
|-------------------|-------|------|---------|--------------|
| **Search/Browse** | 30/min | 60/min | 120/min | 120/min |
| **Reviews** | N/A | 5/hour | 10/hour | 10/hour |
| **Server Register** | N/A | 3 total | 10 total | Unlimited |
| **Plugin API** | N/A | N/A | N/A | 1000/min |
| **Auth** | 5/min | 10/min | 10/min | 10/min |
| **Favorites** | N/A | 100/hour | 200/hour | 200/hour |
| **Puzzle Submit** | N/A | 10/puzzle | 10/puzzle | 10/puzzle |

### Implementation

```typescript
// NestJS Throttler Configuration
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 second
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,  // 1 minute
        limit: 60,
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 100,
      },
    ]),
  ],
})
```

---

## Elasticsearch Integration

### Index Mappings

```json
{
  "game_servers": {
    "mappings": {
      "properties": {
        "id": { "type": "keyword" },
        "name": { 
          "type": "text",
          "analyzer": "standard",
          "fields": {
            "keyword": { "type": "keyword" }
          }
        },
        "description": { "type": "text" },
        "gameType": { "type": "keyword" },
        "tags": { "type": "keyword" },
        "region": { "type": "keyword" },
        "language": { "type": "keyword" },
        "isOnline": { "type": "boolean" },
        "isVerified": { "type": "boolean" },
        "playerCount": { "type": "integer" },
        "maxPlayers": { "type": "integer" },
        "uptime": { "type": "float" },
        "averageRating": { "type": "float" },
        "reviewCount": { "type": "integer" },
        "favoriteCount": { "type": "integer" },
        "createdAt": { "type": "date" },
        "location": { "type": "geo_point" }
      }
    }
  }
}
```

### Search Features

| Feature | Implementation |
|---------|----------------|
| **Full-text search** | Multi-match on name, description |
| **Filters** | Term queries on gameType, tags, region |
| **Sorting** | playerCount, averageRating, uptime, createdAt |
| **Geo-search** | Distance-based filtering by region |
| **Aggregations** | Tag counts, game type distribution |
| **Suggestions** | Completion suggester for autocomplete |

### Sync Strategy

- **Real-time**: Updates via Prisma middleware on CRUD operations
- **Full reindex**: Nightly job for data consistency
- **Bulk operations**: BullMQ job for batch updates

---

## WebSocket Architecture

### Event Structure

```typescript
// Connection
client.connect({ token: 'jwt_token' });

// Authentication
server.emit('authenticated', { userId: 'xxx' });

// Event Categories
interface WebSocketEvents {
  // User Events
  'user:badgeEarned': { badgeId: string; badgeName: string };
  'user:reputationChange': { delta: number; newTotal: number; reason: string };
  'user:reviewRated': { reviewId: string; isUpvote: boolean };
  
  // Server Events (for server owners)
  'server:statusChange': { serverId: string; isOnline: boolean };
  'server:newReview': { serverId: string; reviewId: string; rating: number };
  'server:newFavorite': { serverId: string; userId: string };
  'server:badgeEarned': { serverId: string; badgeId: string };
  
  // Guild Events
  'guild:memberJoined': { guildId: string; userId: string };
  'guild:memberLeft': { guildId: string; userId: string };
  'guild:inviteUsed': { guildId: string; inviteCode: string };
  
  // Puzzle Events
  'puzzle:newDaily': { puzzleId: string; title: string };
  'puzzle:solved': { puzzleId: string; rank?: number };
  'puzzle:prizeWon': { prizeId: string; redemptionCode: string };
  
  // System Events
  'notification:new': { notificationId: string; type: string; title: string };
}
```

### NestJS Gateway

```typescript
@WebSocketGateway({
  namespace: 'events',
  cors: { origin: ['https://api.firstspawn.com'] },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('subscribe:server')
  handleServerSubscription(client: Socket, serverId: string) {
    client.join(`server:${serverId}`);
  }

  @SubscribeMessage('subscribe:guild')
  handleGuildSubscription(client: Socket, guildId: string) {
    client.join(`guild:${guildId}`);
  }
}
```

---

## API Versioning Strategy

All API endpoints follow the pattern:

```
/api/v1/resource
/api/v2/resource  (future)
```

### Versioning Rules

1. **URL-based versioning**: `/api/v1/`, `/api/v2/`
2. **Support window**: 2 major versions simultaneously
3. **Deprecation notice**: 6 months before sunsetting
4. **Breaking changes**: Only in major versions

---

## Environment Configuration

### Required Environment Variables

```bash
# Application
NODE_ENV=development|staging|production
PORT=3000
API_PREFIX=api
API_VERSION=v1
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/firstspawn

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PASSWORD_SALT_ROUNDS=12

# Email Service (Resend recommended)
RESEND_API_KEY=
EMAIL_FROM=FirstSpawn <noreply@firstspawn.com>

# OR SMTP (alternative)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# OAuth Providers
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_CALLBACK_URL=

STEAM_API_KEY=
STEAM_CALLBACK_URL=

EPIC_CLIENT_ID=
EPIC_CLIENT_SECRET=
EPIC_CALLBACK_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Storage
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=firstspawn
R2_ENDPOINT=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Monitoring
SENTRY_DSN=
```

---

## Key API Endpoints

### Auth Module

#### Primary: Email & Password
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register with email + password + username |
| POST | `/api/v1/auth/login` | Login with email + password |
| POST | `/api/v1/auth/verify-email` | Verify email with token from email link |
| POST | `/api/v1/auth/resend-verification` | Resend verification email |
| POST | `/api/v1/auth/forgot-password` | Request password reset email |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| POST | `/api/v1/auth/change-password` | Change password (authenticated) |

#### Secondary: OAuth Quick Login
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/discord` | Initiate Discord OAuth |
| GET | `/api/v1/auth/discord/callback` | Discord OAuth callback |
| GET | `/api/v1/auth/steam` | Initiate Steam OAuth |
| GET | `/api/v1/auth/steam/callback` | Steam OAuth callback |
| GET | `/api/v1/auth/epic` | Initiate Epic Games OAuth |
| GET | `/api/v1/auth/epic/callback` | Epic OAuth callback |
| GET | `/api/v1/auth/google` | Initiate Google OAuth |
| GET | `/api/v1/auth/google/callback` | Google OAuth callback |

#### Token Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Invalidate refresh token |
| POST | `/api/v1/auth/logout-all` | Invalidate all sessions |
| GET | `/api/v1/auth/sessions` | List active sessions |
| DELETE | `/api/v1/auth/sessions/:id` | Revoke specific session |


### Users Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/:id` | Get user profile |
| GET | `/api/v1/users/:id/badges` | Get user badges |
| GET | `/api/v1/users/:id/reviews` | Get user reviews |
| GET | `/api/v1/users/:id/guilds` | Get user guilds |
| PATCH | `/api/v1/users/me` | Update own profile |

### Identities Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/identities` | List linked identities |
| POST | `/api/v1/identities/link/:platform` | Link new platform |
| DELETE | `/api/v1/identities/:platform` | Unlink platform |

### Servers Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/servers` | Search/list servers |
| GET | `/api/v1/servers/:id` | Get server details |
| POST | `/api/v1/servers` | Register new server |
| PATCH | `/api/v1/servers/:id` | Update server |
| DELETE | `/api/v1/servers/:id` | Delete server |
| GET | `/api/v1/servers/:id/reviews` | Get server reviews |
| GET | `/api/v1/servers/:id/badges` | Get server badges |

### Reviews Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/servers/:id/reviews` | Create review |
| PATCH | `/api/v1/reviews/:id` | Update review |
| DELETE | `/api/v1/reviews/:id` | Delete review |
| POST | `/api/v1/reviews/:id/vote` | Upvote/downvote |

### Tags Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tags` | List all tags |
| GET | `/api/v1/tags/:category` | List tags by category |

### Guilds Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/guilds` | List/search guilds |
| GET | `/api/v1/guilds/:id` | Get guild details |
| POST | `/api/v1/guilds` | Create guild |
| PATCH | `/api/v1/guilds/:id` | Update guild |
| POST | `/api/v1/guilds/:id/join` | Join guild |
| POST | `/api/v1/guilds/:id/leave` | Leave guild |
| GET | `/api/v1/guilds/:id/members` | List members |
| POST | `/api/v1/guilds/:id/invites` | Create invite |

### Badges Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/badges` | List all badges |
| GET | `/api/v1/badges/user` | List user badge types |
| GET | `/api/v1/badges/server` | List server badge types |
| POST | `/api/v1/badges/purchase` | Purchase a badge |

### Puzzles Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/puzzles/daily` | Get today's puzzle |
| GET | `/api/v1/puzzles/:id` | Get puzzle details |
| POST | `/api/v1/puzzles/:id/submit` | Submit answer |
| GET | `/api/v1/puzzles/leaderboard` | Puzzle leaderboard |

### Prizes Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/prizes/pool/:serverId` | Get server prize pool |
| POST | `/api/v1/prizes/pool/:serverId` | Configure prize pool |
| POST | `/api/v1/prizes` | Add prize to pool |
| GET | `/api/v1/redemptions/my` | My redemption codes |
| POST | `/api/v1/redemptions/:code/claim` | Claim prize |

### Favorites Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/favorites` | List my favorites |
| POST | `/api/v1/favorites/:serverId` | Add to favorites |
| DELETE | `/api/v1/favorites/:serverId` | Remove from favorites |

### Plugin Module (Server-to-Server)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/plugin/verify` | Verify plugin installation |
| POST | `/api/v1/plugin/heartbeat` | Plugin heartbeat |
| POST | `/api/v1/plugin/playtime/sync` | Sync playtime data |
| GET | `/api/v1/plugin/redemption/check` | Check pending redemptions |
| POST | `/api/v1/plugin/redemption/execute` | Mark as executed |

---

## MVP Scope vs Future Features

### MVP (Phase 1)
- [ ] User authentication (Discord OAuth)
- [ ] User profiles & linked identities
- [ ] Server registration & listing
- [ ] Basic search (PostgreSQL FTS first)
- [ ] Reviews with verified/unverified status
- [ ] Plugin verification system
- [ ] Playtime tracking
- [ ] Basic reputation system
- [ ] Favorites

### Phase 2
- [ ] Elasticsearch integration
- [ ] Advanced filtering & search
- [ ] Guild system (foundation)
- [ ] Badge system (foundation)
- [ ] WebSocket notifications
- [ ] Steam & Epic OAuth

### Phase 3
- [ ] Puzzle system
- [ ] Prize pool & redemption codes
- [ ] Full guild features
- [ ] Full badge economy
- [ ] Stripe payments
- [ ] Webhooks for server owners

### Phase 4
- [ ] Hytale integration
- [ ] Mobile API optimizations
- [ ] Advanced analytics
- [ ] Leaderboards
- [ ] Moderation tools

---

## Security Considerations

| Area | Implementation |
|------|----------------|
| **Authentication** | JWT with short expiry (15min) + refresh tokens |
| **Rate Limiting** | Redis-backed, per-user and per-IP |
| **Input Validation** | class-validator on all DTOs |
| **SQL Injection** | Prisma parameterized queries |
| **XSS** | Response sanitization, CSP headers |
| **CORS** | Whitelist frontend domains only |
| **Secrets** | Environment variables, never in code |
| **HTTPS** | Enforced in production |
| **Plugin Auth** | HMAC signatures + timestamp validation |

---

## Monitoring & Observability

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking & alerting |
| **Pino** | Structured JSON logging |
| **Prometheus** | Metrics collection |
| **Grafana** | Metrics visualization |
| **Health Checks** | `/health`, `/health/db`, `/health/redis` |

---

## Deployment Strategy

| Environment | Platform | Database | Redis |
|-------------|----------|----------|-------|
| **Development** | Local / Docker | Local PostgreSQL | Local Redis |
| **Staging** | Railway / Render | Managed PostgreSQL | Managed Redis |
| **Production** | AWS ECS / Kubernetes | RDS PostgreSQL | ElastiCache |

---

## Next Steps (When Ready to Code)

1. **Initialize NestJS project** with strict TypeScript
2. **Configure Prisma** with PostgreSQL connection
3. **Implement Auth module** with Discord OAuth
4. **Build core modules**: Users → Servers → Reviews
5. **Set up Plugin verification** module
6. **Add Elasticsearch** integration
7. **Implement WebSocket gateway**
8. **Add background jobs** with BullMQ
9. **Integrate with Next.js frontend**