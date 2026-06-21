"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  fetchServerAnalytics,
  type ServerAnalyticsPoint,
  type ServerAnalyticsRange,
} from "@/lib/servers-api";

const RANGES: ServerAnalyticsRange[] = ["24h", "7d", "30d", "90d", "1y"];
const EMPTY_POINTS: ServerAnalyticsPoint[] = [];

interface ServerAnalyticsPanelProps {
  slug: string;
  title: string;
  availabilityLabel: string;
  playersLabel: string;
  coverageLabel: string;
  provenanceNote: string;
}

const pathFor = (
  points: ServerAnalyticsPoint[],
  value: (point: ServerAnalyticsPoint) => number | null,
  width: number,
  height: number,
  fixedMax?: number
): string => {
  const values = points.map(value);
  const max = fixedMax ?? Math.max(1, ...values.filter((item): item is number => item !== null));
  let drawing = false;
  return values
    .map((item, index) => {
      if (item === null) {
        drawing = false;
        return "";
      }
      const x = points.length <= 1 ? 0 : (index / (points.length - 1)) * width;
      const y = height - (item / max) * height;
      const command = drawing ? "L" : "M";
      drawing = true;
      return `${command}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

/** Accessible, dependency-free probe history chart shared by public and owner views. */
export function ServerAnalyticsPanel({
  slug,
  title,
  availabilityLabel,
  playersLabel,
  coverageLabel,
  provenanceNote,
}: ServerAnalyticsPanelProps) {
  const [range, setRange] = useState<ServerAnalyticsRange>("30d");
  const queryKey = `${slug}:${range}`;
  const [result, setResult] = useState<{
    key: string;
    points: ServerAnalyticsPoint[];
  } | null>(null);
  const points = result?.key === queryKey ? result.points : EMPTY_POINTS;
  const loading = result?.key !== queryKey;
  const titleId = useId();
  useEffect(() => {
    let active = true;
    fetchServerAnalytics(slug, range, { cache: "no-store" })
      .then((data) => {
        if (active) setResult({ key: queryKey, points: data.points });
      })
      .catch(() => {
        if (active) setResult({ key: queryKey, points: [] });
      });
    return () => {
      active = false;
    };
  }, [queryKey, range, slug]);
  const availabilityPath = useMemo(
    () => pathFor(points, (point) => point.availability_percent, 720, 160, 100),
    [points]
  );
  const playersPath = useMemo(
    () => pathFor(points, (point) => point.players_avg, 720, 160),
    [points]
  );
  const coveragePath = useMemo(
    () => pathFor(points, (point) => point.coverage_percent, 720, 160, 100),
    [points]
  );

  return (
    <section className="border border-border bg-surface/60 p-5" aria-labelledby={titleId}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id={titleId} className="font-display text-lg text-foreground">
            {title}
          </h2>
          <p className="mt-1 font-mono text-[10px] text-muted">{provenanceNote}</p>
        </div>
        <div className="flex gap-1" role="group" aria-label={title}>
          {RANGES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              aria-pressed={range === item}
              className={`border px-2 py-1 font-mono text-[10px] ${range === item ? "border-primary text-primary" : "border-border text-muted"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="mt-5 h-40 animate-pulse bg-border/20" />
      ) : points.length === 0 ? (
        <div className="mt-5 grid h-40 place-items-center font-mono text-sm text-muted">—</div>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {[
            [availabilityLabel, availabilityPath, "text-success"],
            [playersLabel, playersPath, "text-primary"],
            [coverageLabel, coveragePath, "text-fs-gold"],
          ].map(([label, path, tone]) => (
            <figure key={label}>
              <figcaption className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">
                {label}
              </figcaption>
              <svg
                viewBox="0 0 720 160"
                role="img"
                aria-label={`${label}, ${range}`}
                className={`h-40 w-full ${tone}`}
                preserveAspectRatio="none"
              >
                <path
                  d={path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
