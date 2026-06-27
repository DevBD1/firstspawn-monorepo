/** Known `error.code` values the vote endpoint can return. */
export type VoteErrorCode =
  | "INVALID_USERNAME"
  | "TURNSTILE_REQUIRED"
  | "TURNSTILE_FAILED"
  | "SERVER_NOT_FOUND"
  | "ALREADY_VOTED_TODAY"
  | "SERVER_NOT_VOTABLE"
  | "RATE_LIMITED"
  | "UNKNOWN";

/** Client-visible state returned by the anonymous vote Server Action. */
export interface VoteState {
  /** `idle` before submit; `success` / `error` after. */
  status: "idle" | "success" | "error";
  /** `ALREADY_VOTED_TODAY` is a soft, friendly state, not a hard error. */
  code: VoteErrorCode | null;
  message: string | null;
  votesThisMonth: number | null;
  votesAllTime: number | null;
  usernameNormalized: string | null;
}

/** Initial state for the server detail vote form. */
export const initialVoteState: VoteState = {
  status: "idle",
  code: null,
  message: null,
  votesThisMonth: null,
  votesAllTime: null,
  usernameNormalized: null,
};
