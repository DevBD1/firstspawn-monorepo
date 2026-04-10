import type { FastifyInstance } from "fastify";

import { registerAuthRoutes } from "./v1/auth.js";
import { registerCollectorRoutes } from "./v1/collector.js";
import { registerServerRoutes } from "./v1/servers.js";

export const registerApiRoutes = (app: FastifyInstance): void => {
  app.get("/healthz", async () => ({ status: "ok" }));
  app.register(registerAuthRoutes, { prefix: "/api/v1/auth" });
  app.register(registerCollectorRoutes, { prefix: "/api/v1/collector" });
  app.register(registerServerRoutes);
};
