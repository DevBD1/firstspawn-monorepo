import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "../src/api-client.js";

const envelope = <T>(data: T) => ({
  data,
  meta: { request_id: "req-1" },
  error: null,
});

describe("ApiClient", () => {
  it("fetches paginated targets across all pages", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            envelope({
              targets: [
                {
                  id: "a",
                  slug: "one",
                  host: "1.1.1.1",
                  port: 25565,
                  game: "mc_java",
                  region: null,
                },
              ],
              next_cursor: "next-1",
            })
          ),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            envelope({
              targets: [
                {
                  id: "b",
                  slug: "two",
                  host: "2.2.2.2",
                  port: 25565,
                  game: "mc_java",
                  region: "eu",
                },
              ],
              next_cursor: null,
            })
          ),
          { status: 200 }
        )
      );

    const client = new ApiClient({
      baseUrl: "http://localhost:8000/api/v1",
      collectorKey: "secret",
      pageSize: 1,
      fetchImpl: fetchMock,
    });

    const targets = await client.fetchAllTargets();
    expect(targets.map((target) => target.id)).toEqual(["a", "b"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("waits until api is ready before continuing", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify(
            envelope({
              targets: [],
              next_cursor: null,
            })
          ),
          { status: 200 }
        )
      );

    const sleep = vi.fn<(ms: number) => Promise<void>>().mockResolvedValue();
    const logger = {
      info: vi.fn(),
    };

    const client = new ApiClient({
      baseUrl: "http://localhost:8000/api/v1",
      collectorKey: "secret",
      pageSize: 1,
      fetchImpl: fetchMock,
    });

    await client.waitUntilReady({
      retryDelayMs: 25,
      sleep,
      logger,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith("[collector] waiting for api readiness: fetch failed");
  });

  it("records probe failure attempts", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify(
          envelope({
            accepted: true,
          })
        ),
        { status: 200 }
      )
    );

    const client = new ApiClient({
      baseUrl: "http://localhost:8000/api/v1",
      collectorKey: "secret",
      pageSize: 1,
      fetchImpl: fetchMock,
    });

    await client.recordProbeFailure({
      server_id: "srv-a",
      occurred_at: "2026-04-10T08:00:00.000Z",
      result: "failure",
      error_code: "network_unreachable",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://localhost:8000/api/v1/collector/probe-attempts"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          server_id: "srv-a",
          occurred_at: "2026-04-10T08:00:00.000Z",
          result: "failure",
          error_code: "network_unreachable",
        }),
      })
    );
  });

  it("includes api rejection details in heartbeat ingest errors", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: null,
          meta: { request_id: "req-1" },
          error: {
            code: "validation_error",
            message: "Request validation failed",
            details: { body: ["Expected integer"] },
          },
        }),
        { status: 422 }
      )
    );

    const client = new ApiClient({
      baseUrl: "http://localhost:8000/api/v1",
      collectorKey: "secret",
      pageSize: 1,
      fetchImpl: fetchMock,
    });

    await expect(
      client.ingestHeartbeat({
        server_id: "srv-a",
        occurred_at: "2026-04-10T08:00:00.000Z",
        idempotency_key: "srv-a:2026-04-10T08:00:00.000Z",
        ping_ms: 24,
        online_players: 100.25,
        max_players: 200,
        protocol_version: 765,
        minecraft_version: "1.20.4",
      })
    ).rejects.toThrow("Expected integer");
  });
});
