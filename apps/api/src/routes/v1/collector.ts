import { and, asc, eq, gt, or, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { serverHeartbeats, servers } from "@firstspawn/database/schema";
import { ApiError } from "../../lib/api-error.js";
import { successEnvelope } from "../../lib/envelope.js";
import { requireCollectorKey } from "../../lib/request-auth.js";
import {
  decodeTargetsCursor,
  encodeTargetsCursor,
  type TargetsCursor,
} from "./collector-helpers.js";

const MAX_TARGET_LIMIT = 200;

const targetsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(MAX_TARGET_LIMIT).default(100),
});

const heartbeatBodySchema = z
  .object({
    server_id: z.string().uuid(),
    occurred_at: z.string().datetime(),
    idempotency_key: z.string().trim().min(1).max(255),
    ping_ms: z.number().int().nonnegative(),
    online_players: z.number().int().nonnegative().nullish(),
    max_players: z.number().int().nonnegative().nullish(),
    uptime_seconds: z.number().int().nonnegative().nullish(),
    protocol_version: z.number().int().nullish(),
    minecraft_version: z.string().trim().max(50).nullish(),
    payload: z.unknown().optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.online_players != null &&
      value.max_players != null &&
      value.online_players > value.max_players
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "online_players cannot exceed max_players.",
        path: ["online_players"],
      });
    }
  });

const probeAttemptBodySchema = z.object({
  server_id: z.string().uuid(),
  occurred_at: z.string().datetime(),
  result: z.literal("failure"),
  error_code: z.string().trim().min(1).max(80),
});

const collectorTargetSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  host: z.string(),
  port: z.number().int().positive(),
  game: z.literal("mc_java"),
  country_code: z.string().nullable(),
  created_at: z.string().datetime(),
});

const envelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.object({
      request_id: z.string().uuid().nullable(),
    }),
    error: z.null(),
  });

const targetsResponseSchema = envelopeSchema(
  z.object({
    targets: z.array(collectorTargetSchema),
    next_cursor: z.string().nullable(),
  })
);

const heartbeatResponseSchema = envelopeSchema(
  z.object({
    accepted: z.literal(true),
    duplicate: z.boolean(),
    server_id: z.string().uuid(),
    occurred_at: z.string().datetime(),
    collected_at: z.string().datetime(),
  })
);

const probeAttemptResponseSchema = envelopeSchema(
  z.object({
    accepted: z.literal(true),
    server_id: z.string().uuid(),
    occurred_at: z.string().datetime(),
  })
);

interface InsertedHeartbeatResult {
  occurredAt: Date;
  collectedAt: Date;
  duplicate: boolean;
}

const getPgErrorCode = (error: unknown): string | undefined => {
  const candidate = error as {
    code?: string;
    cause?: {
      code?: string;
    };
  };

  return candidate.code ?? candidate.cause?.code;
};

const parseCursor = (cursor: string | undefined): TargetsCursor | null => {
  if (!cursor) {
    return null;
  }

  try {
    return decodeTargetsCursor(cursor);
  } catch {
    throw new ApiError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Request validation failed.",
      details: {
        errors: [
          {
            instancePath: "/cursor",
            message: "Invalid cursor.",
          },
        ],
      },
    });
  }
};

const ensureCollectableServer = async (
  app: FastifyInstance,
  serverId: string
): Promise<{ id: string; status: string; game: string }> => {
  const server = await app.db.db.query.servers.findFirst({
    where: eq(servers.id, serverId),
    columns: {
      id: true,
      status: true,
      game: true,
    },
  });

  if (!server) {
    throw new ApiError({
      statusCode: 404,
      code: "SERVER_NOT_FOUND",
      message: "Server not found.",
    });
  }

  if (server.status !== "active" || server.game !== "mc_java") {
    throw new ApiError({
      statusCode: 409,
      code: "SERVER_NOT_COLLECTABLE",
      message: "Server is not collectable.",
      details: {
        status: server.status,
        game: server.game,
      },
    });
  }

  return server;
};

const insertHeartbeat = async (
  app: FastifyInstance,
  input: z.infer<typeof heartbeatBodySchema>
): Promise<InsertedHeartbeatResult> => {
  const now = new Date();
  const occurredAt = new Date(input.occurred_at);

  try {
    const inserted = await app.db.db.transaction(async (tx) => {
      const [heartbeat] = await tx
        .insert(serverHeartbeats)
        .values({
          id: randomUUID(),
          serverId: input.server_id,
          occurredAt,
          collectedAt: now,
          idempotencyKey: input.idempotency_key,
          pingMs: input.ping_ms,
          onlinePlayers: input.online_players ?? null,
          maxPlayers: input.max_players ?? null,
          uptimeSeconds: input.uptime_seconds ?? null,
          protocolVersion: input.protocol_version ?? null,
          minecraftVersion: input.minecraft_version ?? null,
          payload: input.payload,
          updatedAt: now,
        })
        .returning({
          occurredAt: serverHeartbeats.occurredAt,
          collectedAt: serverHeartbeats.collectedAt,
        });

      await tx
        .update(servers)
        .set({
          lastPingAt: sql`greatest(coalesce(${servers.lastPingAt}, ${occurredAt}), ${occurredAt})`,
          lastProbeAttemptAt: sql`greatest(coalesce(${servers.lastProbeAttemptAt}, ${occurredAt}), ${occurredAt})`,
          lastProbeSuccessAt: sql`greatest(coalesce(${servers.lastProbeSuccessAt}, ${occurredAt}), ${occurredAt})`,
          consecutiveProbeFailures: 0,
          lastProbeErrorCode: null,
          probeStatus: "online",
          updatedAt: now,
        })
        .where(eq(servers.id, input.server_id));

      return heartbeat;
    });

    return {
      occurredAt: inserted.occurredAt,
      collectedAt: inserted.collectedAt,
      duplicate: false,
    };
  } catch (error) {
    if (getPgErrorCode(error) !== "23505") {
      throw error;
    }

    const existing = await app.db.db.query.serverHeartbeats.findFirst({
      where: and(
        eq(serverHeartbeats.serverId, input.server_id),
        eq(serverHeartbeats.idempotencyKey, input.idempotency_key)
      ),
      columns: {
        occurredAt: true,
        collectedAt: true,
      },
    });

    if (!existing) {
      throw error;
    }

    return {
      occurredAt: existing.occurredAt,
      collectedAt: existing.collectedAt,
      duplicate: true,
    };
  }
};

const recordProbeFailure = async (
  app: FastifyInstance,
  input: z.infer<typeof probeAttemptBodySchema>
): Promise<void> => {
  const now = new Date();
  const occurredAt = new Date(input.occurred_at);

  await app.db.db
    .update(servers)
    .set({
      lastProbeAttemptAt: sql`greatest(coalesce(${servers.lastProbeAttemptAt}, ${occurredAt}), ${occurredAt})`,
      lastProbeFailureAt: sql`greatest(coalesce(${servers.lastProbeFailureAt}, ${occurredAt}), ${occurredAt})`,
      consecutiveProbeFailures: sql`${servers.consecutiveProbeFailures} + 1`,
      lastProbeErrorCode: input.error_code,
      probeStatus: "unreachable",
      updatedAt: now,
    })
    .where(
      and(
        eq(servers.id, input.server_id),
        eq(servers.status, "active"),
        eq(servers.game, "mc_java")
      )
    );
};

export const registerCollectorRoutes = (fastify: FastifyInstance): void => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/targets",
    {
      schema: {
        querystring: targetsQuerySchema,
        response: {
          200: targetsResponseSchema,
        },
      },
    },
    async (request) => {
      requireCollectorKey(app, request.headers["x-collector-key"]);

      const cursor = parseCursor(request.query.cursor);
      const limit = request.query.limit;

      const baseWhere = and(eq(servers.status, "active"), eq(servers.game, "mc_java"));
      const createdAtCursorExpr = sql<Date>`date_trunc('milliseconds', ${servers.createdAt})`;
      const whereCondition = cursor
        ? and(
            baseWhere,
            or(
              sql`${createdAtCursorExpr} > ${cursor.createdAt}`,
              and(sql`${createdAtCursorExpr} = ${cursor.createdAt}`, gt(servers.id, cursor.id))
            )
          )
        : baseWhere;

      const rows = await app.db.db
        .select({
          id: servers.id,
          slug: servers.slug,
          host: servers.host,
          port: servers.port,
          game: servers.game,
          countryCode: servers.countryCode,
          createdAt: servers.createdAt,
        })
        .from(servers)
        .where(whereCondition)
        .orderBy(asc(createdAtCursorExpr), asc(servers.id))
        .limit(limit + 1);

      const hasMore = rows.length > limit;
      const pageRows = hasMore ? rows.slice(0, limit) : rows;
      const last = pageRows.at(-1);

      return successEnvelope(
        {
          targets: pageRows.map((row) => ({
            id: row.id,
            slug: row.slug,
            host: row.host,
            port: row.port,
            game: "mc_java" as const,
            country_code: row.countryCode ?? null,
            created_at: row.createdAt.toISOString(),
          })),
          next_cursor:
            hasMore && last
              ? encodeTargetsCursor({
                  id: last.id,
                  createdAt: last.createdAt,
                })
              : null,
        },
        request.id
      );
    }
  );

  app.post(
    "/heartbeats",
    {
      schema: {
        body: heartbeatBodySchema,
        response: {
          200: heartbeatResponseSchema,
        },
      },
    },
    async (request) => {
      requireCollectorKey(app, request.headers["x-collector-key"]);

      await ensureCollectableServer(app, request.body.server_id);
      const result = await insertHeartbeat(app, request.body);

      return successEnvelope(
        {
          accepted: true as const,
          duplicate: result.duplicate,
          server_id: request.body.server_id,
          occurred_at: result.occurredAt.toISOString(),
          collected_at: result.collectedAt.toISOString(),
        },
        request.id
      );
    }
  );

  app.post(
    "/probe-attempts",
    {
      schema: {
        body: probeAttemptBodySchema,
        response: {
          200: probeAttemptResponseSchema,
        },
      },
    },
    async (request) => {
      requireCollectorKey(app, request.headers["x-collector-key"]);

      await ensureCollectableServer(app, request.body.server_id);
      await recordProbeFailure(app, request.body);

      return successEnvelope(
        {
          accepted: true as const,
          server_id: request.body.server_id,
          occurred_at: new Date(request.body.occurred_at).toISOString(),
        },
        request.id
      );
    }
  );
};
