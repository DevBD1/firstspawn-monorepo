import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { servers } from "@firstspawn/database/schema";
import { createTestApp, type TestContext } from "./helpers.js";

describe("public server read model", () => {
  let context: TestContext;
  beforeEach(async () => {
    context = await createTestApp();
  });
  afterEach(async () => {
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
          description: "A measured server",
          host: "127.0.0.1",
          port: 25565,
          game: "mc_java",
          status: "active",
          authMode: "official",
          countryCode: "US",
        })
        .returning()
    )[0]!;

  it("returns provenance-safe observation and availability fields", async () => {
    const server = await createServer();
    const response = await context.app.inject({
      method: "GET",
      url: `/api/v1/servers/${server.slug}`,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.server.latest_observation).toEqual({
      status: "unknown",
      observed_at: null,
      online_players: null,
      source: "firstspawn_probe",
    });
    expect(response.json().data.server.availability_30d).toEqual({
      percent: null,
      coverage_percent: 0,
      sufficient_data: false,
    });
    expect(response.json().data.server.latest_metrics).toBeUndefined();
  });

  it("accepts availability sorting and rejects the removed ping sort", async () => {
    await createServer();
    expect(
      (await context.app.inject({ method: "GET", url: "/api/v1/servers?sort=availability" }))
        .statusCode
    ).toBe(200);
    expect(
      (await context.app.inject({ method: "GET", url: "/api/v1/servers?sort=ping" })).statusCode
    ).toBe(422);
  });

  it("returns an empty measured analytics series before monitoring data exists", async () => {
    const server = await createServer();
    const response = await context.app.inject({
      method: "GET",
      url: `/api/v1/servers/${server.slug}/analytics?range=30d`,
    });
    expect(response.json().data).toMatchObject({
      range: "30d",
      source: "firstspawn_probe",
      points: [],
    });
  });
});
