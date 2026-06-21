"use server";

import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE, getApiBaseUrl } from "@/lib/auth-config";

interface Envelope<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } | null;
}

export type ListingActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export interface ProbeResult {
  reachable: boolean;
  ping_ms: number | null;
  online_players: number | null;
  max_players: number | null;
  minecraft_version: string | null;
  motd: string | null;
}

export interface VerificationToken {
  token: string;
  dns_record_name: string;
}

export interface VerificationCheckResult {
  verified: true;
  ownership_proof: string;
}

export interface CreatedListing {
  slug: string;
  name: string;
}

export type VerificationMethod = "motd" | "dns";
export type ListingGame = "mc_java" | "mc_bedrock" | "hytale";

export interface AvailabilityResult {
  name_available: boolean | null;
  address_available: boolean | null;
}

export interface MyListing {
  id: string;
  slug: string;
  name: string;
  description: string;
  host: string;
  port: number;
  game: ListingGame;
  catalog_status: "active" | "suspended" | "archived";
  freshness_status: "online" | "offline" | "unknown";
  country_code: string | null;
  logo_url: string | null;
  banner_url: string | null;
  verified_at: string | null;
  verification_method: VerificationMethod | null;
  created_at: string;
  tags: string[];
  latest_metrics: {
    ping_ms: number | null;
    online_players: number | null;
    max_players: number | null;
    minecraft_version: string | null;
    occurred_at: string | null;
  };
}

export interface PublishListingInput {
  name: string;
  description: string;
  host: string;
  port: number;
  game: ListingGame;
  geyser_enabled?: boolean;
  country_code?: string;
  reach_scope?: "local" | "regional" | "global";
  method: VerificationMethod;
  ownership_proof: string;
  tags?: string[];
}

const requestApi = async <T>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: unknown
): Promise<ListingActionResult<T>> => {
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
      message: "We couldn't reach the server. Please try again.",
    };
  }

  const payload = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !payload || payload.error || payload.data === null) {
    return {
      ok: false,
      code: payload?.error?.code ?? "REQUEST_FAILED",
      message: payload?.error?.message ?? "Something went wrong. Please try again.",
    };
  }

  return { ok: true, data: payload.data };
};

export async function probeServerAction(
  host: string,
  port: number,
  game: ListingGame = "mc_java"
): Promise<ListingActionResult<ProbeResult>> {
  return requestApi<ProbeResult>("POST", "/listings/probe", { host, port, game });
}

export async function requestVerificationTokenAction(
  host: string,
  port: number
): Promise<ListingActionResult<VerificationToken>> {
  return requestApi<VerificationToken>("POST", "/listings/verification/token", { host, port });
}

export async function checkVerificationAction(
  host: string,
  port: number,
  method: VerificationMethod,
  game: ListingGame = "mc_java"
): Promise<ListingActionResult<VerificationCheckResult>> {
  return requestApi<VerificationCheckResult>("POST", "/listings/verification/check", {
    host,
    port,
    method,
    game,
  });
}

export async function checkAvailabilityAction(input: {
  name?: string;
  host?: string;
  port?: number;
}): Promise<ListingActionResult<AvailabilityResult>> {
  const params = new URLSearchParams();
  if (input.name) params.set("name", input.name);
  if (input.host) params.set("host", input.host);
  if (input.port) params.set("port", String(input.port));
  return requestApi<AvailabilityResult>("GET", `/listings/availability?${params.toString()}`);
}

export async function publishServerAction(
  input: PublishListingInput
): Promise<ListingActionResult<CreatedListing>> {
  const result = await requestApi<{ server: CreatedListing }>("POST", "/listings", input);
  return result.ok ? { ok: true, data: result.data.server } : result;
}

export async function fetchMyListingsAction(): Promise<ListingActionResult<MyListing[]>> {
  const result = await requestApi<{ servers: MyListing[] }>("GET", "/listings/mine");
  return result.ok ? { ok: true, data: result.data.servers } : result;
}

export async function deleteListingAction(
  id: string
): Promise<ListingActionResult<{ deleted: true; id: string }>> {
  return requestApi<{ deleted: true; id: string }>("DELETE", `/listings/${id}`);
}
