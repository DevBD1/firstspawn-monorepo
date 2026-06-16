import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../src/api-client.js";
import { CollectorMetrics } from "../src/metrics.js";
import type { MinecraftProbeClient } from "../src/probe.js";
import { CollectorService } from "../src/service.js";
import type { CollectorTarget, ProbeResult } from "../src/types.js";

const targetA: CollectorTarget = {
  id: "srv-a",
  slug: "srv-a",
  host: "a.example.com",
  port: 25565,
  game: "mc_java",
  country_code: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

const targetB: CollectorTarget = {
  id: "srv-b",
  slug: "srv-b",
  host: "b.example.com",
  port: 25565,
  game: "mc_java",
  country_code: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("CollectorService", () => {
  it("runs one cycle, ingests successful probes, and saves payload by cadence", async () => {
    const batchIngest = vi.fn<ApiClient["batchIngest"]>().mockImplementation(async (payload) => ({
      accepted: true,
      heartbeats: payload.heartbeats.map((h) => ({
        server_id: h.server_id,
        duplicate: false,
      })),
      failures: payload.failures.map((f) => ({
        server_id: f.server_id,
      })),
    }));
    const fetchAllTargets = vi
      .fn<() => Promise<CollectorTarget[]>>()
      .mockResolvedValue([targetA, targetB]);

    const apiClient = {
      fetchAllTargets,
      batchIngest,
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
    expect(batchIngest).toHaveBeenCalledTimes(1);
    expect(batchIngest.mock.calls[0]?.[0].heartbeats[0]?.payload).toBeDefined();
    expect(batchIngest.mock.calls[0]?.[0].heartbeats[1]?.payload).toBeDefined();

    now.mockReturnValue(new Date("2026-04-10T08:05:00.000Z"));
    await service.runCycle();
    expect(batchIngest).toHaveBeenCalledTimes(2);
    expect(batchIngest.mock.calls[1]?.[0].heartbeats[0]?.payload).toBeUndefined();
    expect(batchIngest.mock.calls[1]?.[0].heartbeats[1]?.payload).toBeUndefined();
  });

  it("does not retry failed probes in the same cycle", async () => {
    const batchIngest = vi.fn<ApiClient["batchIngest"]>().mockImplementation(async (payload) => ({
      accepted: true,
      heartbeats: [],
      failures: payload.failures.map((f) => ({
        server_id: f.server_id,
      })),
    }));
    const fetchAllTargets = vi.fn<() => Promise<CollectorTarget[]>>().mockResolvedValue([targetA]);

    const apiClient = {
      fetchAllTargets,
      batchIngest,
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
    expect(batchIngest).toHaveBeenCalledWith({
      heartbeats: [],
      failures: [
        {
          server_id: "srv-a",
          occurred_at: "2026-04-10T08:00:00.000Z",
          result: "failure",
          error_code: "timeout",
        },
      ],
    });
  });

  it("chunks mixed batch ingest payloads and continues after a chunk failure", async () => {
    const targets = Array.from(
      { length: 205 },
      (_, index): CollectorTarget => ({
        id: `srv-${index}`,
        slug: `srv-${index}`,
        host: `${index}.example.com`,
        port: 25565,
        game: "mc_java",
        country_code: null,
        created_at: "2026-01-01T00:00:00.000Z",
      })
    );
    const failingIds = new Set(targets.slice(198).map((target) => target.id));

    const batchIngest = vi
      .fn<ApiClient["batchIngest"]>()
      .mockRejectedValueOnce(new Error("temporary ingest outage"))
      .mockImplementation(async (payload) => ({
        accepted: true,
        heartbeats: payload.heartbeats.map((h) => ({
          server_id: h.server_id,
          duplicate: false,
        })),
        failures: payload.failures.map((f) => ({
          server_id: f.server_id,
        })),
      }));
    const fetchAllTargets = vi.fn<() => Promise<CollectorTarget[]>>().mockResolvedValue(targets);

    const apiClient = {
      fetchAllTargets,
      batchIngest,
    } as unknown as ApiClient;

    const probe = vi
      .fn<(target: CollectorTarget, timeoutMs: number) => Promise<ProbeResult>>()
      .mockImplementation(async (target) => {
        if (failingIds.has(target.id)) {
          throw new Error("probe timeout");
        }

        return {
          pingMs: 20,
          onlinePlayers: 10,
          maxPlayers: 100,
          protocolVersion: 765,
          minecraftVersion: "1.20.4",
          payload: { motd: target.slug },
        };
      });
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

    expect(batchIngest).toHaveBeenCalledTimes(2);
    for (const [payload] of batchIngest.mock.calls) {
      expect(payload.heartbeats.length + payload.failures.length).toBeLessThanOrEqual(200);
    }
    expect(batchIngest.mock.calls[0]?.[0].heartbeats).toHaveLength(198);
    expect(batchIngest.mock.calls[0]?.[0].failures).toHaveLength(2);
    expect(batchIngest.mock.calls[1]?.[0].heartbeats).toHaveLength(0);
    expect(batchIngest.mock.calls[1]?.[0].failures).toHaveLength(5);
    expect(result.probeSuccess).toBe(198);
    expect(result.probeFailure).toBe(7);
    expect(result.ingestSuccess).toBe(5);
    expect(result.ingestFailure).toBe(200);
  });
});
