"use client";

import React, { useEffect, useState } from "react";
import { WLButton } from "@firstspawn/ui";
import { getLeaderboard } from "@/app/actions/servers";
import type {
  LeaderboardEntry,
  LeaderboardMonth,
  LeaderboardResponse,
} from "@/features/server/lib/leaderboard-api";

export interface ServerLeaderboardLabels {
  title: string;
  currentMonth: string;
  previousMonth: string;
  unverifiedNameNote: string;
  emptyState: string;
  rankColumn: string;
  playerColumn: string;
  votesColumn: string;
  loading: string;
  errorState: string;
}

/**
 * Standalone English fallback so the component renders without a parent
 * dictionary. The server detail page passes localized strings instead.
 */
export const DEFAULT_LEADERBOARD_LABELS: ServerLeaderboardLabels = {
  title: "Top voters",
  currentMonth: "This month",
  previousMonth: "Last month",
  unverifiedNameNote:
    "Unverified Minecraft names. These names are submitted by voters and are not confirmed to belong to them.",
  emptyState: "No votes recorded for this month yet.",
  rankColumn: "Rank",
  playerColumn: "Player",
  votesColumn: "Votes",
  loading: "Loading leaderboard…",
  errorState: "We couldn’t load the leaderboard. Please try again.",
};

export interface ServerLeaderboardProps {
  slug: string;
  labels?: ServerLeaderboardLabels;
}

type LoadState = "loading" | "error" | "ready";

const formatVotes = (value: number) => value.toLocaleString();

function MonthToggle({
  month,
  labels,
  onSelect,
}: {
  month: LeaderboardMonth;
  labels: ServerLeaderboardLabels;
  onSelect: (next: LeaderboardMonth) => void;
}) {
  return (
    <div className="inline-flex shrink-0 gap-2" role="group" aria-label={labels.title}>
      <WLButton
        variant={month === "current" ? "primary" : "quiet"}
        size="sm"
        onClick={() => onSelect("current")}
        aria-pressed={month === "current"}
      >
        {labels.currentMonth}
      </WLButton>
      <WLButton
        variant={month === "previous" ? "primary" : "quiet"}
        size="sm"
        onClick={() => onSelect("previous")}
        aria-pressed={month === "previous"}
      >
        {labels.previousMonth}
      </WLButton>
    </div>
  );
}

function LeaderboardRow({
  entry,
  labels,
}: {
  entry: LeaderboardEntry;
  labels: ServerLeaderboardLabels;
}) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-control border border-border bg-secondary/40 px-3 py-2.5">
      <span className="font-mono text-sm font-bold text-fs-gold tabular-nums">
        <span className="sr-only">{labels.rankColumn} </span># {entry.rank}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-body text-sm font-semibold text-foreground">
          {entry.username}
        </span>
      </span>
      <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
        <span className="sr-only">{labels.votesColumn}: </span>
        {formatVotes(entry.votes)}
      </span>
    </li>
  );
}

export default function ServerLeaderboard({
  slug,
  labels = DEFAULT_LEADERBOARD_LABELS,
}: ServerLeaderboardProps) {
  const [month, setMonth] = useState<LeaderboardMonth>("current");
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<LeaderboardResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- reset to loading when slug/month changes before the fetch resolves */
    setState("loading");

    getLeaderboard(slug, month)
      .then((response) => {
        if (cancelled) return;
        setData(response);
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [slug, month]);

  const entries = data?.entries ?? [];
  const hasEntries = state === "ready" && entries.length > 0;

  return (
    <section className="space-y-4 rounded-panel border border-border bg-bg-panel p-4 shadow-card md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-foreground md:text-xl">{labels.title}</h2>
        <MonthToggle month={month} labels={labels} onSelect={setMonth} />
      </div>

      {/* Product rule §14: voter names are never confirmed identities. */}
      <p className="rounded-control border border-fs-gold/40 bg-fs-gold/10 px-3 py-2 font-body text-xs leading-relaxed text-fs-gold">
        {labels.unverifiedNameNote}
      </p>

      {state === "loading" ? (
        <p className="py-6 text-center font-body text-sm text-muted">{labels.loading}</p>
      ) : null}

      {state === "error" ? (
        <p className="py-6 text-center font-body text-sm text-danger">{labels.errorState}</p>
      ) : null}

      {state === "ready" && !hasEntries ? (
        <p className="py-6 text-center font-body text-sm text-muted">{labels.emptyState}</p>
      ) : null}

      {hasEntries ? (
        <ol className="space-y-2">
          {entries.map((entry) => (
            <LeaderboardRow key={`${entry.rank}-${entry.username}`} entry={entry} labels={labels} />
          ))}
        </ol>
      ) : null}
    </section>
  );
}
