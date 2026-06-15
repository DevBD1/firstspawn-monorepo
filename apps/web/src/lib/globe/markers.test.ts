import { describe, it, expect } from "vitest";

import type { ServerGeoPoint } from "@/lib/servers-api";
import { jitterForSlug, markerRadiusForPlayers, buildBeacons } from "./markers";

describe("jitterForSlug", () => {
  it("is deterministic for the same slug", () => {
    const a = jitterForSlug("aurora-smp", 39, -98);
    const b = jitterForSlug("aurora-smp", 39, -98);
    expect(a).toEqual(b);
  });

  it("keeps the offset within the requested bound", () => {
    const [lat, lng] = jitterForSlug("some-server", 10, 20, 2.4);
    expect(Math.abs(lat - 10)).toBeLessThanOrEqual(2.4);
    expect(Math.abs(lng - 20)).toBeLessThanOrEqual(2.4);
  });

  it("clamps latitude to the poles", () => {
    const [lat] = jitterForSlug("polar", 84.9, 0, 5);
    expect(lat).toBeLessThanOrEqual(85);
    expect(lat).toBeGreaterThanOrEqual(-85);
  });

  it("usually separates different slugs", () => {
    const a = jitterForSlug("server-one", 0, 0);
    const b = jitterForSlug("server-two", 0, 0);
    expect(a).not.toEqual(b);
  });
});

describe("markerRadiusForPlayers", () => {
  it("uses the floor for null or zero players", () => {
    expect(markerRadiusForPlayers(null)).toBe(4);
    expect(markerRadiusForPlayers(0)).toBe(4);
  });

  it("grows with player count but stays clamped", () => {
    expect(markerRadiusForPlayers(100)).toBeGreaterThan(markerRadiusForPlayers(10));
    expect(markerRadiusForPlayers(10_000_000)).toBeLessThanOrEqual(14);
  });
});

describe("buildBeacons", () => {
  const make = (over: Partial<ServerGeoPoint>): ServerGeoPoint => ({
    slug: "s",
    name: "Server",
    game: "mc_java",
    country_code: "US",
    latitude: 39,
    longitude: -98,
    reach_scope: "local",
    online_players: 0,
    freshness_status: "online",
    ...over,
  });

  it("flags global servers and orders busier servers last", () => {
    const beacons = buildBeacons([
      make({ slug: "quiet", online_players: 5, reach_scope: "global" }),
      make({ slug: "busy", online_players: 900 }),
    ]);
    expect(beacons[beacons.length - 1]!.slug).toBe("busy");
    const quiet = beacons.find((b) => b.slug === "quiet")!;
    expect(quiet.isGlobal).toBe(true);
  });
});
