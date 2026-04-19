"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LandingContentModel } from "@/features/landing/types";
import { SECTION_SURFACE_CLASS } from "@/features/landing/lib/landing-content";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import HeroSearchBar from "./HeroSearchBar";
import { PixelCorners, SectionSurface, joinClasses } from "./LandingShared";
import QuickTags from "./QuickTags";

interface LandingDiscoverySectionProps {
  content: LandingContentModel;
  lang: string;
}

export default function LandingDiscoverySection({ content, lang }: LandingDiscoverySectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const { heroSignals, landing } = content;

  return (
    <motion.div {...getRevealProps(reduceMotion, 0.08)} className="mx-auto max-w-5xl">
      <SectionSurface className={joinClasses(SECTION_SURFACE_CLASS, "bg-bg-panel/92 p-4 md:p-5")}>
        <PixelCorners />
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground/15 pb-4">
          <span className="font-ui text-[11px] uppercase tracking-[0.38em] text-fs-diamond/80">
            {content.brand}
          </span>
          <div className="flex flex-wrap justify-end gap-2">
            {heroSignals.map((signal) => (
              <span
                key={signal}
                className="border-2 border-black bg-background/80 px-3 py-2 font-ui text-[10px] uppercase tracking-[0.22em] text-foreground/72 shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>

        <HeroSearchBar
          placeholder={landing.search_placeholder}
          buttonText={landing.search_button}
        />
        <QuickTags lang={lang} label={landing.popular_label} tags={landing.popular_tags} />
      </SectionSurface>
    </motion.div>
  );
}
