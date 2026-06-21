import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "../src/api-client.js";

const envelope = <T>(data: T) => ({ data, meta: { request_id: null }, error: null });

describe("ApiClient", () => {
  it("fetches all target pages", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(envelope({ targets: [{ id: "a" }], next_cursor: "next" })))
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(envelope({ targets: [{ id: "b" }], next_cursor: null })))
      );
    const client = new ApiClient({
      baseUrl: "http://localhost/api/v1",
      collectorKey: "key",
      pageSize: 1,
      fetchImpl,
    });
    expect((await client.fetchAllTargets()).map((target) => target.id)).toEqual(["a", "b"]);
  });

  it("submits one atomic probe cycle", async () => {
    const result = {
      accepted: true,
      duplicate: false,
      cycle_id: "cycle",
      classification: "accepted",
      accepted_observations: 1,
      rejected_server_ids: [],
    } as const;
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify(envelope(result))));
    const client = new ApiClient({
      baseUrl: "http://localhost/api/v1",
      collectorKey: "key",
      pageSize: 500,
      fetchImpl,
    });
    const body = {
      submission_id: "00000000-0000-4000-8000-000000000100",
      collector_instance_id: "primary",
      slot_start: "2026-06-21T00:00:00.000Z",
      started_at: "2026-06-21T00:00:00.000Z",
      completed_at: "2026-06-21T00:00:01.000Z",
      observations: [
        {
          server_id: "server",
          observed_at: "2026-06-21T00:00:00.500Z",
          result: "online" as const,
          online_players: 4,
        },
      ],
    };
    expect(await client.ingestProbeCycle(body)).toEqual(result);
    expect(fetchImpl).toHaveBeenCalledWith(
      new URL("http://localhost/api/v1/collector/probe-cycles"),
      expect.objectContaining({ method: "POST", body: JSON.stringify(body) })
    );
  });
});
