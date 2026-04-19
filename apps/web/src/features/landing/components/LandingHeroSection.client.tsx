"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import PixelButton from "@/components/ui/PixelButton";
import type { LandingContentModel } from "@/features/landing/types";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import LandingMetricRotator from "./LandingMetricRotator.client";
import { joinClasses } from "./LandingShared";

interface LandingHeroSectionProps {
  content: LandingContentModel;
  lang: string;
}

const EXPLORER_AVATAR_TILES = [
  "bg-fs-diamond/30",
  "bg-fs-gold/30",
  "bg-success/30",
  "bg-fs-orange/30",
] as const;

function ExplorerProof({ count, label, lang }: { count: number; label: string; lang: string }) {
  const compactCount = new Intl.NumberFormat(lang, {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(count);

  return (
    <div className="border-4 border-black bg-bg-panel/84 px-4 py-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {EXPLORER_AVATAR_TILES.map((toneClass, index) => (
            <span
              key={`${toneClass}-${index}`}
              aria-hidden="true"
              className={joinClasses(
                "inline-flex h-11 w-11 items-center justify-center border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                toneClass
              )}
            >
              <span className="h-3 w-3 border border-black bg-background/65" />
            </span>
          ))}
        </div>
        <div className="min-w-0">
          <div className="font-display text-xl text-foreground sm:text-2xl">{compactCount}</div>
          <div className="mt-1 font-ui text-[11px] uppercase tracking-[0.34em] text-foreground/58">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingHeroSection({ content, lang }: LandingHeroSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const { explorerProof, heroMetrics, heroTitle, landing } = content;

  return (
    <motion.div {...getRevealProps(reduceMotion)} className="relative h-full">
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-full bg-fs-diamond/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 translate-x-1/4 translate-y-1/4 bg-fs-gold/10 blur-3xl" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="max-w-2xl">
          <h1 className="mb-6 max-w-[11ch] font-display text-[clamp(2.9rem,8vw,5.2rem)] leading-[0.98] tracking-[0.02em] text-foreground xl:text-[clamp(3.4rem,4.7vw,5.4rem)] 2xl:text-[clamp(4.1rem,4.3vw,5.9rem)]">
            {heroTitle.map((line, index) => (
              <Fragment key={`${line}-${index}`}>
                <span className={index === heroTitle.length - 1 ? "text-fs-diamond" : ""}>
                  {line}
                </span>
                {index < heroTitle.length - 1 ? <br /> : null}
              </Fragment>
            ))}
          </h1>

          <p className="max-w-xl font-body text-base leading-relaxed text-foreground/72 md:text-lg">
            {landing.hero_subtitle}
          </p>

          <div className="mt-8 flex max-w-2xl flex-col items-start gap-4 sm:flex-row sm:flex-wrap">
            <PixelButton href={`/${lang}/discover`} size="lg" variant="primary">
              {landing.cta_primary}
            </PixelButton>
            <PixelButton href={`/${lang}/console`} size="lg" variant="outline" disabled>
              {landing.cta_secondary}
            </PixelButton>
          </div>
        </div>

        <div className="mt-10 grid gap-5 border-t-4 border-black pt-6 xl:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)] xl:items-end">
          <ExplorerProof count={explorerProof.count} label={explorerProof.label} lang={lang} />
          <LandingMetricRotator items={heroMetrics} lang={lang} reduceMotion={reduceMotion} />
        </div>
      </div>
    </motion.div>
  );
}
