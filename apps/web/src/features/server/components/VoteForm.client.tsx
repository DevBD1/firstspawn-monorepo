"use client";

import { useActionState, useEffect, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { WLButton } from "@firstspawn/ui";
import { castVote, getVoteStatus } from "@/app/actions/servers";
import { initialVoteState, type VoteState } from "@/features/server/lib/vote-state";

/**
 * Display strings for {@link VoteForm}. Defaults are English; the Server Detail
 * page passes localized overrides built from the dictionary (en/tr/de).
 */
export interface VoteFormLabels {
  heading: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  submitLabel: string;
  submitPendingLabel: string;
  votesThisMonth: string;
  votesAllTime: string;
  successTitle: string;
  successBody: string;
  alreadyVotedTitle: string;
  alreadyVotedBody: string;
  rewardEnabledNote: string;
  rewardNotEnabledNote: string;
  turnstileMissingNote: string;
  checkingStatus: string;
}

export const DEFAULT_VOTE_FORM_LABELS: VoteFormLabels = {
  heading: "Vote for this server",
  usernameLabel: "Minecraft Java username",
  usernamePlaceholder: "e.g. Notch",
  submitLabel: "Vote",
  submitPendingLabel: "Submitting…",
  votesThisMonth: "Votes this month",
  votesAllTime: "All-time votes",
  successTitle: "Thanks for voting!",
  successBody: "Your vote has been counted for this server.",
  alreadyVotedTitle: "You already voted today",
  alreadyVotedBody: "You can vote again after 00:00 UTC. Thanks for the support!",
  rewardEnabledNote: "This server delivers in-game rewards when you vote.",
  rewardNotEnabledNote:
    "This server hasn't enabled in-game vote rewards, but your vote still counts.",
  turnstileMissingNote: "Voting is temporarily unavailable.",
  checkingStatus: "Checking your vote status…",
};

interface VoteFormProps {
  slug: string;
  /** Whether the server has Votifier configured (controls the reward note). */
  votifierEnabled?: boolean;
  votesThisMonth?: number | null;
  votesAllTime?: number | null;
  labels?: Partial<VoteFormLabels>;
}

const numberFormatter = new Intl.NumberFormat();

export function VoteForm({
  slug,
  votifierEnabled = false,
  votesThisMonth = null,
  votesAllTime = null,
  labels,
}: VoteFormProps) {
  const copy = { ...DEFAULT_VOTE_FORM_LABELS, ...labels };
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const [state, action, isPending] = useActionState<VoteState, FormData>(
    castVote.bind(null, slug),
    initialVoteState
  );

  // Anonymous "already voted today" + live counts, resolved on load from the daily
  // IP-HMAC so a refresh reflects the real state instead of resetting the form.
  const [checking, setChecking] = useState(true);
  const [votedTodayOnLoad, setVotedTodayOnLoad] = useState(false);
  const [loadedThisMonth, setLoadedThisMonth] = useState<number | null>(null);
  const [loadedAllTime, setLoadedAllTime] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getVoteStatus(slug)
      .then((status) => {
        if (cancelled) return;
        if (status) {
          setVotedTodayOnLoad(status.votedToday);
          setLoadedThisMonth(status.votesThisMonth);
          setLoadedAllTime(status.votesAllTime);
        }
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Latest successful vote wins, then load-time status, then server-rendered props.
  const liveThisMonth = state.votesThisMonth ?? loadedThisMonth ?? votesThisMonth;
  const liveAllTime = state.votesAllTime ?? loadedAllTime ?? votesAllTime;

  const alreadyVoted =
    votedTodayOnLoad || (state.status === "error" && state.code === "ALREADY_VOTED_TODAY");
  const hardError = state.status === "error" && state.code !== "ALREADY_VOTED_TODAY";

  return (
    <section className="rounded-card border border-border bg-surface/60 p-6">
      <h2 className="font-display text-lg text-foreground">{copy.heading}</h2>

      {/* Votifier reward status — visible before voting (v1-mvp §12.4). */}
      <p className="mt-1 font-ui text-sm text-muted">
        {votifierEnabled ? copy.rewardEnabledNote : copy.rewardNotEnabledNote}
      </p>

      {(liveThisMonth !== null || liveAllTime !== null) && (
        <dl className="mt-4 flex gap-6">
          {liveThisMonth !== null && (
            <div>
              <dt className="font-ui text-xs uppercase tracking-wide text-muted">
                {copy.votesThisMonth}
              </dt>
              <dd className="font-display text-2xl text-foreground">
                {numberFormatter.format(liveThisMonth)}
              </dd>
            </div>
          )}
          {liveAllTime !== null && (
            <div>
              <dt className="font-ui text-xs uppercase tracking-wide text-muted">
                {copy.votesAllTime}
              </dt>
              <dd className="font-display text-2xl text-muted">
                {numberFormatter.format(liveAllTime)}
              </dd>
            </div>
          )}
        </dl>
      )}

      {state.status === "success" ? (
        <div className="mt-4 rounded-control border border-primary/40 bg-primary/10 px-4 py-3 font-ui text-base text-foreground">
          <p className="font-semibold">{copy.successTitle}</p>
          <p className="mt-1 text-muted">{copy.successBody}</p>
        </div>
      ) : alreadyVoted ? (
        <div className="mt-4 rounded-control border border-primary/30 bg-primary/5 px-4 py-3 font-ui text-base text-foreground">
          <p className="font-semibold">{copy.alreadyVotedTitle}</p>
          <p className="mt-1 text-muted">{copy.alreadyVotedBody}</p>
        </div>
      ) : checking ? (
        <p className="mt-4 font-ui text-sm text-muted">{copy.checkingStatus}</p>
      ) : (
        <form action={action} className="mt-4 flex flex-col gap-4">
          <label htmlFor="vote-username" className="flex flex-col gap-1">
            <span className="font-ui text-sm text-muted">{copy.usernameLabel}</span>
            <input
              id="vote-username"
              name="username"
              type="text"
              required
              autoComplete="off"
              placeholder={copy.usernamePlaceholder}
              className="rounded-control border border-border bg-background px-3 py-2 font-body text-base text-foreground"
            />
          </label>

          {hardError ? (
            <div className="rounded-control border border-danger/40 bg-danger/10 px-4 py-3 font-ui text-base text-danger">
              {state.message}
            </div>
          ) : null}

          {siteKey ? (
            <div className="flex justify-center">
              <Turnstile siteKey={siteKey} options={{ theme: "dark", action: "vote" }} />
            </div>
          ) : (
            <p className="font-ui text-sm text-muted">{copy.turnstileMissingNote}</p>
          )}

          <WLButton type="submit" disabled={isPending || !siteKey}>
            {isPending ? copy.submitPendingLabel : copy.submitLabel}
          </WLButton>
        </form>
      )}
    </section>
  );
}
