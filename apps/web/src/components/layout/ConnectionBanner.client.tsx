"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import {
  useApiHealth,
  type ApiHealthStatus,
} from "@/components/providers/ApiHealthProvider.client";
import type { ConnectionBannerDictionary } from "@/lib/dictionaries/schema";

export interface ConnectionBannerProps {
  copy: ConnectionBannerDictionary;
}

// Orders health states by severity so the banner can tell recovery from escalation.
const severityRank = (status: ApiHealthStatus): number =>
  status === "down" ? 2 : status === "degraded" ? 1 : 0;

/**
 * App-wide outage banner. Renders at the top of every route — including
 * /discover, where the footer status indicator is hidden — so a silent API
 * outage becomes visible at the moment it matters.
 */
export default function ConnectionBanner({ copy }: ConnectionBannerProps) {
  const { status } = useApiHealth();
  const [dismissed, setDismissed] = useState(false);
  const [prevStatus, setPrevStatus] = useState(status);

  // Re-show the banner on recovery (so a future outage isn't permanently silenced
  // by an earlier dismissal) AND on escalation to a worse state — dismissing a
  // mild "degraded" warning must not suppress a subsequent "down". Adjusting state
  // during render off a previous-value state is React's recommended alt to an effect.
  if (prevStatus !== status) {
    if (dismissed && (status === "ok" || severityRank(status) > severityRank(prevStatus))) {
      setDismissed(false);
    }
    setPrevStatus(status);
  }

  if (dismissed || (status !== "down" && status !== "degraded")) {
    return null;
  }

  const isDown = status === "down";
  const message = isDown ? copy.down : copy.degraded;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center justify-center gap-3 px-4 py-2 text-center font-body text-xs ${
        isDown ? "bg-danger text-white" : "bg-amber-500 text-black"
      }`}
    >
      <AlertTriangle size={14} className="shrink-0" />
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={copy.dismiss}
        className="shrink-0 opacity-80 transition-opacity hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
