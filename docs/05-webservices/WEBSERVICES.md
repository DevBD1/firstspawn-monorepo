# Phase 5: Webservices Design - FirstSpawn

**Status:** ✅ API Architecture Defined  
**Date:** 2026-02-20  
**Framework:** NestJS  
**Protocol:** REST (WebSocket for real-time)  
**Auth:** JWT Access + Refresh Tokens

---

## 1. Architecture Overview

### 1.1 API Architecture Decision

**Chosen: NestJS with REST**

After research considering your learning background:

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **NestJS** | Structured, TypeScript-first, excellent docs, decorators, built-in patterns | Learning curve | ✅ **Best for learning** |
| Next.js API Routes | Same codebase, simpler | Tight coupling, scaling limits | Good for prototyping |
| Express/Fastify | Simple, flexible | Manual structure, can become messy | Not for learning |
| tRPC | Type-safe end-to-end | Tighter coupling, smaller community | Future consideration |

**Why NestJS for you:**
- Opinionated structure = less decision fatigue
- Built-in dependency injection (learns you good patterns)
- Excellent documentation and community
- Scales from small to large applications
- Modular architecture matches your learning journey

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│  │  Next.js Web │  │  Mobile App  │  │  Hytale Plugin│                       │
│  └──────────────┘  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (Nginx/Traefik)                         │
│  • SSL termination    • Rate limiting    • Request routing                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NESTJS APPLICATION                                   │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ AuthModule  │ │ UserModule  │ │ ServerModule│ │ ReviewModule│           │
│  │             │ │             │ │             │ │             │           │
│  │ • Register  │ │ • Profile   │ │ • CRUD      │ │ • Post      │           │
│  │ • Login     │ │ • Identities│ │ • Search    │ │ • Vote      │           │
│  │ • OAuth     │ │ • Favorites │ │ • Claim     │ │ • Moderate  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │PluginModule │ │ BadgeModule │ │SearchModule │ │WS Gateway   │           │
│  │             │ │             │ │             │ │             │           │
│  │ • Heartbeat │ │ • List      │ │ • Full-text │ │ • Real-time │           │
│  │ • Playtime  │ │ • Award     │ │ • Filters   │ │ • Presence  │           │
│  │ • Verify    │ │ • Purchase  │ │ • Sort      │ │ • Notifs    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
┌──────────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│     PostgreSQL       │ │      Redis       │ │   File Storage   │
│  (Primary Database)  │ │  (Cache/Sessions)│ │  (Cloudflare R2) │
└──────────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 2. Authentication & Security

### 2.1 Authentication Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          AUTHENTICATION FLOW                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  EMAIL/PASSWORD (Primary)                                                   │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│  │  Client  │────▶│  POST    │────▶│ Validate │────▶│ Generate │          │
│  │          │     │/auth/login     │ Password │     │ Tokens   │          │
│  └──────────┘     └──────────┘     └──────────┘     └────┬─────┘          │
│                                                          │                 │
│                              ┌───────────────────────────┘                 │
│                              ▼                                             │
│                         ┌──────────┐                                       │
│                         │  Return  │                                       │
│                         │ Access + │                                       │
│                         │ Refresh  │                                       │
│                         └──────────┘                                       │
│                                                                             │
│  OAUTH (Discord, Google)                                                    │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│  │  Client  │────▶│ Redirect │────▶│ OAuth    │────▶│ Create/  │          │
│  │          │     │ to OAuth │     │ Callback │     │ Link User│          │
│  └──────────┘     └──────────┘     └──────────┘     └────┬─────┘          │
│                                                          │                 │
│                              ┌───────────────────────────┘                 │
│                              ▼                                             │
│                         ┌──────────┐                                       │
│                         │ Generate │                                       │
│                         │ Tokens   │                                       │
│                         └──────────┘                                       │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Token Strategy

| Token Type | Storage | Expiry | Purpose |
|------------|---------|--------|---------|
| **Access Token** | httpOnly cookie | 15 minutes | API authentication |
| **Refresh Token** | httpOnly cookie + DB | 7 days | Obtain new access token |

### 2.3 JWT Claims

```typescript
interface AccessTokenPayload {
  sub: string;        // User ID
  email: string;      // User email
  username: string;   // Username
  iat: number;        // Issued at
  exp: number;        // Expiration
  type: 'access';
}

interface RefreshTokenPayload {
  sub: string;        // User ID
  jti: string;        // Token ID (for revocation)
  iat: number;
  exp: number;
  type: 'refresh';
}
```

### 2.4 Security Headers

```typescript
// NestJS middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // For pixel styling
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.firstspawn.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow images from CDNs
}));

app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

---

## 3. API Endpoints

### 3.1 Authentication Module

```typescript
// Base: /api/v1/auth

POST   /auth/register              // Register with email/password
POST   /auth/login                 // Login with email/password
POST   /auth/logout                // Logout (revoke refresh token)
POST   /auth/refresh               // Get new access token
POST   /auth/forgot-password       // Request password reset
POST   /auth/reset-password        // Reset password with token
POST   /auth/verify-email          // Verify email with token
POST   /auth/resend-verification   // Resend verification email

// OAuth routes
GET    /auth/discord               // Initiate Discord OAuth
GET    /auth/discord/callback      // Discord callback
GET    /auth/google                // Initiate Google OAuth
GET    /auth/google/callback       // Google callback
```

#### Request/Response Examples

**Register:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "alexplayer",
  "password": "SecurePass123!"
}

Response 201:
{
  "user": {
    "id": "cl...",
    "email": "user@example.com",
    "username": "alexplayer",
    "emailVerified": false
  },
  "message": "Verification email sent"
}
```

**Login:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "user": {
    "id": "cl...",
    "email": "user@example.com",
    "username": "alexplayer"
  }
}
// Sets httpOnly cookies: access_token, refresh_token
```

### 3.2 Users Module

```typescript
// Base: /api/v1/users

GET    /users/me                   // Get current user
PATCH  /users/me                   // Update current user
DELETE /users/me                   // Delete account

GET    /users/:id                  // Get public user profile
GET    /users/:id/reviews          // Get user's reviews
GET    /users/:id/badges           // Get user's badges

// Identities
GET    /users/me/identities        // List linked identities
POST   /users/me/identities/:platform/link    // Link OAuth identity
DELETE /users/me/identities/:platform         // Unlink identity
```

### 3.3 Servers Module

```typescript
// Base: /api/v1/servers

// Public routes
GET    /servers                    // List/search servers
GET    /servers/:slug              // Get server by slug
GET    /servers/:slug/reviews      // Get server reviews

// Protected routes
POST   /servers                    // Register new server
PATCH  /servers/:id                // Update server (owner only)
DELETE /servers/:id                // Delete server (owner only)
POST   /servers/:id/claim          // Claim existing server
POST   /servers/:id/verify         // Verify with plugin

// Favorites (protected)
GET    /servers/favorites          // Get user's favorites
POST   /servers/:id/favorite       // Add to favorites
DELETE /servers/:id/favorite       // Remove from favorites
```

#### Search Parameters

```http
GET /api/v1/servers?
  q=hytale+rpg&           // Search query
  tags=pve,survival&      // Filter by tags
  region=eu&              // Filter by region
  online=true&            // Online only
  verified=true&          // Verified only
  sort=rating&            // rating | players | newest
  order=desc&             // asc | desc
  page=1&                 // Pagination
  limit=20                // Items per page (max 50)

Response 200:
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 3.4 Reviews Module

```typescript
// Base: /api/v1/reviews

// Server-scoped (public)
GET    /servers/:id/reviews        // List server reviews

// Review operations (protected)
POST   /servers/:id/reviews        // Create review
PATCH  /reviews/:id                // Update own review
DELETE /reviews/:id                // Delete own review

// Helpful votes (protected)
POST   /reviews/:id/helpful        // Mark as helpful
DELETE /reviews/:id/helpful        // Remove helpful mark
```

#### Create Review

```http
POST /api/v1/servers/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Amazing server!",
  "content": "This is the best Hytale server I've played on..."
}

Response 201:
{
  "id": "cl...",
  "rating": 5,
  "title": "Amazing server!",
  "content": "...",
  "isVerified": true,           // If user has playtime
  "verifiedPlaytime": 720,      // Minutes
  "user": {
    "username": "alexplayer",
    "reputation": 1250
  },
  "createdAt": "2026-02-20T..."
}
```

### 3.5 Plugin Module (Server-to-Server)

These endpoints are for the Hytale plugin to communicate with the API.

```typescript
// Base: /api/v1/plugin
// All endpoints require plugin authentication (API key + HMAC)

POST   /plugin/heartbeat           // Plugin heartbeat
POST   /plugin/playtime/sync       // Sync playtime batch
POST   /plugin/playtime/player     // Single player update
GET    /plugin/verify              // Verify plugin installation
```

#### Plugin Authentication

Every request must include:

```http
X-FirstSpawn-Key: fs_pk_abc123...
X-FirstSpawn-Timestamp: 1704900000000
X-FirstSpawn-Signature: sha256=abc123def456...
```

**Signature generation:**
```typescript
const message = `${timestamp}.${JSON.stringify(body)}`;
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(message)
  .digest('hex');
```

#### Heartbeat Endpoint

```http
POST /api/v1/plugin/heartbeat
X-FirstSpawn-Key: fs_pk_...
X-FirstSpawn-Timestamp: ...
X-FirstSpawn-Signature: ...

{
  "playerCount": 142,
  "maxPlayers": 500,
  "version": "0.1.0",
  "uptime": 86400  // Seconds since start
}

Response 200:
{
  "status": "ok",
  "serverTime": "2026-02-20T12:00:00Z",
  "config": {
    "heartbeatInterval": 300  // Seconds
  }
}
```

#### Playtime Sync

```http
POST /api/v1/plugin/playtime/sync
X-FirstSpawn-Key: fs_pk_...
X-FirstSpawn-Timestamp: ...
X-FirstSpawn-Signature: ...

{
  "players": [
    {
      "uuid": "player-uuid-1",
      "username": "PlayerOne",
      "playtimeMinutes": 120,
      "lastSeen": "2026-02-20T11:30:00Z"
    },
    // ... more players
  ]
}

Response 200:
{
  "synced": 50,
  "errors": []
}
```

### 3.6 Badges Module

```typescript
// Base: /api/v1/badges

GET    /badges                     // List all badges
GET    /badges/user                // List user badge types
GET    /badges/server              // List server badge types

GET    /users/:id/badges           // Get user's earned badges
GET    /servers/:id/badges         // Get server's badges

// Protected
POST   /badges/:id/purchase        // Purchase badge
POST   /users/me/badges/:id/feature  // Feature badge on profile
```

### 3.7 Tags Module

```typescript
// Base: /api/v1/tags

GET    /tags                       // List all tags
GET    /tags/:category             // List tags by category
```

---

## 4. Response Standards

### 4.1 Success Responses

```typescript
// Single resource
{
  "data": { ... }
}

// Collection
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}

// Created
HTTP 201
{
  "data": { ... },
  "message": "Resource created successfully"
}
```

### 4.2 Error Responses

```typescript
// Standard error format
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Must be at least 8 characters" }
  ]
}

// Common error codes
400 - Bad Request (validation errors)
401 - Unauthorized (not authenticated)
403 - Forbidden (no permission)
404 - Not Found
409 - Conflict (duplicate email, etc.)
422 - Unprocessable Entity
429 - Too Many Requests
500 - Internal Server Error
```

### 4.3 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | GET success |
| 201 | POST success (created) |
| 204 | DELETE success (no content) |
| 400 | Validation error |
| 401 | Authentication required |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | Conflict (duplicate, etc.) |
| 429 | Rate limited |
| 500 | Server error |

---

## 5. Rate Limiting

### 5.1 Rate Limit Tiers

| Endpoint Category | Guest | User | Premium | Plugin |
|-------------------|-------|------|---------|--------|
| **Auth** | 5/min | 10/min | 10/min | N/A |
| **General API** | 30/min | 100/min | 200/min | N/A |
| **Search** | 30/min | 60/min | 120/min | N/A |
| **Reviews** | N/A | 5/hour | 10/hour | N/A |
| **Server Actions** | N/A | 10/hour | 30/hour | N/A |
| **Plugin API** | N/A | N/A | N/A | 1000/min |

### 5.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704903600
Retry-After: 60  // When rate limited
```

### 5.3 Implementation

```typescript
// NestJS Throttler
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000,      // 1 minute
          limit: 100,      // 100 requests per minute for users
        },
        {
          name: 'auth',
          ttl: 60000,
          limit: 10,       // Stricter for auth
        },
      ],
    }),
  ],
})
```

---

## 6. WebSocket Real-Time API

### 6.1 Gateway Configuration

```typescript
@WebSocketGateway({
  namespace: 'events',
  cors: { origin: process.env.FRONTEND_URL },
})
export class EventsGateway {
  // Handles real-time notifications
}
```

### 6.2 Authentication

WebSocket connections authenticate with the access token:

```javascript
const socket = io('wss://api.firstspawn.com/events', {
  auth: {
    token: 'access_token_here'
  }
});
```

### 6.3 Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe:server` | `serverId` | Subscribe to server updates |
| `subscribe:user` | - | Subscribe to user notifications |
| `unsubscribe:server` | `serverId` | Unsubscribe |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `server:status` | `{ serverId, isOnline, playerCount }` | Server status change |
| `server:new_review` | `{ serverId, review }` | New review posted |
| `notification` | `{ type, title, message }` | User notification |
| `badge:earned` | `{ badgeId, badgeName }` | Badge earned |

---

## 7. Hytale Plugin API Specification

### 7.1 What the Site Needs from Servers

The plugin must provide:

1. **Heartbeat** - Every 5 minutes
   - Current player count
   - Max players
   - Server version
   - Uptime

2. **Playtime Tracking** - Continuous
   - Player UUID
   - Player username
   - Cumulative playtime (minutes)
   - Last seen timestamp
   - AFK detection (don't count AFK time)

3. **Verification** - One-time + periodic
   - Plugin version
   - Server identity confirmation

### 7.2 Plugin-to-API Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PLUGIN LIFECYCLE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SERVER OWNER DASHBOARD                                                     │
│  ┌──────────────┐                                                           │
│  │ Generate API │────▶ Download plugin JAR with embedded credentials       │
│  │ Key + Secret │                                                           │
│  └──────────────┘                                                           │
│                                                                             │
│  PLUGIN INITIALIZATION                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │ Server starts│────▶│ Load config  │────▶│ POST /verify │                │
│  │              │     │ (key+secret) │     │ (initial)    │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│                                                    │                        │
│                                                    ▼                        │
│  REGULAR OPERATION                            ┌──────────┐                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ Status:  │                 │
│  │ Heartbeat│──│ Playtime │──│   Sync   │◀───│ ACTIVE   │                 │
│  │ 5min     │  │ Track    │  │ Batch    │    │          │                 │
│  └──────────┘  └──────────┘  └──────────┘    └──────────┘                 │
│       │              │              │                                       │
│       ▼              ▼              ▼                                       │
│  ┌──────────────────────────────────────────┐                              │
│  │ POST /heartbeat   POST /playtime/sync    │                              │
│  │ { players,      │ { players: [...] }    │                              │
│  │   version,      │                        │                              │
│ │   uptime }      │                        │                              │
│  └──────────────────────────────────────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Plugin Configuration

```yaml
# config.yml
firstspawn:
  api-key: "fs_pk_xxxxxxxxxxxxxxxx"
  api-secret: "fs_sk_xxxxxxxxxxxxxxxx"
  
  # Behavior settings
  heartbeat-interval: 300  # seconds (5 minutes)
  playtime-sync-interval: 60  # seconds
  afk-timeout: 300  # seconds of inactivity = AFK
  
  # Optional
  debug: false
```

### 7.4 Security for Plugin API

**Multi-layer verification:**

1. **API Key** - Identifies the server
2. **HMAC Signature** - Verifies request integrity
3. **Timestamp** - Prevents replay attacks (±5 min tolerance)
4. **IP Whitelist** - Optional extra security
5. **Version Check** - Ensures compatible plugin version

---

## 8. API Versioning

### 8.1 URL Versioning

```
/api/v1/...     # Current version
/api/v2/...     # Future breaking changes
```

### 8.2 Deprecation Strategy

1. Add new endpoint alongside old one
2. Mark old endpoint as deprecated in docs
3. Add `Deprecation: true` header
4. After 6 months, remove old endpoint

---

## 9. Documentation & Testing

### 9.1 API Documentation

**Swagger/OpenAPI** auto-generated by NestJS:

```typescript
// Accessible at /api/docs
@Module({
  imports: [
    SwaggerModule.setup('api/docs', app, document),
  ],
})
```

### 9.2 Testing Strategy

| Type | Tool | Coverage |
|------|------|----------|
| Unit | Jest | Services, utilities |
| Integration | Jest + Supertest | Controllers, endpoints |
| E2E | Jest | Full request flows |

---

## 10. Environment Configuration

```bash
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api
API_VERSION=v1
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/firstspawn

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-super-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
DISCORD_CLIENT_ID=xxx
DISCORD_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Email
RESEND_API_KEY=xxx
EMAIL_FROM=noreply@firstspawn.com

# Storage (R2/S3)
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET=firstspawn
R2_ENDPOINT=xxx

# Sentry (optional)
SENTRY_DSN=xxx
```

---

## Related Documents

- [Product Planning](../01-product/PRODUCT_PLANNING.md)
- [Frontend Planning](../02-frontend-planning/FRONTEND_PLANNING.md)
- [Frontend Design](../03-frontend-design/FRONTEND_DESIGN.md)
- [Database Design](../04-database-design/DATABASE_DESIGN.md)
- [Backend Architecture](../06-backend/BACKEND_ARCHITECTURE.md)
