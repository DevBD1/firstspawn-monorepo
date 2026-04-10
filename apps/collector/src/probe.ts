import type { CollectorTarget, ProbeResult } from "./types.js";

export interface MinecraftProbeClient {
  probe(target: CollectorTarget, timeoutMs: number): Promise<ProbeResult>;
}

type StatusFn = (
  host: string,
  port: number,
  options: { timeout: number; enableSRV: boolean }
) => Promise<Record<string, unknown>>;

const toNumberOrNull = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const toStringOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const normalizeProbeHost = (host: string): string => {
  const trimmed = host.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

export class MinecraftServerUtilProbeClient implements MinecraftProbeClient {
  private readonly status: StatusFn;

  public constructor(status: StatusFn) {
    this.status = status;
  }

  public async probe(target: CollectorTarget, timeoutMs: number): Promise<ProbeResult> {
    const startedAt = Date.now();
    const response = await this.status(normalizeProbeHost(target.host), target.port, {
      timeout: timeoutMs,
      enableSRV: true,
    });
    const pingMs = Math.max(0, Date.now() - startedAt);

    const playersOnline = toNumberOrNull(
      (response as { players?: { online?: unknown } }).players?.online
    );
    const playersMax = toNumberOrNull((response as { players?: { max?: unknown } }).players?.max);
    const protocolVersion = toNumberOrNull(
      (response as { version?: { protocol?: unknown } }).version?.protocol
    );
    const minecraftVersion = toStringOrNull(
      (response as { version?: { name?: unknown } }).version?.name
    );

    return {
      pingMs,
      onlinePlayers: playersOnline,
      maxPlayers: playersMax,
      protocolVersion,
      minecraftVersion,
      payload: response as unknown as Record<string, unknown>,
    };
  }
}

export const createDefaultProbeClient = async (): Promise<MinecraftProbeClient> => {
  const module = (await import("minecraft-server-util")) as unknown as {
    status?: StatusFn;
  };
  if (typeof module.status !== "function") {
    throw new Error("minecraft-server-util status function not available");
  }
  return new MinecraftServerUtilProbeClient(module.status);
};
