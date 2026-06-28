"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type ApiHealthStatus = "unknown" | "ok" | "degraded" | "down";

interface ApiHealthContextType {
  status: ApiHealthStatus;
  /** Force an immediate re-check (e.g. after a user retry). */
  refresh: () => void;
}

const ApiHealthContext = createContext<ApiHealthContextType | undefined>(undefined);

const POLL_INTERVAL_MS = 30_000;
// Require two consecutive failures before declaring "down" so a single blip
// (a dropped poll, a brief redeploy) doesn't flash an alarming banner.
const FAILURE_THRESHOLD = 2;
// Hard cap on each poll's fetch. Without it, a never-settling request would
// leave inFlightRef stuck true and freeze every subsequent poll. Kept above the
// proxy's own 3s timeout so the proxy normally responds first.
const POLL_TIMEOUT_MS = 5_000;

export function ApiHealthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ApiHealthStatus>("unknown");
  // Counts consecutive non-"ok" polls (degraded, down, or a failed request).
  const nonOkCountRef = useRef(0);
  // Serializes checks so overlapping triggers (interval + focus/online) can't
  // double-count one outage window and bypass the consecutive-poll debounce.
  const inFlightRef = useRef(false);

  const check = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      // Resolve each poll to a single reading; a thrown/unrecognized result is a
      // failure we treat as "down" once it persists.
      let reading: ApiHealthStatus | "fail" = "fail";
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), POLL_TIMEOUT_MS);
      try {
        const res = await fetch("/api/health", { cache: "no-store", signal: controller.signal });
        const body = (await res.json()) as { status?: ApiHealthStatus };
        const reported = body?.status;
        if (reported === "ok" || reported === "degraded" || reported === "down") {
          reading = reported;
        }
      } catch {
        reading = "fail";
      } finally {
        clearTimeout(timer);
      }

      if (reading === "ok") {
        nonOkCountRef.current = 0;
        setStatus("ok");
      } else {
        // Debounce every non-ok reading — including "degraded" — so a single blip
        // (e.g. a redis reconnect right after a deploy) doesn't flash the banner.
        nonOkCountRef.current += 1;
        if (nonOkCountRef.current >= FAILURE_THRESHOLD) {
          setStatus(reading === "fail" ? "down" : reading);
        }
      }
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) void check();
    };

    run();
    const interval = setInterval(run, POLL_INTERVAL_MS);

    const onFocus = () => run();
    const onOnline = () => run();
    const onOffline = () => {
      // The browser knows it's offline before any fetch fails — surface it now,
      // bypassing the debounce (this is a definite, not a probabilistic, signal).
      nonOkCountRef.current = FAILURE_THRESHOLD;
      setStatus("down");
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [check]);

  return (
    <ApiHealthContext.Provider value={{ status, refresh: check }}>
      {children}
    </ApiHealthContext.Provider>
  );
}

export function useApiHealth() {
  const context = useContext(ApiHealthContext);
  if (context === undefined) {
    throw new Error("useApiHealth must be used within an ApiHealthProvider");
  }
  return context;
}
