"use server";

import { headers } from "next/headers";
import {
  fetchServers,
  fetchServerStats,
  fetchServerDetail,
  type FetchServersParams,
} from "@/lib/servers-api";
import { getApiBaseUrl, getApiBasicAuthHeader } from "@/lib/auth-config";
import {
  initialVoteState,
  type VoteErrorCode,
  type VoteState,
} from "@/features/server/lib/vote-state";

export async function loadMoreServers(params: FetchServersParams) {
  return fetchServers(params, { cache: "no-store" });
}

export async function getServerStats() {
  return fetchServerStats({ cache: "no-store" });
}

export async function getServerDetail(slug: string) {
  return fetchServerDetail(slug, { cache: "no-store" });
}

// ---------------------------------------------------------------------------
// Anonymous voting (v1-mvp §12)
// ---------------------------------------------------------------------------
// The vote is submitted from a `<form>` on the Server Detail page and routed
// through this Server Action (BFF) because the API sits behind basic auth and
// the browser cannot call it directly. We forward the resolved client IP via
// `X-Forwarded-For` so the API's existing `trustProxy` (apps/api/src/server.ts)
// derives `request.ip`; the API owns Turnstile Siteverify and the daily IP-HMAC
// uniqueness rules. Contract: docs/sprints/2026-06-27-api-contract.md §1.

interface VoteEnvelope {
  data: {
    vote: {
      server_slug: string;
      username_normalized: string;
      voted_on: string;
      votes_this_month: number;
      votes_all_time: number;
    };
  } | null;
  error: { code: string; message: string; details?: Record<string, unknown> } | null;
}

const KNOWN_VOTE_CODES = new Set<VoteErrorCode>([
  "INVALID_USERNAME",
  "TURNSTILE_REQUIRED",
  "TURNSTILE_FAILED",
  "SERVER_NOT_FOUND",
  "ALREADY_VOTED_TODAY",
  "SERVER_NOT_VOTABLE",
  "RATE_LIMITED",
]);

const resolveClientIp = (h: Headers): string | null => {
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip");
};

/**
 * Submits an anonymous vote for `slug`. Bind the slug with
 * `castVote.bind(null, slug)` and drive via `useActionState`.
 *
 * Reads `username` and the Turnstile token (`cf-turnstile-response`, injected by
 * the `<Turnstile>` widget) from the submitted form.
 */
export async function castVote(
  slug: string,
  _prevState: VoteState,
  formData: FormData
): Promise<VoteState> {
  const username = String(formData.get("username") ?? "").trim();
  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");

  const requestHeaders = await headers();
  const clientIp = resolveClientIp(requestHeaders);
  const userAgent = requestHeaders.get("user-agent");

  const outgoing = new Headers({ "Content-Type": "application/json" });
  const basicAuth = getApiBasicAuthHeader();
  if (basicAuth) outgoing.set("Authorization", basicAuth);
  // Forwarded so the API's trustProxy resolves the real client IP for the
  // daily IP-HMAC uniqueness rule; arbitrary XFF is rejected upstream.
  if (clientIp) outgoing.set("X-Forwarded-For", clientIp);
  if (userAgent) outgoing.set("User-Agent", userAgent);

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/servers/${encodeURIComponent(slug)}/vote`, {
      method: "POST",
      headers: outgoing,
      cache: "no-store",
      body: JSON.stringify({ username, turnstile_token: turnstileToken }),
    });
  } catch (error) {
    console.error("[castVote] vote request failed:", error);
    return {
      ...initialVoteState,
      status: "error",
      code: "UNKNOWN",
      message: "Voting is temporarily unavailable. Please try again shortly.",
    };
  }

  const json = (await response.json().catch(() => null)) as VoteEnvelope | null;

  if (response.ok && json?.data?.vote) {
    const vote = json.data.vote;
    return {
      status: "success",
      code: null,
      message: null,
      votesThisMonth: vote.votes_this_month,
      votesAllTime: vote.votes_all_time,
      usernameNormalized: vote.username_normalized,
    };
  }

  const rawCode = json?.error?.code ?? "UNKNOWN";
  const code: VoteErrorCode = KNOWN_VOTE_CODES.has(rawCode as VoteErrorCode)
    ? (rawCode as VoteErrorCode)
    : "UNKNOWN";

  return {
    ...initialVoteState,
    status: "error",
    code,
    message: json?.error?.message ?? "Your vote could not be recorded.",
  };
}

export interface VoteStatus {
  votedToday: boolean;
  votesThisMonth: number;
  votesAllTime: number;
}

interface VoteStatusEnvelope {
  data: {
    voted_today: boolean;
    votes_this_month: number;
    votes_all_time: number;
  } | null;
}

/**
 * Reads whether the current client already voted for `slug` today (by the daily
 * IP-HMAC) plus live vote counts, so the vote form can reflect the real state on
 * load instead of resetting after a refresh. Forwards the client IP like castVote.
 */
export async function getVoteStatus(slug: string): Promise<VoteStatus | null> {
  const requestHeaders = await headers();
  const clientIp = resolveClientIp(requestHeaders);

  const outgoing = new Headers();
  const basicAuth = getApiBasicAuthHeader();
  if (basicAuth) outgoing.set("Authorization", basicAuth);
  if (clientIp) outgoing.set("X-Forwarded-For", clientIp);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/servers/${encodeURIComponent(slug)}/vote-status`,
      { method: "GET", headers: outgoing, cache: "no-store" }
    );
    if (!response.ok) return null;
    const json = (await response.json()) as VoteStatusEnvelope;
    if (!json.data) return null;
    return {
      votedToday: json.data.voted_today,
      votesThisMonth: json.data.votes_this_month,
      votesAllTime: json.data.votes_all_time,
    };
  } catch (error) {
    console.error("[getVoteStatus] failed:", error);
    return null;
  }
}
