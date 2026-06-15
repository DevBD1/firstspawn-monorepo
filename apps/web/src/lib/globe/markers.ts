// Pure helpers for deriving deterministic beacon placement and styling from
// server geo data. Kept free of React/DOM so they can be unit-tested directly.

import type { ServerGeoPoint, ServerReachScope } from "@/lib/servers-api";

/** FNV-1a 32-bit hash — small, fast, and stable across runs. */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Deterministic per-server offset so multiple servers sharing a country centroid
 * don't stack on the exact same pixel. The same slug always yields the same
 * offset, keeping placement stable across renders and reloads.
 */
export function jitterForSlug(
  slug: string,
  lat: number,
  lng: number,
  maxDeg = 2.4
): [number, number] {
  const hash = fnv1a(slug);
  const a = (hash & 0xffff) / 0xffff; // [0, 1]
  const b = ((hash >>> 16) & 0xffff) / 0xffff; // [0, 1]
  const dLat = (a * 2 - 1) * maxDeg;
  const dLng = (b * 2 - 1) * maxDeg;
  const jLat = Math.max(-85, Math.min(85, lat + dLat));
  return [jLat, lng + dLng];
}

/**
 * Beacon radius (px) scaled by online player count — the primary "highlight"
 * signal on the globe. Uses a log scale so a handful of huge servers don't
 * dwarf everyone else, and clamps to a readable range.
 */
export function markerRadiusForPlayers(players: number | null): number {
  const count = Math.max(0, players ?? 0);
  const radius = 4 + Math.min(10, Math.log10(count + 1) * 3.2);
  return Math.round(radius * 10) / 10;
}

export type BeaconStatus = "online" | "offline" | "unknown";

/** A server beacon ready to be projected and rendered. */
export interface GlobeBeacon {
  slug: string;
  name: string;
  countryCode: string;
  lat: number;
  lng: number;
  players: number | null;
  status: BeaconStatus;
  reach: ServerReachScope;
  radius: number;
  isGlobal: boolean;
}

/**
 * Turn raw geo points into deterministic, jittered beacons sorted so that the
 * most prominent servers render last (on top). Stable ordering by slug keeps
 * the z-order from flickering between renders.
 */
export function buildBeacons(servers: ServerGeoPoint[]): GlobeBeacon[] {
  return servers
    .map((s) => {
      const [lat, lng] = jitterForSlug(s.slug, s.latitude, s.longitude);
      return {
        slug: s.slug,
        name: s.name,
        countryCode: s.country_code,
        lat,
        lng,
        players: s.online_players,
        status: s.freshness_status,
        reach: s.reach_scope,
        radius: markerRadiusForPlayers(s.online_players),
        isGlobal: s.reach_scope === "global",
      };
    })
    .sort((a, b) => {
      const ap = a.players ?? 0;
      const bp = b.players ?? 0;
      if (ap !== bp) return ap - bp; // busier servers drawn on top
      return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
    });
}
