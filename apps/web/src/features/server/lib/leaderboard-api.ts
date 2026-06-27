// Types only. The leaderboard fetch runs through the `getLeaderboard` Server
// Action (apps/web/src/app/actions/servers.ts) because the API base URL and
// basic-auth credentials are server-only (apps/web/src/lib/config.ts) and must
// never run in the client bundle.

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
