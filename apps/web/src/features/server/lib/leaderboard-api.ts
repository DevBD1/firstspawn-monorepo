import { getApiBaseUrl, getApiBasicAuthHeader } from "@/lib/auth-config";

const PAGE_REVALIDATE_SECONDS = 60;

type FetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

export type LeaderboardMonth = "current" | "previous";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  votes: number;
}

export interface LeaderboardResponse {
  /** Calendar month the entries belong to, e.g. "2026-06". */
  month: string;
  /** True when this is a closed, finalized previous month. */
  finalized: boolean;
  entries: LeaderboardEntry[];
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

export async function fetchLeaderboard(
  slug: string,
  month: LeaderboardMonth,
  init: FetchInit = defaultFetchInit()
): Promise<LeaderboardResponse | null> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}/servers/${encodeURIComponent(slug)}/leaderboard`);
  url.searchParams.set("month", month);

  const response = await fetch(url.toString(), {
    headers: getHeaders(),
    ...init,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return payload.data as LeaderboardResponse;
}
