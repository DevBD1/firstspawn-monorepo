import { and, asc, eq, gt, inArray, lt, ne, or, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import {
  collectorProbeCycles,
  serverProbeObservations,
  servers,
} from "@firstspawn/database/schema";
import { ApiError } from "../../lib/api-error.js";
import { successEnvelope } from "../../lib/envelope.js";
import { requireCollectorKey } from "../../lib/request-auth.js";
import {
  decodeTargetsCursor,
  encodeTargetsCursor,
  type TargetsCursor,
} from "./collector-helpers.js";

const MAX_TARGET_LIMIT = 500;
const PROBE_CYCLE_BODY_LIMIT_BYTES = 32 * 1024 * 1024;

const targetsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(MAX_TARGET_LIMIT).default(100),
});

const onlineObservationSchema = z.object({
  server_id: z.string().uuid(),
  observed_at: z.string().datetime(),
  result: z.literal("online"),
  online_players: z.number().int().nonnegative().nullable(),
});

const failedObservationSchema = z.object({
  server_id: z.string().uuid(),
  observed_at: z.string().datetime(),
  result: z.literal("failure"),
  error_code: z.string().trim().min(1).max(80),
});

const probeCycleBodySchema = z
  .object({
    submission_id: z.string().uuid(),
    collector_instance_id: z.string().trim().min(1).max(64),
    slot_start: z.string().datetime(),
    started_at: z.string().datetime(),
    completed_at: z.string().datetime(),
    observations: z.array(
      z.discriminatedUnion("result", [onlineObservationSchema, failedObservationSchema])
    ),
  })
  .superRefine((value, ctx) => {
    if (new Date(value.completed_at) < new Date(value.started_at)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["completed_at"],
        message: "completed_at must not precede started_at.",
      });
    }
    const slot = new Date(value.slot_start);
    if (
      slot.getUTCMinutes() % 10 !== 0 ||
      slot.getUTCSeconds() !== 0 ||
      slot.getUTCMilliseconds() !== 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["slot_start"],
        message: "slot_start must be aligned to a ten-minute UTC boundary.",
      });
    }
    const seen = new Set<string>();
    value.observations.forEach((observation, index) => {
      if (seen.has(observation.server_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["observations", index, "server_id"],
          message: "A server may appear only once per cycle.",
        });
      }
      seen.add(observation.server_id);
    });
  });

const collectorTargetSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  host: z.string(),
  port: z.number().int().positive(),
  game: z.literal("mc_java"),
  created_at: z.string().datetime(),
});

const envelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.object({ request_id: z.string().uuid().nullable() }),
    error: z.null(),
  });

const targetsResponseSchema = envelopeSchema(
  z.object({
    targets: z.array(collectorTargetSchema),
    next_cursor: z.string().nullable(),
  })
);

const probeCycleResponseSchema = envelopeSchema(
  z.object({
    accepted: z.literal(true),
    duplicate: z.boolean(),
    cycle_id: z.string().uuid(),
    classification: z.enum(["accepted", "warmup", "quarantined"]),
    accepted_observations: z.number().int().nonnegative(),
    rejected_server_ids: z.array(z.string().uuid()),
  })
);

type CycleClassification = "accepted" | "warmup" | "quarantined";

const median = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1]! + sorted[middle]!) / 2)
    : sorted[middle]!;
};

const parseCursor = (cursor: string | undefined): TargetsCursor | null => {
  if (!cursor) return null;
  try {
    return decodeTargetsCursor(cursor);
  } catch {
    throw new ApiError({
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Request validation failed.",
      details: { errors: [{ instancePath: "/cursor", message: "Invalid cursor." }] },
    });
  }
};

/** Registers the fixed-cadence collector target and atomic cycle-ingest API. */
export const registerCollectorRoutes = (fastify: FastifyInstance): void => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/targets",
    { schema: { querystring: targetsQuerySchema, response: { 200: targetsResponseSchema } } },
    async (request) => {
      requireCollectorKey(app, request.headers["x-collector-key"]);
      const cursor = parseCursor(request.query.cursor);
      const limit = request.query.limit;
      const createdAtCursorExpr = sql<Date>`date_trunc('milliseconds', ${servers.createdAt})`;
      const baseWhere = and(
        eq(servers.status, "active"),
        eq(servers.game, "mc_java"),
        sql`length(trim(${servers.host})) > 0`
      );
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
            created_at: row.createdAt.toISOString(),
          })),
          next_cursor:
            hasMore && last
              ? encodeTargetsCursor({ id: last.id, createdAt: last.createdAt })
              : null,
        },
        request.id
      );
    }
  );

  app.post(
    "/probe-cycles",
    {
      bodyLimit: PROBE_CYCLE_BODY_LIMIT_BYTES,
      schema: { body: probeCycleBodySchema, response: { 200: probeCycleResponseSchema } },
    },
    async (request) => {
      requireCollectorKey(app, request.headers["x-collector-key"]);
      const input = request.body;
      const slotStart = new Date(input.slot_start);
      const existing = await app.db.db.query.collectorProbeCycles.findFirst({
        where: or(
          eq(collectorProbeCycles.submissionId, input.submission_id),
          and(
            eq(collectorProbeCycles.collectorInstanceId, input.collector_instance_id),
            eq(collectorProbeCycles.slotStart, slotStart)
          )
        ),
      });
      if (existing) {
        if (
          existing.submissionId !== input.submission_id ||
          existing.collectorInstanceId !== input.collector_instance_id ||
          existing.slotStart.getTime() !== slotStart.getTime()
        ) {
          throw new ApiError({
            statusCode: 409,
            code: "COLLECTOR_SLOT_CONFLICT",
            message: "Another collector submission already owns this instance and slot.",
          });
        }
        return successEnvelope(
          {
            accepted: true as const,
            duplicate: true,
            cycle_id: existing.id,
            classification: existing.classification as CycleClassification,
            accepted_observations: existing.targetCount,
            rejected_server_ids: [],
          },
          request.id
        );
      }

      const requestedIds = input.observations.map((item) => item.server_id);
      const collectable =
        requestedIds.length === 0
          ? []
          : await app.db.db
              .select({ id: servers.id })
              .from(servers)
              .where(
                and(
                  eq(servers.status, "active"),
                  eq(servers.game, "mc_java"),
                  inArray(servers.id, requestedIds)
                )
              );
      const collectableIds = new Set(collectable.map((row) => row.id));
      const observations = input.observations.filter((item) => collectableIds.has(item.server_id));
      const rejectedServerIds = requestedIds.filter((id) => !collectableIds.has(id));
      const successCount = observations.filter((item) => item.result === "online").length;

      const previousCycles = await app.db.db
        .select({
          successCount: collectorProbeCycles.successCount,
          classification: collectorProbeCycles.classification,
        })
        .from(collectorProbeCycles)
        .where(
          and(
            eq(collectorProbeCycles.collectorInstanceId, input.collector_instance_id),
            lt(collectorProbeCycles.slotStart, slotStart),
            ne(collectorProbeCycles.classification, "quarantined")
          )
        )
        .orderBy(sql`${collectorProbeCycles.slotStart} desc`)
        .limit(12);
      const baseline = median(previousCycles.map((cycle) => cycle.successCount));
      let classification: CycleClassification = previousCycles.length < 3 ? "warmup" : "accepted";
      let quarantineReason: string | null = null;
      if (
        classification === "accepted" &&
        observations.length >= 100 &&
        baseline !== null &&
        baseline >= 5 &&
        successCount < baseline * 0.25
      ) {
        classification = "quarantined";
        quarantineReason = "success_count_below_fleet_baseline";
      }

      const now = new Date();
      const result = await app.db.db.transaction(async (tx) => {
        const [cycle] = await tx
          .insert(collectorProbeCycles)
          .values({
            submissionId: input.submission_id,
            collectorInstanceId: input.collector_instance_id,
            slotStart,
            startedAt: new Date(input.started_at),
            completedAt: new Date(input.completed_at),
            targetCount: observations.length,
            successCount,
            failureCount: observations.length - successCount,
            classification,
            baselineSuccessMedian: baseline,
            quarantineReason,
            updatedAt: now,
          })
          .onConflictDoNothing()
          .returning();
        if (!cycle) return null;

        if (observations.length > 0) {
          await tx.insert(serverProbeObservations).values(
            observations.map((observation) => ({
              cycleId: cycle.id,
              serverId: observation.server_id,
              slotStart,
              observedAt: new Date(observation.observed_at),
              outcome:
                classification === "quarantined"
                  ? "unknown"
                  : observation.result === "online"
                    ? "online"
                    : "offline",
              onlinePlayers:
                classification !== "quarantined" && observation.result === "online"
                  ? observation.online_players
                  : null,
              errorCode: observation.result === "failure" ? observation.error_code : null,
              updatedAt: now,
            }))
          );
        }

        const online =
          classification === "quarantined"
            ? []
            : observations.filter((item) => item.result === "online");
        if (online.length > 0) {
          const rows = online.map(
            (item) => sql`(${item.server_id}::uuid, ${new Date(item.observed_at)}::timestamptz)`
          );
          await tx.execute(
            sql`update servers s set last_probe_attempt_at = v.observed_at, last_probe_success_at = v.observed_at, consecutive_probe_failures = 0, last_probe_error_code = null, probe_status = 'online', updated_at = ${now} from (values ${sql.join(rows, sql`, `)}) v(id, observed_at) where s.id = v.id and (s.last_probe_attempt_at is null or s.last_probe_attempt_at <= v.observed_at)`
          );
        }
        const failures =
          classification === "quarantined"
            ? []
            : observations.filter(
                (item): item is z.infer<typeof failedObservationSchema> => item.result === "failure"
              );
        if (failures.length > 0) {
          const rows = failures.map(
            (item) =>
              sql`(${item.server_id}::uuid, ${new Date(item.observed_at)}::timestamptz, ${item.error_code}::varchar)`
          );
          await tx.execute(
            sql`update servers s set last_probe_attempt_at = v.observed_at, last_probe_failure_at = v.observed_at, consecutive_probe_failures = s.consecutive_probe_failures + 1, last_probe_error_code = v.error_code, probe_status = case when s.consecutive_probe_failures + 1 >= 2 then 'offline' else s.probe_status end, updated_at = ${now} from (values ${sql.join(rows, sql`, `)}) v(id, observed_at, error_code) where s.id = v.id and (s.last_probe_attempt_at is null or s.last_probe_attempt_at <= v.observed_at)`
          );
        }
        return cycle;
      });

      if (!result) {
        const duplicate = await app.db.db.query.collectorProbeCycles.findFirst({
          where: or(
            eq(collectorProbeCycles.submissionId, input.submission_id),
            and(
              eq(collectorProbeCycles.collectorInstanceId, input.collector_instance_id),
              eq(collectorProbeCycles.slotStart, slotStart)
            )
          ),
        });
        if (!duplicate)
          throw new ApiError({
            statusCode: 409,
            code: "CYCLE_CONFLICT",
            message: "Probe cycle could not be recorded.",
          });
        if (
          duplicate.submissionId !== input.submission_id ||
          duplicate.collectorInstanceId !== input.collector_instance_id ||
          duplicate.slotStart.getTime() !== slotStart.getTime()
        ) {
          throw new ApiError({
            statusCode: 409,
            code: "COLLECTOR_SLOT_CONFLICT",
            message: "Another collector submission already owns this instance and slot.",
          });
        }
        return successEnvelope(
          {
            accepted: true as const,
            duplicate: true,
            cycle_id: duplicate.id,
            classification: duplicate.classification as CycleClassification,
            accepted_observations: duplicate.targetCount,
            rejected_server_ids: [],
          },
          request.id
        );
      }

      return successEnvelope(
        {
          accepted: true as const,
          duplicate: false,
          cycle_id: result.id,
          classification,
          accepted_observations: observations.length,
          rejected_server_ids: rejectedServerIds,
        },
        request.id
      );
    }
  );
};
