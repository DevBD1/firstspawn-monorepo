import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { successEnvelope } from "../lib/envelope.js";
import { withTimeout } from "../lib/timeout.js";
import { registerAuthRoutes } from "./v1/auth.js";
import { registerCollectorRoutes } from "./v1/collector.js";
import { registerListingRoutes } from "./v1/listings.js";
import { registerServerRoutes } from "./v1/servers.js";

const HEALTH_CHECK_TIMEOUT_MS = 2_000;

const checkDependency = async (probeFn: () => Promise<unknown>): Promise<boolean> => {
  try {
    // Create the probe inside the try so a synchronous throw is caught too.
    await withTimeout(probeFn(), HEALTH_CHECK_TIMEOUT_MS, "health check");
    return true;
  } catch {
    return false;
  }
};

// Liveness: the process is up and serving. Deliberately does NOT touch
// Postgres/Redis, so a dependency outage can never make a liveness probe or a
// restart policy kill an otherwise-healthy process. Always 200.
const handleLiveness = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  return reply
    .header("Cache-Control", "no-store, max-age=0")
    .send(successEnvelope({ status: "ok" }, request.id));
};

// Readiness: can the API actually serve requests right now? Checks Postgres +
// Redis and reports ok/degraded/down (503 when down) — this is what the web
// health indicator polls.
const handleReadiness = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const app = request.server;
  const [db, redis] = await Promise.all([
    checkDependency(() => app.db.pool.query("SELECT 1")),
    checkDependency(() => app.redis.ping()),
  ]);

  // Postgres is the core dependency; without it the API can't serve. Redis is
  // degradable (rate-limit/cache), so a Redis outage is "degraded", not "down".
  const status = !db ? "down" : !redis ? "degraded" : "ok";

  return reply
    .status(status === "down" ? 503 : 200)
    .header("Cache-Control", "no-store, max-age=0")
    .send(successEnvelope({ status, deps: { db, redis } }, request.id));
};

export const registerApiRoutes = (app: FastifyInstance): void => {
  // Root `/healthz` is liveness only (infra/container probes, always 200 while
  // the process is up). Dependency/readiness state lives on the versioned
  // `/api/v1/healthz`, which is also the path that routes through a gateway/nginx
  // forwarding only `/api/*` — that's what the web health indicator polls.
  app.get("/healthz", handleLiveness);
  app.get("/api/v1/healthz", handleReadiness);
  app.register(registerAuthRoutes, { prefix: "/api/v1/auth" });
  app.register(registerCollectorRoutes, { prefix: "/api/v1/collector" });
  app.register(registerServerRoutes);
  app.register(registerListingRoutes);
};
