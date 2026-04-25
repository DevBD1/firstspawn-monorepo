import { payloadDecision } from "./cadence.js";
import { buildHeartbeatIdempotencyKey } from "./idempotency.js";
import type { CollectorMetrics } from "./metrics.js";
import type { ApiClient } from "./api-client.js";
import type { MinecraftProbeClient } from "./probe.js";
import type { CollectorTarget, HeartbeatPayload } from "./types.js";

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

    await runWithConcurrency(targets, this.concurrency, async (target) => {
      await this.processTarget(target, result);
    });

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

  private async processTarget(target: CollectorTarget, result: CycleResult): Promise<void> {
    this.metrics.observeTargetProcessed();
    const occurredAt = this.now();
    const occurredAtIso = occurredAt.toISOString();

    let probe;
    try {
      probe = await this.probeClient.probe(target, this.probeTimeoutMs);
      this.metrics.observeProbeSuccess();
      result.probeSuccess += 1;
    } catch (error) {
      this.metrics.observeProbeFailure();
      result.probeFailure += 1;
      try {
        await this.apiClient.recordProbeFailure({
          server_id: target.id,
          occurred_at: occurredAtIso,
          result: "failure",
          error_code: probeErrorCode(error),
        });
      } catch (ingestError) {
        this.metrics.observeIngestFailure();
        result.ingestFailure += 1;
        this.logger.error(
          `[collector] probe failure ingest failed server=${target.id}`,
          ingestError
        );
      }
      this.logger.error(`[collector] probe failed server=${target.id} host=${target.host}`, error);
      return;
    }

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

    try {
      const ingest = await this.apiClient.ingestHeartbeat(heartbeatPayload);
      this.metrics.observeIngestSuccess(ingest.duplicate);
      result.ingestSuccess += 1;

      if (decision.includePayload) {
        this.lastPayloadAtByServer.set(target.id, decision.nextPayloadAtMs);
      }
    } catch (error) {
      this.metrics.observeIngestFailure();
      result.ingestFailure += 1;
      this.logger.error(`[collector] ingest failed server=${target.id}`, error);
    }
  }
}
