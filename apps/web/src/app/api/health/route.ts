import { NextResponse } from "next/server";

import { getApiBaseUrl, getApiBasicAuthHeader } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

export type ApiHealthStatus = "ok" | "degraded" | "down";

const HEALTH_FETCH_TIMEOUT_MS = 3_000;

// Candidate health URLs, tried in order:
//  1. Versioned `/api/v1/healthz` — routes through a gateway/nginx that only
//     forwards `/api/*` (the same path family every other API call uses).
//  2. Root `/healthz` — for a directly-reachable API, or an older backend that
//     predates the versioned route. Falling back here means a new frontend
//     paired with an old backend doesn't false-alarm as "unreachable".
// Deduped when the API base has no version segment to strip.
const getHealthUrls = (): string[] => {
  // getApiBaseUrl() already strips a trailing slash; redo it here so the version
  // regex below can't be defeated by an unexpected trailing slash in the base.
  const base = getApiBaseUrl().replace(/\/$/, "");
  const versioned = `${base}/healthz`;
  const root = `${base.replace(/\/api\/v\d+$/, "")}/healthz`;
  return versioned === root ? [versioned] : [versioned, root];
};

interface HealthBody {
  // New API: status nested under `data`. Older API: a bare `{ status }`.
  data?: { status?: string } | null;
  status?: string;
}

const isHealthStatus = (value: unknown): value is ApiHealthStatus =>
  value === "ok" || value === "degraded" || value === "down";

// Probe one URL. Returns a health status if the API answered usefully, or
// `null` if this candidate was unreachable/not-found so the next can be tried.
const probe = async (
  url: string,
  headers: Record<string, string>
): Promise<ApiHealthStatus | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers,
      cache: "no-store",
      // Don't follow redirects: a 3xx to e.g. a login/SSO page could otherwise
      // resolve to a healthy-looking 2xx.
      redirect: "manual",
      signal: controller.signal,
    });

    // The API returns 503 with a structured body when down — that's a real,
    // usable answer. A 404 (route missing on an old backend) or other non-2xx
    // is "not this URL"; return null so the caller can try the next candidate.
    if (res.ok || res.status === 503) {
      const body = (await res.json().catch(() => null)) as HealthBody | null;
      const reported = body?.data?.status ?? body?.status;
      if (isHealthStatus(reported)) return reported;
      // Reachable 2xx but unrecognized payload — the API is up, so don't cry
      // "down". A 503 we can't parse is genuinely down.
      return res.ok ? "ok" : "down";
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export async function GET(): Promise<NextResponse> {
  const headers: Record<string, string> = {};
  const auth = getApiBasicAuthHeader();
  if (auth) {
    headers.Authorization = auth;
  }

  let status: ApiHealthStatus = "down";
  for (const url of getHealthUrls()) {
    const result = await probe(url, headers);
    if (result !== null) {
      status = result;
      break;
    }
    // else: this candidate was unreachable/not-found — try the next one.
  }

  return NextResponse.json({ status }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
