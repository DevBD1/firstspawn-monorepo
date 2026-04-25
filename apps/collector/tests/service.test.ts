import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../src/api-client.js";
import { CollectorMetrics } from "../src/metrics.js";
import type { MinecraftProbeClient } from "../src/probe.js";
import { CollectorService } from "../src/service.js";
import type { CollectorTarget, HeartbeatPayload, IngestResult, ProbeResult } from "../src/types.js";

const targetA: CollectorTarget = {
  id: "srv-a",
  slug: "srv-a",
  host: "a.example.com",
  port: 25565,
  game: "mc_java",
  region: null,
};

const targetB: CollectorTarget = {
  id: "srv-b",
  slug: "srv-b",
  host: "b.example.com",
  port: 25565,
  game: "mc_java",
  region: null,
};

describe("CollectorService", () => {
  it("runs one cycle, ingests successful probes, and saves payload by cadence", async () => {
    const ingestHeartbeat = vi
      .fn<(payload: HeartbeatPayload) => Promise<IngestResult>>()
      .mockResolvedValue({ accepted: true, duplicate: false });
    const recordProbeFailure = vi.fn<ApiClient["recordProbeFailure"]>().mockResolvedValue();
    const fetchAllTargets = vi
      .fn<() => Promise<CollectorTarget[]>>()
      .mockResolvedValue([targetA, targetB]);

    const apiClient = {
      fetchAllTargets,
      ingestHeartbeat,
      recordProbeFailure,
    } as unknown as ApiClient;

    const probe = vi
      .fn<(target: CollectorTarget, timeoutMs: number) => Promise<ProbeResult>>()
      .mockImplementation(async (target) => ({
        pingMs: 20,
        onlinePlayers: target.id === "srv-a" ? 10 : 20,
        maxPlayers: 100,
        protocolVersion: 765,
        minecraftVersion: "1.20.4",
        payload: { motd: target.slug },
      }));
    const probeClient = {
      probe,
    } as unknown as MinecraftProbeClient;

    const nowSequence = [
      new Date("2026-04-10T08:00:00.000Z"),
      new Date("2026-04-10T08:00:00.000Z"),
      new Date("2026-04-10T08:00:00.000Z"),
      new Date("2026-04-10T08:00:01.000Z"),
      new Date("2026-04-10T08:00:01.000Z"),
      new Date("2026-04-10T08:00:01.000Z"),
    ];
    const now = vi.fn<() => Date>(
      () => nowSequence.shift() ?? new Date("2026-04-10T08:00:01.000Z")
    );

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const service = new CollectorService({
      apiClient,
      probeClient,
      metrics: new CollectorMetrics(),
      pingIntervalSeconds: 300,
      payloadIntervalSeconds: 1800,
      concurrency: 2,
      probeTimeoutMs: 5000,
      now,
      logger,
    });

    const first = await service.runCycle();
    expect(first.targets).toBe(2);
    expect(first.probeSuccess).toBe(2);
    expect(first.probeFailure).toBe(0);
    expect(first.ingestSuccess).toBe(2);
    expect(first.ingestFailure).toBe(0);
    expect(ingestHeartbeat).toHaveBeenCalledTimes(2);
    expect(ingestHeartbeat.mock.calls[0]?.[0].payload).toBeDefined();
    expect(ingestHeartbeat.mock.calls[1]?.[0].payload).toBeDefined();

    now.mockReturnValue(new Date("2026-04-10T08:05:00.000Z"));
    await service.runCycle();
    expect(ingestHeartbeat).toHaveBeenCalledTimes(4);
    expect(ingestHeartbeat.mock.calls[2]?.[0].payload).toBeUndefined();
    expect(ingestHeartbeat.mock.calls[3]?.[0].payload).toBeUndefined();
  });

  it("does not retry failed probes in the same cycle", async () => {
    const ingestHeartbeat = vi
      .fn<(payload: HeartbeatPayload) => Promise<IngestResult>>()
      .mockResolvedValue({ accepted: true, duplicate: false });
    const recordProbeFailure = vi.fn<ApiClient["recordProbeFailure"]>().mockResolvedValue();
    const fetchAllTargets = vi.fn<() => Promise<CollectorTarget[]>>().mockResolvedValue([targetA]);

    const apiClient = {
      fetchAllTargets,
      ingestHeartbeat,
      recordProbeFailure,
    } as unknown as ApiClient;

    const probe = vi
      .fn<(target: CollectorTarget, timeoutMs: number) => Promise<ProbeResult>>()
      .mockRejectedValue(new Error("probe timeout"));
    const probeClient = {
      probe,
    } as unknown as MinecraftProbeClient;

    const service = new CollectorService({
      apiClient,
      probeClient,
      metrics: new CollectorMetrics(),
      pingIntervalSeconds: 300,
      payloadIntervalSeconds: 1800,
      concurrency: 1,
      probeTimeoutMs: 2000,
      now: () => new Date("2026-04-10T08:00:00.000Z"),
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
    });

    const result = await service.runCycle();
    expect(result.targets).toBe(1);
    expect(result.probeSuccess).toBe(0);
    expect(result.probeFailure).toBe(1);
    expect(probe).toHaveBeenCalledTimes(1);
    expect(recordProbeFailure).toHaveBeenCalledWith({
      server_id: "srv-a",
      occurred_at: "2026-04-10T08:00:00.000Z",
      result: "failure",
      error_code: "timeout",
    });
    expect(ingestHeartbeat).not.toHaveBeenCalled();
  });
});
