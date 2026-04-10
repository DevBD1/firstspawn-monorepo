import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { CollectorMetrics } from "./metrics.js";

const send = (
  response: ServerResponse,
  statusCode: number,
  body: string,
  contentType: string
): void => {
  response.statusCode = statusCode;
  response.setHeader("content-type", contentType);
  response.end(body);
};

const handleRequest = (
  request: IncomingMessage,
  response: ServerResponse,
  metrics: CollectorMetrics
): void => {
  const url = request.url ?? "/";
  if (request.method === "GET" && url === "/healthz") {
    send(response, 200, "ok", "text/plain; charset=utf-8");
    return;
  }

  if (request.method === "GET" && url === "/metrics") {
    send(response, 200, metrics.renderPrometheus(), "text/plain; version=0.0.4; charset=utf-8");
    return;
  }

  send(response, 404, "not found", "text/plain; charset=utf-8");
};

export const startHealthServer = (host: string, port: number, metrics: CollectorMetrics): void => {
  const server = createServer((request, response) => handleRequest(request, response, metrics));
  server.listen(port, host, () => {
    console.info(`[collector] health server listening on http://${host}:${port}`);
  });
};
