# Phase 6: Backend Architecture - FirstSpawn

**Status:** ✅ Architecture Defined  
**Date:** 2026-02-20  
**Framework:** NestJS 10  
**Runtime:** Node.js 20+  
**Language:** TypeScript 5

---

## 1. Project Structure

### 1.1 NestJS Project Layout

```
firstspawn-api/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   │
│   ├── common/                      # Shared utilities
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── utils/
│   │       ├── crypto.ts            # Encryption utilities
│   │       └── hmac.ts              # HMAC signature verification
│   │
│   ├── config/                      # Configuration
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── auth.config.ts
│   │   └── validation.ts            # Config validation schema
│   │
│   ├── database/                    # Database setup
│   │   ├── prisma.service.ts
│   │   └── seeds/
│   │       └── main.seed.ts
│   │
│   ├── modules/                     # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── servers/
│   │   ├── reviews/
│   │   ├── tags/
│   │   ├── badges/
│   │   ├── plugins/
│   │   └── search/
│   │
│   └── health/                      # Health checks
│       └── health.controller.ts
│
├── prisma/
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # Migration files
│
├── test/                            # E2E tests
│   ├── auth.e2e-spec.ts
│   └── jest-e2e.json
│
├── Dockerfile                       # Container definition
├── docker-compose.yml               # Local development stack
├── nest-cli.json                    # NestJS CLI config
├── package.json
├── tsconfig.json
└── .env.example                     # Environment template
```

### 1.2 Module Structure

Each module follows this pattern:

```
modules/feature/
├── dto/
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   └── feature-response.dto.ts
├── entities/
│   └── feature.entity.ts          # Prisma-generated types
├── feature.controller.ts          # HTTP routes
├── feature.service.ts             # Business logic
├── feature.module.ts              # Module definition
└── feature.repository.ts          # Data access (optional)
```

---

## 2. Core Modules

### 2.1 Auth Module

```typescript
// modules/auth/auth.module.ts
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    DiscordStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
```

**Key Components:**

| Component | Purpose |
|-----------|---------|
| `AuthService` | Registration, login, token management |
| `JwtStrategy` | Validate JWT tokens |
| `JwtAuthGuard` | Protect routes |
| `DiscordStrategy` | Discord OAuth |
| `GoogleStrategy` | Google OAuth |

### 2.2 Users Module

```typescript
// modules/users/users.service.ts
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserDto): Promise<User> {
    const hashedPassword = await argon2.hash(data.password);
    return this.prisma.user.create({
      data: { ...data, passwordHash: hashedPassword },
    });
  }

  async updateReputation(userId: string, delta: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { reputation: { increment: delta } },
    });
  }
}
```

### 2.3 Servers Module

```typescript
// modules/servers/servers.service.ts
@Injectable()
export class ServersService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {}

  async search(params: SearchServersDto) {
    const { q, tags, region, sort, page, limit } = params;
    
    return this.prisma.server.findMany({
      where: {
        isActive: true,
        gameType: GameType.HYTALE,
        ...(q && {
          OR: [
            { name: { search: q } },
            { description: { search: q } },
          ],
        }),
        ...(tags && {
          tags: { some: { tag: { slug: { in: tags } } } },
        }),
        ...(region && { region }),
      },
      orderBy: this.getSortOrder(sort),
      skip: (page - 1) * limit,
      take: limit,
      include: {
        tags: { include: { tag: true } },
        owner: { select: { username: true } },
      },
    });
  }

  async claimServer(serverId: string, userId: string) {
    // Generate verification token
    const token = crypto.randomUUID();
    
    await this.prisma.server.update({
      where: { id: serverId },
      data: {
        ownerId: userId,
        verificationToken: token,
      },
    });

    return { token }; // Plugin uses this to verify
  }
}
```

### 2.4 Plugins Module

This module handles server plugin communication:

```typescript
// modules/plugins/plugins.service.ts
@Injectable()
export class PluginsService {
  constructor(
    private prisma: PrismaService,
    private serversService: ServersService,
  ) {}

  async verifyRequest(
    apiKey: string,
    timestamp: number,
    signature: string,
    body: string,
  ): Promise<Plugin> {
    // 1. Find plugin by API key
    const plugin = await this.prisma.plugin.findUnique({
      where: { apiKey },
      include: { server: true },
    });

    if (!plugin) {
      throw new UnauthorizedException('Invalid API key');
    }

    // 2. Check timestamp (prevent replay attacks)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (Math.abs(now - timestamp) > fiveMinutes) {
      throw new UnauthorizedException('Request expired');
    }

    // 3. Verify HMAC signature
    const message = `${timestamp}.${body}`;
    const expectedSig = crypto
      .createHmac('sha256', plugin.apiSecret)
      .update(message)
      .digest('hex');

    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSig),
    )) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 4. Check plugin status
    if (plugin.status === PluginStatus.REVOKED) {
      throw new UnauthorizedException('Plugin access revoked');
    }

    return plugin;
  }

  async handleHeartbeat(pluginId: string, data: HeartbeatDto) {
    // Update plugin heartbeat
    await this.prisma.plugin.update({
      where: { id: pluginId },
      data: {
        lastHeartbeat: new Date(),
        activePlayers: data.playerCount,
      },
    });

    // Update server stats
    await this.prisma.server.update({
      where: { id: (await this.getPlugin(pluginId)).serverId },
      data: {
        isOnline: true,
        playerCount: data.playerCount,
        maxPlayers: data.maxPlayers,
      },
    });
  }

  async syncPlaytime(pluginId: string, players: PlaytimeRecordDto[]) {
    for (const player of players) {
      await this.prisma.playtimeRecord.upsert({
        where: {
          pluginId_playerUuid: {
            pluginId,
            playerUuid: player.uuid,
          },
        },
        update: {
          playtimeMinutes: player.playtimeMinutes,
          lastSeenAt: player.lastSeen,
          playerUsername: player.username,
        },
        create: {
          pluginId,
          playerUuid: player.uuid,
          playerUsername: player.username,
          playtimeMinutes: player.playtimeMinutes,
          lastSeenAt: player.lastSeen,
        },
      });
    }
  }
}
```

---

## 3. Background Jobs

### 3.1 BullMQ Setup

```typescript
// modules/queue/queue.module.ts
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue(
      { name: 'uptime' },
      { name: 'notifications' },
      { name: 'cleanup' },
    ),
  ],
  providers: [UptimeProcessor, CleanupProcessor],
})
export class QueueModule {}
```

### 3.2 Job Processors

```typescript
// modules/queue/processors/uptime.processor.ts
@Processor('uptime')
export class UptimeProcessor {
  constructor(
    private prisma: PrismaService,
    private serversService: ServersService,
  ) {}

  @Process('check-server')
  async checkServer(job: Job<{ serverId: string }>) {
    const { serverId } = job.data;
    
    // Query server status
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
    });

    // Check if online (ping/query server)
    const isOnline = await this.queryServer(server.ip, server.port);
    const playerCount = isOnline ? await this.getPlayerCount(server) : 0;

    // Record check
    await this.prisma.uptimeCheck.create({
      data: {
        serverId,
        isOnline,
        playerCount,
      },
    });

    // Update cached stats
    await this.updateServerStats(serverId);
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name}`);
  }
}
```

### 3.3 Scheduled Jobs

```typescript
// modules/queue/scheduler.service.ts
@Injectable()
export class SchedulerService {
  constructor(
    @InjectQueue('uptime') private uptimeQueue: Queue,
    @InjectQueue('cleanup') private cleanupQueue: Queue,
  ) {}

  // Run every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduleUptimeChecks() {
    const servers = await this.prisma.server.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    for (const server of servers) {
      await this.uptimeQueue.add('check-server', { serverId: server.id });
    }
  }

  // Run daily at 3 AM
  @Cron('0 3 * * *')
  async scheduleCleanup() {
    await this.cleanupQueue.add('cleanup-old-records', {});
  }
}
```

---

## 4. Real-Time with WebSockets

### 4.1 Gateway Setup

```typescript
// modules/events/events.gateway.ts
@WebSocketGateway({
  namespace: 'events',
  cors: { origin: process.env.FRONTEND_URL },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Verify JWT from auth token
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
      
      console.log(`Client connected: ${client.id}, user: ${payload.sub}`);
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:server')
  handleServerSubscribe(client: Socket, serverId: string) {
    client.join(`server:${serverId}`);
    console.log(`User ${client.data.userId} subscribed to server ${serverId}`);
  }

  @SubscribeMessage('unsubscribe:server')
  handleServerUnsubscribe(client: Socket, serverId: string) {
    client.leave(`server:${serverId}`);
  }

  // Methods to emit events
  notifyServerStatusChange(serverId: string, isOnline: boolean, playerCount: number) {
    this.server.to(`server:${serverId}`).emit('server:status', {
      serverId,
      isOnline,
      playerCount,
    });
  }

  notifyNewReview(serverId: string, review: any) {
    this.server.to(`server:${serverId}`).emit('server:new_review', {
      serverId,
      review,
    });
  }

  notifyUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
```

---

## 5. Infrastructure & Deployment

### 5.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main"]
```

### 5.2 Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/firstspawn
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev-secret-not-for-production
    depends_on:
      - db
      - redis
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run start:dev

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=firstspawn
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Optional: PGAdmin for database management
  pgadmin:
    image: dpage/pgadmin4
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@firstspawn.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    ports:
      - "5050:80"
    depends_on:
      - db

volumes:
  postgres_data:
  redis_data:
```

### 5.3 Production Deployment Options

#### Option A: Supabase + Railway (Easiest)

| Component | Service | Cost |
|-----------|---------|------|
| Database | Supabase (Pro) | $25/mo |
| API | Railway | $5-20/mo |
| Redis | Upstash (Redis) | Free tier |
| **Total** | | **~$30-50/mo** |

#### Option B: Self-Hosted on VDS (Most Control)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    build: .
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis
    deploy:
      replicas: 2  # Scale horizontally

  db:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=firstspawn
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"  # Local only

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - ./data/redis:/data
    ports:
      - "127.0.0.1:6379:6379"  # Local only

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
```

**Recommended Specs for Self-Hosting:**
- 2 vCPU
- 4GB RAM
- 50GB SSD
- Cost: ~$10-20/mo (Hetzner, DigitalOcean, etc.)

---

## 6. Monitoring & Logging

### 6.1 Logging

```typescript
// main.ts - Setup structured logging
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'], // Levels
  });

  // Use Pino for structured logging in production
  if (process.env.NODE_ENV === 'production') {
    // Add Pino logger
  }

  await app.listen(3001);
}
```

### 6.2 Health Checks

```typescript
// health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prisma.pingCheck('database'),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

### 6.3 Error Tracking (Sentry)

```typescript
// main.ts
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}
```

---

## 7. Security Checklist

### 7.1 Implementation Checklist

| Security Measure | Status | Implementation |
|------------------|--------|----------------|
| Password hashing (Argon2id) | ⏳ | Use `argon2` package |
| JWT secure storage | ⏳ | httpOnly cookies |
| Rate limiting | ⏳ | NestJS Throttler |
| Input validation | ⏳ | class-validator DTOs |
| SQL injection prevention | ✅ | Prisma handles this |
| CORS configuration | ⏳ | Whitelist frontend URL |
| Helmet security headers | ⏳ | `helmet` middleware |
| HMAC verification (plugin) | ⏳ | Custom guard |
| Timestamp validation | ⏳ | ±5 minute window |
| Request logging | ⏳ | Logging interceptor |

### 7.2 Secrets Management

**Development:**
```bash
# .env file (not committed)
# Use .env.example as template
```

**Production:**
- Use Docker secrets OR
- Use environment variables from hosting provider OR
- Use Vault/AWS Secrets Manager for enterprise

---

## 8. Testing Strategy

### 8.1 Test Structure

```
test/
├── unit/                      # Unit tests
│   ├── auth.service.spec.ts
│   ├── users.service.spec.ts
│   └── servers.service.spec.ts
├── integration/               # Integration tests
│   ├── auth.controller.spec.ts
│   └── servers.controller.spec.ts
└── e2e/                       # End-to-end tests
    ├── auth.e2e-spec.ts
    └── servers.e2e-spec.ts
```

### 8.2 Example Test

```typescript
// modules/auth/auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const dto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        ...dto,
        passwordHash: 'hashed',
      });

      const result = await service.register(dto);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(dto.email);
    });
  });
});
```

---

## 9. Development Workflow

### 9.1 Getting Started

```bash
# 1. Clone and install
cd firstspawn-api
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your values

# 3. Start infrastructure
docker-compose up -d db redis

# 4. Run migrations
npx prisma migrate dev

# 5. Seed database
npx prisma db seed

# 6. Start development
npm run start:dev

# API available at http://localhost:3001
# Swagger docs at http://localhost:3001/api/docs
```

### 9.2 Adding a New Module

```bash
# Generate module boilerplate
nest generate module features
nest generate controller features
nest generate service features

# Create DTOs
# Create entity (Prisma handles actual DB entity)
# Add to app.module.ts
```

---

## 10. Performance Optimization

### 10.1 Database Optimization

```typescript
// Use select to limit returned fields
prisma.server.findMany({
  select: {
    id: true,
    name: true,
    playerCount: true,
    // Don't include description, etc.
  },
});

// Use pagination
prisma.server.findMany({
  take: 20,
  skip: (page - 1) * 20,
});

// Batch operations
prisma.$transaction([
  prisma.server.update(...),
  prisma.uptimeCheck.create(...),
]);
```

### 10.2 Caching Strategy

```typescript
// Redis cache for expensive queries
@Injectable()
export class ServersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPopularServers() {
    const cacheKey = 'servers:popular';
    let servers = await this.cacheManager.get(cacheKey);

    if (!servers) {
      servers = await this.prisma.server.findMany({
        orderBy: { playerCount: 'desc' },
        take: 10,
      });
      await this.cacheManager.set(cacheKey, servers, 60); // 60 seconds
    }

    return servers;
  }
}
```

---

## Related Documents

- [Product Planning](../01-product/PRODUCT_PLANNING.md)
- [Frontend Planning](../02-frontend-planning/FRONTEND_PLANNING.md)
- [Frontend Design](../03-frontend-design/FRONTEND_DESIGN.md)
- [Database Design](../04-database-design/DATABASE_DESIGN.md)
- [Webservices](../05-webservices/WEBSERVICES.md)
