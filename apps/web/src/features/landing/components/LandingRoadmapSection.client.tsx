"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LandingContentModel, LandingRoadmapItem } from "@/features/landing/types";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import { PixelCorners, joinClasses } from "./LandingShared";

interface LandingRoadmapSectionProps {
  content: LandingContentModel;
}

const ROADMAP_TONES = ["diamond", "success", "gold"] as const;

function getToneClasses(index: number) {
  const tone = ROADMAP_TONES[index] ?? ROADMAP_TONES[0];

  if (tone === "gold") {
    return {
      accent: "border-fs-gold bg-fs-gold/12 text-fs-gold",
      track: "bg-fs-gold/65",
    };
  }

  if (tone === "success") {
    return {
      accent: "border-success bg-success/12 text-success",
      track: "bg-success/65",
    };
  }

  return {
    accent: "border-fs-diamond bg-fs-diamond/12 text-fs-diamond",
    track: "bg-fs-diamond/65",
  };
}

function RoadmapDrawer({
  active,
  index,
  item,
  onToggle,
  reduceMotion,
}: {
  active: boolean;
  index: number;
  item: LandingRoadmapItem;
  onToggle: () => void;
  reduceMotion: boolean;
}) {
  const tone = getToneClasses(index);

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      initial={false}
      animate={{
        translateX: active ? 2 : 0,
        translateY: active ? 2 : 0,
      }}
      transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
      className={joinClasses(
        "group relative w-full overflow-hidden border-4 border-black bg-bg-panel/92 p-4 text-left shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition duration-150",
        active ? "z-20 shadow-none" : "z-10 hover:-translate-y-1"
      )}
    >
      <PixelCorners />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black/10">
        <motion.div
          initial={false}
          animate={{ width: active ? "100%" : "42%" }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
          className={joinClasses("h-full", tone.track)}
        />
      </div>

      <div className="relative z-10 flex items-start gap-4">
        <div
          className={joinClasses(
            "flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition duration-150 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none",
            tone.accent
          )}
        >
          <span className="font-display text-[0.8rem] leading-none">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-ui text-[10px] uppercase tracking-[0.32em] text-foreground/45">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={joinClasses(
                "border px-2 py-1 font-ui text-[10px] uppercase tracking-[0.22em]",
                tone.accent
              )}
            >
              {item.statusLabel}
            </span>
          </div>

          <h3
            className={joinClasses(
              "mt-2 font-display text-sm uppercase tracking-[0.14em] text-foreground transition-colors duration-150",
              active ? "text-fs-diamond" : "group-hover:text-fs-diamond"
            )}
          >
            {item.title}
          </h3>

          <p className="mt-3 max-h-[3.4rem] overflow-hidden font-body text-sm leading-relaxed text-foreground/68">
            {item.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function RoadmapDetail({
  index,
  item,
  total,
  reduceMotion,
}: {
  index: number;
  item: LandingRoadmapItem;
  total: number;
  reduceMotion: boolean;
}) {
  const tone = getToneClasses(index);

  return (
    <motion.div
      key={item.title}
      initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
      className="relative overflow-hidden border-4 border-black bg-background/88 p-5 shadow-[10px_10px_0_0_rgba(0,0,0,1)]"
    >
      <PixelCorners />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-fs-diamond" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="border-2 border-black bg-background px-3 py-1 font-ui text-[10px] uppercase tracking-[0.32em] text-foreground/55 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span
            className={joinClasses(
              "border px-2 py-1 font-ui text-[10px] uppercase tracking-[0.22em]",
              tone.accent
            )}
          >
            {item.statusLabel}
          </span>
        </div>

        <h3 className="mt-5 max-w-xl font-display text-lg uppercase tracking-[0.14em] text-foreground md:text-xl">
          {item.title}
        </h3>

        <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-foreground/70 md:text-base">
          {item.description}
        </p>

        <div className="mt-6 grid gap-3 border-t border-black/10 pt-5 sm:grid-cols-3">
          <div className="border-2 border-black bg-bg-panel/84 px-3 py-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            <p className="font-ui text-[10px] uppercase tracking-[0.28em] text-foreground/45">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-2 font-display text-sm uppercase tracking-[0.12em] text-foreground">
              {item.statusLabel}
            </p>
          </div>
          <div className="border-2 border-black bg-bg-panel/84 px-3 py-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)] sm:col-span-2">
            <p className="font-ui text-[10px] uppercase tracking-[0.28em] text-foreground/45">
              {String(total).padStart(2, "0")}
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-foreground/68">
              {item.title}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingRoadmapSection({ content }: LandingRoadmapSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const roadmap = content.landing.roadmap;
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <motion.section {...getRevealProps(reduceMotion)} className="relative">
      <div className="relative overflow-hidden border-4 border-black bg-bg-panel/88 p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px] md:p-5">
        <PixelCorners />
        <div className="relative z-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <p className="font-ui text-[11px] uppercase tracking-[0.36em] text-fs-diamond/80">
              {roadmap.eyebrow}
            </p>
            <h2 className="font-display text-base leading-relaxed tracking-[0.14em] text-foreground md:text-lg">
              {roadmap.title}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="space-y-3">
              {content.roadmapItems.map((item, index) => (
                <motion.div key={item.title} {...getRevealProps(reduceMotion, index * 0.05)}>
                  <RoadmapDrawer
                    active={activeIndex === index}
                    index={index}
                    item={item}
                    reduceMotion={reduceMotion}
                    onToggle={() => setActiveIndex(index)}
                  />
                </motion.div>
              ))}
            </div>

            <div className="min-h-full">
              <AnimatePresence mode="wait" initial={false}>
                <RoadmapDetail
                  key={content.roadmapItems[activeIndex]?.title ?? "roadmap-detail"}
                  index={activeIndex}
                  item={content.roadmapItems[activeIndex] ?? content.roadmapItems[0]}
                  total={content.roadmapItems.length}
                  reduceMotion={reduceMotion}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
