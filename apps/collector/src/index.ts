import { ApiClient } from "./api-client.js";
import { getConfig } from "./config.js";
import { startHealthServer } from "./health-server.js";
import { CollectorMetrics } from "./metrics.js";
import { createDefaultProbeClient } from "./probe.js";
import { CollectorService } from "./service.js";

const main = async (): Promise<void> => {
  const config = getConfig();
  const metrics = new CollectorMetrics();
  const probeClient = await createDefaultProbeClient();
  const apiClient = new ApiClient({
    baseUrl: config.COLLECTOR_API_BASE_URL,
    collectorKey: config.API_COLLECTOR_KEY,
    pageSize: config.COLLECTOR_TARGET_PAGE_SIZE,
  });

  startHealthServer(config.COLLECTOR_HOST, config.COLLECTOR_PORT, metrics);
  await apiClient.waitUntilReady();

  const service = new CollectorService({
    apiClient,
    probeClient,
    metrics,
    pingIntervalSeconds: config.COLLECTOR_PING_INTERVAL_SECONDS,
    payloadIntervalSeconds: config.COLLECTOR_PAYLOAD_INTERVAL_SECONDS,
    concurrency: config.COLLECTOR_CONCURRENCY,
    probeTimeoutMs: config.COLLECTOR_PROBE_TIMEOUT_MS,
  });

  await service.runForever();
};

main().catch((error) => {
  console.error("[collector] fatal error", error);
  process.exit(1);
});
