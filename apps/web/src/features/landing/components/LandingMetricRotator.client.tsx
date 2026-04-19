"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { LandingHeroMetric } from "@/features/landing/types";
import { joinClasses } from "./LandingShared";

interface LandingMetricRotatorProps {
  items: LandingHeroMetric[];
  lang: string;
  reduceMotion: boolean;
}

function MetricCard({ lang, metric }: { lang: string; metric: LandingHeroMetric }) {
  const formattedValue = new Intl.NumberFormat(lang).format(metric.value);

  return (
    <div className="flex h-full flex-col justify-between gap-5 border-2 border-black bg-bg-panel/88 px-5 py-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <div className="flex items-center gap-3">
        <span
          className={joinClasses(
            "inline-flex h-4 w-4 shrink-0 border-2 border-black",
            metric.tone === "diamond"
              ? "bg-fs-diamond"
              : metric.tone === "gold"
                ? "bg-fs-gold"
                : "bg-success"
          )}
        />
        <span className="font-ui text-[11px] uppercase tracking-[0.34em] text-foreground/62">
          {metric.label}
        </span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="font-display text-3xl leading-none text-foreground sm:text-4xl">
          {formattedValue}
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          <span
            className={joinClasses(
              "h-4 w-4 border border-black",
              metric.tone === "diamond"
                ? "bg-fs-diamond"
                : metric.tone === "gold"
                  ? "bg-fs-gold"
                  : "bg-success"
            )}
          />
          <span className="h-4 w-4 border border-black bg-background/55" />
          <span className="h-4 w-4 border border-black bg-background/55" />
        </div>
      </div>
    </div>
  );
}

export default function LandingMetricRotator({
  items,
  lang,
  reduceMotion,
}: LandingMetricRotatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % items.length);
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  const activeItem = items[index];

  return (
    <div className="min-h-0 min-w-0 flex-1">
      <div className="relative h-[9.25rem] overflow-hidden border-4 border-black bg-background/72 p-2 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
        {reduceMotion ? (
          <MetricCard lang={lang} metric={activeItem} />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeItem.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.18, ease: "linear" }}
              className="absolute inset-2"
            >
              <MetricCard lang={lang} metric={activeItem} />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
