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
import { createDatabase, type DatabaseContext } from "./db/client.js";
import type { Mailer } from "./services/mailer.js";
import { createMailer } from "./services/mailer.js";

export interface BuildAppOptions {
  db?: DatabaseContext;
  mailer?: Mailer;
}

declare module "fastify" {
  interface FastifyInstance {
    db: DatabaseContext;
    mailer: Mailer;
    config: ReturnType<typeof getConfig>;
  }
}

export const buildApp = async (options: BuildAppOptions = {}): Promise<FastifyInstance> => {
  const config = getConfig();
  const db = options.db ?? createDatabase(config.API_DATABASE_URL);
  const mailer = options.mailer ?? createMailer(config);

  const app = Fastify({
    logger: config.API_ENV !== "test",
    genReqId: () => randomUUID(),
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("db", db);
  app.decorate("mailer", mailer);
  app.decorate("config", config);

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

  app.addHook("onClose", async () => {
    await db.pool.end();
  });

  app.get("/openapi.json", async () => app.swagger());

  registerApiRoutes(app);
  return app;
};
