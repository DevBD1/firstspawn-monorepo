import { getApiBaseUrl, getApiBasicAuthHeader } from "./auth-config";

const PAGE_REVALIDATE_SECONDS = 60;

type FetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export type PublicServerSort = "players" | "ping";
export type PublicServerGame = "mc_java" | "mc_bedrock";
export type PublicServerTier = "common" | "rare" | "epic" | "legendary";

export interface PublicServerListItem {
  slug: string;
  name: string;
  description: string;
  game: PublicServerGame;
  catalog_status: "active" | "archived";
  freshness_status: "online" | "offline" | "unknown";
  auth_mode: "official" | "offline_allowed" | "unknown";
  country_code: string | null;
  logo_url: string | null;
  banner_url: string | null;
  last_ping_at: string | null;
  latest_metrics: {
    ping_ms: number | null;
    online_players: number | null;
    max_players: number | null;
    minecraft_version: string | null;
    occurred_at: string | null;
  };
}

export interface PublicServerDetail {
  slug: string;
  name: string;
  description: string;
  game: PublicServerGame;
  catalog_status: "active" | "archived";
  freshness_status: "online" | "offline" | "unknown";
  auth_mode: "official" | "offline_allowed" | "unknown";
  country_code: string | null;
  logo_url: string | null;
  banner_url: string | null;
  last_ping_at: string | null;
  latest_metrics: {
    ping_ms: number | null;
    online_players: number | null;
    max_players: number | null;
    minecraft_version: string | null;
    occurred_at: string | null;
  };
  host: string;
  port: number;
  id: string;
  socials: Array<{
    platform: "website" | "discord" | "youtube" | "twitter" | "instagram" | "tiktok" | "facebook";
    url: string;
    display_order: number;
  }>;
  supported_clients: Array<{
    client_name: PublicServerGame;
    client_version: string;
  }>;
  created_at: string;
  updated_at: string;
}

export type ServerReachScope = "local" | "regional" | "global";

export interface ServerGeoPoint {
  slug: string;
  name: string;
  game: PublicServerGame;
  /** Origin country (always a real place, never "WW"). */
  country_code: string;
  latitude: number;
  longitude: number;
  reach_scope: ServerReachScope;
  online_players: number | null;
  freshness_status: "online" | "offline" | "unknown";
}

export interface FetchServersParams {
  q?: string;
  freshness_status?: string;
  game?: PublicServerGame;
  tier?: PublicServerTier[];
  sort?: PublicServerSort;
  limit?: number;
  cursor?: string;
}

export interface FetchServersResponse {
  servers: PublicServerListItem[];
  pagination: {
    next_cursor: string | null;
    limit: number;
  };
}

const defaultFetchInit = (): FetchInit => ({
  next: { revalidate: PAGE_REVALIDATE_SECONDS },
});

const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const basicAuth = getApiBasicAuthHeader();
  if (basicAuth) {
    headers["Authorization"] = basicAuth;
  }
  return headers;
};

export async function fetchServers(
  params: FetchServersParams,
  init: FetchInit = defaultFetchInit()
): Promise<FetchServersResponse> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}/servers`);

  if (params.q) url.searchParams.set("q", params.q);
  if (params.freshness_status) url.searchParams.set("freshness_status", params.freshness_status);
  if (params.game) url.searchParams.set("game", params.game);
  if (params.tier && params.tier.length > 0) url.searchParams.set("tier", params.tier.join(","));
  if (params.sort) url.searchParams.set("sort", params.sort);
  if (params.limit) url.searchParams.set("limit", params.limit.toString());
  if (params.cursor) url.searchParams.set("cursor", params.cursor);

  const response = await fetch(url.toString(), {
    headers: getHeaders(),
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch servers: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return payload.data;
}

export interface PublicServerStats {
  checked_recently: number;
  total_active_servers: number;
  total_online_players: number;
}

export async function fetchServerStats(
  init: FetchInit = defaultFetchInit()
): Promise<PublicServerStats> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/servers/stats`;

  const response = await fetch(url, {
    headers: getHeaders(),
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch server stats: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return {
    checked_recently: payload.data.checked_recently ?? 0,
    total_active_servers: payload.data.total_active_servers,
    total_online_players: payload.data.total_online_players,
  };
}

export async function fetchServerGeo(
  init: FetchInit = defaultFetchInit()
): Promise<ServerGeoPoint[]> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/servers/geo`;

  const response = await fetch(url, {
    headers: getHeaders(),
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch server geo: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return payload.data.servers as ServerGeoPoint[];
}

export async function fetchServerDetail(
  slug: string,
  init: FetchInit = defaultFetchInit()
): Promise<PublicServerDetail | null> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/servers/${encodeURIComponent(slug)}`;

  const response = await fetch(url, {
    headers: getHeaders(),
    ...init,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch server detail: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return payload.data.server;
}
