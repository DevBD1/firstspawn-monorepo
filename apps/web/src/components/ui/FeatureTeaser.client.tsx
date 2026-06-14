"use client";

import { useEffect, useState } from "react";
import { Lock, Bell, Check } from "lucide-react";
import { WLButton } from "@firstspawn/ui";
import type { TeaserFeatureItem } from "@/lib/dictionaries/schema";
import { PageBackdrop, PageContainer, PageSurface, StatusChip } from "./PagePrimitives";

/**
 * Computes whole days remaining until `targetDate`, post-mount only. Returns
 * null until mounted so SSR markup stays deterministic (no hydration drift
 * from `Date.now()` differing between server and client).
 */
function useDaysUntil(targetDate?: string): number | null {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    if (Number.isNaN(target)) return;
    const diffMs = target - Date.now();
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount countdown, intentionally client-only */
    setDays(Math.max(0, Math.ceil(diffMs / 86_400_000)));
  }, [targetDate]);

  return days;
}

export interface TeaserPanelProps {
  badge: string;
  /** Optional uppercase eyebrow above the title (page variant). */
  eyebrow?: string;
  title: string;
  tagline: string;
  description?: string;
  features: TeaserFeatureItem[];
  /** Social-proof line; the literal `{count}` is replaced with `waitlistCount`. */
  waitlistNote: string;
  waitlistCount: number;
  notifyCta: string;
  notifiedLabel: string;
  /** ISO date that the v2 feature is targeted for; drives the countdown pill. */
  targetDate?: string;
  countdownDaysLabel?: string;
  countdownUntilLabel?: string;
  /** Tighter spacing for the in-page (Discussion tab) variant. */
  dense?: boolean;
  className?: string;
}

/**
 * The locked "coming in v2" card: gold badge, optional countdown, a teaser
 * headline + tagline, three locked-feature highlights, and a notify-me hook.
 * Used standalone over a blurred preview (Discussion) and inside the
 * page-level {@link FeatureTeaser} shell (Community, My Loot).
 */
export function TeaserPanel({
  badge,
  eyebrow,
  title,
  tagline,
  description,
  features,
  waitlistNote,
  waitlistCount,
  notifyCta,
  notifiedLabel,
  targetDate,
  countdownDaysLabel,
  countdownUntilLabel,
  dense = false,
  className = "",
}: TeaserPanelProps) {
  const [notified, setNotified] = useState(false);
  const days = useDaysUntil(targetDate);

  const waitlistTotal = (waitlistCount + (notified ? 1 : 0)).toLocaleString();

  return (
    <div
      className={`flex flex-col items-center text-center ${dense ? "gap-4" : "gap-6"} ${className}`}
    >
      {/* Lock crest */}
      <div className="relative flex items-center justify-center">
        <span
          className="absolute inline-flex h-16 w-16 rounded-full bg-primary/20 blur-md"
          aria-hidden
        />
        <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-fs-gold/40 bg-bg-panel">
          <Lock size={22} className="text-fs-gold" />
        </span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <StatusChip tone="gold">{badge}</StatusChip>
        {days !== null && countdownDaysLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-3 py-1 font-mono text-[11px] text-muted">
            <span className="font-bold text-foreground">
              {countdownDaysLabel.replace("{count}", String(days))}
            </span>
            {countdownUntilLabel ? <span>{countdownUntilLabel}</span> : null}
          </span>
        ) : null}
      </div>

      {/* Heading */}
      <div className={`flex flex-col ${dense ? "gap-2" : "gap-3"} max-w-2xl`}>
        {eyebrow ? (
          <p className="font-ui text-[11px] uppercase tracking-[0.38em] text-fs-gold/80">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={`font-display ${dense ? "text-xl" : "text-2xl md:text-3xl"} leading-tight tracking-tight text-foreground`}
        >
          {title}
        </h2>
        <p className="font-body text-sm font-semibold leading-relaxed text-primary md:text-base">
          {tagline}
        </p>
        {description ? (
          <p className="font-body text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>

      {/* Locked feature highlights */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-1.5 rounded-xl border border-border bg-bg-panel/60 p-3.5 text-left"
          >
            <Lock size={13} className="text-muted" />
            <span className="font-body text-xs font-bold text-foreground">{feature.title}</span>
            <span className="font-body text-[11.5px] leading-relaxed text-muted">
              {feature.body}
            </span>
          </div>
        ))}
      </div>

      {/* Notify-me hook */}
      <div className="flex flex-col items-center gap-2.5">
        {notified ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-4 py-2 font-body text-sm font-bold text-success">
            <Check size={15} /> {notifiedLabel}
          </span>
        ) : (
          <WLButton variant="primary" onClick={() => setNotified(true)}>
            <span className="inline-flex items-center gap-2">
              <Bell size={15} /> {notifyCta}
            </span>
          </WLButton>
        )}
        <p className="font-mono text-[11px] text-muted">
          {waitlistNote.replace("{count}", waitlistTotal)}
        </p>
      </div>
    </div>
  );
}

export interface FeatureTeaserCopyProps {
  badge: string;
  eyebrow: string;
  title: string;
  tagline: string;
  description: string;
  features: TeaserFeatureItem[];
  waitlistNote: string;
  notifyCta: string;
  notifiedLabel: string;
  countdownDaysLabel: string;
  countdownUntilLabel: string;
}

export interface FeatureTeaserProps {
  copy: FeatureTeaserCopyProps;
  /** ISO date the v2 feature is targeted for. */
  targetDate?: string;
  /** Stable pseudo-count for the social-proof waitlist line. */
  waitlistCount: number;
}

/**
 * Full-page "coming in v2" teaser shell for routes that gate an unfinished
 * feature (Community, My Loot). Wraps {@link TeaserPanel} in the standard
 * WorldLight page surface.
 */
export default function FeatureTeaser({ copy, targetDate, waitlistCount }: FeatureTeaserProps) {
  return (
    <main className="relative min-h-[calc(100vh-84px)] overflow-hidden bg-background py-12 md:py-16">
      <PageBackdrop />
      <PageContainer className="relative z-10">
        <PageSurface className="mx-auto max-w-3xl p-6 md:p-12">
          <TeaserPanel
            badge={copy.badge}
            eyebrow={copy.eyebrow}
            title={copy.title}
            tagline={copy.tagline}
            description={copy.description}
            features={copy.features}
            waitlistNote={copy.waitlistNote}
            waitlistCount={waitlistCount}
            notifyCta={copy.notifyCta}
            notifiedLabel={copy.notifiedLabel}
            targetDate={targetDate}
            countdownDaysLabel={copy.countdownDaysLabel}
            countdownUntilLabel={copy.countdownUntilLabel}
          />
        </PageSurface>
      </PageContainer>
    </main>
  );
}

/** Shared v2 launch target so every teaser counts down to the same date. */
export const V2_TARGET_DATE = "2026-09-01";
