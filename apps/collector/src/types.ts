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

export interface OnlineProbeObservation {
  server_id: string;
  observed_at: string;
  result: "online";
  online_players: number | null;
}

export interface FailedProbeObservation {
  server_id: string;
  observed_at: string;
  result: "failure";
  error_code: string;
}

export type ProbeObservation = OnlineProbeObservation | FailedProbeObservation;

export interface ProbeCyclePayload {
  submission_id: string;
  collector_instance_id: string;
  slot_start: string;
  started_at: string;
  completed_at: string;
  observations: ProbeObservation[];
}

export interface ProbeResult {
  pingMs: number;
  onlinePlayers: number | null;
  maxPlayers: number | null;
  protocolVersion: number | null;
  minecraftVersion: string | null;
  payload: Record<string, unknown>;
}

export interface ProbeCycleIngestResult {
  accepted: boolean;
  duplicate: boolean;
  cycle_id: string;
  classification: "accepted" | "warmup" | "quarantined";
  accepted_observations: number;
  rejected_server_ids: string[];
}
