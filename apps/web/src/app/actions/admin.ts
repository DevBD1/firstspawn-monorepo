"use server";

import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE, getApiBaseUrl } from "@/lib/auth-config";
import { getAuthState } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Admin catalog actions.
//
// These call the API's admin endpoints (/admin/servers...) with the signed-in
// user's bearer token. The API gates every one of them with requireAdminUser
// (email allowlist), so a non-admin token is rejected server-side regardless of
// what the UI shows. Admin-created servers carry no owner_id — they are the
// "owner is null" editorial listings from docs/releases/v1-mvp.md §5.1/§7.2.
// ---------------------------------------------------------------------------

interface Envelope<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } | null;
}

export type AdminActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; field?: string };

export type AdminCatalogStatus = "active" | "suspended" | "archived";
export type AdminAuthMode = "official" | "offline_allowed" | "unknown";
export type AdminReachScope = "local" | "regional" | "global";
export type AdminFreshness = "online" | "offline" | "unknown";
export type AdminSocialPlatform =
  | "website"
  | "discord"
  | "youtube"
  | "twitter"
  | "instagram"
  | "tiktok"
  | "facebook";

export interface AdminServer {
  id: string;
  slug: string;
  name: string;
  description: string;
  host: string;
  port: number;
  game: "mc_java";
  catalog_status: AdminCatalogStatus;
  freshness_status: AdminFreshness;
  auth_mode: AdminAuthMode;
  country_code: string | null;
  reach_scope: AdminReachScope;
  logo_url: string | null;
  banner_url: string | null;
  last_ping_at: string | null;
  created_at: string;
  updated_at: string;
  /** Null = editorial listing with no owner yet (claimable). */
  owner_id: string | null;
}

export interface AdminServerDetail extends AdminServer {
  latest_metrics: {
    ping_ms: number | null;
    online_players: number | null;
    max_players: number | null;
    minecraft_version: string | null;
    occurred_at: string | null;
  };
  socials: Array<{ platform: AdminSocialPlatform; url: string; display_order: number }>;
  supported_clients: Array<{ client_name: "mc_java" | "mc_bedrock"; client_version: string }>;
}

export interface AdminServerListResult {
  servers: AdminServer[];
  pagination: { next_cursor: string | null; limit: number };
}

export interface AdminListParams {
  q?: string;
  status?: AdminCatalogStatus;
  limit?: number;
  cursor?: string;
}

export interface CreateServerInput {
  name: string;
  host: string;
  port: number;
  description: string;
  slug?: string;
  status?: AdminCatalogStatus;
  auth_mode?: AdminAuthMode;
  country_code?: string | null;
  reach_scope?: AdminReachScope;
  logo_url?: string | null;
  banner_url?: string | null;
  supported_clients?: Array<{ client_name: "mc_java" | "mc_bedrock"; client_version: string }>;
  socials?: Array<{ platform: AdminSocialPlatform; url: string; display_order: number }>;
}

export type UpdateServerInput = Partial<Omit<CreateServerInput, "status">>;

const requestApi = async <T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<AdminActionResult<T>> => {
  // Defense in depth: refuse before we ever hit the network if the caller isn't
  // an admin. The API enforces this too, but failing here gives a clean message.
  const authState = await getAuthState();
  if (!authState.isAuthenticated || !authState.user?.is_admin) {
    return { ok: false, code: "AUTH_FORBIDDEN", message: "Admin access is required." };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return {
      ok: false,
      code: "AUTH_REQUIRED",
      message: "Your session expired. Please sign in again.",
    };
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${accessToken}`,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: "We couldn't reach the API. Please try again.",
    };
  }

  const payload = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !payload || payload.error || payload.data === null) {
    const field =
      payload?.error?.details && typeof payload.error.details.field === "string"
        ? payload.error.details.field
        : undefined;
    return {
      ok: false,
      code: payload?.error?.code ?? "REQUEST_FAILED",
      message: payload?.error?.message ?? "Something went wrong. Please try again.",
      field,
    };
  }

  return { ok: true, data: payload.data };
};

const buildListQuery = (params: AdminListParams): string => {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.cursor) search.set("cursor", params.cursor);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export async function adminListServersAction(
  params: AdminListParams = {}
): Promise<AdminActionResult<AdminServerListResult>> {
  return requestApi<AdminServerListResult>("GET", `/admin/servers${buildListQuery(params)}`);
}

// Safety cap so a runaway catalog can't loop forever: 50 pages × 100 = 5,000.
const MAX_ADMIN_PAGES = 50;

/**
 * Follows `next_cursor` to load the whole catalog, not just the first page —
 * the admin panel manages every server, not the first 100.
 */
export async function adminFetchAllServersAction(
  params: Omit<AdminListParams, "cursor" | "limit"> = {}
): Promise<AdminActionResult<{ servers: AdminServer[]; truncated: boolean }>> {
  const servers: AdminServer[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_ADMIN_PAGES; page++) {
    const result = await adminListServersAction({ ...params, limit: 100, cursor });
    if (!result.ok) {
      return result;
    }
    servers.push(...result.data.servers);
    const next = result.data.pagination.next_cursor;
    if (!next) {
      return { ok: true, data: { servers, truncated: false } };
    }
    cursor = next;
  }

  return { ok: true, data: { servers, truncated: true } };
}

export async function adminGetServerAction(
  id: string
): Promise<AdminActionResult<AdminServerDetail>> {
  const result = await requestApi<{ server: AdminServerDetail }>("GET", `/admin/servers/${id}`);
  return result.ok ? { ok: true, data: result.data.server } : result;
}

export async function adminCreateServerAction(
  input: CreateServerInput
): Promise<AdminActionResult<AdminServerDetail>> {
  const result = await requestApi<{ server: AdminServerDetail }>("POST", "/admin/servers", input);
  return result.ok ? { ok: true, data: result.data.server } : result;
}

export async function adminUpdateServerAction(
  id: string,
  input: UpdateServerInput
): Promise<AdminActionResult<AdminServerDetail>> {
  const result = await requestApi<{ server: AdminServerDetail }>(
    "PATCH",
    `/admin/servers/${id}`,
    input
  );
  return result.ok ? { ok: true, data: result.data.server } : result;
}

export async function adminSetServerStatusAction(
  id: string,
  status: AdminCatalogStatus
): Promise<AdminActionResult<AdminServerDetail>> {
  const result = await requestApi<{ server: AdminServerDetail }>(
    "PATCH",
    `/admin/servers/${id}/status`,
    { status }
  );
  return result.ok ? { ok: true, data: result.data.server } : result;
}
