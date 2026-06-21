import { describe, expect, it, vi } from "vitest";
import { CollectorService } from "../src/service.js";

describe("CollectorService", () => {
  it("probes the fleet and submits one cycle with only liveness and players", async () => {
    const apiClient = {
      fetchAllTargets: vi.fn().mockResolvedValue([
        {
          id: "one",
          slug: "one",
          host: "one.test",
          port: 25565,
          game: "mc_java",
          created_at: "2026-06-21T00:00:00.000Z",
        },
      ]),
      ingestProbeCycle: vi.fn().mockResolvedValue({
        accepted: true,
        duplicate: false,
        cycle_id: "cycle",
        classification: "accepted",
        accepted_observations: 1,
        rejected_server_ids: [],
      }),
    };
    const metrics = {
      startCycle: vi.fn(),
      observeTargetProcessed: vi.fn(),
      observeProbeSuccess: vi.fn(),
      observeProbeFailure: vi.fn(),
      observeIngestSuccess: vi.fn(),
      observeIngestFailure: vi.fn(),
      finishCycle: vi.fn(),
    };
    const service = new CollectorService({
      apiClient: apiClient as never,
      probeClient: { probe: vi.fn().mockResolvedValue({ onlinePlayers: 7 }) } as never,
      metrics: metrics as never,
      collectorInstanceId: "primary",
      probeIntervalSeconds: 600,
      concurrency: 50,
      probeTimeoutMs: 5_000,
      now: () => new Date("2026-06-21T00:00:05.000Z"),
      logger: { info: vi.fn(), error: vi.fn() },
    });
    await service.runCycle(new Date("2026-06-21T00:00:00.000Z"));
    expect(apiClient.ingestProbeCycle).toHaveBeenCalledWith(
      expect.objectContaining({
        submission_id: expect.any(String),
        observations: [
          {
            server_id: "one",
            observed_at: "2026-06-21T00:00:05.000Z",
            result: "online",
            online_players: 7,
          },
        ],
      })
    );
    expect(metrics.observeIngestSuccess).toHaveBeenCalledTimes(1);
    expect(metrics.observeIngestFailure).not.toHaveBeenCalled();
  });

  it("counts a failed cycle ingest as one failed request", async () => {
    const metrics = {
      startCycle: vi.fn(),
      observeTargetProcessed: vi.fn(),
      observeProbeSuccess: vi.fn(),
      observeProbeFailure: vi.fn(),
      observeIngestSuccess: vi.fn(),
      observeIngestFailure: vi.fn(),
      finishCycle: vi.fn(),
    };
    const service = new CollectorService({
      apiClient: {
        fetchAllTargets: vi.fn().mockResolvedValue([
          { id: "one", host: "one.test", port: 25565 },
          { id: "two", host: "two.test", port: 25565 },
        ]),
        ingestProbeCycle: vi.fn().mockRejectedValue(new Error("unavailable")),
      } as never,
      probeClient: { probe: vi.fn().mockResolvedValue({ onlinePlayers: 1 }) } as never,
      metrics: metrics as never,
      collectorInstanceId: "collector-test-1",
      probeIntervalSeconds: 600,
      concurrency: 2,
      probeTimeoutMs: 5_000,
      now: () => new Date("2026-06-21T00:00:05.000Z"),
      logger: { info: vi.fn(), error: vi.fn() },
    });
    await service.runCycle(new Date("2026-06-21T00:00:00.000Z"));
    expect(metrics.observeIngestFailure).toHaveBeenCalledTimes(1);
    expect(metrics.observeIngestSuccess).not.toHaveBeenCalled();
  });
});
