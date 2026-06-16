import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { servers } from "@firstspawn/database/schema";
import { createTestApp, type TestContext } from "./helpers.js";

describe("collector integration", () => {
  let context: TestContext | undefined;

  const getContext = (): TestContext => {
    if (!context) {
      throw new Error("Test context is not initialized.");
    }

    return context;
  };

  const collectorKey = "test-collector-key";

  beforeEach(async () => {
    process.env.API_COLLECTOR_KEY = collectorKey;
    context = await createTestApp();
  });

  afterEach(async () => {
    delete process.env.API_COLLECTOR_KEY;

    if (context) {
      await context.close();
      context = undefined;
    }
  });

  const createServer = async (overrides: Partial<typeof servers.$inferInsert> = {}) => {
    const now = new Date();
    const serverId = randomUUID();
    const [row] = await getContext()
      .app.db.db.insert(servers)
      .values({
        id: serverId,
        slug: `srv-${randomUUID().slice(0, 8)}`,
        name: `Test Server ${serverId.slice(0, 8)}`,
        description: "Test",
        host: "127.0.0.1",
        port: 25565,
        game: "mc_java",
        status: "active",
        authMode: "official",
        countryCode: "US",
        createdAt: now,
        updatedAt: now,
        ...overrides,
      })
      .returning();

    return row;
  };

  it("supports cursor pagination for active mc_java targets only", async () => {
    const base = new Date("2026-04-10T00:00:00.000Z");
    const first = await createServer({
      slug: "first",
      createdAt: new Date(base.getTime() + 1000),
      updatedAt: new Date(base.getTime() + 1000),
    });
    await createServer({
      slug: "ignored-archived",
      status: "archived",
      createdAt: new Date(base.getTime() + 1500),
      updatedAt: new Date(base.getTime() + 1500),
    });
    await createServer({
      slug: "ignored-bedrock",
      game: "mc_bedrock",
      createdAt: new Date(base.getTime() + 1600),
      updatedAt: new Date(base.getTime() + 1600),
    });
    const second = await createServer({
      slug: "second",
      createdAt: new Date(base.getTime() + 2000),
      updatedAt: new Date(base.getTime() + 2000),
    });

    const pageOne = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/collector/targets?limit=1",
      headers: {
        "x-collector-key": collectorKey,
      },
    });

    expect(pageOne.statusCode).toBe(200);
    expect(pageOne.json().data.targets).toHaveLength(1);
    expect(pageOne.json().data.targets[0].id).toBe(first.id);
    expect(pageOne.json().data.targets[0].country_code).toBe("US");
    expect(pageOne.json().data.next_cursor).toBeTruthy();

    const pageTwo = await getContext().app.inject({
      method: "GET",
      url: `/api/v1/collector/targets?limit=1&cursor=${encodeURIComponent(pageOne.json().data.next_cursor)}`,
      headers: {
        "x-collector-key": collectorKey,
      },
    });

    expect(pageTwo.statusCode).toBe(200);
    expect(pageTwo.json().data.targets).toHaveLength(1);
    expect(pageTwo.json().data.targets[0].id).toBe(second.id);
    expect(pageTwo.json().data.next_cursor).toBeNull();
  });

  it("does not duplicate targets when multiple rows share a cursor timestamp", async () => {
    const createdAt = new Date("2026-04-10T00:00:00.000Z");
    const first = await createServer({
      slug: "same-time-first",
      createdAt,
      updatedAt: createdAt,
    });
    const second = await createServer({
      slug: "same-time-second",
      createdAt,
      updatedAt: createdAt,
    });
    const third = await createServer({
      slug: "same-time-third",
      createdAt,
      updatedAt: createdAt,
    });
    const expectedIds = [first.id, second.id, third.id].sort();

    const pageOne = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/collector/targets?limit=2",
      headers: {
        "x-collector-key": collectorKey,
      },
    });

    expect(pageOne.statusCode).toBe(200);
    expect(pageOne.json().data.targets).toHaveLength(2);
    expect(pageOne.json().data.next_cursor).toBeTruthy();

    const pageTwo = await getContext().app.inject({
      method: "GET",
      url: `/api/v1/collector/targets?limit=2&cursor=${encodeURIComponent(pageOne.json().data.next_cursor)}`,
      headers: {
        "x-collector-key": collectorKey,
      },
    });

    expect(pageTwo.statusCode).toBe(200);
    expect(pageTwo.json().data.targets).toHaveLength(1);
    expect(pageTwo.json().data.next_cursor).toBeNull();

    const actualIds = [
      ...pageOne.json().data.targets.map((target: { id: string }) => target.id),
      ...pageTwo.json().data.targets.map((target: { id: string }) => target.id),
    ].sort();
    expect(actualIds).toEqual(expectedIds);
  });

  it("keeps old never-probed active servers in collector targets", async () => {
    const oldActive = await createServer({
      slug: "old-never-probed",
      createdAt: new Date("2026-04-01T00:00:00.000Z"),
      updatedAt: new Date("2026-04-01T00:00:00.000Z"),
      lastPingAt: null,
    });

    const response = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/collector/targets?limit=10",
      headers: {
        "x-collector-key": collectorKey,
      },
    });

    expect(response.statusCode).toBe(200);
    const ids = response.json().data.targets.map((target: { id: string }) => target.id);
    expect(ids).toContain(oldActive.id);
  });

  it("rejects requests with bad collector key", async () => {
    const response = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/collector/targets",
      headers: {
        "x-collector-key": "wrong",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("AUTH_FORBIDDEN");
  });

  it("returns duplicate success for repeated idempotency key", async () => {
    const server = await createServer();

    const first = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/heartbeats",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: {
        server_id: server.id,
        occurred_at: "2026-04-10T10:00:00.000Z",
        idempotency_key: "same-key",
        ping_ms: 42,
      },
    });

    expect(first.statusCode).toBe(200);
    expect(first.json().data.duplicate).toBe(false);

    const duplicate = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/heartbeats",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: {
        server_id: server.id,
        occurred_at: "2026-04-10T10:00:00.000Z",
        idempotency_key: "same-key",
        ping_ms: 42,
      },
    });

    expect(duplicate.statusCode).toBe(200);
    expect(duplicate.json().data.duplicate).toBe(true);
  });

  it("accepts explicit null optional heartbeat metrics", async () => {
    const server = await createServer();

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/heartbeats",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: {
        server_id: server.id,
        occurred_at: "2026-04-10T10:00:00.000Z",
        idempotency_key: "null-metrics",
        ping_ms: 42,
        online_players: null,
        max_players: null,
        uptime_seconds: null,
        protocol_version: null,
        minecraft_version: null,
      },
    });

    expect(response.statusCode).toBe(200);
  });

  it("accepts out-of-order samples but keeps last_ping_at monotonic", async () => {
    const server = await createServer();

    const newer = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/heartbeats",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: {
        server_id: server.id,
        occurred_at: "2026-04-10T11:00:00.000Z",
        idempotency_key: "newer",
        ping_ms: 33,
      },
    });

    expect(newer.statusCode).toBe(200);

    const older = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/heartbeats",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: {
        server_id: server.id,
        occurred_at: "2026-04-10T10:00:00.000Z",
        idempotency_key: "older",
        ping_ms: 55,
      },
    });

    expect(older.statusCode).toBe(200);

    const updated = await getContext().app.db.db.query.servers.findFirst({
      where: (table, { eq }) => eq(table.id, server.id),
      columns: { lastPingAt: true },
    });

    expect(updated?.lastPingAt?.toISOString()).toBe("2026-04-10T11:00:00.000Z");
  });

  it("persists probe failure state without changing catalog status", async () => {
    const server = await createServer();

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/probe-attempts",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: {
        server_id: server.id,
        occurred_at: "2026-04-10T12:00:00.000Z",
        result: "failure",
        error_code: "network_unreachable",
      },
    });

    expect(response.statusCode).toBe(200);

    const updated = await getContext().app.db.db.query.servers.findFirst({
      where: (table, { eq }) => eq(table.id, server.id),
      columns: {
        status: true,
        lastProbeAttemptAt: true,
        lastProbeFailureAt: true,
        consecutiveProbeFailures: true,
        lastProbeErrorCode: true,
        probeStatus: true,
      },
    });

    expect(updated).toMatchObject({
      status: "active",
      consecutiveProbeFailures: 1,
      lastProbeErrorCode: "network_unreachable",
      probeStatus: "unreachable",
    });
    expect(updated?.lastProbeAttemptAt?.toISOString()).toBe("2026-04-10T12:00:00.000Z");
    expect(updated?.lastProbeFailureAt?.toISOString()).toBe("2026-04-10T12:00:00.000Z");
  });

  it("resets probe failure state on successful heartbeat", async () => {
    const server = await createServer({
      consecutiveProbeFailures: 3,
      lastProbeErrorCode: "timeout",
      probeStatus: "unreachable",
      lastProbeAttemptAt: new Date("2026-04-10T09:00:00.000Z"),
      lastProbeFailureAt: new Date("2026-04-10T09:00:00.000Z"),
    });

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/heartbeats",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: {
        server_id: server.id,
        occurred_at: "2026-04-10T13:00:00.000Z",
        idempotency_key: "success-after-failure",
        ping_ms: 21,
      },
    });

    expect(response.statusCode).toBe(200);

    const updated = await getContext().app.db.db.query.servers.findFirst({
      where: (table, { eq }) => eq(table.id, server.id),
      columns: {
        lastProbeAttemptAt: true,
        lastProbeSuccessAt: true,
        consecutiveProbeFailures: true,
        lastProbeErrorCode: true,
        probeStatus: true,
      },
    });

    expect(updated?.lastProbeAttemptAt?.toISOString()).toBe("2026-04-10T13:00:00.000Z");
    expect(updated?.lastProbeSuccessAt?.toISOString()).toBe("2026-04-10T13:00:00.000Z");
    expect(updated?.consecutiveProbeFailures).toBe(0);
    expect(updated?.lastProbeErrorCode).toBeNull();
    expect(updated?.probeStatus).toBe("online");
  });

  it("returns 409 for archived or suspended targets", async () => {
    const archived = await createServer({ status: "archived", slug: "archived-srv" });
    const suspended = await createServer({ status: "suspended", slug: "suspended-srv" });

    const archivedRes = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/heartbeats",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: {
        server_id: archived.id,
        occurred_at: "2026-04-10T10:00:00.000Z",
        idempotency_key: "archived-key",
        ping_ms: 12,
      },
    });

    expect(archivedRes.statusCode).toBe(409);
    expect(archivedRes.json().error.code).toBe("SERVER_NOT_COLLECTABLE");

    const suspendedRes = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/heartbeats",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: {
        server_id: suspended.id,
        occurred_at: "2026-04-10T10:00:00.000Z",
        idempotency_key: "suspended-key",
        ping_ms: 12,
      },
    });

    expect(suspendedRes.statusCode).toBe(409);
    expect(suspendedRes.json().error.code).toBe("SERVER_NOT_COLLECTABLE");
  });

  it("batch-ingest processes heartbeats and failures, caching in Redis and writing to DB conditionally", async () => {
    const server1 = await createServer();
    const server2 = await createServer();
    const server3 = await createServer();

    const payload = {
      heartbeats: [
        {
          server_id: server1.id,
          occurred_at: "2026-04-10T10:00:00.000Z",
          idempotency_key: "batch-key-1",
          ping_ms: 10,
          online_players: 5,
          max_players: 100,
        },
        {
          server_id: server2.id,
          occurred_at: "2026-04-10T10:00:00.000Z",
          idempotency_key: "batch-key-2",
          ping_ms: 20,
          online_players: 10,
          max_players: 100,
        },
      ],
      failures: [
        {
          server_id: server3.id,
          occurred_at: "2026-04-10T10:00:00.000Z",
          result: "failure",
          error_code: "timeout",
        },
      ],
    };

    const firstRes = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/batch-ingest",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload,
    });

    expect(firstRes.statusCode).toBe(200);
    expect(firstRes.json().data.accepted).toBe(true);
    expect(firstRes.json().data.heartbeats).toEqual([
      { server_id: server1.id, duplicate: false },
      { server_id: server2.id, duplicate: false },
    ]);
    expect(firstRes.json().data.failures).toEqual([{ server_id: server3.id }]);

    const dbHb1Count = await getContext().app.db.db.query.serverHeartbeats.findMany({
      where: (table, { eq }) => eq(table.serverId, server1.id),
    });
    expect(dbHb1Count).toHaveLength(1);

    const payload2 = {
      heartbeats: [
        {
          server_id: server1.id,
          occurred_at: "2026-04-10T10:10:00.000Z",
          idempotency_key: "batch-key-1-2",
          ping_ms: 11,
          online_players: 5,
          max_players: 100,
        },
        {
          server_id: server2.id,
          occurred_at: "2026-04-10T10:10:00.000Z",
          idempotency_key: "batch-key-2-2",
          ping_ms: 22,
          online_players: 13,
          max_players: 100,
        },
      ],
      failures: [],
    };

    const secondRes = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/batch-ingest",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: payload2,
    });

    expect(secondRes.statusCode).toBe(200);

    const dbHb1After = await getContext().app.db.db.query.serverHeartbeats.findMany({
      where: (table, { eq }) => eq(table.serverId, server1.id),
    });
    expect(dbHb1After).toHaveLength(1);

    const dbHb2After = await getContext().app.db.db.query.serverHeartbeats.findMany({
      where: (table, { eq }) => eq(table.serverId, server2.id),
    });
    expect(dbHb2After).toHaveLength(2);
  });

  it("rejects batch-ingest payloads above the total record limit", async () => {
    const heartbeats = Array.from({ length: 201 }, (_, index) => ({
      server_id: randomUUID(),
      occurred_at: "2026-04-10T10:00:00.000Z",
      idempotency_key: `oversized-batch-${index}`,
      ping_ms: 10,
    }));

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/collector/batch-ingest",
      headers: {
        "x-collector-key": collectorKey,
      },
      payload: {
        heartbeats,
        failures: [],
      },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error.code).toBe("VALIDATION_ERROR");
  });
});
