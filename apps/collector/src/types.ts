export interface CollectorTarget {
  id: string;
  slug: string;
  host: string;
  port: number;
  game: "mc_java";
  country_code: string | null;
  created_at: string;
}

export interface CollectorTargetsPage {
  items: CollectorTarget[];
  nextCursor: string | null;
}

export interface HeartbeatPayload {
  server_id: string;
  occurred_at: string;
  idempotency_key: string;
  ping_ms: number;
  online_players: number | null;
  max_players: number | null;
  protocol_version: number | null;
  minecraft_version: string | null;
  uptime_seconds?: number | null;
  payload?: Record<string, unknown>;
}

export interface ProbeFailurePayload {
  server_id: string;
  occurred_at: string;
  result: "failure";
  error_code: string;
}

export interface IngestResult {
  accepted: boolean;
  duplicate: boolean;
}

export interface ProbeResult {
  pingMs: number;
  onlinePlayers: number | null;
  maxPlayers: number | null;
  protocolVersion: number | null;
  minecraftVersion: string | null;
  payload: Record<string, unknown>;
}
