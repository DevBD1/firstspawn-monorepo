import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { serverProbeObservations, servers } from "@firstspawn/database/schema";
import { createTestApp, type TestContext } from "./helpers.js";

describe("collector probe cycles", () => {
  let context: TestContext;
  const key = "test-collector-key";
  beforeEach(async () => {
    process.env.API_COLLECTOR_KEY = key;
    context = await createTestApp();
  });
  afterEach(async () => {
    delete process.env.API_COLLECTOR_KEY;
    await context.close();
  });
  const createServer = async () =>
    (
      await context.app.db.db
        .insert(servers)
        .values({
          id: randomUUID(),
          slug: `server-${randomUUID()}`,
          name: `Server ${randomUUID()}`,
          description: "Test",
          host: "127.0.0.1",
          port: 25565,
          game: "mc_java",
          status: "active",
          authMode: "official",
          countryCode: "US",
        })
        .returning()
    )[0]!;
  const cycle = (serverId: string, slot: string, result: "online" | "failure") => ({
    submission_id: randomUUID(),
    collector_instance_id: "primary",
    slot_start: slot,
    started_at: slot,
    completed_at: new Date(new Date(slot).getTime() + 1_000).toISOString(),
    observations: [
      result === "online"
        ? { server_id: serverId, observed_at: slot, result, online_players: 5 }
        : { server_id: serverId, observed_at: slot, result, error_code: "timeout" },
    ],
  });
  const post = (body: object) =>
    context.app.inject({
      method: "POST",
      url: "/api/v1/collector/probe-cycles",
      headers: { "x-collector-key": key },
      payload: body,
    });

  it("returns every active target without adaptive backoff", async () => {
    const server = await createServer();
    await context.app.db.db.update(servers).set({
      probeStatus: "offline",
      consecutiveProbeFailures: 20,
      lastProbeAttemptAt: new Date(),
    });
    const response = await context.app.inject({
      method: "GET",
      url: "/api/v1/collector/targets",
      headers: { "x-collector-key": key },
    });
    expect(
      response.json().data.targets.some((target: { id: string }) => target.id === server.id)
    ).toBe(true);
  });

  it("records warmup outcomes symmetrically and deduplicates an exact retry", async () => {
    const server = await createServer();
    const body = cycle(server.id, "2026-06-21T00:00:00.000Z", "failure");
    const first = await post(body);
    const duplicate = await post(body);
    expect(first.json().data.classification).toBe("warmup");
    expect(duplicate.json().data.duplicate).toBe(true);
    const observations = await context.app.db.db.select().from(serverProbeObservations);
    expect(observations).toHaveLength(1);
    expect(observations[0]?.outcome).toBe("offline");
  });

  it("rejects a different submission that reuses an instance slot", async () => {
    const server = await createServer();
    const body = cycle(server.id, "2026-06-21T00:00:00.000Z", "online");
    expect((await post(body)).statusCode).toBe(200);
    const conflict = await post({ ...body, submission_id: randomUUID() });
    expect(conflict.statusCode).toBe(409);
    expect(conflict.json().error.code).toBe("COLLECTOR_SLOT_CONFLICT");
  });

  it("accepts cycles larger than the former 2000-observation ceiling", async () => {
    const slot = "2026-06-21T00:00:00.000Z";
    const response = await post({
      submission_id: randomUUID(),
      collector_instance_id: "large-fleet",
      slot_start: slot,
      started_at: slot,
      completed_at: "2026-06-21T00:00:01.000Z",
      observations: Array.from({ length: 2_001 }, () => ({
        server_id: randomUUID(),
        observed_at: slot,
        result: "failure" as const,
        error_code: "timeout",
      })),
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.accepted_observations).toBe(0);
    expect(response.json().data.rejected_server_ids).toHaveLength(2_001);
  });

  it("marks offline only after two usable failures", async () => {
    const server = await createServer();
    for (const slot of ["00:00", "00:10", "00:20"])
      await post(cycle(server.id, `2026-06-21T${slot}:00.000Z`, "online"));
    await post(cycle(server.id, "2026-06-21T00:30:00.000Z", "failure"));
    let state = await context.app.db.db.query.servers.findFirst({
      where: (table, { eq }) => eq(table.id, server.id),
    });
    expect(state?.probeStatus).toBe("online");
    await post(cycle(server.id, "2026-06-21T00:40:00.000Z", "failure"));
    state = await context.app.db.db.query.servers.findFirst({
      where: (table, { eq }) => eq(table.id, server.id),
    });
    expect(state?.probeStatus).toBe("offline");
  });

  it("turns every quarantined result into unknown and preserves current state", async () => {
    const fleet = await Promise.all(Array.from({ length: 100 }, () => createServer()));
    const makeFleetCycle = (slot: string, successCount: number) => ({
      submission_id: randomUUID(),
      collector_instance_id: "quarantine-test",
      slot_start: slot,
      started_at: slot,
      completed_at: new Date(new Date(slot).getTime() + 1_000).toISOString(),
      observations: fleet.map((server, index) =>
        index < successCount
          ? {
              server_id: server.id,
              observed_at: slot,
              result: "online" as const,
              online_players: 5,
            }
          : {
              server_id: server.id,
              observed_at: slot,
              result: "failure" as const,
              error_code: "timeout",
            }
      ),
    });
    for (const slot of ["00:00", "00:10", "00:20"])
      await post(makeFleetCycle(`2026-06-21T${slot}:00.000Z`, 100));
    const quarantined = await post(makeFleetCycle("2026-06-21T00:30:00.000Z", 1));
    expect(quarantined.json().data.classification).toBe("quarantined");
    const observations = await context.app.db.db.query.serverProbeObservations.findMany({
      where: (table, { eq }) => eq(table.slotStart, new Date("2026-06-21T00:30:00.000Z")),
    });
    expect(observations).toHaveLength(100);
    expect(observations.every((observation) => observation.outcome === "unknown")).toBe(true);
    expect(observations.every((observation) => observation.onlinePlayers === null)).toBe(true);
    const state = await context.app.db.db.query.servers.findFirst({
      where: (table, { eq }) => eq(table.id, fleet[0]!.id),
    });
    expect(state?.probeStatus).toBe("online");
  });
});
