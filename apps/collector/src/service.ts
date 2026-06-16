import { payloadDecision } from "./cadence.js";
import { buildHeartbeatIdempotencyKey } from "./idempotency.js";
import type { CollectorMetrics } from "./metrics.js";
import type { ApiClient } from "./api-client.js";
import type { MinecraftProbeClient } from "./probe.js";
import type {
  BatchIngestPayload,
  CollectorTarget,
  HeartbeatPayload,
  ProbeFailurePayload,
} from "./types.js";

const MAX_BATCH_INGEST_ITEMS = 200;

interface PendingHeartbeat {
  payload: HeartbeatPayload;
  nextPayloadAtMs: number;
  includePayload: boolean;
}

interface PendingPayloads {
  heartbeats: PendingHeartbeat[];
  failures: ProbeFailurePayload[];
}

interface CollectorServiceOptions {
  apiClient: ApiClient;
  probeClient: MinecraftProbeClient;
  metrics: CollectorMetrics;
  pingIntervalSeconds: number;
  payloadIntervalSeconds: number;
  concurrency: number;
  probeTimeoutMs: number;
  now?: () => Date;
  sleep?: (ms: number) => Promise<void>;
  logger?: Pick<Console, "info" | "error">;
}

export interface CycleResult {
  targets: number;
  probeSuccess: number;
  probeFailure: number;
  ingestSuccess: number;
  ingestFailure: number;
}

const sleepDefault = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const runWithConcurrency = async <T>(
  items: T[],
  concurrency: number,
  handler: (item: T) => Promise<void>
): Promise<void> => {
  const limit = Math.max(1, concurrency);
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      await handler(items[current]!);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
};

const chunkPendingPayloads = (pendingPayloads: PendingPayloads): PendingPayloads[] => {
  const chunks: PendingPayloads[] = [];
  let current: PendingPayloads = {
    heartbeats: [],
    failures: [],
  };

  const pushCurrent = (): void => {
    if (current.heartbeats.length > 0 || current.failures.length > 0) {
      chunks.push(current);
      current = {
        heartbeats: [],
        failures: [],
      };
    }
  };

  for (const heartbeat of pendingPayloads.heartbeats) {
    if (current.heartbeats.length + current.failures.length >= MAX_BATCH_INGEST_ITEMS) {
      pushCurrent();
    }
    current.heartbeats.push(heartbeat);
  }

  for (const failure of pendingPayloads.failures) {
    if (current.heartbeats.length + current.failures.length >= MAX_BATCH_INGEST_ITEMS) {
      pushCurrent();
    }
    current.failures.push(failure);
  }

  pushCurrent();
  return chunks;
};

const probeErrorCode = (error: unknown): string => {
  const code = (error as { code?: unknown; cause?: { code?: unknown } }).code;
  const causeCode = (error as { cause?: { code?: unknown } }).cause?.code;
  const rawCode = typeof code === "string" ? code : typeof causeCode === "string" ? causeCode : "";
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (rawCode.includes("TIMEOUT") || message.includes("timeout")) {
    return "timeout";
  }
  if (rawCode.includes("ENOTFOUND") || rawCode.includes("EAI_AGAIN")) {
    return "dns";
  }
  if (rawCode.includes("ECONNREFUSED")) {
    return "connection_refused";
  }
  if (rawCode.includes("ENETUNREACH") || rawCode.includes("EHOSTUNREACH")) {
    return "network_unreachable";
  }

  return "probe_failed";
};

export class CollectorService {
  private readonly apiClient: ApiClient;
  private readonly probeClient: MinecraftProbeClient;
  private readonly metrics: CollectorMetrics;
  private readonly pingIntervalSeconds: number;
  private readonly payloadIntervalSeconds: number;
  private readonly concurrency: number;
  private readonly probeTimeoutMs: number;
  private readonly now: () => Date;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly logger: Pick<Console, "info" | "error">;
  private readonly lastPayloadAtByServer = new Map<string, number>();

  public constructor(options: CollectorServiceOptions) {
    this.apiClient = options.apiClient;
    this.probeClient = options.probeClient;
    this.metrics = options.metrics;
    this.pingIntervalSeconds = options.pingIntervalSeconds;
    this.payloadIntervalSeconds = options.payloadIntervalSeconds;
    this.concurrency = options.concurrency;
    this.probeTimeoutMs = options.probeTimeoutMs;
    this.now = options.now ?? (() => new Date());
    this.sleep = options.sleep ?? sleepDefault;
    this.logger = options.logger ?? console;
  }

  public async runCycle(): Promise<CycleResult> {
    const cycleStartedAt = this.now();
    this.metrics.startCycle();

    const targets = await this.apiClient.fetchAllTargets();
    const result: CycleResult = {
      targets: targets.length,
      probeSuccess: 0,
      probeFailure: 0,
      ingestSuccess: 0,
      ingestFailure: 0,
    };

    const pendingPayloads: PendingPayloads = {
      heartbeats: [],
      failures: [],
    };

    await runWithConcurrency(targets, this.concurrency, async (target) => {
      await this.processTarget(target, pendingPayloads);
    });

    result.probeSuccess = pendingPayloads.heartbeats.length;
    result.probeFailure = pendingPayloads.failures.length;

    for (const chunk of chunkPendingPayloads(pendingPayloads)) {
      const batchPayload: BatchIngestPayload = {
        heartbeats: chunk.heartbeats.map((h) => h.payload),
        failures: chunk.failures,
      };
      try {
        const ingestResult = await this.apiClient.batchIngest(batchPayload);

        const dupMap = new Set<string>();
        for (const hb of ingestResult.heartbeats) {
          if (hb.duplicate) {
            dupMap.add(hb.server_id);
          }
        }

        const acceptedHearts = new Set(ingestResult.heartbeats.map((h) => h.server_id));
        const acceptedFailures = new Set(ingestResult.failures.map((f) => f.server_id));

        for (const hb of chunk.heartbeats) {
          const sId = hb.payload.server_id;
          if (acceptedHearts.has(sId)) {
            const isDuplicate = dupMap.has(sId);
            this.metrics.observeIngestSuccess(isDuplicate);
            result.ingestSuccess += 1;

            if (hb.includePayload) {
              this.lastPayloadAtByServer.set(sId, hb.nextPayloadAtMs);
            }
          } else {
            this.metrics.observeIngestFailure();
            result.ingestFailure += 1;
            this.logger.error(`[collector] server heartbeat rejected by batch ingest: ${sId}`);
          }
        }

        for (const f of chunk.failures) {
          const sId = f.server_id;
          if (acceptedFailures.has(sId)) {
            result.ingestSuccess += 1;
          } else {
            this.metrics.observeIngestFailure();
            result.ingestFailure += 1;
            this.logger.error(`[collector] server failure report rejected by batch ingest: ${sId}`);
          }
        }
      } catch (error) {
        const chunkSize = chunk.heartbeats.length + chunk.failures.length;
        for (let i = 0; i < chunkSize; i++) {
          this.metrics.observeIngestFailure();
        }
        result.ingestFailure += chunkSize;
        this.logger.error("[collector] batch ingest failed", error);
      }
    }

    const cycleFinishedAt = this.now();
    const durationSeconds = Math.max(
      0,
      (cycleFinishedAt.getTime() - cycleStartedAt.getTime()) / 1000
    );
    this.metrics.finishCycle(durationSeconds, Math.floor(cycleFinishedAt.getTime() / 1000));

    this.logger.info(
      `[collector] cycle finished targets=${result.targets} probe_ok=${result.probeSuccess} probe_fail=${result.probeFailure} ingest_ok=${result.ingestSuccess} ingest_fail=${result.ingestFailure}`
    );

    return result;
  }

  public async runForever(): Promise<never> {
    while (true) {
      const cycleStartMs = this.now().getTime();
      try {
        await this.runCycle();
      } catch (error) {
        this.logger.error("[collector] cycle crashed", error);
      }

      const elapsedMs = this.now().getTime() - cycleStartMs;
      const nextDelayMs = Math.max(0, this.pingIntervalSeconds * 1000 - elapsedMs);
      await this.sleep(nextDelayMs);
    }
  }

  private async processTarget(
    target: CollectorTarget,
    pendingPayloads: PendingPayloads
  ): Promise<void> {
    this.metrics.observeTargetProcessed();
    const occurredAt = this.now();
    const occurredAtIso = occurredAt.toISOString();

    let probe;
    try {
      probe = await this.probeClient.probe(target, this.probeTimeoutMs);
      this.metrics.observeProbeSuccess();

      const lastPayloadAt = this.lastPayloadAtByServer.get(target.id);
      const decision = payloadDecision(
        lastPayloadAt,
        occurredAt.getTime(),
        this.payloadIntervalSeconds
      );

      const heartbeatPayload: HeartbeatPayload = {
        server_id: target.id,
        occurred_at: occurredAtIso,
        idempotency_key: buildHeartbeatIdempotencyKey(target.id, occurredAtIso),
        ping_ms: probe.pingMs,
        online_players: probe.onlinePlayers,
        max_players: probe.maxPlayers,
        protocol_version: probe.protocolVersion,
        minecraft_version: probe.minecraftVersion?.slice(0, 50) ?? null,
        ...(decision.includePayload ? { payload: probe.payload } : {}),
      };

      pendingPayloads.heartbeats.push({
        payload: heartbeatPayload,
        nextPayloadAtMs: decision.nextPayloadAtMs,
        includePayload: decision.includePayload,
      });
    } catch (error) {
      this.metrics.observeProbeFailure();
      this.logger.error(`[collector] probe failed server=${target.id} host=${target.host}`, error);

      pendingPayloads.failures.push({
        server_id: target.id,
        occurred_at: occurredAtIso,
        result: "failure",
        error_code: probeErrorCode(error),
      });
    }
  }
}
