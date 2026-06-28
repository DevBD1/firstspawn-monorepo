import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { successEnvelope } from "../lib/envelope.js";
import { withTimeout } from "../lib/timeout.js";
import { registerAuthRoutes } from "./v1/auth.js";
import { registerCollectorRoutes } from "./v1/collector.js";
import { registerListingRoutes } from "./v1/listings.js";
import { registerServerRoutes } from "./v1/servers.js";

const HEALTH_CHECK_TIMEOUT_MS = 2_000;

const checkDependency = async (probe: Promise<unknown>): Promise<boolean> => {
  try {
    await withTimeout(probe, HEALTH_CHECK_TIMEOUT_MS, "health check");
    return true;
  } catch {
    return false;
  }
};

const handleHealthz = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> => {
  const app = request.server;
  const [db, redis] = await Promise.all([
    checkDependency(app.db.pool.query("SELECT 1")),
    checkDependency(app.redis.ping()),
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
  // `/healthz` at the root is for infra/container liveness probes (unauthenticated,
  // direct). The versioned `/api/v1/healthz` is the same check reachable through a
  // gateway/nginx that only forwards `/api/*` — that's the path the web proxy uses,
  // so the indicator works whether the web talks to the API directly or via a proxy.
  app.get("/healthz", handleHealthz);
  app.get("/api/v1/healthz", handleHealthz);
  app.register(registerAuthRoutes, { prefix: "/api/v1/auth" });
  app.register(registerCollectorRoutes, { prefix: "/api/v1/collector" });
  app.register(registerServerRoutes);
  app.register(registerListingRoutes);
};
