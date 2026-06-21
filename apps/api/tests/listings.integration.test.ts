import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { serverSupportedClients, serverTags, servers, users } from "@firstspawn/database/schema";
import { createTestApp, type TestContext } from "./helpers.js";

const mocks = vi.hoisted(() => ({
  status: vi.fn(),
  statusBedrock: vi.fn(),
  lookup: vi.fn(),
  resolveTxt: vi.fn(),
}));

vi.mock("minecraft-server-util", () => ({
  status: mocks.status,
  statusBedrock: mocks.statusBedrock,
}));
vi.mock("node:dns/promises", () => ({ lookup: mocks.lookup, resolveTxt: mocks.resolveTxt }));

const HOST = "play.example.com";
const PORT = 25565;

describe("listings integration", () => {
  let context: TestContext | undefined;

  const getContext = (): TestContext => {
    if (!context) {
      throw new Error("Test context is not initialized.");
    }
    return context;
  };

  const registerUser = async (
    overrides: { email?: string; username?: string } = {}
  ): Promise<{ accessToken: string; email: string }> => {
    const email = overrides.email ?? `owner_${randomUUID().slice(0, 8)}@example.com`;
    const username = overrides.username ?? `owner_${randomUUID().slice(0, 8).replace(/-/g, "")}`;
    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email,
        username,
        password: "StrongPass123!",
        locale: "en",
        terms_accepted: true,
        privacy_accepted: true,
        marketing_consent: false,
      },
    });

    expect(response.statusCode).toBe(201);
    return { accessToken: response.json().data.tokens.access_token as string, email };
  };

  const requestToken = async (accessToken: string, host = HOST, port = PORT): Promise<string> => {
    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/verification/token",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { host, port },
    });
    expect(response.statusCode).toBe(200);
    return response.json().data.token as string;
  };

  // Verifies ownership over DNS (no probe/lookup needed) and returns the signed proof.
  const obtainProof = async (accessToken: string, host = HOST, port = PORT): Promise<string> => {
    const token = await requestToken(accessToken, host, port);
    mocks.resolveTxt.mockResolvedValueOnce([[token]]);
    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/verification/check",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { host, port, method: "dns" },
    });
    expect(response.statusCode).toBe(200);
    return response.json().data.ownership_proof as string;
  };

  const createListing = async (
    accessToken: string,
    ownershipProof: string,
    overrides: Record<string, unknown> = {}
  ) =>
    getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        name: `Emberfall ${randomUUID().slice(0, 8)}`,
        description: "A seasonal survival server.",
        host: HOST,
        port: PORT,
        country_code: "DE",
        method: "dns",
        ownership_proof: ownershipProof,
        tags: ["Survival", "Economy"],
        ...overrides,
      },
    });

  beforeEach(async () => {
    context = await createTestApp();
    mocks.status.mockReset();
    mocks.statusBedrock.mockReset();
    mocks.lookup.mockReset();
    mocks.resolveTxt.mockReset();
    // Default: host resolves to a public address so the SSRF guard passes.
    mocks.lookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
  });

  afterEach(async () => {
    if (context) {
      await context.close();
      context = undefined;
    }
  });

  it("requires authentication on listing endpoints", async () => {
    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/probe",
      payload: { host: HOST, port: PORT },
    });
    expect(response.statusCode).toBe(401);
  });

  it("probes a reachable server", async () => {
    const user = await registerUser();
    mocks.status.mockResolvedValueOnce({
      players: { online: 87, max: 150 },
      version: { name: "1.21.4" },
      motd: { clean: "Emberfall — seasonal survival" },
    });

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/probe",
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: { host: HOST, port: PORT },
    });

    expect(response.statusCode).toBe(200);
    const data = response.json().data;
    expect(data.reachable).toBe(true);
    expect(data.online_players).toBe(87);
    expect(data.minecraft_version).toBe("1.21.4");
    expect(data.motd).toContain("Emberfall");
    expect(mocks.status).toHaveBeenCalledWith(
      HOST,
      PORT,
      expect.objectContaining({ enableSRV: false })
    );
  });

  it("reports an unreachable server without erroring", async () => {
    const user = await registerUser();
    mocks.status.mockRejectedValueOnce(new Error("ETIMEDOUT"));

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/probe",
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: { host: HOST, port: PORT },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.reachable).toBe(false);
  });

  it("rejects probing a private/internal host (SSRF guard)", async () => {
    const user = await registerUser();

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/probe",
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: { host: "10.0.0.5", port: PORT },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error.code).toBe("HOST_NOT_ALLOWED");
    expect(mocks.status).not.toHaveBeenCalled();
  });

  it("derives a deterministic verification token", async () => {
    const user = await registerUser();
    const first = await requestToken(user.accessToken);
    const second = await requestToken(user.accessToken);
    expect(first).toBe(second);
    expect(first.startsWith("fs-verify-")).toBe(true);
  });

  it("fails verification when the token is absent", async () => {
    const user = await registerUser();
    await requestToken(user.accessToken);
    mocks.resolveTxt.mockResolvedValueOnce([["some-unrelated-record"]]);

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/verification/check",
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: { host: HOST, port: PORT, method: "dns" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error.code).toBe("VERIFICATION_FAILED");
  });

  it("rejects DNS verification for a private/internal host", async () => {
    const user = await registerUser();
    const token = await requestToken(user.accessToken, "internal.example.com");
    mocks.lookup.mockResolvedValueOnce([{ address: "10.0.0.5", family: 4 }]);
    mocks.resolveTxt.mockResolvedValueOnce([[token]]);

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/verification/check",
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: { host: "internal.example.com", port: PORT, method: "dns" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error.code).toBe("HOST_NOT_ALLOWED");
    expect(mocks.resolveTxt).not.toHaveBeenCalled();
  });

  it("verifies ownership via MOTD when the token is present", async () => {
    const user = await registerUser();
    const token = await requestToken(user.accessToken);
    mocks.status.mockResolvedValueOnce({
      players: { online: 1, max: 20 },
      version: { name: "1.21.4" },
      motd: { clean: `Welcome! ${token}` },
    });

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/verification/check",
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: { host: HOST, port: PORT, method: "motd" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.verified).toBe(true);
    expect(typeof response.json().data.ownership_proof).toBe("string");
  });

  it("creates a live listing owned by the user with tags and verifiedAt", async () => {
    const user = await registerUser();
    const proof = await obtainProof(user.accessToken);

    const response = await createListing(user.accessToken, proof, {
      name: "Emberfall Prime",
      tags: ["Survival", "Economy", "Towny"],
    });

    expect(response.statusCode).toBe(201);
    const server = response.json().data.server;
    expect(server.catalog_status).toBe("active");
    expect(server.slug.startsWith("emberfall-prime-")).toBe(true);
    expect([...server.tags].sort()).toEqual(["Economy", "Survival", "Towny"]);

    const app = getContext().app;
    const [ownerRow] = await app.db.db.select().from(users).where(eq(users.email, user.email));
    const [row] = await app.db.db.select().from(servers).where(eq(servers.id, server.id));
    expect(row.ownerId).toBe(ownerRow.id);
    expect(row.status).toBe("active");
    expect(row.verificationMethod).toBe("dns");
    expect(row.verifiedAt).not.toBeNull();

    const tagRows = await app.db.db
      .select()
      .from(serverTags)
      .where(eq(serverTags.serverId, server.id));
    expect(tagRows).toHaveLength(3);
  });

  it("hides freshly created listings until a heartbeat arrives but lists them publicly", async () => {
    const user = await registerUser();
    const proof = await obtainProof(user.accessToken);
    const created = await createListing(user.accessToken, proof, { name: "Emberfall Public" });
    expect(created.statusCode).toBe(201);

    const slug = created.json().data.server.slug;
    const detail = await getContext().app.inject({
      method: "GET",
      url: `/api/v1/servers/${slug}`,
    });
    expect(detail.statusCode).toBe(200);
    expect(detail.json().data.server.freshness_status).toBe("unknown");
  });

  it("rejects a forged or malformed ownership proof", async () => {
    const user = await registerUser();

    const response = await createListing(user.accessToken, "not-a-real-proof", {
      name: "Emberfall Forged",
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("OWNERSHIP_PROOF_INVALID");
  });

  it("rejects an ownership proof issued for a different host", async () => {
    const user = await registerUser();
    const proof = await obtainProof(user.accessToken, "play.other-host.com", PORT);

    const response = await createListing(user.accessToken, proof, {
      name: "Emberfall Mismatch",
      host: HOST,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("OWNERSHIP_PROOF_MISMATCH");
  });

  it("enforces the tag allowlist and the four-tag cap", async () => {
    const user = await registerUser();
    const proof = await obtainProof(user.accessToken);

    const invalidTag = await createListing(user.accessToken, proof, {
      name: "Emberfall BadTag",
      tags: ["NotARealTag"],
    });
    expect(invalidTag.statusCode).toBe(422);

    const proof2 = await obtainProof(user.accessToken);
    const tooMany = await createListing(user.accessToken, proof2, {
      name: "Emberfall TooMany",
      tags: ["Survival", "Economy", "Towny", "Quests", "RPG"],
    });
    expect(tooMany.statusCode).toBe(422);
  });

  it("returns 409 when the server name is already listed", async () => {
    const user = await registerUser();
    const name = `Emberfall Dup ${randomUUID().slice(0, 8)}`;

    const proof1 = await obtainProof(user.accessToken);
    const first = await createListing(user.accessToken, proof1, { name });
    expect(first.statusCode).toBe(201);

    // Different port so the address check passes and the duplicate-name path is exercised.
    const proof2 = await obtainProof(user.accessToken, HOST, 25566);
    const second = await createListing(user.accessToken, proof2, { name, port: 25566 });
    expect(second.statusCode).toBe(409);
    expect(second.json().error.code).toBe("VALIDATION_ERROR");
  });

  it("probes a Bedrock server via the Bedrock status protocol", async () => {
    const user = await registerUser();
    mocks.statusBedrock.mockResolvedValueOnce({
      players: { online: 12, max: 40 },
      version: { name: "1.21.40" },
      motd: { clean: "Bedrock Realm" },
    });

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/probe",
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: { host: HOST, port: 19132, game: "mc_bedrock" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.reachable).toBe(true);
    expect(response.json().data.online_players).toBe(12);
    expect(mocks.statusBedrock).toHaveBeenCalledWith(HOST, 19132, expect.any(Object));
    expect(mocks.status).not.toHaveBeenCalled();
  });

  it("rejects MOTD verification for Hytale (no MOTD protocol)", async () => {
    const user = await registerUser();
    await requestToken(user.accessToken);

    const response = await getContext().app.inject({
      method: "POST",
      url: "/api/v1/listings/verification/check",
      headers: { authorization: `Bearer ${user.accessToken}` },
      payload: { host: HOST, port: PORT, method: "motd", game: "hytale" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json().error.code).toBe("MOTD_UNSUPPORTED");
    expect(mocks.status).not.toHaveBeenCalled();
  });

  it("records Bedrock as a supported client when Geyser is enabled", async () => {
    const user = await registerUser();
    const proof = await obtainProof(user.accessToken);
    const response = await createListing(user.accessToken, proof, {
      name: "Emberfall Geyser",
      game: "mc_java",
      geyser_enabled: true,
    });
    expect(response.statusCode).toBe(201);
    const server = response.json().data.server;
    expect(server.game).toBe("mc_java");
    expect(
      server.supported_clients.map((c: { client_name: string }) => c.client_name).sort()
    ).toEqual(["mc_bedrock", "mc_java"]);

    const clientRows = await getContext()
      .app.db.db.select()
      .from(serverSupportedClients)
      .where(eq(serverSupportedClients.serverId, server.id));
    expect(clientRows).toHaveLength(2);
  });

  it("blocks a second listing on the same host:port but allows a different port", async () => {
    const user = await registerUser();
    const proof1 = await obtainProof(user.accessToken);
    const first = await createListing(user.accessToken, proof1, { name: "Emberfall Addr A" });
    expect(first.statusCode).toBe(201);

    const proof2 = await obtainProof(user.accessToken);
    const dup = await createListing(user.accessToken, proof2, { name: "Emberfall Addr B" });
    expect(dup.statusCode).toBe(409);
    expect(dup.json().error.code).toBe("ADDRESS_TAKEN");

    const proof3 = await obtainProof(user.accessToken, HOST, 25566);
    const otherPort = await createListing(user.accessToken, proof3, {
      name: "Emberfall Addr C",
      port: 25566,
    });
    expect(otherPort.statusCode).toBe(201);
  });

  it("reports name and address availability", async () => {
    const user = await registerUser();
    const proof = await obtainProof(user.accessToken);
    const created = await createListing(user.accessToken, proof, { name: "Emberfall Taken" });
    expect(created.statusCode).toBe(201);

    const response = await getContext().app.inject({
      method: "GET",
      url: `/api/v1/listings/availability?name=${encodeURIComponent("Emberfall Taken")}&host=${HOST}&port=${PORT}`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data.name_available).toBe(false);
    expect(response.json().data.address_available).toBe(false);

    const free = await getContext().app.inject({
      method: "GET",
      url: `/api/v1/listings/availability?name=${encodeURIComponent("Totally Free Name")}&host=${HOST}&port=25599`,
      headers: { authorization: `Bearer ${user.accessToken}` },
    });
    expect(free.json().data.name_available).toBe(true);
    expect(free.json().data.address_available).toBe(true);
  });

  it("lists only the caller's own servers and supports owner-scoped delete", async () => {
    const owner = await registerUser();
    const stranger = await registerUser();

    const proof = await obtainProof(owner.accessToken);
    const created = await createListing(owner.accessToken, proof, { name: "Emberfall Mine" });
    expect(created.statusCode).toBe(201);
    const serverId = created.json().data.server.id;

    const mine = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/listings/mine",
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });
    expect(mine.statusCode).toBe(200);
    expect(mine.json().data.servers).toHaveLength(1);
    expect(mine.json().data.servers[0].id).toBe(serverId);

    const strangerMine = await getContext().app.inject({
      method: "GET",
      url: "/api/v1/listings/mine",
      headers: { authorization: `Bearer ${stranger.accessToken}` },
    });
    expect(strangerMine.json().data.servers).toHaveLength(0);

    // A stranger cannot delete someone else's server (404, not 403).
    const forbidden = await getContext().app.inject({
      method: "DELETE",
      url: `/api/v1/listings/${serverId}`,
      headers: { authorization: `Bearer ${stranger.accessToken}` },
    });
    expect(forbidden.statusCode).toBe(404);

    const deleted = await getContext().app.inject({
      method: "DELETE",
      url: `/api/v1/listings/${serverId}`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });
    expect(deleted.statusCode).toBe(200);
    expect(deleted.json().data.deleted).toBe(true);

    const rows = await getContext()
      .app.db.db.select()
      .from(servers)
      .where(eq(servers.id, serverId));
    expect(rows).toHaveLength(0);
  });
});
