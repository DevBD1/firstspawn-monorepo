import { and, eq, isNull, or, sql } from "drizzle-orm";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID, randomBytes } from "node:crypto";
import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { ApiError } from "../../lib/api-error.js";
import { successEnvelope } from "../../lib/envelope.js";
import { checkRateLimit } from "../../lib/rate-limit.js";
import { requireCurrentUser } from "../../lib/request-auth.js";
import {
  decodeRefreshToken,
  hashPassword,
  hashRefreshToken,
  hashToken,
  issueAccessToken,
  issueRefreshToken,
  TokenDecodeError,
  verifyPassword,
} from "../../lib/security.js";
import {
  userConsentAuditLogs,
  userDeletionRequests,
  userSessions,
  users,
  verificationTokens,
  type UserRecord,
} from "@firstspawn/database/schema";

const RESTORE_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const SOFT_DELETE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const EXPEDITE_DELETE_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_LOCALE = "en";

const localeSchema = z.enum(["en", "tr", "de", "ru", "es", "fr"]);
const usernameRegex = /^[a-zA-Z0-9_]{3,32}$/;

const registerBodySchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email format.")
    .transform((value) => value.toLowerCase()),
  username: z.string().trim().regex(usernameRegex, {
    message: "Username must be 3-32 chars and contain only letters, numbers, underscores.",
  }),
  password: z.string().min(8).max(128),
  locale: localeSchema.default("en"),
  terms_accepted: z.boolean().refine((value) => value, {
    message: "Terms must be accepted.",
  }),
  privacy_accepted: z.boolean().refine((value) => value, {
    message: "Privacy policy must be accepted.",
  }),
  marketing_consent: z.boolean().default(false),
});

const loginBodySchema = z.object({
  identifier: z.string().trim().min(3).max(255),
  password: z.string().min(8).max(128),
});

const tokenBodySchema = z.object({
  refresh_token: z.string().min(20),
});

const deleteRequestBodySchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

const restoreConfirmBodySchema = z.object({
  token: z.string().min(20),
});

const expediteDeleteBodySchema = z.object({
  token: z.string().min(20),
  note: z.string().trim().max(1000).optional(),
});

const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  email_confirmed_at: z.string().datetime().nullable(),
  username: z.string(),
  status: z.string(),
  locale: z.string(),
});

const tokenPairSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal("bearer"),
  expires_in: z.number().int().positive(),
});

const envelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z.object({
      request_id: z.string().uuid().nullable(),
    }),
    error: z.null(),
  });

const authResponseSchema = envelopeSchema(
  z.object({
    user: authUserSchema,
    tokens: tokenPairSchema,
  })
);

const refreshResponseSchema = envelopeSchema(
  z.object({
    tokens: tokenPairSchema,
  })
);

const logoutResponseSchema = envelopeSchema(
  z.object({
    logged_out: z.literal(true),
  })
);

const meResponseSchema = envelopeSchema(
  z.object({
    user: authUserSchema,
  })
);

const deleteRequestResponseSchema = envelopeSchema(
  z.object({
    deletion_requested: z.literal(true),
    purge_after: z.string().datetime(),
    remaining_days: z.number().int().nonnegative(),
  })
);

const restoreConfirmResponseSchema = envelopeSchema(
  z.object({
    restored: z.literal(true),
  })
);

const expediteDeleteResponseSchema = envelopeSchema(
  z.object({
    expedited: z.literal(true),
    purge_after: z.string().datetime(),
    remaining_days: z.number().int().nonnegative(),
  })
);

const createRawToken = (): string => randomBytes(32).toString("base64url");

interface LockedSessionRow {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  expires_at: Date | string;
  revoked_at: Date | null;
}

const normalizeHeader = (value: string | string[] | undefined): string | null => {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
};

const getClientIp = (ip?: string): string | null => {
  if (!ip) {
    return null;
  }

  const first = ip.split(",")[0]?.trim();
  return first || null;
};

const inferDeviceType = (userAgent: string | null): string | null => {
  if (!userAgent) {
    return null;
  }

  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
    return "mobile";
  }
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet";
  }

  return "desktop";
};

const inferOsName = (userAgent: string | null): string | null => {
  if (!userAgent) {
    return null;
  }

  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) {
    return "Windows";
  }
  if (ua.includes("mac os") || ua.includes("macintosh")) {
    return "macOS";
  }
  if (ua.includes("android")) {
    return "Android";
  }
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) {
    return "iOS";
  }
  if (ua.includes("linux")) {
    return "Linux";
  }

  return "Other";
};

const inferClientName = (userAgent: string | null): string | null => {
  if (!userAgent) {
    return null;
  }

  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) {
    return "Edge";
  }
  if (ua.includes("chrome/")) {
    return "Chrome";
  }
  if (ua.includes("safari/") && !ua.includes("chrome/")) {
    return "Safari";
  }
  if (ua.includes("firefox/")) {
    return "Firefox";
  }

  return "Other";
};

const daysUntil = (target: Date): number => {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return 0;
  }

  return Math.ceil(diff / (24 * 60 * 60 * 1000));
};

const userPayload = (user: UserRecord) => ({
  id: user.id,
  email: user.email,
  email_confirmed_at: user.emailConfirmedAt?.toISOString() ?? null,
  username: user.username,
  status: user.status,
  locale: user.locale ?? DEFAULT_LOCALE,
});

const duplicateFieldFromError = (error: { constraint?: string; detail?: string }): string => {
  const text = `${error.constraint ?? ""} ${error.detail ?? ""}`.toLowerCase();
  if (text.includes("email")) {
    return "email";
  }
  if (text.includes("username")) {
    return "username";
  }
  return "identifier";
};

const createSessionAndTokens = async (
  app: FastifyInstance,
  user: UserRecord,
  request: { ip?: string; headers: Record<string, string | string[] | undefined> }
): Promise<{
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}> => {
  const now = new Date();
  const userAgent = normalizeHeader(request.headers["user-agent"]);
  const clientIp = getClientIp(request.ip);
  const fingerprintSource = `${clientIp ?? ""}|${userAgent ?? ""}`;
  const [session] = await app.db.db
    .insert(userSessions)
    .values({
      id: randomUUID(),
      userId: user.id,
      refreshTokenHash: "pending",
      expiresAt: now,
      revokedAt: null,
      ip: clientIp ?? undefined,
      userAgent: userAgent ?? undefined,
      deviceFingerprintHash: userAgent ? hashToken(fingerprintSource, app.config) : undefined,
      deviceType: inferDeviceType(userAgent) ?? undefined,
      osName: inferOsName(userAgent) ?? undefined,
      clientName: inferClientName(userAgent) ?? undefined,
      lastSeenAt: now,
      updatedAt: now,
    })
    .returning({ id: userSessions.id });

  const refresh = issueRefreshToken(user.id, session.id, app.config);
  await app.db.db
    .update(userSessions)
    .set({
      refreshTokenHash: hashRefreshToken(refresh.token, app.config),
      expiresAt: refresh.expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(userSessions.id, session.id));

  const access = issueAccessToken(user.id, app.config);
  return {
    access_token: access.token,
    refresh_token: refresh.token,
    token_type: "bearer",
    expires_in: access.expiresIn,
  };
};

const ensureActiveDeletionRequest = async (
  app: FastifyInstance,
  user: UserRecord,
  reason: string
): Promise<{ id: string; purgeAfter: Date }> => {
  const existing = await app.db.db.query.userDeletionRequests.findFirst({
    where: and(
      eq(userDeletionRequests.userId, user.id),
      isNull(userDeletionRequests.cancelledAt),
      isNull(userDeletionRequests.purgedAt)
    ),
  });

  if (existing) {
    return { id: existing.id, purgeAfter: existing.purgeAfter };
  }

  const now = new Date();
  const purgeAfter = new Date(now.getTime() + SOFT_DELETE_WINDOW_MS);

  const [created] = await app.db.db
    .insert(userDeletionRequests)
    .values({
      id: randomUUID(),
      userId: user.id,
      requestedAt: now,
      purgeAfter,
      reason,
      updatedAt: now,
    })
    .returning({
      id: userDeletionRequests.id,
      purgeAfter: userDeletionRequests.purgeAfter,
    });

  return created;
};

const sendRestoreToken = async (
  app: FastifyInstance,
  user: UserRecord,
  purgeAfter: Date
): Promise<void> => {
  const now = new Date();
  const rawToken = createRawToken();

  await app.db.db
    .delete(verificationTokens)
    .where(
      and(eq(verificationTokens.userId, user.id), eq(verificationTokens.purpose, "account_restore"))
    );

  await app.db.db.insert(verificationTokens).values({
    id: randomUUID(),
    userId: user.id,
    tokenHash: hashToken(rawToken, app.config),
    purpose: "account_restore",
    expiresAt: new Date(now.getTime() + RESTORE_TOKEN_TTL_MS),
    updatedAt: now,
  });

  void app.mailer.sendAccountRestoreEmail(
    user.email,
    rawToken,
    purgeAfter,
    user.locale ?? DEFAULT_LOCALE
  );
};

const findActiveRestoreToken = async (
  app: FastifyInstance,
  token: string
): Promise<{
  id: string;
  userId: string;
  expiresAt: Date;
}> => {
  const hashed = hashToken(token, app.config);
  const record = await app.db.db.query.verificationTokens.findFirst({
    where: and(
      eq(verificationTokens.tokenHash, hashed),
      eq(verificationTokens.purpose, "account_restore")
    ),
  });

  if (!record || record.expiresAt <= new Date()) {
    throw new ApiError({
      statusCode: 401,
      code: "AUTH_TOKEN_EXPIRED",
      message: "Invalid or expired restore token.",
    });
  }

  return {
    id: record.id,
    userId: record.userId,
    expiresAt: record.expiresAt,
  };
};

const createRateLimitPreHandler = (
  app: FastifyInstance,
  keyPrefix: string,
  maxRequests: number,
  windowSeconds: number
) => {
  return async (request: FastifyRequest): Promise<void> => {
    const allowed = await checkRateLimit(
      app.redis,
      `${keyPrefix}:${request.ip ?? "unknown"}`,
      maxRequests,
      windowSeconds
    );

    if (!allowed) {
      throw new ApiError({
        statusCode: 429,
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again later.",
      });
    }
  };
};

export const registerAuthRoutes = (fastify: FastifyInstance): void => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    "/register",
    {
      preHandler: [createRateLimitPreHandler(app, "rl:auth_register", 5, 3600)],
      schema: {
        body: registerBodySchema,
        response: {
          201: authResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const payload = request.body;
      const db = app.db.db;

      const [existingEmail, existingUsername] = await Promise.all([
        db.query.users.findFirst({
          where: eq(users.email, payload.email),
        }),
        db.query.users.findFirst({
          where: eq(users.username, payload.username),
        }),
      ]);

      if (existingEmail) {
        throw new ApiError({
          statusCode: 409,
          code: "VALIDATION_ERROR",
          message: "Email is already registered.",
          details: { field: "email" },
        });
      }

      if (existingUsername) {
        throw new ApiError({
          statusCode: 409,
          code: "VALIDATION_ERROR",
          message: "Username is already taken.",
          details: { field: "username" },
        });
      }

      const now = new Date();
      const rawToken = createRawToken();
      let user: UserRecord;

      try {
        user = await db.transaction(async (tx) => {
          const [newUser] = await tx
            .insert(users)
            .values({
              email: payload.email,
              username: payload.username,
              passwordHash: hashPassword(payload.password),
              status: "active",
              locale: payload.locale,
              termsAcceptedAt: payload.terms_accepted ? now : null,
              privacyAcceptedAt: payload.privacy_accepted ? now : null,
              marketingConsentAt: payload.marketing_consent ? now : null,
              lastLoginAt: now,
              updatedAt: now,
            })
            .returning();

          await tx.insert(verificationTokens).values({
            id: randomUUID(),
            userId: newUser.id,
            tokenHash: hashToken(rawToken, app.config),
            purpose: "email_verification",
            expiresAt: new Date(Date.now() + RESTORE_TOKEN_TTL_MS),
            updatedAt: now,
          });

          // GDPR Consent Logging
          const ipAddress = getClientIp(request.ip);
          const userAgent = normalizeHeader(request.headers["user-agent"]);

          const consentLogs = [];
          if (payload.terms_accepted) {
            consentLogs.push({
              userId: newUser.id,
              action: "opt_in" as const,
              consentType: "terms" as const,
              policyVersion: "1.0",
              ip: ipAddress ?? undefined,
              userAgent: userAgent ?? undefined,
              createdAt: now,
            });
          }
          if (payload.privacy_accepted) {
            consentLogs.push({
              userId: newUser.id,
              action: "opt_in" as const,
              consentType: "privacy" as const,
              policyVersion: "1.0",
              ip: ipAddress ?? undefined,
              userAgent: userAgent ?? undefined,
              createdAt: now,
            });
          }
          if (payload.marketing_consent) {
            consentLogs.push({
              userId: newUser.id,
              action: "opt_in" as const,
              consentType: "marketing" as const,
              policyVersion: "1.0",
              ip: ipAddress ?? undefined,
              userAgent: userAgent ?? undefined,
              createdAt: now,
            });
          }

          if (consentLogs.length > 0) {
            await tx.insert(userConsentAuditLogs).values(consentLogs);
          }

          return newUser;
        });
      } catch (error) {
        const duplicateField = duplicateFieldFromError(
          error as { constraint?: string; detail?: string }
        );
        if ((error as { code?: string }).code === "23505") {
          throw new ApiError({
            statusCode: 409,
            code: "VALIDATION_ERROR",
            message:
              duplicateField === "email"
                ? "Email is already registered."
                : duplicateField === "username"
                  ? "Username is already taken."
                  : "Email or username is already in use.",
            details: { field: duplicateField },
          });
        }
        throw error;
      }

      const tokens = await createSessionAndTokens(app, user, request);
      void app.mailer.sendVerificationEmail(user.email, rawToken, user.locale ?? DEFAULT_LOCALE);

      const response = successEnvelope({ user: userPayload(user), tokens }, request.id);
      return reply.status(201).send(response);
    }
  );

  app.post(
    "/login",
    {
      preHandler: [createRateLimitPreHandler(app, "rl:auth_login", 10, 900)],
      schema: {
        body: loginBodySchema,
        response: {
          200: authResponseSchema,
        },
      },
    },
    async (request) => {
      const identifier = request.body.identifier.trim();
      const user = await app.db.db.query.users.findFirst({
        where: or(eq(users.email, identifier.toLowerCase()), eq(users.username, identifier)),
      });

      if (!user || !verifyPassword(request.body.password, user.passwordHash)) {
        throw new ApiError({
          statusCode: 401,
          code: "AUTH_INVALID_CREDENTIALS",
          message: "Invalid credentials.",
        });
      }

      if (user.status === "deleted") {
        const deletion = await ensureActiveDeletionRequest(app, user, "deleted_login_restore_flow");
        await sendRestoreToken(app, user, deletion.purgeAfter);

        throw new ApiError({
          statusCode: 403,
          code: "AUTH_RESTORE_REQUIRED",
          message: "Account is pending deletion. Restore is required.",
          details: {
            purge_after: deletion.purgeAfter.toISOString(),
            remaining_days: daysUntil(deletion.purgeAfter),
          },
        });
      }

      if (user.status !== "active") {
        throw new ApiError({
          statusCode: 403,
          code: "AUTH_FORBIDDEN",
          message: "User account is not active.",
        });
      }

      await app.db.db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      const refreshedUser = {
        ...user,
        lastLoginAt: new Date(),
      };
      const tokens = await createSessionAndTokens(app, refreshedUser, request);
      return {
        data: { user: userPayload(refreshedUser), tokens },
        meta: { request_id: request.id },
        error: null,
      };
    }
  );

  app.post(
    "/refresh",
    {
      preHandler: [createRateLimitPreHandler(app, "rl:auth_refresh", 30, 900)],
      schema: {
        body: tokenBodySchema,
        response: {
          200: refreshResponseSchema,
        },
      },
    },
    async (request) => {
      let claims: ReturnType<typeof decodeRefreshToken>;
      try {
        claims = decodeRefreshToken(request.body.refresh_token, app.config);
      } catch (error) {
        if (error instanceof TokenDecodeError) {
          throw new ApiError({
            statusCode: 401,
            code: "AUTH_TOKEN_EXPIRED",
            message: "Invalid or expired refresh token.",
          });
        }
        throw error;
      }

      const now = new Date();
      const tokenHash = hashRefreshToken(request.body.refresh_token, app.config);

      const tokens = await app.db.db.transaction(async (tx) => {
        const lockedSessionResult = await tx.execute(sql`
          select id, user_id, refresh_token_hash, expires_at, revoked_at
          from user_sessions
          where id = ${claims.sid}::uuid
          for update
        `);

        const session = lockedSessionResult.rows[0] as unknown as LockedSessionRow | undefined;
        if (!session || session.user_id !== claims.sub) {
          throw new ApiError({
            statusCode: 401,
            code: "AUTH_FORBIDDEN",
            message: "Refresh session not found.",
          });
        }

        const expiresAt =
          session.expires_at instanceof Date
            ? session.expires_at
            : new Date(session.expires_at as string);

        if (session.revoked_at || expiresAt <= now) {
          throw new ApiError({
            statusCode: 401,
            code: "AUTH_TOKEN_EXPIRED",
            message: "Refresh token expired.",
          });
        }

        if (session.refresh_token_hash !== tokenHash) {
          throw new ApiError({
            statusCode: 401,
            code: "AUTH_FORBIDDEN",
            message: "Refresh token mismatch.",
          });
        }

        const user = await tx.query.users.findFirst({
          where: eq(users.id, claims.sub),
        });

        if (!user || user.status !== "active") {
          throw new ApiError({
            statusCode: 403,
            code: "AUTH_FORBIDDEN",
            message: "User account is not active.",
          });
        }

        await tx
          .update(userSessions)
          .set({
            revokedAt: now,
            updatedAt: now,
          })
          .where(and(eq(userSessions.id, session.id), sql`${userSessions.revokedAt} is null`));

        const userAgent = normalizeHeader(request.headers["user-agent"]);
        const clientIp = getClientIp(request.ip);
        const [newSession] = await tx
          .insert(userSessions)
          .values({
            id: randomUUID(),
            userId: user.id,
            refreshTokenHash: "pending",
            expiresAt: now,
            ip: clientIp ?? undefined,
            userAgent: userAgent ?? undefined,
            deviceFingerprintHash: userAgent
              ? hashToken(`${clientIp ?? ""}|${userAgent}`, app.config)
              : undefined,
            deviceType: inferDeviceType(userAgent) ?? undefined,
            osName: inferOsName(userAgent) ?? undefined,
            clientName: inferClientName(userAgent) ?? undefined,
            lastSeenAt: now,
            updatedAt: now,
          })
          .returning({ id: userSessions.id });

        const refreshToken = issueRefreshToken(user.id, newSession.id, app.config);
        await tx
          .update(userSessions)
          .set({
            refreshTokenHash: hashRefreshToken(refreshToken.token, app.config),
            expiresAt: refreshToken.expiresAt,
            updatedAt: now,
          })
          .where(eq(userSessions.id, newSession.id));

        const accessToken = issueAccessToken(user.id, app.config);
        return {
          access_token: accessToken.token,
          refresh_token: refreshToken.token,
          token_type: "bearer" as const,
          expires_in: accessToken.expiresIn,
        };
      });

      return {
        data: { tokens },
        meta: { request_id: request.id },
        error: null,
      };
    }
  );

  app.post(
    "/logout",
    {
      schema: {
        body: tokenBodySchema,
        response: {
          200: logoutResponseSchema,
        },
      },
    },
    async (request) => {
      try {
        const claims = decodeRefreshToken(request.body.refresh_token, app.config);
        await app.db.db
          .update(userSessions)
          .set({
            revokedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(eq(userSessions.id, claims.sid), sql`${userSessions.revokedAt} is null`));
      } catch (error) {
        if (!(error instanceof TokenDecodeError)) {
          throw error;
        }
      }

      return {
        data: { logged_out: true as const },
        meta: { request_id: request.id },
        error: null,
      };
    }
  );

  app.get(
    "/me",
    {
      schema: {
        response: {
          200: meResponseSchema,
        },
      },
    },
    async (request) => {
      const user = await requireCurrentUser(app, request.headers.authorization);
      return {
        data: { user: userPayload(user) },
        meta: { request_id: request.id },
        error: null,
      };
    }
  );

  app.post(
    "/delete/request",
    {
      schema: {
        body: deleteRequestBodySchema,
        response: {
          200: deleteRequestResponseSchema,
        },
      },
    },
    async (request) => {
      const user = await requireCurrentUser(app, request.headers.authorization);
      const now = new Date();
      const purgeAfter = new Date(now.getTime() + SOFT_DELETE_WINDOW_MS);

      await app.db.db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({
            status: "deleted",
            updatedAt: now,
          })
          .where(eq(users.id, user.id));

        const existing = await tx.query.userDeletionRequests.findFirst({
          where: and(
            eq(userDeletionRequests.userId, user.id),
            isNull(userDeletionRequests.cancelledAt),
            isNull(userDeletionRequests.purgedAt)
          ),
        });

        if (existing) {
          await tx
            .update(userDeletionRequests)
            .set({
              requestedAt: now,
              purgeAfter,
              reason: request.body.reason ?? existing.reason,
              updatedAt: now,
            })
            .where(eq(userDeletionRequests.id, existing.id));
        } else {
          await tx.insert(userDeletionRequests).values({
            id: randomUUID(),
            userId: user.id,
            requestedAt: now,
            purgeAfter,
            reason: request.body.reason,
            updatedAt: now,
          });
        }
      });

      return {
        data: {
          deletion_requested: true as const,
          purge_after: purgeAfter.toISOString(),
          remaining_days: daysUntil(purgeAfter),
        },
        meta: { request_id: request.id },
        error: null,
      };
    }
  );

  app.post(
    "/restore/confirm",
    {
      schema: {
        body: restoreConfirmBodySchema,
        response: {
          200: restoreConfirmResponseSchema,
        },
      },
    },
    async (request) => {
      const restoreToken = await findActiveRestoreToken(app, request.body.token);
      const now = new Date();

      await app.db.db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({
            status: "active",
            updatedAt: now,
          })
          .where(eq(users.id, restoreToken.userId));

        await tx
          .update(userDeletionRequests)
          .set({
            cancelledAt: now,
            updatedAt: now,
          })
          .where(
            and(
              eq(userDeletionRequests.userId, restoreToken.userId),
              isNull(userDeletionRequests.cancelledAt),
              isNull(userDeletionRequests.purgedAt)
            )
          );

        await tx
          .delete(verificationTokens)
          .where(
            and(
              eq(verificationTokens.userId, restoreToken.userId),
              eq(verificationTokens.purpose, "account_restore")
            )
          );
      });

      return {
        data: { restored: true as const },
        meta: { request_id: request.id },
        error: null,
      };
    }
  );

  app.post(
    "/restore/expedite-delete",
    {
      schema: {
        body: expediteDeleteBodySchema,
        response: {
          200: expediteDeleteResponseSchema,
        },
      },
    },
    async (request) => {
      const restoreToken = await findActiveRestoreToken(app, request.body.token);
      const now = new Date();
      const purgeAfter = new Date(now.getTime() + EXPEDITE_DELETE_WINDOW_MS);

      const [updated] = await app.db.db
        .update(userDeletionRequests)
        .set({
          expediteRequestedAt: now,
          expediteNote: request.body.note ?? "requested_from_restore_email",
          purgeAfter,
          updatedAt: now,
        })
        .where(
          and(
            eq(userDeletionRequests.userId, restoreToken.userId),
            isNull(userDeletionRequests.cancelledAt),
            isNull(userDeletionRequests.purgedAt)
          )
        )
        .returning({ id: userDeletionRequests.id });

      if (!updated) {
        throw new ApiError({
          statusCode: 404,
          code: "NOT_FOUND",
          message: "Active deletion request not found.",
        });
      }

      return {
        data: {
          expedited: true as const,
          purge_after: purgeAfter.toISOString(),
          remaining_days: daysUntil(purgeAfter),
        },
        meta: { request_id: request.id },
        error: null,
      };
    }
  );
};
