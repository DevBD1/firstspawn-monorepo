import { and, asc, eq, inArray, ilike, or, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import {
  serverHeartbeats,
  serverSocials,
  serverSupportedClients,
  servers,
} from "@firstspawn/database/schema";
import { ApiError } from "../../lib/api-error.js";
import { successEnvelope } from "../../lib/envelope.js";
import { checkRateLimit } from "../../lib/rate-limit.js";
import { requireAdminUser } from "../../lib/request-auth.js";
import { hashToken } from "../../lib/security.js";

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
  game: "mc_java";
  status: "active" | "suspended" | "archived";
  countryCode: string | null;
  authMode: "official" | "offline_allowed" | "unknown";
  logoUrl: string | null;
  bannerUrl: string | null;
  lastPingAt: Date | null;
  lastProbeAttemptAt: Date | null;
  probeStatus: "online" | "offline" | "unknown" | "unreachable";
  latestId: string | null;
  pingMs: number | null;
  onlinePlayers: number | null;
  maxPlayers: number | null;
  minecraftVersion: string | null;
  occurredAt: Date | null;
  votesThisMonth: number;
  votesAllTime: number;
  sortPrimary: number;
  sortSecondary: number;
};
type VoteCountRow = {
  serverId: string;
  votesThisMonth: number;
  votesAllTime: number;
};
type LeaderboardRow = {
  username: string;
  votes: number;
};
type PublicStatsRow = {
  checked_recently: number;
  total_active_servers: number;
  total_online_players: number;
};
type PublicGeoRow = {
  slug: string;
  name: string;
  game: "mc_java";
  countryCode: string;
  latitude: number;
  longitude: number;
  reachScope: "local" | "regional" | "global";
  onlinePlayers: number | null;
  status: "active" | "suspended" | "archived";
  lastPingAt: Date | null;
  lastProbeAttemptAt: Date | null;
  probeStatus: "online" | "offline" | "unknown" | "unreachable";
};

const adminStatusSchema = z.enum(["active", "suspended", "archived"]);
const freshnessStatusSchema = z.enum(["online", "offline", "unknown"]);
// Minecraft Java is the only supported server platform (docs/releases/v1-mvp.md §3.1).
const gameSchema = z.literal("mc_java");
// Bedrock appears only as a supported client when a Java server enables Geyser.
const clientNameSchema = z.enum(["mc_java", "mc_bedrock"]);
const authModeSchema = z.enum(["official", "offline_allowed", "unknown"]);
export const reachScopeSchema = z.enum(["local", "regional", "global"]);
const publicListSortSchema = z.enum(["most_voted", "players", "ping"]);
const publicTierSchema = z.enum(["common", "rare", "epic", "legendary"]);
const serverSocialPlatformSchema = z.enum([
  "website",
  "discord",
  "youtube",
  "twitter",
  "instagram",
  "tiktok",
  "facebook",
]);

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

const serverSocialSchema = z.object({
  platform: serverSocialPlatformSchema,
  url: z.string().url().max(2048),
  display_order: z.number().int().min(0).default(0),
});

const serverSupportedClientSchema = z.object({
  client_name: clientNameSchema,
  client_version: z.string().trim().min(1).max(50),
});

const serverSocialsBodySchema = z
  .array(serverSocialSchema)
  .max(20)
  .superRefine((socials, ctx) => {
    const seenPlatforms = new Set<string>();
    socials.forEach((social, index) => {
      if (seenPlatforms.has(social.platform)) {
        ctx.addIssue({
          code: "custom",
          message: "Only one social link per platform is allowed.",
          path: [index, "platform"],
        });
      }
      seenPlatforms.add(social.platform);
    });
  });

const serverSupportedClientsBodySchema = z
  .array(serverSupportedClientSchema)
  .max(20)
  .superRefine((clients, ctx) => {
    const seenClients = new Set<string>();
    clients.forEach((client, index) => {
      const key = JSON.stringify([client.client_name, client.client_version]);
      if (seenClients.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: "Only one supported client entry per client and version is allowed.",
          path: [index, "client_version"],
        });
      }
      seenClients.add(key);
    });
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
  auth_mode: authModeSchema,
  country_code: z.string().nullable(),
  reach_scope: reachScopeSchema,
  logo_url: z.string().nullable(),
  banner_url: z.string().nullable(),

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
  sort: publicListSortSchema.default("most_voted"),
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
  auth_mode: authModeSchema.default("official"),
  country_code: z.string().trim().length(2).nullable().optional(),
  reach_scope: reachScopeSchema.optional(),
  logo_url: z.string().url().max(2048).nullable().optional(),
  banner_url: z.string().url().max(2048).nullable().optional(),
  socials: serverSocialsBodySchema.optional(),
  supported_clients: serverSupportedClientsBodySchema.optional(),
});

const adminUpdateBodySchema = z
  .object({
    slug: z.string().trim().min(3).max(120).regex(slugPattern).optional(),
    name: z.string().trim().min(2).max(64).optional(),
    description: z.string().trim().min(1).max(4000).optional(),
    host: z.string().trim().min(1).max(255).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    auth_mode: authModeSchema.optional(),
    country_code: z.string().trim().length(2).nullable().optional(),
    reach_scope: reachScopeSchema.optional(),
    logo_url: z.string().url().max(2048).nullable().optional(),
    banner_url: z.string().url().max(2048).nullable().optional(),
    socials: serverSocialsBodySchema.optional(),
    supported_clients: serverSupportedClientsBodySchema.optional(),
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

const voteBodySchema = z.object({
  username: z.string().trim().min(1).max(32),
  turnstile_token: z.string().trim().min(1).optional(),
});

const leaderboardQuerySchema = z.object({
  month: z.enum(["current", "previous"]).default("current"),
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
      socials: z.array(serverSocialSchema),
      supported_clients: z.array(serverSupportedClientSchema),
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
          auth_mode: true,
          country_code: true,
          logo_url: true,
          banner_url: true,
          last_ping_at: true,
        })
        .extend({
          votes_this_month: z.number().int().nonnegative(),
          votes_all_time: z.number().int().nonnegative(),
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
      votes_this_month: z.number().int().nonnegative(),
      votes_all_time: z.number().int().nonnegative(),
      votifier_enabled: z.boolean(),
      latest_metrics: latestMetricsSchema,
      socials: z.array(serverSocialSchema),
      supported_clients: z.array(serverSupportedClientSchema),
    }),
  })
);

const voteResponseSchema = envelopeSchema(
  z.object({
    vote: z.object({
      server_slug: z.string(),
      username_normalized: z.string(),
      voted_on: z.string(),
      votes_this_month: z.number().int().nonnegative(),
      votes_all_time: z.number().int().nonnegative(),
    }),
  })
);

const voteStatusResponseSchema = envelopeSchema(
  z.object({
    voted_today: z.boolean(),
    votes_this_month: z.number().int().nonnegative(),
    votes_all_time: z.number().int().nonnegative(),
  })
);

const leaderboardResponseSchema = envelopeSchema(
  z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/),
    finalized: z.boolean(),
    entries: z.array(
      z.object({
        rank: z.number().int().positive(),
        username: z.string(),
        votes: z.number().int().positive(),
      })
    ),
  })
);

const publicStatsResponseSchema = envelopeSchema(
  z.object({
    checked_recently: z.number().int().nonnegative(),
    total_active_servers: z.number().int().nonnegative(),
    total_online_players: z.number().int().nonnegative(),
  })
);

const publicGeoResponseSchema = envelopeSchema(
  z.object({
    servers: z.array(
      z.object({
        slug: z.string(),
        name: z.string(),
        game: gameSchema,
        country_code: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        reach_scope: reachScopeSchema,
        online_players: z.number().int().nonnegative().nullable(),
        freshness_status: freshnessStatusSchema,
      })
    ),
  })
);

export const toNullable = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

type ReachScope = z.infer<typeof reachScopeSchema>;

// Default origin for servers that don't declare a real country (or use the legacy
// "WW" sentinel). Origin must always be a real place for the homepage globe, while
// worldwide availability is expressed via reach_scope.
const DEFAULT_GLOBAL_ORIGIN = "US";

// A server's origin is always a real country; "WW" (or an empty value) is treated as
// "global reach from a default origin". An explicit reach_scope always wins.
export const resolveOriginAndReach = (
  countryCode: string | null | undefined,
  reachScope: ReachScope | undefined
): { countryCode: string; reachScope: ReachScope } => {
  const raw = toNullable(countryCode ?? null)?.toUpperCase() ?? null;
  const isGlobalLike = raw === null || raw === "WW";
  return {
    countryCode: isGlobalLike ? DEFAULT_GLOBAL_ORIGIN : raw,
    reachScope: reachScope ?? (isGlobalLike ? "global" : "local"),
  };
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

export const buildTemporarySlug = (name: string): string => {
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

export const findLatestHeartbeats = async (
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

export const normalizeServerPayload = (
  server: ServerRecord,
  nowMs: number
): {
  id: string;
  slug: string;
  name: string;
  description: string;
  host: string;
  port: number;
  game: "mc_java";
  catalog_status: "active" | "suspended" | "archived";
  freshness_status: "online" | "offline" | "unknown";
  auth_mode: "official" | "offline_allowed" | "unknown";
  country_code: string | null;
  reach_scope: "local" | "regional" | "global";
  logo_url: string | null;
  banner_url: string | null;

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
  game: server.game as "mc_java",
  catalog_status: server.status as "active" | "suspended" | "archived",
  freshness_status: freshnessFromServer(server, nowMs),
  auth_mode: server.authMode as "official" | "offline_allowed" | "unknown",
  country_code: server.countryCode,
  reach_scope: server.reachScope as "local" | "regional" | "global",
  logo_url: server.logoUrl,
  banner_url: server.bannerUrl,
  last_ping_at: server.lastPingAt ? server.lastPingAt.toISOString() : null,
  created_at: server.createdAt.toISOString(),
  updated_at: server.updatedAt.toISOString(),
});

type ServerMetadata = {
  socials: Array<z.infer<typeof serverSocialSchema>>;
  supported_clients: Array<z.infer<typeof serverSupportedClientSchema>>;
};

export const findServerMetadata = async (
  app: FastifyInstance,
  serverId: string
): Promise<ServerMetadata> => {
  const [socialRows, clientRows] = await Promise.all([
    app.db.db
      .select()
      .from(serverSocials)
      .where(eq(serverSocials.serverId, serverId))
      .orderBy(asc(serverSocials.displayOrder), asc(serverSocials.platform)),
    app.db.db
      .select()
      .from(serverSupportedClients)
      .where(eq(serverSupportedClients.serverId, serverId))
      .orderBy(asc(serverSupportedClients.clientName), asc(serverSupportedClients.clientVersion)),
  ]);

  return {
    socials: socialRows.map((row) => ({
      platform: row.platform as z.infer<typeof serverSocialPlatformSchema>,
      url: row.url,
      display_order: row.displayOrder,
    })),
    supported_clients: clientRows.map((row) => ({
      client_name: row.clientName as z.infer<typeof clientNameSchema>,
      client_version: row.clientVersion,
    })),
  };
};

export const normalizeMetricsPayload = (
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

export const duplicateFieldFromError = (error: {
  constraint?: string;
  detail?: string;
}): string => {
  const text = `${error.constraint ?? ""} ${error.detail ?? ""}`.toLowerCase();
  if (text.includes("slug")) {
    return "slug";
  }

  return "identifier";
};

export const getPgErrorMetadata = (
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

const USERNAME_DENYLIST = new Set([
  "admin",
  "administrator",
  "moderator",
  "owner",
  "staff",
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "nigger",
  "nigga",
]);

const normalizeMinecraftUsername = (username: string): string => {
  const normalized = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,16}$/.test(normalized) || USERNAME_DENYLIST.has(normalized)) {
    throw new ApiError({
      statusCode: 400,
      code: "INVALID_USERNAME",
      message: "Minecraft Java username is invalid.",
      details: { field: "username" },
    });
  }

  return normalized;
};

const utcDateString = (value = new Date()): string => value.toISOString().slice(0, 10);

const utcMonthStartString = (value = new Date()): string =>
  `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-01`;

const leaderboardMonth = (selection: "current" | "previous"): { label: string; start: string } => {
  const now = new Date();
  const month = selection === "current" ? now.getUTCMonth() : now.getUTCMonth() - 1;
  const start = new Date(Date.UTC(now.getUTCFullYear(), month, 1));
  return {
    label: start.toISOString().slice(0, 7),
    start: utcMonthStartString(start),
  };
};

const getClientIp = (ip?: string): string | null => {
  if (!ip) {
    return null;
  }

  const first = ip.split(",")[0]?.trim();
  return first || null;
};

const dailyIpHmac = (
  ip: string,
  votedOn: string,
  config: { API_TOKEN_HASH_SECRET: string }
): string => hashToken(`${votedOn}:${ip}`, config);

const normalizeHeader = (value: string | string[] | undefined): string | null => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const expectedTurnstileHostname = (frontendUrl: string): string | null => {
  try {
    return new URL(frontendUrl).hostname;
  } catch {
    return null;
  }
};

/** True only for routable public IPs — excludes loopback and private ranges. */
const isForwardableRemoteIp = (ip: string): boolean => {
  if (ip === "::1" || ip === "::" || ip.startsWith("127.")) return false;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return false;
  if (ip.startsWith("fc") || ip.startsWith("fd")) return false; // IPv6 ULA
  if (ip.startsWith("::ffff:127.") || ip.startsWith("::ffff:10.")) return false;
  return true;
};

const verifyTurnstile = async (
  token: string | undefined,
  requestIp: string | null,
  app: FastifyInstance
): Promise<void> => {
  if (!token) {
    throw new ApiError({
      statusCode: 400,
      code: "TURNSTILE_REQUIRED",
      message: "Turnstile token is required.",
      details: { field: "turnstile_token" },
    });
  }

  const secret = app.config.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new ApiError({
      statusCode: 403,
      code: "TURNSTILE_FAILED",
      message: "Turnstile verification failed.",
    });
  }

  const tokenHash = hashToken(token, app.config);
  const singleUseKey = `turnstile:vote:${tokenHash}`;
  const singleUseResult = await app.redis
    .multi()
    .incr(singleUseKey)
    .expire(singleUseKey, 300, "NX")
    .exec();
  const useCount = singleUseResult?.[0]?.[1];
  if (typeof useCount !== "number" || useCount > 1) {
    throw new ApiError({
      statusCode: 403,
      code: "TURNSTILE_FAILED",
      message: "Turnstile verification failed.",
    });
  }

  const form = new URLSearchParams({
    secret,
    response: token,
  });
  // Only forward a real public client IP to Cloudflare. Sending a loopback or
  // private address (e.g. `::1` from a local BFF->API hop) is meaningless and
  // can fail siteverify's remoteip validation.
  if (requestIp && isForwardableRemoteIp(requestIp)) {
    form.set("remoteip", requestIp);
  }

  let payload: {
    success?: boolean;
    action?: string;
    hostname?: string;
    challenge_ts?: string;
    "error-codes"?: string[];
  };
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new ApiError({
      statusCode: 403,
      code: "TURNSTILE_FAILED",
      message: "Turnstile verification failed.",
    });
  }

  const challengeMs = payload.challenge_ts ? Date.parse(payload.challenge_ts) : Number.NaN;
  const maxAgeMs = 5 * 60 * 1000;
  const expectedHostname = expectedTurnstileHostname(app.config.FRONTEND_URL);
  const hostnameOk = expectedHostname ? payload.hostname === expectedHostname : true;

  if (
    payload.success !== true ||
    payload.action !== "vote" ||
    !hostnameOk ||
    !Number.isFinite(challengeMs) ||
    Date.now() - challengeMs > maxAgeMs
  ) {
    throw new ApiError({
      statusCode: 403,
      code: "TURNSTILE_FAILED",
      message: "Turnstile verification failed.",
    });
  }
};

export const findVoteCounts = async (
  app: FastifyInstance,
  serverIds: string[]
): Promise<Map<string, { votes_this_month: number; votes_all_time: number }>> => {
  const uniqueServerIds = [...new Set(serverIds)];
  if (uniqueServerIds.length === 0) {
    return new Map();
  }

  const result = await app.db.pool.query<VoteCountRow>(
    `
      select
        s.id as "serverId",
        coalesce(current_month.count, 0)::integer as "votesThisMonth",
        coalesce(sum(c.count), 0)::integer as "votesAllTime"
      from servers s
      left join server_vote_counters c on c.server_id = s.id
      left join server_vote_counters current_month
        on current_month.server_id = s.id
       and current_month.month = date_trunc('month', now() at time zone 'utc')::date
      where s.id = any($1::uuid[])
      group by s.id, current_month.count
    `,
    [uniqueServerIds]
  );

  return new Map(
    result.rows.map((row) => [
      row.serverId,
      {
        votes_this_month: row.votesThisMonth,
        votes_all_time: row.votesAllTime,
      },
    ])
  );
};

const enqueueVotifierDelivery = async (_voteId: string): Promise<void> => {
  // Day 2: enqueue Votifier reward delivery when public/private config is complete.
};

export const registerServerRoutes = (fastify: FastifyInstance): void => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Simple in-memory cache for stats to reduce DB load
  let cachedStats: {
    checked_recently: number;
    total_active_servers: number;
    total_online_players: number;
    last_fetched_at: number;
  } | null = null;
  const STATS_CACHE_TTL_MS = 60 * 1000; // 1 minute

  // Cache for the homepage globe payload (origin coordinates rarely change).
  let cachedGeo: {
    servers: z.infer<typeof publicGeoResponseSchema>["data"]["servers"];
    last_fetched_at: number;
  } | null = null;
  const GEO_CACHE_TTL_MS = 60 * 1000; // 1 minute

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
            checked_recently: cachedStats.checked_recently,
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
            (count(s.id) filter (where s.last_probe_attempt_at >= $1))::integer as checked_recently,
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
        checked_recently: counts?.checked_recently ?? 0,
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
    "/api/v1/servers/geo",
    {
      schema: {
        response: {
          200: publicGeoResponseSchema,
        },
      },
    },
    async (request) => {
      const now = Date.now();
      if (cachedGeo && now - cachedGeo.last_fetched_at < GEO_CACHE_TTL_MS) {
        return successEnvelope({ servers: cachedGeo.servers }, request.id);
      }

      // Lightweight payload for the homepage globe: active servers placed at their
      // origin-country centroid. Servers whose origin has no coordinates are skipped.
      const rowsResult = await app.db.pool.query<PublicGeoRow>(`
        select
          s.slug::text as slug,
          s.name,
          s.game,
          s.country_code as "countryCode",
          c.latitude as "latitude",
          c.longitude as "longitude",
          s.reach_scope as "reachScope",
          latest.online_players as "onlinePlayers",
          s.status as "status",
          s.last_ping_at as "lastPingAt",
          s.last_probe_attempt_at as "lastProbeAttemptAt",
          s.probe_status as "probeStatus"
        from servers s
        join countries c on c.iso_a_2 = s.country_code
        left join lateral (
          select hb.online_players
          from server_heartbeats hb
          where hb.server_id = s.id
          order by hb.occurred_at desc, hb.created_at desc, hb.id desc
          limit 1
        ) latest on true
        where s.game = 'mc_java'
          and s.status = 'active'
          and c.latitude is not null
          and c.longitude is not null
        order by coalesce(latest.online_players, 0) desc, s.id asc
        limit 500
      `);

      const geoServers = rowsResult.rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        game: row.game,
        country_code: row.countryCode,
        latitude: row.latitude,
        longitude: row.longitude,
        reach_scope: row.reachScope,
        online_players: row.onlinePlayers,
        freshness_status: freshnessFromServer(row, now),
      }));

      cachedGeo = { servers: geoServers, last_fetched_at: now };
      return successEnvelope({ servers: geoServers }, request.id);
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

      const origin = resolveOriginAndReach(payload.country_code, payload.reach_scope);

      let created: ServerRecord;
      try {
        created = await app.db.db.transaction(async (tx) => {
          const rows = await tx
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
              authMode: payload.auth_mode,
              countryCode: origin.countryCode,
              reachScope: origin.reachScope,
              logoUrl: toNullable(payload.logo_url),
              bannerUrl: toNullable(payload.banner_url),
              updatedAt: now,
            })
            .returning();
          const row = rows[0]!;

          if (payload.socials && payload.socials.length > 0) {
            await tx.insert(serverSocials).values(
              payload.socials.map((social) => ({
                serverId: row.id,
                platform: social.platform,
                url: social.url,
                displayOrder: social.display_order,
                updatedAt: now,
              }))
            );
          }

          if (payload.supported_clients && payload.supported_clients.length > 0) {
            await tx.insert(serverSupportedClients).values(
              payload.supported_clients.map((client) => ({
                serverId: row.id,
                clientName: client.client_name,
                clientVersion: client.client_version,
                updatedAt: now,
              }))
            );
          }

          return row;
        });
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
      const metadata = await findServerMetadata(app, created.id);
      return reply.status(201).send(
        successEnvelope(
          {
            server: {
              ...serverPayload,
              latest_metrics: normalizeMetricsPayload(null),
              ...metadata,
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

      const [latest, metadata] = await Promise.all([
        findLatestHeartbeat(app, server.id),
        findServerMetadata(app, server.id),
      ]);
      return successEnvelope(
        {
          server: {
            ...normalizeServerPayload(server, Date.now()),
            latest_metrics: normalizeMetricsPayload(latest),
            ...metadata,
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
      if (request.body.auth_mode !== undefined) {
        patch.authMode = request.body.auth_mode;
      }
      if (request.body.country_code !== undefined || request.body.reach_scope !== undefined) {
        const nextCountry =
          request.body.country_code !== undefined
            ? request.body.country_code
            : existing.countryCode;
        // The new origin is "global-like" if the caller set country_code to "WW"/empty.
        const switchedToGlobalOrigin =
          request.body.country_code !== undefined &&
          ((toNullable(request.body.country_code)?.toUpperCase() ?? null) === null ||
            toNullable(request.body.country_code)?.toUpperCase() === "WW");
        // When reach_scope isn't given, preserve the server's current reach — except
        // when switching to a global-like origin, where the resolver should derive
        // "global" (pass undefined). This prevents a country-only edit from silently
        // resetting an existing "global"/"regional" reach back to "local".
        const reachArg =
          request.body.reach_scope !== undefined
            ? request.body.reach_scope
            : switchedToGlobalOrigin
              ? undefined
              : (existing.reachScope as ReachScope);
        const origin = resolveOriginAndReach(nextCountry, reachArg);
        patch.countryCode = origin.countryCode;
        patch.reachScope = origin.reachScope;
      }
      if (request.body.logo_url !== undefined) {
        patch.logoUrl = toNullable(request.body.logo_url);
      }
      if (request.body.banner_url !== undefined) {
        patch.bannerUrl = toNullable(request.body.banner_url);
      }

      let updated: ServerRecord;
      try {
        updated = await app.db.db.transaction(async (tx) => {
          const rows = await tx
            .update(servers)
            .set(patch)
            .where(eq(servers.id, existing.id))
            .returning();
          const row = rows[0]!;

          if (request.body.socials !== undefined) {
            await tx.delete(serverSocials).where(eq(serverSocials.serverId, existing.id));
            if (request.body.socials.length > 0) {
              await tx.insert(serverSocials).values(
                request.body.socials.map((social) => ({
                  serverId: existing.id,
                  platform: social.platform,
                  url: social.url,
                  displayOrder: social.display_order,
                  updatedAt: now,
                }))
              );
            }
          }

          if (request.body.supported_clients !== undefined) {
            await tx
              .delete(serverSupportedClients)
              .where(eq(serverSupportedClients.serverId, existing.id));
            if (request.body.supported_clients.length > 0) {
              await tx.insert(serverSupportedClients).values(
                request.body.supported_clients.map((client) => ({
                  serverId: existing.id,
                  clientName: client.client_name,
                  clientVersion: client.client_version,
                  updatedAt: now,
                }))
              );
            }
          }

          return row;
        });
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

      const [latest, metadata] = await Promise.all([
        findLatestHeartbeat(app, updated.id),
        findServerMetadata(app, updated.id),
      ]);
      return successEnvelope(
        {
          server: {
            ...normalizeServerPayload(updated, Date.now()),
            latest_metrics: normalizeMetricsPayload(latest),
            ...metadata,
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

      const [latest, metadata] = await Promise.all([
        findLatestHeartbeat(app, updated.id),
        findServerMetadata(app, updated.id),
      ]);
      return successEnvelope(
        {
          server: {
            ...normalizeServerPayload(updated, Date.now()),
            latest_metrics: normalizeMetricsPayload(latest),
            ...metadata,
          },
        },
        request.id
      );
    }
  );

  app.post(
    "/api/v1/servers/:slug/vote",
    {
      schema: {
        params: slugParamSchema,
        body: voteBodySchema,
        response: {
          201: voteResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const clientIp = getClientIp(request.ip);
      const rateLimitKey = `rl:vote:${clientIp ?? "unknown"}`;
      const allowed = await checkRateLimit(app.redis, rateLimitKey, 20, 60);
      if (!allowed) {
        throw new ApiError({
          statusCode: 429,
          code: "RATE_LIMITED",
          message: "Too many vote attempts. Please try again later.",
        });
      }

      const usernameNormalized = normalizeMinecraftUsername(request.body.username);
      await verifyTurnstile(request.body.turnstile_token, clientIp, app);

      const votedOn = utcDateString();
      const month = utcMonthStartString();
      const ipHmac = dailyIpHmac(clientIp ?? "unknown", votedOn, app.config);
      const userAgent = normalizeHeader(request.headers["user-agent"]);
      const voteCountry = normalizeHeader(request.headers["cf-ipcountry"])?.toUpperCase() ?? null;
      const voteAsn = normalizeHeader(request.headers["cf-asn"]);

      const client = await app.db.pool.connect();
      let voteId: string | null = null;
      try {
        await client.query("begin");

        const serverResult = await client.query<{
          id: string;
          slug: string;
          status: "active" | "suspended" | "archived";
        }>(
          `
            select id, slug::text as slug, status
            from servers
            where slug = $1::citext
              and game = 'mc_java'
            limit 1
          `,
          [request.params.slug]
        );
        const server = serverResult.rows[0];
        if (!server) {
          throw new ApiError({
            statusCode: 404,
            code: "SERVER_NOT_FOUND",
            message: "Server not found.",
          });
        }
        if (server.status !== "active") {
          throw new ApiError({
            statusCode: 422,
            code: "SERVER_NOT_VOTABLE",
            message: "Server is not votable.",
          });
        }

        const voteResult = await client.query<{ id: string }>(
          `
            insert into votes (
              server_id,
              username_normalized,
              voted_on,
              ip_hmac,
              asn,
              country_code,
              user_agent
            )
            values ($1::uuid, $2::citext, $3::date, $4, $5, $6, $7)
            returning id
          `,
          [
            server.id,
            usernameNormalized,
            votedOn,
            ipHmac,
            voteAsn,
            voteCountry && /^[A-Z]{2}$/.test(voteCountry) ? voteCountry : null,
            userAgent,
          ]
        );
        voteId = voteResult.rows[0]?.id ?? null;

        await client.query(
          `
            insert into server_vote_counters (
              server_id,
              month,
              count,
              first_vote_at,
              last_vote_at,
              updated_at
            )
            values ($1::uuid, $2::date, 1, now(), now(), now())
            on conflict (server_id, month)
            do update set
              count = server_vote_counters.count + 1,
              first_vote_at = coalesce(server_vote_counters.first_vote_at, excluded.first_vote_at),
              last_vote_at = excluded.last_vote_at,
              updated_at = excluded.updated_at
          `,
          [server.id, month]
        );

        const countsResult = await client.query<{
          votes_this_month: number;
          votes_all_time: number;
        }>(
          `
            select
              coalesce(max(count) filter (where month = $2::date), 0)::integer as votes_this_month,
              coalesce(sum(count), 0)::integer as votes_all_time
            from server_vote_counters
            where server_id = $1::uuid
          `,
          [server.id, month]
        );
        const counts = countsResult.rows[0] ?? { votes_this_month: 0, votes_all_time: 0 };

        await client.query("commit");
        if (voteId) {
          await enqueueVotifierDelivery(voteId);
        }

        return reply.status(201).send(
          successEnvelope(
            {
              vote: {
                server_slug: server.slug,
                username_normalized: usernameNormalized,
                voted_on: votedOn,
                votes_this_month: counts.votes_this_month,
                votes_all_time: counts.votes_all_time,
              },
            },
            request.id
          )
        );
      } catch (error) {
        await client.query("rollback").catch(() => {});
        const pgError = getPgErrorMetadata(error);
        if (pgError.code === "23505") {
          throw new ApiError({
            statusCode: 409,
            code: "ALREADY_VOTED_TODAY",
            message: "You already voted for this server today.",
          });
        }
        throw error;
      } finally {
        client.release();
      }
    }
  );

  // Lets the vote form reflect "already voted today" + live counts on load, keyed on
  // the same daily IP-HMAC as the uniqueness rule. Read-only; no Turnstile.
  app.get(
    "/api/v1/servers/:slug/vote-status",
    {
      schema: {
        params: slugParamSchema,
        response: {
          200: voteStatusResponseSchema,
        },
      },
    },
    async (request) => {
      const serverResult = await app.db.pool.query<{ id: string; status: string }>(
        `select id, status from servers where slug = $1::citext and game = 'mc_java' limit 1`,
        [request.params.slug]
      );
      const server = serverResult.rows[0];
      if (!server || server.status !== "active") {
        throw new ApiError({
          statusCode: 404,
          code: "SERVER_NOT_FOUND",
          message: "Server not found.",
        });
      }

      const today = utcDateString();
      const ipHmac = dailyIpHmac(getClientIp(request.ip) ?? "unknown", today, app.config);
      const votedResult = await app.db.pool.query<{ voted: boolean }>(
        `
          select exists(
            select 1 from votes
            where server_id = $1::uuid and voted_on = $2::date and ip_hmac = $3
          ) as voted
        `,
        [server.id, today, ipHmac]
      );
      const counts = (await findVoteCounts(app, [server.id])).get(server.id) ?? {
        votes_this_month: 0,
        votes_all_time: 0,
      };

      return successEnvelope(
        {
          voted_today: votedResult.rows[0]?.voted ?? false,
          votes_this_month: counts.votes_this_month,
          votes_all_time: counts.votes_all_time,
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
      if (query.sort === "most_voted") {
        filters.push("s.probe_status <> 'offline'");
      }

      const sortPlayersExpr = `coalesce(latest.online_players, ${PUBLIC_PLAYERS_NULL_SORT_VALUE})::integer`;
      const sortPingExpr = `coalesce(latest.ping_ms::integer, ${PUBLIC_PING_NULL_SORT_VALUE})`;
      const sortVotesExpr = "coalesce(current_month.count, 0)::integer";
      const sortVoteReachedExpr = `case
        when coalesce(current_month.count, 0) > 0 then extract(epoch from current_month.first_vote_at)::integer
        else abs(('x' || substr(md5((current_date::text || ':' || s.id::text)), 1, 8))::bit(32)::int)
      end`;
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
      const cursorFilter = cursor
        ? (() => {
            const primary = addQueryParam(queryParams, cursor.primary);
            const secondary = addQueryParam(queryParams, cursor.secondary);
            const id = addQueryParam(queryParams, cursor.id);
            if (query.sort === "players") {
              return `(
              ${sortPlayersExpr} < ${primary}
              or (${sortPlayersExpr} = ${primary} and ${sortPingExpr} > ${secondary})
              or (
                ${sortPlayersExpr} = ${primary}
                and ${sortPingExpr} = ${secondary}
                and s.id > ${id}::uuid
              )
            )`;
            }
            if (query.sort === "ping") {
              return `(
                ${sortPingExpr} > ${primary}
                or (${sortPingExpr} = ${primary} and ${sortPlayersExpr} < ${secondary})
                or (
                  ${sortPingExpr} = ${primary}
                  and ${sortPlayersExpr} = ${secondary}
                  and s.id > ${id}::uuid
                )
              )`;
            }
            return `(
              ${sortVotesExpr} < ${primary}
              or (${sortVotesExpr} = ${primary} and ${sortVoteReachedExpr} > ${secondary})
              or (
                ${sortVotesExpr} = ${primary}
                and ${sortVoteReachedExpr} = ${secondary}
                and s.id > ${id}::uuid
              )
            )`;
          })()
        : undefined;
      if (cursorFilter) {
        filters.push(cursorFilter);
      }

      const sortPrimaryExpr =
        query.sort === "players"
          ? sortPlayersExpr
          : query.sort === "ping"
            ? sortPingExpr
            : sortVotesExpr;
      const sortSecondaryExpr =
        query.sort === "players"
          ? sortPingExpr
          : query.sort === "ping"
            ? sortPlayersExpr
            : sortVoteReachedExpr;
      const orderClause =
        query.sort === "players"
          ? `${sortPlayersExpr} desc, ${sortPingExpr} asc, s.id asc`
          : query.sort === "ping"
            ? `${sortPingExpr} asc, ${sortPlayersExpr} desc, s.id asc`
            : `${sortVotesExpr} desc, ${sortVoteReachedExpr} asc, s.id asc`;
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
            s.country_code as "countryCode",
            s.auth_mode as "authMode",
            s.logo_url as "logoUrl",
            s.banner_url as "bannerUrl",
            s.last_ping_at as "lastPingAt",
            s.last_probe_attempt_at as "lastProbeAttemptAt",
            s.probe_status as "probeStatus",
            latest.id as "latestId",
            latest.ping_ms as "pingMs",
            latest.online_players as "onlinePlayers",
            latest.max_players as "maxPlayers",
            latest.minecraft_version as "minecraftVersion",
            latest.occurred_at as "occurredAt",
            coalesce(current_month.count, 0)::integer as "votesThisMonth",
            coalesce(all_votes.count, 0)::integer as "votesAllTime",
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
          left join server_vote_counters current_month
            on current_month.server_id = s.id
           and current_month.month = date_trunc('month', now() at time zone 'utc')::date
          left join lateral (
            select coalesce(sum(vc.count), 0)::integer as count
            from server_vote_counters vc
            where vc.server_id = s.id
          ) all_votes on true
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
            auth_mode: row.authMode,
            country_code: row.countryCode ?? null,
            logo_url: row.logoUrl,
            banner_url: row.bannerUrl,
            last_ping_at: row.lastPingAt ? row.lastPingAt.toISOString() : null,
            votes_this_month: row.votesThisMonth,
            votes_all_time: row.votesAllTime,
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
    "/api/v1/servers/:slug/leaderboard",
    {
      schema: {
        params: slugParamSchema,
        querystring: leaderboardQuerySchema,
        response: {
          200: leaderboardResponseSchema,
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
          columns: { id: true },
        })
      );

      const selectedMonth = leaderboardMonth(request.query.month);
      const result = await app.db.pool.query<LeaderboardRow>(
        `
          select
            username_normalized::text as username,
            count(*)::integer as votes
          from votes
          where server_id = $1::uuid
            and date_trunc('month', voted_on::timestamp)::date = $2::date
          group by username_normalized
          order by count(*) desc, username_normalized asc
          limit 10
        `,
        [server.id, selectedMonth.start]
      );

      return successEnvelope(
        {
          month: selectedMonth.label,
          finalized: request.query.month === "previous",
          entries: result.rows.map((row, index) => ({
            rank: index + 1,
            username: row.username,
            votes: row.votes,
          })),
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

      const [latest, metadata, voteCounts] = await Promise.all([
        findLatestHeartbeat(app, server.id),
        findServerMetadata(app, server.id),
        findVoteCounts(app, [server.id]),
      ]);
      const counts = voteCounts.get(server.id) ?? { votes_this_month: 0, votes_all_time: 0 };
      return successEnvelope(
        {
          server: {
            ...normalizeServerPayload(server, Date.now()),
            votes_this_month: counts.votes_this_month,
            votes_all_time: counts.votes_all_time,
            votifier_enabled: server.votifierEnabled,
            latest_metrics: normalizeMetricsPayload(latest),
            ...metadata,
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
