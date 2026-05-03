import { and, asc, eq, inArray, ilike, or, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { serverHeartbeats, servers } from "../../db/schema.js";
import { ApiError } from "../../lib/api-error.js";
import { successEnvelope } from "../../lib/envelope.js";
import { requireAdminUser } from "../../lib/request-auth.js";

const ONLINE_WINDOW_MS = 15 * 60 * 1000;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PUBLIC_PING_NULL_SORT_VALUE = 2_147_483_647;
const PUBLIC_PLAYERS_NULL_SORT_VALUE = -1;

type ServerRecord = typeof servers.$inferSelect;
type HeartbeatRecord = typeof serverHeartbeats.$inferSelect;
type FreshnessServerFields = Pick<
  ServerRecord,
  "status" | "lastProbeAttemptAt" | "probeStatus" | "lastPingAt"
>;
type PublicServerListRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  game: "mc_java" | "mc_bedrock" | "hytale";
  status: "active" | "suspended" | "archived";
  region: string | null;
  lastPingAt: Date | null;
  lastProbeAttemptAt: Date | null;
  probeStatus: "online" | "offline" | "unknown" | "unreachable";
  latestId: string | null;
  pingMs: number | null;
  onlinePlayers: number | null;
  maxPlayers: number | null;
  minecraftVersion: string | null;
  occurredAt: Date | null;
  sortPrimary: number;
  sortSecondary: number;
};
type PublicStatsRow = {
  total_active_servers: number;
  total_online_players: number;
};

const urlOrNullSchema = z.string().trim().url().nullable().optional();
const adminStatusSchema = z.enum(["active", "suspended", "archived"]);
const freshnessStatusSchema = z.enum(["online", "offline", "unknown"]);
const gameSchema = z.enum(["mc_java", "mc_bedrock", "hytale"]);
const publicListSortSchema = z.enum(["players", "ping"]);
const publicTierSchema = z.enum(["common", "rare", "epic", "legendary"]);

const envelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.object({
      request_id: z.string().uuid().nullable(),
    }),
    error: z.null(),
  });

const latestMetricsSchema = z.object({
  ping_ms: z.number().int().nonnegative().nullable(),
  online_players: z.number().int().nonnegative().nullable(),
  max_players: z.number().int().nonnegative().nullable(),
  minecraft_version: z.string().nullable(),
  occurred_at: z.string().datetime().nullable(),
});

const serverBaseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  host: z.string(),
  port: z.number().int(),
  game: gameSchema,
  catalog_status: adminStatusSchema,
  freshness_status: freshnessStatusSchema,
  online_mode: z.boolean(),
  region: z.string().nullable(),
  website_url: z.string().nullable(),
  discord_url: z.string().nullable(),
  last_ping_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const adminListQuerySchema = z.object({
  q: z.string().trim().min(1).max(255).optional(),
  status: adminStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().uuid().optional(),
});

const publicListQuerySchema = z.object({
  q: z.string().trim().min(1).max(255).optional(),
  game: gameSchema.optional(),
  tier: z
    .string()
    .trim()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    )
    .pipe(z.array(publicTierSchema).max(4))
    .optional(),
  freshness_status: freshnessStatusSchema.optional(),
  include_archived: z.coerce.boolean().default(false),
  sort: publicListSortSchema.default("players"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().trim().min(1).optional(),
});

const adminCreateBodySchema = z.object({
  slug: z.string().trim().min(3).max(120).regex(slugPattern).optional(),
  name: z.string().trim().min(2).max(64),
  description: z.string().trim().min(1).max(4000),
  host: z.string().trim().min(1).max(255),
  port: z.number().int().min(1).max(65535),
  game: z.literal("mc_java").default("mc_java"),
  status: adminStatusSchema.default("active"),
  online_mode: z.boolean().default(true),
  region: z.string().trim().min(1).max(50).nullable().optional(),
  website_url: urlOrNullSchema,
  discord_url: urlOrNullSchema,
});

const adminUpdateBodySchema = z
  .object({
    slug: z.string().trim().min(3).max(120).regex(slugPattern).optional(),
    name: z.string().trim().min(2).max(64).optional(),
    description: z.string().trim().min(1).max(4000).optional(),
    host: z.string().trim().min(1).max(255).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    online_mode: z.boolean().optional(),
    region: z.string().trim().min(1).max(50).nullable().optional(),
    website_url: urlOrNullSchema,
    discord_url: urlOrNullSchema,
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided.",
  });

const statusBodySchema = z.object({
  status: adminStatusSchema,
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const slugParamSchema = z.object({
  slug: z.string().trim().min(3).max(120),
});

const adminListResponseSchema = envelopeSchema(
  z.object({
    servers: z.array(serverBaseSchema),
    pagination: z.object({
      next_cursor: z.string().nullable(),
      limit: z.number().int().positive(),
    }),
  })
);

const adminDetailResponseSchema = envelopeSchema(
  z.object({
    server: serverBaseSchema.extend({
      latest_metrics: latestMetricsSchema,
    }),
  })
);

const publicListResponseSchema = envelopeSchema(
  z.object({
    servers: z.array(
      serverBaseSchema
        .pick({
          slug: true,
          name: true,
          description: true,
          game: true,
          catalog_status: true,
          freshness_status: true,
          region: true,
          last_ping_at: true,
        })
        .extend({
          latest_metrics: latestMetricsSchema,
        })
    ),
    pagination: z.object({
      next_cursor: z.string().nullable(),
      limit: z.number().int().positive(),
    }),
  })
);

const publicDetailResponseSchema = envelopeSchema(
  z.object({
    server: serverBaseSchema.extend({
      latest_metrics: latestMetricsSchema,
    }),
  })
);

const publicStatsResponseSchema = envelopeSchema(
  z.object({
    total_active_servers: z.number().int().nonnegative(),
    total_online_players: z.number().int().nonnegative(),
  })
);

const toNullable = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const randomSlugSuffix = (): string => randomUUID().slice(0, 6);

const buildTemporarySlug = (name: string): string => {
  const base = slugify(name);
  if (base.length === 0) {
    return `server-${randomSlugSuffix()}`;
  }

  return `${base.slice(0, 100)}-${randomSlugSuffix()}`;
};

const freshnessFromServer = (
  server: FreshnessServerFields,
  nowMs: number
): "online" | "offline" | "unknown" => {
  if (server.status !== "active") {
    return "offline";
  }

  if (!server.lastProbeAttemptAt || server.probeStatus === "unknown") {
    return "unknown";
  }

  if (!server.lastPingAt) {
    return "offline";
  }

  return nowMs - server.lastPingAt.getTime() <= ONLINE_WINDOW_MS ? "online" : "offline";
};

const findLatestHeartbeats = async (
  app: FastifyInstance,
  serverIds: string[]
): Promise<Map<string, HeartbeatRecord>> => {
  const uniqueServerIds = [...new Set(serverIds)];
  if (uniqueServerIds.length === 0) {
    return new Map();
  }

  const rankedHeartbeats = app.db.db
    .select({
      id: serverHeartbeats.id,
      rn: sql<number>`row_number() over (
        partition by ${serverHeartbeats.serverId}
        order by ${serverHeartbeats.occurredAt} desc, ${serverHeartbeats.createdAt} desc, ${serverHeartbeats.id} desc
      )`.as("rn"),
    })
    .from(serverHeartbeats)
    .where(inArray(serverHeartbeats.serverId, uniqueServerIds))
    .as("ranked_heartbeats");

  const rows = await app.db.db
    .select({ heartbeat: serverHeartbeats })
    .from(serverHeartbeats)
    .innerJoin(rankedHeartbeats, eq(serverHeartbeats.id, rankedHeartbeats.id))
    .where(eq(rankedHeartbeats.rn, 1));

  return new Map(rows.map(({ heartbeat }) => [heartbeat.serverId, heartbeat]));
};

const findLatestHeartbeat = async (
  app: FastifyInstance,
  serverId: string
): Promise<HeartbeatRecord | null> => {
  return (await findLatestHeartbeats(app, [serverId])).get(serverId) ?? null;
};

const normalizeServerPayload = (
  server: ServerRecord,
  nowMs: number
): {
  id: string;
  slug: string;
  name: string;
  description: string;
  host: string;
  port: number;
  game: "mc_java" | "mc_bedrock" | "hytale";
  catalog_status: "active" | "suspended" | "archived";
  freshness_status: "online" | "offline" | "unknown";
  online_mode: boolean;
  region: string | null;
  website_url: string | null;
  discord_url: string | null;
  last_ping_at: string | null;
  created_at: string;
  updated_at: string;
} => ({
  id: server.id,
  slug: server.slug,
  name: server.name,
  description: server.description,
  host: server.host,
  port: server.port,
  game: server.game as "mc_java" | "mc_bedrock" | "hytale",
  catalog_status: server.status as "active" | "suspended" | "archived",
  freshness_status: freshnessFromServer(server, nowMs),
  online_mode: server.onlineMode,
  region: server.region ?? null,
  website_url: server.websiteUrl ?? null,
  discord_url: server.discordUrl ?? null,
  last_ping_at: server.lastPingAt ? server.lastPingAt.toISOString() : null,
  created_at: server.createdAt.toISOString(),
  updated_at: server.updatedAt.toISOString(),
});

const normalizeMetricsPayload = (
  heartbeat: Pick<
    HeartbeatRecord,
    "pingMs" | "onlinePlayers" | "maxPlayers" | "minecraftVersion" | "occurredAt"
  > | null
): {
  ping_ms: number | null;
  online_players: number | null;
  max_players: number | null;
  minecraft_version: string | null;
  occurred_at: string | null;
} => ({
  ping_ms: heartbeat?.pingMs ?? null,
  online_players: heartbeat?.onlinePlayers ?? null,
  max_players: heartbeat?.maxPlayers ?? null,
  minecraft_version: heartbeat?.minecraftVersion ?? null,
  occurred_at: heartbeat?.occurredAt.toISOString() ?? null,
});

const latestHeartbeatFromPublicRow = (
  row: PublicServerListRow
): Pick<
  HeartbeatRecord,
  "pingMs" | "onlinePlayers" | "maxPlayers" | "minecraftVersion" | "occurredAt"
> | null => {
  if (!row.latestId || !row.occurredAt) {
    return null;
  }

  return {
    pingMs: row.pingMs,
    onlinePlayers: row.onlinePlayers,
    maxPlayers: row.maxPlayers,
    minecraftVersion: row.minecraftVersion,
    occurredAt: row.occurredAt,
  };
};

type PublicListSort = z.infer<typeof publicListSortSchema>;
type PublicListCursorPayload = {
  sort: PublicListSort;
  id: string;
  primary: number;
  secondary: number;
};

const encodePublicListCursor = (value: PublicListCursorPayload): string =>
  Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

const decodePublicListCursor = (
  cursor: string | undefined,
  expectedSort: PublicListSort
): PublicListCursorPayload | null => {
  if (!cursor) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8")
    ) as Partial<PublicListCursorPayload>;
    if (
      parsed.sort !== expectedSort ||
      typeof parsed.id !== "string" ||
      !z.string().uuid().safeParse(parsed.id).success ||
      typeof parsed.primary !== "number" ||
      typeof parsed.secondary !== "number"
    ) {
      return null;
    }

    return {
      sort: parsed.sort,
      id: parsed.id,
      primary: parsed.primary,
      secondary: parsed.secondary,
    };
  } catch {
    return null;
  }
};

const duplicateFieldFromError = (error: { constraint?: string; detail?: string }): string => {
  const text = `${error.constraint ?? ""} ${error.detail ?? ""}`.toLowerCase();
  if (text.includes("slug")) {
    return "slug";
  }

  return "identifier";
};

const getPgErrorMetadata = (
  error: unknown
): {
  code?: string;
  constraint?: string;
  detail?: string;
} => {
  const candidate = error as {
    code?: string;
    constraint?: string;
    detail?: string;
    cause?: {
      code?: string;
      constraint?: string;
      detail?: string;
    };
  };

  return {
    code: candidate.code ?? candidate.cause?.code,
    constraint: candidate.constraint ?? candidate.cause?.constraint,
    detail: candidate.detail ?? candidate.cause?.detail,
  };
};

const throwNotFound = (): never => {
  throw new ApiError({
    statusCode: 404,
    code: "SERVER_NOT_FOUND",
    message: "Server not found.",
  });
};

const requireFound = <T>(value: T | null | undefined): NonNullable<T> => {
  if (!value) {
    throwNotFound();
  }

  return value as NonNullable<T>;
};

export const registerServerRoutes = (fastify: FastifyInstance): void => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Simple in-memory cache for stats to reduce DB load
  let cachedStats: {
    total_active_servers: number;
    total_online_players: number;
    last_fetched_at: number;
  } | null = null;
  const STATS_CACHE_TTL_MS = 60 * 1000; // 1 minute

  app.get(
    "/api/v1/servers/stats",
    {
      schema: {
        response: {
          200: publicStatsResponseSchema,
        },
      },
    },
    async (request) => {
      const now = Date.now();
      if (cachedStats && now - cachedStats.last_fetched_at < STATS_CACHE_TTL_MS) {
        return successEnvelope(
          {
            total_active_servers: cachedStats.total_active_servers,
            total_online_players: cachedStats.total_online_players,
          },
          request.id
        );
      }

      const threshold = new Date(now - ONLINE_WINDOW_MS);

      const countsResult = await app.db.pool.query<PublicStatsRow>(
        `
          select
            count(s.id)::integer as total_active_servers,
            coalesce(
              sum(
                case
                  when s.last_ping_at >= $1 then latest.online_players
                  else 0
                end
              ),
              0
            )::integer as total_online_players
          from servers s
          left join lateral (
            select hb.online_players
            from server_heartbeats hb
            where hb.server_id = s.id
            order by hb.occurred_at desc, hb.created_at desc, hb.id desc
            limit 1
          ) latest on true
          where s.status = 'active'
        `,
        [threshold]
      );
      const counts = countsResult.rows[0];

      const stats = {
        total_active_servers: counts?.total_active_servers ?? 0,
        total_online_players: counts?.total_online_players ?? 0,
      };

      cachedStats = {
        ...stats,
        last_fetched_at: now,
      };

      return successEnvelope(stats, request.id);
    }
  );

  app.get(
    "/api/v1/admin/servers",
    {
      schema: {
        querystring: adminListQuerySchema,
        response: {
          200: adminListResponseSchema,
        },
      },
    },
    async (request) => {
      await requireAdminUser(app, request.headers.authorization);

      const query = request.query;
      const filters = [eq(servers.game, "mc_java")];
      if (query.status) {
        filters.push(eq(servers.status, query.status));
      }
      if (query.q) {
        const q = `%${query.q}%`;
        filters.push(
          or(
            ilike(servers.name, q),
            ilike(servers.slug, q),
            ilike(servers.description, q),
            ilike(servers.host, q)
          )!
        );
      }
      if (query.cursor) {
        filters.push(gtId(query.cursor));
      }

      const rows = await app.db.db
        .select()
        .from(servers)
        .where(and(...filters))
        .orderBy(asc(servers.id))
        .limit(query.limit + 1);

      const sliced = rows.slice(0, query.limit);
      const nowMs = Date.now();
      const data = sliced.map((row) => normalizeServerPayload(row, nowMs));
      const nextCursor = rows.length > query.limit ? (rows[query.limit]?.id ?? null) : null;

      return successEnvelope(
        {
          servers: data,
          pagination: {
            next_cursor: nextCursor,
            limit: query.limit,
          },
        },
        request.id
      );
    }
  );

  app.post(
    "/api/v1/admin/servers",
    {
      schema: {
        body: adminCreateBodySchema,
        response: {
          201: adminDetailResponseSchema,
        },
      },
    },
    async (request, reply) => {
      await requireAdminUser(app, request.headers.authorization);
      const payload = request.body;
      const now = new Date();
      const generatedSlug = payload.slug ?? buildTemporarySlug(payload.name);

      let created: ServerRecord;
      try {
        const rows = await app.db.db
          .insert(servers)
          .values({
            id: randomUUID(),
            slug: generatedSlug,
            name: payload.name,
            description: payload.description,
            host: payload.host,
            port: payload.port,
            game: "mc_java",
            status: payload.status,
            onlineMode: payload.online_mode,
            region: toNullable(payload.region),
            websiteUrl: toNullable(payload.website_url),
            discordUrl: toNullable(payload.discord_url),
            updatedAt: now,
          })
          .returning();
        created = rows[0]!;
      } catch (error) {
        const pgError = getPgErrorMetadata(error);
        if (pgError.code === "23505") {
          throw new ApiError({
            statusCode: 409,
            code: "VALIDATION_ERROR",
            message: "Slug is already in use.",
            details: { field: duplicateFieldFromError(pgError) },
          });
        }
        throw error;
      }

      const serverPayload = normalizeServerPayload(created, Date.now());
      return reply.status(201).send(
        successEnvelope(
          {
            server: {
              ...serverPayload,
              latest_metrics: normalizeMetricsPayload(null),
            },
          },
          request.id
        )
      );
    }
  );

  app.get(
    "/api/v1/admin/servers/:id",
    {
      schema: {
        params: idParamSchema,
        response: {
          200: adminDetailResponseSchema,
        },
      },
    },
    async (request) => {
      await requireAdminUser(app, request.headers.authorization);
      const server = requireFound(
        await app.db.db.query.servers.findFirst({
          where: and(eq(servers.id, request.params.id), eq(servers.game, "mc_java")),
        })
      );

      const latest = await findLatestHeartbeat(app, server.id);
      return successEnvelope(
        {
          server: {
            ...normalizeServerPayload(server, Date.now()),
            latest_metrics: normalizeMetricsPayload(latest),
          },
        },
        request.id
      );
    }
  );

  app.patch(
    "/api/v1/admin/servers/:id",
    {
      schema: {
        params: idParamSchema,
        body: adminUpdateBodySchema,
        response: {
          200: adminDetailResponseSchema,
        },
      },
    },
    async (request) => {
      await requireAdminUser(app, request.headers.authorization);

      const existing = requireFound(
        await app.db.db.query.servers.findFirst({
          where: and(eq(servers.id, request.params.id), eq(servers.game, "mc_java")),
        })
      );

      const now = new Date();
      const patch: Partial<typeof servers.$inferInsert> = {
        updatedAt: now,
      };

      if (request.body.slug !== undefined) {
        patch.slug = request.body.slug;
      }
      if (request.body.name !== undefined) {
        patch.name = request.body.name;
      }
      if (request.body.description !== undefined) {
        patch.description = request.body.description;
      }
      if (request.body.host !== undefined) {
        patch.host = request.body.host;
      }
      if (request.body.port !== undefined) {
        patch.port = request.body.port;
      }
      if (request.body.online_mode !== undefined) {
        patch.onlineMode = request.body.online_mode;
      }
      if (request.body.region !== undefined) {
        patch.region = toNullable(request.body.region);
      }
      if (request.body.website_url !== undefined) {
        patch.websiteUrl = toNullable(request.body.website_url);
      }
      if (request.body.discord_url !== undefined) {
        patch.discordUrl = toNullable(request.body.discord_url);
      }

      let updated: ServerRecord;
      try {
        const rows = await app.db.db
          .update(servers)
          .set(patch)
          .where(eq(servers.id, existing.id))
          .returning();
        updated = rows[0]!;
      } catch (error) {
        const pgError = getPgErrorMetadata(error);
        if (pgError.code === "23505") {
          throw new ApiError({
            statusCode: 409,
            code: "VALIDATION_ERROR",
            message: "Slug is already in use.",
            details: { field: duplicateFieldFromError(pgError) },
          });
        }
        throw error;
      }

      const latest = await findLatestHeartbeat(app, updated.id);
      return successEnvelope(
        {
          server: {
            ...normalizeServerPayload(updated, Date.now()),
            latest_metrics: normalizeMetricsPayload(latest),
          },
        },
        request.id
      );
    }
  );

  app.patch(
    "/api/v1/admin/servers/:id/status",
    {
      schema: {
        params: idParamSchema,
        body: statusBodySchema,
        response: {
          200: adminDetailResponseSchema,
        },
      },
    },
    async (request) => {
      await requireAdminUser(app, request.headers.authorization);

      const rows = await app.db.db
        .update(servers)
        .set({
          status: request.body.status,
          updatedAt: new Date(),
        })
        .where(and(eq(servers.id, request.params.id), eq(servers.game, "mc_java")))
        .returning();

      const updated = requireFound(rows[0]);

      const latest = await findLatestHeartbeat(app, updated.id);
      return successEnvelope(
        {
          server: {
            ...normalizeServerPayload(updated, Date.now()),
            latest_metrics: normalizeMetricsPayload(latest),
          },
        },
        request.id
      );
    }
  );

  app.get(
    "/api/v1/servers",
    {
      schema: {
        querystring: publicListQuerySchema,
        response: {
          200: publicListResponseSchema,
        },
      },
    },
    async (request) => {
      const query = request.query;
      const cursor = decodePublicListCursor(query.cursor, query.sort);
      if (query.cursor && !cursor) {
        throw new ApiError({
          statusCode: 400,
          code: "VALIDATION_ERROR",
          message: "Invalid cursor.",
          details: { field: "cursor" },
        });
      }

      const statuses = query.include_archived
        ? (["active", "archived"] as const)
        : (["active"] as const);
      const queryParams: unknown[] = [];
      const filters = [
        `s.game = ${addQueryParam(queryParams, query.game ?? "mc_java")}`,
        `s.status = any(${addQueryParam(queryParams, statuses)}::text[])`,
      ];
      if (query.q) {
        const q = addQueryParam(queryParams, `%${query.q}%`);
        filters.push(`(s.name ilike ${q} or s.slug::text ilike ${q} or s.description ilike ${q})`);
      }

      const threshold = new Date(Date.now() - ONLINE_WINDOW_MS);
      if (query.freshness_status === "online") {
        filters.push("s.status = 'active'");
        filters.push(`s.last_ping_at >= ${addQueryParam(queryParams, threshold)}`);
      } else if (query.freshness_status === "offline") {
        filters.push(
          `(
            s.status = 'archived'
            or (s.status = 'active' and s.last_ping_at < ${addQueryParam(queryParams, threshold)})
            or (s.status = 'active' and s.probe_status = 'unreachable')
            or (s.status = 'active' and s.probe_status = 'offline')
          )`
        );
      } else if (query.freshness_status === "unknown") {
        filters.push(
          "(s.status = 'active' and (s.last_probe_attempt_at is null or s.probe_status = 'unknown'))"
        );
      }

      const sortPlayersExpr = `coalesce(latest.online_players, ${PUBLIC_PLAYERS_NULL_SORT_VALUE})::integer`;
      const sortPingExpr = `coalesce(latest.ping_ms::integer, ${PUBLIC_PING_NULL_SORT_VALUE})`;
      const tierPlayersExpr = "coalesce(latest.online_players, 0)";
      if (query.tier && query.tier.length > 0) {
        const tierFilters = query.tier.map((tier) => {
          if (tier === "common") {
            return `${tierPlayersExpr} < 100`;
          }
          if (tier === "rare") {
            return `${tierPlayersExpr} >= 100 and ${tierPlayersExpr} < 1000`;
          }
          if (tier === "epic") {
            return `${tierPlayersExpr} >= 1000 and ${tierPlayersExpr} < 10000`;
          }
          return `${tierPlayersExpr} >= 10000`;
        });
        filters.push(`(${tierFilters.join(" or ")})`);
      }
      const cursorFilter =
        cursor && query.sort === "players"
          ? (() => {
              const primary = addQueryParam(queryParams, cursor.primary);
              const secondary = addQueryParam(queryParams, cursor.secondary);
              const id = addQueryParam(queryParams, cursor.id);
              return `(
              ${sortPlayersExpr} < ${primary}
              or (${sortPlayersExpr} = ${primary} and ${sortPingExpr} > ${secondary})
              or (
                ${sortPlayersExpr} = ${primary}
                and ${sortPingExpr} = ${secondary}
                and s.id > ${id}::uuid
              )
            )`;
            })()
          : cursor && query.sort === "ping"
            ? (() => {
                const primary = addQueryParam(queryParams, cursor.primary);
                const secondary = addQueryParam(queryParams, cursor.secondary);
                const id = addQueryParam(queryParams, cursor.id);
                return `(
                ${sortPingExpr} > ${primary}
                or (${sortPingExpr} = ${primary} and ${sortPlayersExpr} < ${secondary})
                or (
                  ${sortPingExpr} = ${primary}
                  and ${sortPlayersExpr} = ${secondary}
                  and s.id > ${id}::uuid
                )
              )`;
              })()
            : undefined;
      if (cursorFilter) {
        filters.push(cursorFilter);
      }

      const sortPrimaryExpr = query.sort === "players" ? sortPlayersExpr : sortPingExpr;
      const sortSecondaryExpr = query.sort === "players" ? sortPingExpr : sortPlayersExpr;
      const orderClause =
        query.sort === "players"
          ? `${sortPlayersExpr} desc, ${sortPingExpr} asc, s.id asc`
          : `${sortPingExpr} asc, ${sortPlayersExpr} desc, s.id asc`;
      const limit = addQueryParam(queryParams, query.limit + 1);
      const rowsResult = await app.db.pool.query<PublicServerListRow>(
        `
          select
            s.id,
            s.slug::text as slug,
            s.name,
            s.description,
            s.game,
            s.status,
            s.region,
            s.last_ping_at as "lastPingAt",
            s.last_probe_attempt_at as "lastProbeAttemptAt",
            s.probe_status as "probeStatus",
            latest.id as "latestId",
            latest.ping_ms as "pingMs",
            latest.online_players as "onlinePlayers",
            latest.max_players as "maxPlayers",
            latest.minecraft_version as "minecraftVersion",
            latest.occurred_at as "occurredAt",
            ${sortPrimaryExpr} as "sortPrimary",
            ${sortSecondaryExpr} as "sortSecondary"
          from servers s
          left join lateral (
            select
              hb.id,
              hb.ping_ms,
              hb.online_players,
              hb.max_players,
              hb.minecraft_version,
              hb.occurred_at,
              hb.created_at
            from server_heartbeats hb
            where hb.server_id = s.id
            order by hb.occurred_at desc, hb.created_at desc, hb.id desc
            limit 1
          ) latest on true
          where ${filters.join("\n            and ")}
          order by ${orderClause}
          limit ${limit}
        `,
        queryParams
      );
      const rows = rowsResult.rows;

      const nowMs = Date.now();
      const sliced = rows.slice(0, query.limit);
      const tail = sliced[sliced.length - 1];
      const nextCursor =
        rows.length > query.limit && tail
          ? encodePublicListCursor({
              sort: query.sort,
              id: tail.id,
              primary: tail.sortPrimary,
              secondary: tail.sortSecondary,
            })
          : null;
      return successEnvelope(
        {
          servers: sliced.map((row) => ({
            slug: row.slug,
            name: row.name,
            description: row.description,
            game: row.game,
            catalog_status: row.status,
            freshness_status: freshnessFromServer(row, nowMs),
            region: row.region ?? null,
            last_ping_at: row.lastPingAt ? row.lastPingAt.toISOString() : null,
            latest_metrics: normalizeMetricsPayload(latestHeartbeatFromPublicRow(row)),
          })),
          pagination: {
            next_cursor: nextCursor,
            limit: query.limit,
          },
        },
        request.id
      );
    }
  );

  app.get(
    "/api/v1/servers/:slug",
    {
      schema: {
        params: slugParamSchema,
        response: {
          200: publicDetailResponseSchema,
        },
      },
    },
    async (request) => {
      const server = requireFound(
        await app.db.db.query.servers.findFirst({
          where: and(
            eq(servers.slug, request.params.slug),
            eq(servers.game, "mc_java"),
            inArray(servers.status, ["active", "archived"])
          ),
        })
      );

      const latest = await findLatestHeartbeat(app, server.id);
      return successEnvelope(
        {
          server: {
            ...normalizeServerPayload(server, Date.now()),
            latest_metrics: normalizeMetricsPayload(latest),
          },
        },
        request.id
      );
    }
  );
};

const gtId = (cursor: string) => sql`${servers.id} > ${cursor}::uuid`;

const addQueryParam = (params: unknown[], value: unknown): string => {
  params.push(value);
  return `$${params.length}`;
};
