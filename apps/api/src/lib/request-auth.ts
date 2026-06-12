import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";

import { users, type UserRecord } from "@firstspawn/database/schema";
import { ApiError } from "./api-error.js";
import { decodeAccessToken, TokenDecodeError } from "./security.js";

const unauthorized = (message: string, code = "AUTH_FORBIDDEN"): ApiError =>
  new ApiError({
    statusCode: 401,
    code,
    message,
  });

const forbidden = (message: string): ApiError =>
  new ApiError({
    statusCode: 403,
    code: "AUTH_FORBIDDEN",
    message,
  });

export const requireCurrentUser = async (
  app: FastifyInstance,
  authorization: string | undefined
): Promise<UserRecord> => {
  if (!authorization?.startsWith("Bearer ")) {
    throw unauthorized("Authentication required.");
  }

  let userId: string;
  try {
    const claims = decodeAccessToken(authorization.slice("Bearer ".length), app.config);
    userId = claims.sub;
  } catch (error) {
    if (error instanceof TokenDecodeError) {
      throw unauthorized("Invalid or expired access token.", "AUTH_TOKEN_EXPIRED");
    }
    throw error;
  }

  const user = await app.db.db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw unauthorized("Authenticated user not found.");
  }

  if (user.status !== "active") {
    throw forbidden("User account is not active.");
  }

  return user;
};

export const requireAdminUser = async (
  app: FastifyInstance,
  authorization: string | undefined
): Promise<UserRecord> => {
  const user = await requireCurrentUser(app, authorization);

  if (!app.config.API_ADMIN_EMAIL_ALLOWLIST.includes(user.email.toLowerCase())) {
    throw forbidden("Admin access is required.");
  }

  return user;
};

export const requireCollectorKey = (
  app: FastifyInstance,
  providedKey: string | string[] | undefined
): void => {
  const normalizedKey = Array.isArray(providedKey) ? providedKey[0] : providedKey;

  if (!normalizedKey || normalizedKey !== app.config.API_COLLECTOR_KEY) {
    throw unauthorized("Collector authentication required.");
  }
};
