import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

import { registerApiRoutes } from "./routes/index.js";
import { ApiError } from "./lib/api-error.js";
import { errorEnvelope } from "./lib/envelope.js";
import { getConfig } from "./lib/config.js";
import { withTimeout } from "./lib/timeout.js";
import { createDatabase, type DatabaseContext } from "@firstspawn/database/client";
import type { Mailer } from "./services/mailer.js";
import { createMailer } from "./services/mailer.js";
import { createRedisClient, type RedisClient } from "./lib/redis.js";

export interface BuildAppOptions {
  db?: DatabaseContext;
  mailer?: Mailer;
  redis?: RedisClient;
}

const TRUSTED_PROXY_CIDRS = [
  "127.0.0.0/8",
  "::1/128",
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.0.0/16",
  "fc00::/7",
  "fe80::/10",
] as const;

declare module "fastify" {
  interface FastifyInstance {
    db: DatabaseContext;
    mailer: Mailer;
    config: ReturnType<typeof getConfig>;
    redis: RedisClient;
  }
}

export const buildApp = async (options: BuildAppOptions = {}): Promise<FastifyInstance> => {
  const config = getConfig();
  const db = options.db ?? createDatabase(config.API_DATABASE_URL);
  const mailer = options.mailer ?? createMailer(config);
  const redis = options.redis ?? createRedisClient(config.API_REDIS_URL);

  const app = Fastify({
    logger: config.API_ENV !== "test",
    genReqId: () => randomUUID(),
    trustProxy: [...TRUSTED_PROXY_CIDRS],
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("db", db);
  app.decorate("mailer", mailer);
  app.decorate("config", config);
  app.decorate("redis", redis);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "FirstSpawn API",
        version: "0.1.0",
      },
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("X-Request-Id", request.id);
    return payload;
  });

  app.setErrorHandler((error: unknown, request, reply) => {
    if (error instanceof ApiError) {
      return reply
        .status(error.statusCode)
        .send(errorEnvelope(error.code, error.message, request.id, error.details));
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "validation" in error &&
      Array.isArray(error.validation)
    ) {
      return reply.status(422).send(
        errorEnvelope("VALIDATION_ERROR", "Request validation failed.", request.id, {
          errors: error.validation,
        })
      );
    }

    request.log.error(error);
    return reply
      .status(500)
      .send(errorEnvelope("INTERNAL_ERROR", "An unexpected error occurred.", request.id));
  });

  app.addHook("onReady", async () => {
    // Eagerly establish the Redis connection at boot. ioredis is lazyConnect, so
    // without this the first /healthz poll after a (re)start would report a false
    // "degraded" while the connection is still being set up. Fire-and-forget with
    // a timeout so a slow Redis can't delay the server becoming ready.
    void withTimeout(app.redis.ping(), 1_000, "redis warmup").catch(() => {});
  });

  app.addHook("onClose", async () => {
    await app.redis.quit().catch(() => {});
    await db.pool.end();
  });

  app.get("/openapi.json", async () => app.swagger());

  registerApiRoutes(app);
  return app;
};
