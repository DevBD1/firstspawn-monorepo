import { describe, expect, it, vi } from "vitest";
import { MinecraftServerUtilProbeClient } from "../src/probe.js";
import type { CollectorTarget } from "../src/types.js";

const baseTarget: CollectorTarget = {
  id: "srv-1",
  slug: "srv-1",
  host: "example.com",
  port: 25565,
  game: "mc_java",
  region: null,
};

describe("MinecraftServerUtilProbeClient", () => {
  it("passes raw host for domain and ipv4 hosts", async () => {
    const status = vi.fn().mockResolvedValue({
      players: { online: 12, max: 100 },
      version: { protocol: 765, name: "1.20.4" },
    });
    const client = new MinecraftServerUtilProbeClient(status);

    await client.probe({ ...baseTarget, host: "203.0.113.10" }, 5000);

    expect(status).toHaveBeenCalledWith("203.0.113.10", 25565, {
      timeout: 5000,
      enableSRV: true,
    });
  });

  it("normalizes bracketed ipv6 host before probing", async () => {
    const status = vi.fn().mockResolvedValue({
      players: { online: 0, max: 20 },
      version: { protocol: 766, name: "1.21.0" },
    });
    const client = new MinecraftServerUtilProbeClient(status);

    await client.probe({ ...baseTarget, host: "[2001:db8::7]" }, 5000);

    expect(status).toHaveBeenCalledWith("2001:db8::7", 25565, {
      timeout: 5000,
      enableSRV: true,
    });
  });

  it("drops heartbeat metrics that would fail api validation", async () => {
    const status = vi.fn().mockResolvedValue({
      players: { online: 42, max: 20 },
      version: { protocol: 765.5, name: "1.20.4" },
    });
    const client = new MinecraftServerUtilProbeClient(status);

    const result = await client.probe(baseTarget, 5000);

    expect(result.onlinePlayers).toBe(42);
    expect(result.maxPlayers).toBeNull();
    expect(result.protocolVersion).toBeNull();
  });

  it("drops non-integer and negative player counts", async () => {
    const status = vi.fn().mockResolvedValue({
      players: { online: -1, max: 100.25 },
      version: { protocol: 765, name: "1.20.4" },
    });
    const client = new MinecraftServerUtilProbeClient(status);

    const result = await client.probe(baseTarget, 5000);

    expect(result.onlinePlayers).toBeNull();
    expect(result.maxPlayers).toBeNull();
    expect(result.protocolVersion).toBe(765);
  });
});
