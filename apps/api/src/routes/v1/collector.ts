import { and, asc, eq, gt, inArray, or, sql } from "drizzle-orm";
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
const MAX_BATCH_INGEST_ITEMS = 200;

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

const batchIngestBodySchema = z
  .object({
    heartbeats: z.array(heartbeatBodySchema),
    failures: z.array(probeAttemptBodySchema),
  })
  .superRefine((value, ctx) => {
    if (value.heartbeats.length + value.failures.length > MAX_BATCH_INGEST_ITEMS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Batch ingest accepts at most ${MAX_BATCH_INGEST_ITEMS} total records.`,
        path: [],
      });
    }
  });

const batchIngestResponseSchema = envelopeSchema(
  z.object({
    accepted: z.literal(true),
    heartbeats: z.array(
      z.object({
        server_id: z.string().uuid(),
        duplicate: z.boolean(),
      })
    ),
    failures: z.array(
      z.object({
        server_id: z.string().uuid(),
      })
    ),
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

      const dueCondition = sql`
        (${servers.lastProbeAttemptAt} IS NULL OR
          CASE
            WHEN ${servers.probeStatus} IN ('unreachable', 'offline') AND now() - COALESCE(${servers.lastProbeSuccessAt}, ${servers.createdAt}) > INTERVAL '24 hours'
              THEN ${servers.lastProbeAttemptAt} <= now() - INTERVAL '350 minutes'
            WHEN ${servers.probeStatus} IN ('unreachable', 'offline') AND now() - COALESCE(${servers.lastProbeSuccessAt}, ${servers.createdAt}) > INTERVAL '1 hour'
              THEN ${servers.lastProbeAttemptAt} <= now() - INTERVAL '28 minutes'
            ELSE
              ${servers.lastProbeAttemptAt} <= now() - INTERVAL '270 seconds'
          END
        )
      `;
      const baseWhere = and(
        eq(servers.status, "active"),
        eq(servers.game, "mc_java"),
        dueCondition
      );
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

  app.post(
    "/batch-ingest",
    {
      schema: {
        body: batchIngestBodySchema,
        response: {
          200: batchIngestResponseSchema,
        },
      },
    },
    async (request) => {
      requireCollectorKey(app, request.headers["x-collector-key"]);

      const { heartbeats, failures } = request.body;
      const now = new Date();

      // 1. Check all server IDs for existence and active status in one query
      const serverIds = [
        ...new Set([...heartbeats.map((h) => h.server_id), ...failures.map((f) => f.server_id)]),
      ];

      let dbServers: { id: string; status: string; game: string }[] = [];
      if (serverIds.length > 0) {
        dbServers = await app.db.db
          .select({
            id: servers.id,
            status: servers.status,
            game: servers.game,
          })
          .from(servers)
          .where(
            and(
              eq(servers.status, "active"),
              eq(servers.game, "mc_java"),
              inArray(servers.id, serverIds)
            )
          );
      }

      const activeServerIds = new Set(dbServers.map((s) => s.id));

      // Filter input sets by active servers
      const validHeartbeats = heartbeats.filter((h) => activeServerIds.has(h.server_id));
      const validFailures = failures.filter((f) => activeServerIds.has(f.server_id));

      // 2. Fetch cached state from Redis for the valid heartbeats
      interface CachedState {
        status: string;
        onlinePlayers: number | null;
        maxPlayers: number | null;
        lastDbWriteAt: string; // ISO string
      }

      const redisKeys = validHeartbeats.map((h) => `server:heartbeat:state:${h.server_id}`);
      const cachedStrings = redisKeys.length > 0 ? await app.redis.mget(...redisKeys) : [];

      const cachedStateMap = new Map<string, CachedState | null>();
      validHeartbeats.forEach((h, index) => {
        const cachedStr = cachedStrings[index];
        if (cachedStr) {
          try {
            cachedStateMap.set(h.server_id, JSON.parse(cachedStr) as CachedState);
          } catch {
            cachedStateMap.set(h.server_id, null);
          }
        } else {
          cachedStateMap.set(h.server_id, null);
        }
      });

      // 3. Process heartbeats, determining which need a DB insert
      const heartbeatsToInsert: (typeof serverHeartbeats.$inferInsert)[] = [];
      const redisUpdates: { key: string; state: CachedState }[] = [];
      const heartbeatsOutput: { server_id: string; duplicate: boolean }[] = [];

      for (const h of validHeartbeats) {
        const cached = cachedStateMap.get(h.server_id);
        const occurredAtDate = new Date(h.occurred_at);

        let shouldWrite = false;
        if (!cached) {
          shouldWrite = true;
        } else {
          // Condition A: Status changed
          if (cached.status !== "online") {
            shouldWrite = true;
          }

          // Condition B: Player count changed significantly (5% or +/- 2 players)
          if (!shouldWrite) {
            const prev = cached.onlinePlayers;
            const current = h.online_players ?? null;
            if (prev !== current) {
              if (prev === null || current === null) {
                shouldWrite = true;
              } else {
                const absDiff = Math.abs(current - prev);
                if (absDiff >= 2) {
                  shouldWrite = true;
                } else if (prev > 0 && absDiff / prev >= 0.05) {
                  shouldWrite = true;
                }
              }
            }
          }

          // Condition C: At least 1 forced DB write per hour
          if (!shouldWrite && cached.lastDbWriteAt) {
            const lastWriteTime = new Date(cached.lastDbWriteAt).getTime();
            if (occurredAtDate.getTime() - lastWriteTime >= 60 * 60 * 1000) {
              shouldWrite = true;
            }
          }
        }

        const nextDbWriteAt = shouldWrite
          ? h.occurred_at
          : (cached?.lastDbWriteAt ?? h.occurred_at);

        // Prepare Redis cache update state
        redisUpdates.push({
          key: `server:heartbeat:state:${h.server_id}`,
          state: {
            status: "online",
            onlinePlayers: h.online_players ?? null,
            maxPlayers: h.max_players ?? null,
            lastDbWriteAt: nextDbWriteAt,
          },
        });

        if (shouldWrite) {
          heartbeatsToInsert.push({
            id: randomUUID(),
            serverId: h.server_id,
            occurredAt: occurredAtDate,
            collectedAt: now,
            idempotencyKey: h.idempotency_key,
            pingMs: h.ping_ms,
            onlinePlayers: h.online_players ?? null,
            maxPlayers: h.max_players ?? null,
            uptimeSeconds: h.uptime_seconds ?? null,
            protocolVersion: h.protocol_version ?? null,
            minecraftVersion: h.minecraft_version ?? null,
            payload: h.payload,
            updatedAt: now,
          });
        } else {
          // Skipped, so duplicate is false
          heartbeatsOutput.push({
            server_id: h.server_id,
            duplicate: false,
          });
        }
      }

      // 4. Perform bulk Postgres inserts
      const insertedSet = new Set<string>(); // "serverId:idempotencyKey"
      if (heartbeatsToInsert.length > 0) {
        const insertedRows = await app.db.db
          .insert(serverHeartbeats)
          .values(heartbeatsToInsert)
          .onConflictDoNothing({
            target: [serverHeartbeats.serverId, serverHeartbeats.idempotencyKey],
          })
          .returning({
            serverId: serverHeartbeats.serverId,
            idempotencyKey: serverHeartbeats.idempotencyKey,
          });

        for (const row of insertedRows) {
          insertedSet.add(`${row.serverId}:${row.idempotencyKey}`);
        }

        // Add back to outputs, determining duplicate status
        for (const h of heartbeatsToInsert) {
          const wasInserted = insertedSet.has(`${h.serverId}:${h.idempotencyKey}`);
          heartbeatsOutput.push({
            server_id: h.serverId,
            duplicate: !wasInserted,
          });
        }
      }

      // 5. Bulk update the servers table for successes
      if (validHeartbeats.length > 0) {
        const successRows = validHeartbeats.map(
          (h) => sql`(${h.server_id}::uuid, ${new Date(h.occurred_at)}::timestamptz)`
        );

        // We run bulk update in SQL
        await app.db.db.execute(sql`
          UPDATE servers AS s
          SET
            last_ping_at = GREATEST(COALESCE(s.last_ping_at, v.occurred_at), v.occurred_at),
            last_probe_attempt_at = GREATEST(COALESCE(s.last_probe_attempt_at, v.occurred_at), v.occurred_at),
            last_probe_success_at = GREATEST(COALESCE(s.last_probe_success_at, v.occurred_at), v.occurred_at),
            consecutive_probe_failures = 0,
            last_probe_error_code = NULL,
            probe_status = 'online',
            updated_at = ${now}
          FROM (VALUES ${sql.join(successRows, sql`, `)}) AS v(id, occurred_at)
          WHERE s.id = v.id;
        `);
      }

      // 6. Bulk update the servers table for failures
      const failuresOutput: { server_id: string }[] = [];
      if (validFailures.length > 0) {
        const failureRows = validFailures.map(
          (f) =>
            sql`(${f.server_id}::uuid, ${new Date(f.occurred_at)}::timestamptz, ${f.error_code})`
        );

        await app.db.db.execute(sql`
          UPDATE servers AS s
          SET
            last_probe_attempt_at = GREATEST(COALESCE(s.last_probe_attempt_at, v.occurred_at), v.occurred_at),
            last_probe_failure_at = GREATEST(COALESCE(s.last_probe_failure_at, v.occurred_at), v.occurred_at),
            consecutive_probe_failures = s.consecutive_probe_failures + 1,
            last_probe_error_code = v.error_code,
            probe_status = 'unreachable',
            updated_at = ${now}
          FROM (VALUES ${sql.join(failureRows, sql`, `)}) AS v(id, occurred_at, error_code)
          WHERE s.id = v.id AND s.status = 'active' AND s.game = 'mc_java';
        `);

        for (const f of validFailures) {
          failuresOutput.push({ server_id: f.server_id });

          redisUpdates.push({
            key: `server:heartbeat:state:${f.server_id}`,
            state: {
              status: "unreachable",
              onlinePlayers: null,
              maxPlayers: null,
              lastDbWriteAt: f.occurred_at,
            },
          });
        }
      }

      // 7. Write all states to Redis in one pipeline
      if (redisUpdates.length > 0) {
        const pipeline = app.redis.pipeline();
        for (const update of redisUpdates) {
          pipeline.set(update.key, JSON.stringify(update.state), "EX", 86400 * 7); // Cache for 7 days
        }
        await pipeline.exec();
      }

      return successEnvelope(
        {
          accepted: true as const,
          heartbeats: heartbeatsOutput,
          failures: failuresOutput,
        },
        request.id
      );
    }
  );
};
