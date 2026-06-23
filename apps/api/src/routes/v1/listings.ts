import { and, eq, inArray } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { randomUUID } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { z } from "zod";

import {
  serverSocials,
  serverSupportedClients,
  serverTags,
  servers,
} from "@firstspawn/database/schema";
import { ApiError } from "../../lib/api-error.js";
import { successEnvelope } from "../../lib/envelope.js";
import { requireCurrentUser } from "../../lib/request-auth.js";
import {
  decodeListingOwnershipProof,
  deriveListingVerificationToken,
  issueListingOwnershipProof,
  TokenDecodeError,
} from "../../lib/security.js";
import {
  assertPublicHost,
  gameSupportsMotd,
  probeServer,
  type ListingGame,
} from "../../services/minecraft-probe.js";
import {
  buildTemporarySlug,
  duplicateFieldFromError,
  findLatestHeartbeats,
  findServerMetadata,
  getPgErrorMetadata,
  normalizeMetricsPayload,
  normalizeServerPayload,
  reachScopeSchema,
  resolveOriginAndReach,
} from "./servers.js";

// Mirrors WL_TAG_FEATURES in apps/web .../listing/components/WLListFlowClient.client.tsx.
const LISTING_TAGS = [
  "Survival",
  "Whitelist",
  "Economy",
  "Trading",
  "Towny",
  "Skyblock",
  "Quests",
  "RPG",
  "Hardcore",
  "Seasonal",
  "Creative",
  "Builds",
  "Showcase",
  "Dungeons",
  "Family-friendly",
] as const;

const verificationMethodSchema = z.enum(["motd", "dns"]);
// Minecraft Java is the only supported server platform (PRODUCT.md §3.1).
const gameSchema = z.literal("mc_java");
// Bedrock appears only as a supported client when a Java server enables Geyser.
const clientNameSchema = z.enum(["mc_java", "mc_bedrock"]);
const serverSocialPlatformSchema = z.enum([
  "website",
  "discord",
  "youtube",
  "twitter",
  "instagram",
  "tiktok",
  "facebook",
]);

const hostSchema = z.string().trim().min(1).max(255);
const portSchema = z.number().int().min(1).max(65535);

const probeBodySchema = z.object({
  host: hostSchema,
  port: portSchema,
  game: gameSchema.default("mc_java"),
});

const tokenBodySchema = z.object({
  host: hostSchema,
  port: portSchema,
});

const verificationCheckBodySchema = z.object({
  host: hostSchema,
  port: portSchema,
  method: verificationMethodSchema,
  game: gameSchema.default("mc_java"),
});

const listingSocialSchema = z.object({
  platform: serverSocialPlatformSchema,
  url: z.string().url().max(2048),
  display_order: z.number().int().min(0).default(0),
});

const createListingBodySchema = z.object({
  name: z.string().trim().min(2).max(64),
  description: z.string().trim().min(1).max(4000),
  host: hostSchema,
  port: portSchema,
  game: gameSchema.default("mc_java"),
  geyser_enabled: z.boolean().default(false),
  country_code: z.string().trim().length(2).nullable().optional(),
  reach_scope: reachScopeSchema.optional(),
  method: verificationMethodSchema,
  ownership_proof: z.string().trim().min(1),
  tags: z.array(z.enum(LISTING_TAGS)).max(4).optional(),
  socials: z.array(listingSocialSchema).max(20).optional(),
});

const availabilityQuerySchema = z.object({
  name: z.string().trim().min(1).max(64).optional(),
  host: hostSchema.optional(),
  port: z.coerce.number().int().min(1).max(65535).optional(),
});

const deleteParamSchema = z.object({
  id: z.string().uuid(),
});

const envelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.object({
      request_id: z.string().uuid().nullable(),
    }),
    error: z.null(),
  });

const probeResultSchema = z.object({
  reachable: z.boolean(),
  ping_ms: z.number().int().nonnegative().nullable(),
  online_players: z.number().int().nonnegative().nullable(),
  max_players: z.number().int().nonnegative().nullable(),
  minecraft_version: z.string().nullable(),
  motd: z.string().nullable(),
});

const probeResponseSchema = envelopeSchema(probeResultSchema);

const tokenResponseSchema = envelopeSchema(
  z.object({
    token: z.string(),
    dns_record_name: z.string(),
  })
);

const verificationCheckResponseSchema = envelopeSchema(
  z.object({
    verified: z.literal(true),
    ownership_proof: z.string(),
  })
);

const latestMetricsSchema = z.object({
  ping_ms: z.number().int().nonnegative().nullable(),
  online_players: z.number().int().nonnegative().nullable(),
  max_players: z.number().int().nonnegative().nullable(),
  minecraft_version: z.string().nullable(),
  occurred_at: z.string().datetime().nullable(),
});

const createListingResponseSchema = envelopeSchema(
  z.object({
    server: z.object({
      id: z.string().uuid(),
      slug: z.string(),
      name: z.string(),
      description: z.string(),
      host: z.string(),
      port: z.number().int(),
      game: gameSchema,
      catalog_status: z.enum(["active", "suspended", "archived"]),
      freshness_status: z.enum(["online", "offline", "unknown"]),
      auth_mode: z.enum(["official", "offline_allowed", "unknown"]),
      country_code: z.string().nullable(),
      logo_url: z.string().nullable(),
      banner_url: z.string().nullable(),
      last_ping_at: z.string().datetime().nullable(),
      created_at: z.string().datetime(),
      updated_at: z.string().datetime(),
      latest_metrics: latestMetricsSchema,
      socials: z.array(listingSocialSchema),
      supported_clients: z.array(
        z.object({
          client_name: clientNameSchema,
          client_version: z.string(),
        })
      ),
      tags: z.array(z.string()),
    }),
  })
);

const availabilityResponseSchema = envelopeSchema(
  z.object({
    name_available: z.boolean().nullable(),
    address_available: z.boolean().nullable(),
  })
);

const listingSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  host: z.string(),
  port: z.number().int(),
  game: gameSchema,
  catalog_status: z.enum(["active", "suspended", "archived"]),
  freshness_status: z.enum(["online", "offline", "unknown"]),
  country_code: z.string().nullable(),
  logo_url: z.string().nullable(),
  banner_url: z.string().nullable(),
  verified_at: z.string().datetime().nullable(),
  verification_method: z.enum(["motd", "dns"]).nullable(),
  created_at: z.string().datetime(),
  tags: z.array(z.string()),
  latest_metrics: latestMetricsSchema,
});

const myListingsResponseSchema = envelopeSchema(
  z.object({
    servers: z.array(listingSummarySchema),
  })
);

const deleteListingResponseSchema = envelopeSchema(
  z.object({
    deleted: z.literal(true),
    id: z.string().uuid(),
  })
);

/** Lowercases and trims the host so the verification token, DNS record, and proof all agree. */
const normalizeListingHost = (host: string): string => {
  const trimmed = host.trim().toLowerCase();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const buildDnsRecordName = (host: string): string =>
  `_firstspawn.${normalizeListingHost(host).replace(/^play\./, "")}`;

const tokenPresent = (haystack: string | null | undefined, token: string): boolean =>
  typeof haystack === "string" && haystack.toUpperCase().includes(token.toUpperCase());

export const registerListingRoutes = (fastify: FastifyInstance): void => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    "/api/v1/listings/probe",
    {
      schema: {
        body: probeBodySchema,
        response: { 200: probeResponseSchema },
      },
    },
    async (request) => {
      await requireCurrentUser(app, request.headers.authorization);
      const probe = await probeServer(request.body.host, request.body.port, request.body.game);
      return successEnvelope(
        {
          reachable: probe.reachable,
          ping_ms: probe.pingMs,
          online_players: probe.onlinePlayers,
          max_players: probe.maxPlayers,
          minecraft_version: probe.minecraftVersion,
          motd: probe.motd,
        },
        request.id
      );
    }
  );

  app.post(
    "/api/v1/listings/verification/token",
    {
      schema: {
        body: tokenBodySchema,
        response: { 200: tokenResponseSchema },
      },
    },
    async (request) => {
      const user = await requireCurrentUser(app, request.headers.authorization);
      const host = normalizeListingHost(request.body.host);
      const token = deriveListingVerificationToken(
        { userId: user.id, host, port: request.body.port },
        app.config
      );
      return successEnvelope(
        {
          token,
          dns_record_name: buildDnsRecordName(host),
        },
        request.id
      );
    }
  );

  app.post(
    "/api/v1/listings/verification/check",
    {
      schema: {
        body: verificationCheckBodySchema,
        response: { 200: verificationCheckResponseSchema },
      },
    },
    async (request) => {
      const user = await requireCurrentUser(app, request.headers.authorization);
      const host = normalizeListingHost(request.body.host);
      const port = request.body.port;
      const game = request.body.game;

      if (request.body.method === "motd" && !gameSupportsMotd(game)) {
        throw new ApiError({
          statusCode: 422,
          code: "MOTD_UNSUPPORTED",
          message: "MOTD verification is not available for this server type. Use DNS instead.",
          details: { method: "motd", game },
        });
      }

      const expectedToken = deriveListingVerificationToken(
        { userId: user.id, host, port },
        app.config
      );

      let verified = false;
      if (request.body.method === "motd") {
        const probe = await probeServer(host, port, game);
        verified = tokenPresent(probe.motd, expectedToken);
      } else {
        await assertPublicHost(host);
        try {
          const records = await resolveTxt(buildDnsRecordName(host));
          verified = records.some((chunks) => tokenPresent(chunks.join(""), expectedToken));
        } catch {
          verified = false;
        }
      }

      if (!verified) {
        throw new ApiError({
          statusCode: 422,
          code: "VERIFICATION_FAILED",
          message:
            request.body.method === "motd"
              ? "The verification token was not found in the server MOTD."
              : "The verification token was not found in the DNS TXT record.",
          details: { method: request.body.method },
        });
      }

      const proof = issueListingOwnershipProof({ userId: user.id, host, port }, app.config);
      return successEnvelope({ verified: true as const, ownership_proof: proof.token }, request.id);
    }
  );

  app.post(
    "/api/v1/listings",
    {
      schema: {
        body: createListingBodySchema,
        response: { 201: createListingResponseSchema },
      },
    },
    async (request, reply) => {
      const user = await requireCurrentUser(app, request.headers.authorization);
      const body = request.body;
      const host = normalizeListingHost(body.host);
      const port = body.port;

      let claims;
      try {
        claims = decodeListingOwnershipProof(body.ownership_proof, app.config);
      } catch (error) {
        if (error instanceof TokenDecodeError) {
          throw new ApiError({
            statusCode: 403,
            code: "OWNERSHIP_PROOF_INVALID",
            message: "Ownership proof is missing, invalid, or expired.",
            details: { field: "ownership_proof" },
          });
        }
        throw error;
      }

      if (
        claims.sub !== user.id ||
        normalizeListingHost(claims.host) !== host ||
        claims.port !== port
      ) {
        throw new ApiError({
          statusCode: 403,
          code: "OWNERSHIP_PROOF_MISMATCH",
          message: "Ownership proof does not match the current user or server address.",
          details: { field: "ownership_proof" },
        });
      }

      await assertPublicHost(host);

      if (body.method === "motd" && !gameSupportsMotd(body.game)) {
        throw new ApiError({
          statusCode: 422,
          code: "MOTD_UNSUPPORTED",
          message: "MOTD verification is not available for this server type. Use DNS instead.",
          details: { field: "method", game: body.game },
        });
      }

      // One active listing per exact host:port (different ports on the same host are allowed).
      const existingAddress = await app.db.db.query.servers.findFirst({
        where: and(eq(servers.host, host), eq(servers.port, port), eq(servers.status, "active")),
        columns: { id: true },
      });
      if (existingAddress) {
        throw new ApiError({
          statusCode: 409,
          code: "ADDRESS_TAKEN",
          message:
            "This server address is already listed. If you own it, please file a report to claim it.",
          details: { field: "host" },
        });
      }

      const verificationToken = deriveListingVerificationToken(
        { userId: user.id, host, port },
        app.config
      );
      const uniqueTags = [...new Set(body.tags ?? [])];
      // Geyser lets a Java server accept Bedrock clients, so advertise both.
      const supportedClients: ListingGame[] =
        body.game === "mc_java" && body.geyser_enabled ? ["mc_java", "mc_bedrock"] : [body.game];
      const now = new Date();
      const slug = buildTemporarySlug(body.name);

      let createdId: string;
      try {
        createdId = await app.db.db.transaction(async (tx) => {
          const rows = await tx
            .insert(servers)
            .values({
              id: randomUUID(),
              slug,
              ownerId: user.id,
              name: body.name,
              description: body.description,
              host,
              port,
              game: body.game,
              status: "active",
              authMode: "unknown",
              ...resolveOriginAndReach(body.country_code, body.reach_scope),
              verificationMethod: body.method,
              verificationToken,
              verifiedAt: now,
              updatedAt: now,
            })
            .returning({ id: servers.id });
          const row = rows[0]!;

          await tx.insert(serverSupportedClients).values(
            supportedClients.map((clientName) => ({
              serverId: row.id,
              clientName,
              clientVersion: "unknown",
              updatedAt: now,
            }))
          );

          if (uniqueTags.length > 0) {
            await tx.insert(serverTags).values(
              uniqueTags.map((tag) => ({
                serverId: row.id,
                tag,
                updatedAt: now,
              }))
            );
          }

          if (body.socials && body.socials.length > 0) {
            await tx.insert(serverSocials).values(
              body.socials.map((social) => ({
                serverId: row.id,
                platform: social.platform,
                url: social.url,
                displayOrder: social.display_order,
                updatedAt: now,
              }))
            );
          }

          return row.id;
        });
      } catch (error) {
        const pgError = getPgErrorMetadata(error);
        if (pgError.code === "23505") {
          throw new ApiError({
            statusCode: 409,
            code: "VALIDATION_ERROR",
            message: "A server with this name is already listed.",
            details: { field: duplicateFieldFromError(pgError) },
          });
        }
        throw error;
      }

      const created = await app.db.db.query.servers.findFirst({
        where: eq(servers.id, createdId),
      });
      if (!created) {
        throw new ApiError({
          statusCode: 500,
          code: "INTERNAL_ERROR",
          message: "Created server could not be loaded.",
        });
      }

      const [metadata, tagRows] = await Promise.all([
        findServerMetadata(app, created.id),
        app.db.db.select().from(serverTags).where(eq(serverTags.serverId, created.id)),
      ]);

      return reply.status(201).send(
        successEnvelope(
          {
            server: {
              ...normalizeServerPayload(created, Date.now()),
              latest_metrics: normalizeMetricsPayload(null),
              ...metadata,
              tags: tagRows.map((row) => row.tag),
            },
          },
          request.id
        )
      );
    }
  );

  // Lightweight pre-flight check so the wizard can flag a taken name/address early.
  app.get(
    "/api/v1/listings/availability",
    {
      schema: {
        querystring: availabilityQuerySchema,
        response: { 200: availabilityResponseSchema },
      },
    },
    async (request) => {
      await requireCurrentUser(app, request.headers.authorization);
      const { name, host, port } = request.query;

      let nameAvailable: boolean | null = null;
      if (name) {
        const existing = await app.db.db.query.servers.findFirst({
          where: eq(servers.name, name),
          columns: { id: true },
        });
        nameAvailable = !existing;
      }

      let addressAvailable: boolean | null = null;
      if (host && port) {
        const normalizedHost = normalizeListingHost(host);
        const existing = await app.db.db.query.servers.findFirst({
          where: and(
            eq(servers.host, normalizedHost),
            eq(servers.port, port),
            eq(servers.status, "active")
          ),
          columns: { id: true },
        });
        addressAvailable = !existing;
      }

      return successEnvelope(
        { name_available: nameAvailable, address_available: addressAvailable },
        request.id
      );
    }
  );

  // The servers the authenticated user owns, for the owner console.
  app.get(
    "/api/v1/listings/mine",
    {
      schema: {
        response: { 200: myListingsResponseSchema },
      },
    },
    async (request) => {
      const user = await requireCurrentUser(app, request.headers.authorization);
      const ownedRows = await app.db.db
        .select()
        .from(servers)
        .where(eq(servers.ownerId, user.id))
        .orderBy(servers.createdAt);

      const serverIds = ownedRows.map((row) => row.id);
      const [heartbeats, tagRows] = await Promise.all([
        findLatestHeartbeats(app, serverIds),
        serverIds.length > 0
          ? app.db.db.select().from(serverTags).where(inArray(serverTags.serverId, serverIds))
          : Promise.resolve([] as Array<{ serverId: string; tag: string }>),
      ]);

      const tagsByServer = new Map<string, string[]>();
      for (const row of tagRows) {
        const list = tagsByServer.get(row.serverId) ?? [];
        list.push(row.tag);
        tagsByServer.set(row.serverId, list);
      }

      const nowMs = Date.now();
      const summaries = ownedRows.map((row) => {
        const base = normalizeServerPayload(row, nowMs);
        return {
          id: base.id,
          slug: base.slug,
          name: base.name,
          description: base.description,
          host: base.host,
          port: base.port,
          game: base.game,
          catalog_status: base.catalog_status,
          freshness_status: base.freshness_status,
          country_code: base.country_code,
          logo_url: base.logo_url,
          banner_url: base.banner_url,
          verified_at: row.verifiedAt ? row.verifiedAt.toISOString() : null,
          verification_method: (row.verificationMethod as "motd" | "dns" | null) ?? null,
          created_at: base.created_at,
          tags: tagsByServer.get(row.id) ?? [],
          latest_metrics: normalizeMetricsPayload(heartbeats.get(row.id) ?? null),
        };
      });

      return successEnvelope({ servers: summaries }, request.id);
    }
  );

  // Owner-scoped hard delete; child rows cascade via FK.
  app.delete(
    "/api/v1/listings/:id",
    {
      schema: {
        params: deleteParamSchema,
        response: { 200: deleteListingResponseSchema },
      },
    },
    async (request) => {
      const user = await requireCurrentUser(app, request.headers.authorization);
      const existing = await app.db.db.query.servers.findFirst({
        where: eq(servers.id, request.params.id),
        columns: { id: true, ownerId: true },
      });

      // 404 (not 403) when the caller isn't the owner, to avoid leaking existence.
      if (!existing || existing.ownerId !== user.id) {
        throw new ApiError({
          statusCode: 404,
          code: "SERVER_NOT_FOUND",
          message: "Server not found.",
        });
      }

      await app.db.db.delete(servers).where(eq(servers.id, existing.id));
      return successEnvelope({ deleted: true as const, id: existing.id }, request.id);
    }
  );
};
