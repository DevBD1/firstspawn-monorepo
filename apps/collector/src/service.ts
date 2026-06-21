import { randomUUID } from "node:crypto";
import type { ApiClient } from "./api-client.js";
import type { CollectorMetrics } from "./metrics.js";
import type { MinecraftProbeClient } from "./probe.js";
import type { CollectorTarget, ProbeObservation } from "./types.js";

type ProbeErrorCode =
  | "connection_refused"
  | "dns"
  | "timeout"
  | "network_unreachable"
  | "offline_or_unreachable"
  | "socket_closed"
  | "probe_failed";
interface CollectorServiceOptions {
  apiClient: ApiClient;
  probeClient: MinecraftProbeClient;
  metrics: CollectorMetrics;
  collectorInstanceId: string;
  probeIntervalSeconds: number;
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
  classification: string | null;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
const runWithConcurrency = async <T>(
  items: T[],
  concurrency: number,
  handler: (item: T) => Promise<void>
): Promise<void> => {
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const index = next++;
      await handler(items[index]!);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(Math.max(1, concurrency), items.length) }, worker)
  );
};
const errorCodeFor = (error: unknown): ProbeErrorCode => {
  const candidate = error as { code?: unknown; cause?: { code?: unknown } };
  const code =
    typeof candidate.code === "string"
      ? candidate.code
      : typeof candidate.cause?.code === "string"
        ? candidate.cause.code
        : "";
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (code.includes("TIMEOUT") || code === "ETIMEDOUT" || message.includes("timeout"))
    return "timeout";
  if (code.includes("ENOTFOUND") || code.includes("EAI_AGAIN")) return "dns";
  if (code.includes("ECONNREFUSED")) return "connection_refused";
  if (code.includes("ENETUNREACH") || code.includes("EHOSTUNREACH")) return "network_unreachable";
  if (message.includes("offline or unreachable")) return "offline_or_unreachable";
  if (message.includes("socket closed")) return "socket_closed";
  return "probe_failed";
};

/** Probes the complete active fleet at fixed slots and submits one atomic cycle. */
export class CollectorService {
  private readonly now: () => Date;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly logger: Pick<Console, "info" | "error">;
  public constructor(private readonly options: CollectorServiceOptions) {
    this.now = options.now ?? (() => new Date());
    this.sleep = options.sleep ?? defaultSleep;
    this.logger = options.logger ?? console;
  }

  public async runCycle(slotStart = this.currentSlot()): Promise<CycleResult> {
    const startedAt = this.now();
    this.options.metrics.startCycle();
    const targets = await this.options.apiClient.fetchAllTargets();
    const observations: ProbeObservation[] = [];
    await runWithConcurrency(targets, this.options.concurrency, async (target) => {
      observations.push(await this.probe(target));
    });
    const successes = observations.filter((item) => item.result === "online").length;
    const result: CycleResult = {
      targets: targets.length,
      probeSuccess: successes,
      probeFailure: targets.length - successes,
      ingestSuccess: 0,
      ingestFailure: 0,
      classification: null,
    };
    try {
      const ingested = await this.options.apiClient.ingestProbeCycle({
        submission_id: randomUUID(),
        collector_instance_id: this.options.collectorInstanceId,
        slot_start: slotStart.toISOString(),
        started_at: startedAt.toISOString(),
        completed_at: this.now().toISOString(),
        observations,
      });
      result.ingestSuccess = ingested.accepted_observations;
      result.ingestFailure = ingested.rejected_server_ids.length;
      result.classification = ingested.classification;
      this.options.metrics.observeIngestSuccess(ingested.duplicate);
    } catch (error) {
      result.ingestFailure = observations.length;
      this.options.metrics.observeIngestFailure();
      this.logger.error("[collector] probe cycle ingest failed", error);
    }
    const finishedAt = this.now();
    this.options.metrics.finishCycle(
      Math.max(0, (finishedAt.getTime() - startedAt.getTime()) / 1_000),
      Math.floor(finishedAt.getTime() / 1_000)
    );
    this.logger.info(
      `[collector] cycle finished slot=${slotStart.toISOString()} targets=${result.targets} probe_ok=${result.probeSuccess} probe_fail=${result.probeFailure} classification=${result.classification ?? "ingest_failed"}`
    );
    return result;
  }

  public async runForever(): Promise<never> {
    while (true) {
      const slot = this.currentSlot();
      try {
        await this.runCycle(slot);
      } catch (error) {
        this.logger.error("[collector] cycle crashed", error);
      }
      const nextSlotMs = slot.getTime() + this.options.probeIntervalSeconds * 1_000;
      await this.sleep(Math.max(0, nextSlotMs - this.now().getTime()));
    }
  }

  private currentSlot(): Date {
    const intervalMs = this.options.probeIntervalSeconds * 1_000;
    return new Date(Math.floor(this.now().getTime() / intervalMs) * intervalMs);
  }

  private async probe(target: CollectorTarget): Promise<ProbeObservation> {
    this.options.metrics.observeTargetProcessed();
    const observedAt = this.now().toISOString();
    try {
      const result = await this.options.probeClient.probe(target, this.options.probeTimeoutMs);
      this.options.metrics.observeProbeSuccess();
      return {
        server_id: target.id,
        observed_at: observedAt,
        result: "online",
        online_players: result.onlinePlayers === null ? null : Math.max(0, result.onlinePlayers),
      };
    } catch (error) {
      this.options.metrics.observeProbeFailure();
      const errorCode = errorCodeFor(error);
      this.logger.error(
        `[collector] probe failed server=${target.id} host=${target.host} error_code=${errorCode}`
      );
      return {
        server_id: target.id,
        observed_at: observedAt,
        result: "failure",
        error_code: errorCode,
      };
    }
  }
}
