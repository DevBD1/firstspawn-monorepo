"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, ShieldCheck, Trophy } from "lucide-react";
import PixelButton from "@/components/ui/PixelButton";
import type { LandingContentModel, LandingQuestItem } from "@/features/landing/types";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import { PixelCorners, joinClasses } from "./LandingShared";

interface LandingQuestBoardHeroProps {
  content: LandingContentModel;
  lang: string;
}

const ICONS: Record<LandingQuestItem["icon"], typeof Search> = {
  search: Search,
  shield: ShieldCheck,
  trophy: Trophy,
};

const TONE_CLASSES: Record<LandingQuestItem["tone"], string> = {
  diamond: "border-fs-diamond bg-fs-diamond/12 text-fs-diamond",
  gold: "border-fs-gold bg-fs-gold/12 text-fs-gold",
  success: "border-success bg-success/12 text-success",
};

function QuestCard({
  active,
  index,
  quest,
  onSelect,
}: {
  active: boolean;
  index: number;
  quest: LandingQuestItem;
  onSelect: () => void;
}) {
  const Icon = ICONS[quest.icon];

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={joinClasses(
        "group relative w-full border-4 border-black bg-bg-panel/92 p-4 text-left shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        active ? "translate-x-[2px] translate-y-[2px] shadow-none" : "hover:-translate-y-1"
      )}
    >
      <PixelCorners />
      <div className="relative z-10 flex gap-4">
        <div
          className={joinClasses(
            "flex h-12 w-12 shrink-0 items-center justify-center border-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)]",
            TONE_CLASSES[quest.tone]
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-ui text-[10px] uppercase tracking-[0.28em] text-foreground/45">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={joinClasses(
                "border px-2 py-1 font-ui text-[10px] uppercase tracking-[0.22em]",
                TONE_CLASSES[quest.tone]
              )}
            >
              {quest.statusLabel} {quest.statusValue}
            </span>
          </div>
          <h3 className="font-display text-sm leading-relaxed tracking-[0.14em] text-foreground transition-colors group-hover:text-fs-diamond">
            {quest.title}
          </h3>
          <p className="mt-3 font-body text-sm leading-relaxed text-foreground/68">
            {quest.description}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-foreground/10 pt-3">
            <span className="font-ui text-[10px] uppercase tracking-[0.26em] text-foreground/45">
              {quest.rewardLabel}
            </span>
            <span className="font-display text-[10px] uppercase tracking-[0.12em] text-fs-gold">
              {quest.rewardValue}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function LandingQuestBoardHero({ content, lang }: LandingQuestBoardHeroProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const [activeQuestIndex, setActiveQuestIndex] = useState(0);
  const questBoard = content.landing.questBoard;
  const activeQuest = content.quests[activeQuestIndex] ?? content.quests[0];

  return (
    <motion.section
      {...getRevealProps(reduceMotion)}
      className="relative grid min-h-[calc(100svh-var(--fs-nav-height))] gap-6 pt-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(25rem,0.78fr)] lg:items-center"
    >
      <div className="relative overflow-hidden border-4 border-black bg-background/86 p-5 shadow-[10px_10px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px] md:p-8">
        <PixelCorners />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-fs-diamond" />
        <div className="pointer-events-none absolute right-6 top-6 h-24 w-24 border-4 border-fs-diamond/20" />

        <div className="relative z-10">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="border-2 border-fs-diamond bg-fs-diamond/12 px-3 py-2 font-ui text-[11px] uppercase tracking-[0.34em] text-fs-diamond shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              {questBoard.eyebrow}
            </span>
            <span className="border-2 border-success/70 bg-success/12 px-3 py-2 font-ui text-[11px] uppercase tracking-[0.28em] text-success">
              {questBoard.statusLabel} {questBoard.statusValue}
            </span>
            <span className="border-2 border-fs-gold/70 bg-fs-gold/12 px-3 py-2 font-ui text-[11px] uppercase tracking-[0.28em] text-fs-gold">
              {questBoard.betaLabel}
            </span>
          </div>

          <h1 className="max-w-5xl font-display text-[clamp(2.4rem,7vw,5.4rem)] leading-[0.98] tracking-[0.02em] text-foreground">
            {questBoard.title}
          </h1>
          <p className="mt-6 max-w-3xl font-body text-base leading-relaxed text-foreground/72 md:text-lg">
            {questBoard.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <PixelButton href={`/${lang}/discover`} size="lg" variant="success">
              {questBoard.primaryLabel}
            </PixelButton>
            <PixelButton href="#notify-signup" size="lg" variant="outline">
              {questBoard.secondaryLabel}
            </PixelButton>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {content.quests.map((quest, index) => (
          <motion.div key={quest.title} {...getRevealProps(reduceMotion, index * 0.05)}>
            <QuestCard
              active={index === activeQuestIndex}
              index={index}
              quest={quest}
              onSelect={() => setActiveQuestIndex(index)}
            />
          </motion.div>
        ))}

        {activeQuest ? (
          <div className="border-4 border-black bg-background/86 p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px]">
            <div className="font-ui text-[10px] uppercase tracking-[0.3em] text-foreground/45">
              {activeQuest.rewardLabel}
            </div>
            <div className="mt-2 font-display text-sm uppercase tracking-[0.14em] text-fs-gold">
              {activeQuest.rewardValue}
            </div>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
