import { lookup } from "node:dns/promises";
import { createConnection, isIP } from "node:net";

import { ApiError } from "../lib/api-error.js";

/** Game/software families a listing can target. */
export type ListingGame = "mc_java" | "mc_bedrock" | "hytale";

/** Whether a given game can be probed for a live MOTD (needed for MOTD-based ownership). */
export const gameSupportsMotd = (game: ListingGame): boolean => game !== "hytale";

/** Result of a live status probe against a server. */
export interface MinecraftProbeResult {
  reachable: boolean;
  pingMs: number | null;
  onlinePlayers: number | null;
  maxPlayers: number | null;
  minecraftVersion: string | null;
  motd: string | null;
}

type StatusFn = (
  host: string,
  port: number,
  options: { timeout: number; enableSRV: boolean }
) => Promise<Record<string, unknown>>;

type StatusBedrockFn = (
  host: string,
  port: number,
  options: { timeout: number }
) => Promise<Record<string, unknown>>;

const DEFAULT_TIMEOUT_MS = 5_000;

const toNonnegativeIntegerOrNull = (value: unknown): number | null =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;

const toStringOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

/** Strips IPv6 bracket notation so the value can be passed to the probe client and DNS lookups. */
export const normalizeProbeHost = (host: string): string => {
  const trimmed = host.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

const ipv4InRange = (parts: number[], prefix: number[], bits: number): boolean => {
  let remaining = bits;
  for (let index = 0; index < 4; index += 1) {
    if (remaining <= 0) {
      return true;
    }
    const maskBits = Math.min(8, remaining);
    const mask = (0xff << (8 - maskBits)) & 0xff;
    if ((parts[index]! & mask) !== (prefix[index]! & mask)) {
      return false;
    }
    remaining -= maskBits;
  }
  return true;
};

// Private, loopback, link-local, CGNAT, and reserved/documentation ranges.
const BLOCKED_IPV4_RANGES: Array<{ prefix: number[]; bits: number }> = [
  { prefix: [0, 0, 0, 0], bits: 8 },
  { prefix: [10, 0, 0, 0], bits: 8 },
  { prefix: [100, 64, 0, 0], bits: 10 },
  { prefix: [127, 0, 0, 0], bits: 8 },
  { prefix: [169, 254, 0, 0], bits: 16 },
  { prefix: [172, 16, 0, 0], bits: 12 },
  { prefix: [192, 0, 0, 0], bits: 24 },
  { prefix: [192, 0, 2, 0], bits: 24 },
  { prefix: [192, 88, 99, 0], bits: 24 },
  { prefix: [192, 168, 0, 0], bits: 16 },
  { prefix: [198, 18, 0, 0], bits: 15 },
  { prefix: [198, 51, 100, 0], bits: 24 },
  { prefix: [203, 0, 113, 0], bits: 24 },
  { prefix: [224, 0, 0, 0], bits: 4 },
  { prefix: [240, 0, 0, 0], bits: 4 },
];

const isBlockedIpv4 = (address: string): boolean => {
  const parts = address.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return true;
  }
  return BLOCKED_IPV4_RANGES.some((range) => ipv4InRange(parts, range.prefix, range.bits));
};

const isBlockedIpv6 = (address: string): boolean => {
  const normalized = address.toLowerCase().split("%")[0]!;

  if (normalized === "::1" || normalized === "::") {
    return true;
  }

  // IPv4-mapped (::ffff:a.b.c.d) — validate the embedded IPv4 address.
  const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) {
    return isBlockedIpv4(mapped[1]!);
  }

  const firstHextet = Number.parseInt(normalized.split(":")[0] || "0", 16);
  // fc00::/7 unique-local, fe80::/10 link-local, ff00::/8 multicast.
  if ((firstHextet & 0xfe00) === 0xfc00) {
    return true;
  }
  if ((firstHextet & 0xffc0) === 0xfe80) {
    return true;
  }
  if ((firstHextet & 0xff00) === 0xff00) {
    return true;
  }

  return false;
};

const blockedHostError = (host: string): ApiError =>
  new ApiError({
    statusCode: 422,
    code: "HOST_NOT_ALLOWED",
    message: "The provided host is not a publicly reachable address.",
    details: { field: "host", host },
  });

/**
 * Guards the user-supplied host against SSRF: rejects loopback, private,
 * link-local, and reserved addresses, resolving hostnames first so a public
 * name that points at an internal IP is also blocked.
 */
export const assertPublicHost = async (host: string): Promise<void> => {
  const normalized = normalizeProbeHost(host);
  const literalFamily = isIP(normalized);

  if (literalFamily === 4) {
    if (isBlockedIpv4(normalized)) {
      throw blockedHostError(host);
    }
    return;
  }

  if (literalFamily === 6) {
    if (isBlockedIpv6(normalized)) {
      throw blockedHostError(host);
    }
    return;
  }

  let resolved: Array<{ address: string; family: number }>;
  try {
    resolved = await lookup(normalized, { all: true });
  } catch {
    throw new ApiError({
      statusCode: 422,
      code: "HOST_UNRESOLVABLE",
      message: "The provided host could not be resolved.",
      details: { field: "host", host },
    });
  }

  for (const entry of resolved) {
    const blocked =
      entry.family === 6 ? isBlockedIpv6(entry.address) : isBlockedIpv4(entry.address);
    if (blocked) {
      throw blockedHostError(host);
    }
  }
};

let cachedProbe: { status: StatusFn; statusBedrock: StatusBedrockFn } | null = null;

const loadProbe = async (): Promise<{ status: StatusFn; statusBedrock: StatusBedrockFn }> => {
  if (cachedProbe) {
    return cachedProbe;
  }

  const probeModule = (await import("minecraft-server-util")) as unknown as {
    status?: StatusFn;
    statusBedrock?: StatusBedrockFn;
  };
  if (typeof probeModule.status !== "function" || typeof probeModule.statusBedrock !== "function") {
    throw new Error("minecraft-server-util status functions not available");
  }

  cachedProbe = { status: probeModule.status, statusBedrock: probeModule.statusBedrock };
  return cachedProbe;
};

const UNREACHABLE: MinecraftProbeResult = {
  reachable: false,
  pingMs: null,
  onlinePlayers: null,
  maxPlayers: null,
  minecraftVersion: null,
  motd: null,
};

const parseStatusResponse = (
  response: Record<string, unknown>,
  pingMs: number
): MinecraftProbeResult => {
  const players = (response as { players?: { online?: unknown; max?: unknown } }).players;
  const motd = (response as { motd?: { clean?: unknown } }).motd;

  return {
    reachable: true,
    pingMs,
    onlinePlayers: toNonnegativeIntegerOrNull(players?.online),
    maxPlayers: toNonnegativeIntegerOrNull(players?.max),
    minecraftVersion: toStringOrNull((response as { version?: { name?: unknown } }).version?.name),
    motd: toStringOrNull(motd?.clean),
  };
};

/**
 * Hytale (and any non-Minecraft target) has no MOTD status protocol we speak,
 * so reachability is a plain TCP connect within the timeout window.
 */
const probeTcpReachable = async (
  host: string,
  port: number,
  timeoutMs: number
): Promise<MinecraftProbeResult> => {
  const startedAt = Date.now();
  return new Promise<MinecraftProbeResult>((resolve) => {
    const socket = createConnection({ host, port });
    let settled = false;
    const finish = (reachable: boolean): void => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(
        reachable
          ? { ...UNREACHABLE, reachable: true, pingMs: Math.max(0, Date.now() - startedAt) }
          : UNREACHABLE
      );
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
};

/**
 * Probes a server for a live status snapshot. Runs the SSRF guard first; a guard
 * failure throws, while an unreachable server resolves to `reachable: false`.
 * Java uses the Java status protocol, Bedrock the RakNet status protocol, and
 * Hytale a plain TCP reachability check (no MOTD/player data available).
 */
export const probeServer = async (
  host: string,
  port: number,
  game: ListingGame = "mc_java",
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<MinecraftProbeResult> => {
  await assertPublicHost(host);
  const normalizedHost = normalizeProbeHost(host);

  if (game === "hytale") {
    return probeTcpReachable(normalizedHost, port, timeoutMs);
  }

  const { status, statusBedrock } = await loadProbe();
  const startedAt = Date.now();
  try {
    const response =
      game === "mc_bedrock"
        ? await statusBedrock(normalizedHost, port, { timeout: timeoutMs })
        : await status(normalizedHost, port, { timeout: timeoutMs, enableSRV: false });
    return parseStatusResponse(response, Math.max(0, Date.now() - startedAt));
  } catch {
    return UNREACHABLE;
  }
};

/** @deprecated Use {@link probeServer}. Retained for the Java-only call sites. */
export const probeMinecraftServer = (
  host: string,
  port: number,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<MinecraftProbeResult> => probeServer(host, port, "mc_java", timeoutMs);
