import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { inArray } from "drizzle-orm";

import { serverHeartbeats, servers } from "../src/db/schema.js";
import { createTestApp, type TestContext } from "./helpers.js";

describe("servers integration", () => {
  let context: TestContext | undefined;

  const getContext = (): TestContext => {
    if (!context) {
      throw new Error("Test context is not initialized.");
    }

    return context;
  };

  const registerUser = async (input: {
    email: string;
    username: string;
  }): Promise<{ accessToken: string }> => {
    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: input.email,
        username: input.username,
        password: "StrongPass123!",
        locale: "en",
        terms_accepted: true,
        privacy_accepted: true,
        marketing_consent: false,
      },
    });

    expect(response.statusCode).toBe(201);
    return {
      accessToken: response.json().data.tokens.access_token as string,
    };
  };

  const createServerAsAdmin = async (
    accessToken: string,
    overrides: Record<string, unknown> = {}
  ) => {
    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/admin/servers",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: "Test Server",
        description: "Test description",
        host: "play.example.com",
        port: 25565,
        game: "mc_java",
        online_mode: true,
        ...overrides,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().error).toBeNull();
    return response.json().data.server as {
      id: string;
      slug: string;
      catalog_status: string;
    };
  };

  beforeEach(async () => {
    process.env.API_ADMIN_EMAIL_ALLOWLIST = "admin@example.com";
    context = await createTestApp();
  });

  afterEach(async () => {
    if (context) {
      await context.close();
      context = undefined;
    }
    delete process.env.API_ADMIN_EMAIL_ALLOWLIST;
  });

  it("allows allowlisted admin to create a server with auto-generated slug", async () => {
    const admin = await registerUser({
      email: "admin@example.com",
      username: "admin_user",
    });

    const server = await createServerAsAdmin(admin.accessToken, {
      name: "Hypixel Network",
      slug: undefined,
    });

    expect(server.slug.startsWith("hypixel-network-")).toBe(true);
  });

  it("blocks non-allowlisted user from admin endpoints", async () => {
    const user = await registerUser({
      email: "normal@example.com",
      username: "normal_user",
    });

    const response = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/admin/servers",
      headers: {
        authorization: `Bearer ${user.accessToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("AUTH_FORBIDDEN");
  });

  it("supports slug rename and old slug returns 404", async () => {
    const admin = await registerUser({
      email: "admin@example.com",
      username: "admin_rename",
    });

    const created = await createServerAsAdmin(admin.accessToken, {
      slug: "first-slug",
    });

    const update = await getContext().app.inject({
      method: "PATCH",
      url: `/api/v1/admin/servers/${created.id}`,
      headers: {
        authorization: `Bearer ${admin.accessToken}`,
      },
      payload: {
        slug: "renamed-slug",
      },
    });

    expect(update.statusCode).toBe(200);
    expect(update.json().data.server.slug).toBe("renamed-slug");

    const oldSlug = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/servers/first-slug",
    });
    expect(oldSlug.statusCode).toBe(404);

    const newSlug = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/servers/renamed-slug",
    });
    expect(newSlug.statusCode).toBe(200);
    expect(newSlug.json().error).toBeNull();
  });

  it("returns slug conflict on create", async () => {
    const admin = await registerUser({
      email: "admin@example.com",
      username: "admin_conflict",
    });

    await createServerAsAdmin(admin.accessToken, {
      slug: "same-slug",
      name: "Server One",
    });

    const duplicate = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/admin/servers",
      headers: {
        authorization: `Bearer ${admin.accessToken}`,
      },
      payload: {
        slug: "same-slug",
        name: "Server Two",
        description: "Second server",
        host: "two.example.com",
        port: 25566,
        game: "mc_java",
        online_mode: true,
      },
    });

    expect(duplicate.statusCode).toBe(409);
    expect(duplicate.json().error.code).toBe("VALIDATION_ERROR");
    expect(duplicate.json().error.details.field).toBe("slug");
  });

  it("hides archived by default but includes archived when requested", async () => {
    const admin = await registerUser({
      email: "admin@example.com",
      username: "admin_archive",
    });

    const active = await createServerAsAdmin(admin.accessToken, {
      slug: "active-server",
      status: "active",
    });
    const archived = await createServerAsAdmin(admin.accessToken, {
      slug: "archived-server",
      status: "archived",
    });

    const defaultList = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/servers",
    });
    expect(defaultList.statusCode).toBe(200);
    const defaultSlugs = defaultList.json().data.servers.map((item: { slug: string }) => item.slug);
    expect(defaultSlugs).toContain(active.slug);
    expect(defaultSlugs).not.toContain(archived.slug);

    const includeArchived = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/servers?include_archived=true",
    });
    expect(includeArchived.statusCode).toBe(200);
    const allSlugs = includeArchived.json().data.servers.map((item: { slug: string }) => item.slug);
    expect(allSlugs).toContain(active.slug);
    expect(allSlugs).toContain(archived.slug);
  });

  it("returns latest heartbeat metrics in public list", async () => {
    const admin = await registerUser({
      email: "admin@example.com",
      username: "admin_metrics",
    });

    const first = await createServerAsAdmin(admin.accessToken, {
      slug: "metrics-one",
      name: "Metrics One",
    });
    const second = await createServerAsAdmin(admin.accessToken, {
      slug: "metrics-two",
      name: "Metrics Two",
    });

    const now = new Date();
    await getContext()
      .app.db.db.insert(serverHeartbeats)
      .values([
        {
          serverId: first.id,
          occurredAt: new Date("2026-04-10T09:00:00.000Z"),
          collectedAt: now,
          pingMs: 80,
          onlinePlayers: 8,
          maxPlayers: 80,
          minecraftVersion: "1.20.1",
          idempotencyKey: "metrics-one-old",
          createdAt: now,
          updatedAt: now,
        },
        {
          serverId: first.id,
          occurredAt: new Date("2026-04-10T10:00:00.000Z"),
          collectedAt: now,
          pingMs: 45,
          onlinePlayers: 14,
          maxPlayers: 80,
          minecraftVersion: "1.21.1",
          idempotencyKey: "metrics-one-new",
          createdAt: now,
          updatedAt: now,
        },
        {
          serverId: second.id,
          occurredAt: new Date("2026-04-10T11:00:00.000Z"),
          collectedAt: now,
          pingMs: 61,
          onlinePlayers: 5,
          maxPlayers: 60,
          minecraftVersion: "1.20.4",
          idempotencyKey: "metrics-two-new",
          createdAt: now,
          updatedAt: now,
        },
      ]);

    const response = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/servers?limit=10",
    });

    expect(response.statusCode).toBe(200);

    const items = response.json().data.servers as Array<{
      slug: string;
      latest_metrics: {
        ping_ms: number | null;
        online_players: number | null;
        max_players: number | null;
        minecraft_version: string | null;
        occurred_at: string | null;
      };
    }>;

    expect(items.find((item) => item.slug === "metrics-one")?.latest_metrics).toEqual({
      ping_ms: 45,
      online_players: 14,
      max_players: 80,
      minecraft_version: "1.21.1",
      occurred_at: "2026-04-10T10:00:00.000Z",
    });
    expect(items.find((item) => item.slug === "metrics-two")?.latest_metrics).toEqual({
      ping_ms: 61,
      online_players: 5,
      max_players: 60,
      minecraft_version: "1.20.4",
      occurred_at: "2026-04-10T11:00:00.000Z",
    });
  });

  it("uses latest heartbeat metrics in public stats", async () => {
    const admin = await registerUser({
      email: "admin@example.com",
      username: "admin_stats",
    });

    const first = await createServerAsAdmin(admin.accessToken, {
      slug: "stats-one",
      name: "Stats One",
    });
    const second = await createServerAsAdmin(admin.accessToken, {
      slug: "stats-two",
      name: "Stats Two",
    });

    const now = new Date();
    await getContext()
      .app.db.db.update(servers)
      .set({
        lastPingAt: now,
        lastProbeAttemptAt: now,
        probeStatus: "online",
      })
      .where(inArray(servers.id, [first.id, second.id]));

    await getContext()
      .app.db.db.insert(serverHeartbeats)
      .values([
        {
          serverId: first.id,
          occurredAt: new Date("2026-04-10T09:00:00.000Z"),
          collectedAt: now,
          onlinePlayers: 2,
          idempotencyKey: "stats-one-old",
          createdAt: now,
          updatedAt: now,
        },
        {
          serverId: first.id,
          occurredAt: new Date("2026-04-10T10:00:00.000Z"),
          collectedAt: now,
          onlinePlayers: 7,
          idempotencyKey: "stats-one-new",
          createdAt: now,
          updatedAt: now,
        },
        {
          serverId: second.id,
          occurredAt: new Date("2026-04-10T11:00:00.000Z"),
          collectedAt: now,
          onlinePlayers: 11,
          idempotencyKey: "stats-two-new",
          createdAt: now,
          updatedAt: now,
        },
      ]);

    const response = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/servers/stats",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual({
      total_active_servers: 2,
      total_online_players: 18,
    });
  });

  it("hides suspended servers from public detail with 404", async () => {
    const admin = await registerUser({
      email: "admin@example.com",
      username: "admin_suspend",
    });

    const suspended = await createServerAsAdmin(admin.accessToken, {
      slug: "suspended-server",
      status: "suspended",
    });
    expect(suspended.catalog_status).toBe("suspended");

    const response = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/servers/suspended-server",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("SERVER_NOT_FOUND");
  });
});
