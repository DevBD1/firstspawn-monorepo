"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Ban, Radar, Signal } from "lucide-react";
import type { LandingContentModel, LandingTrustItem } from "@/features/landing/types";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import { CARD_SURFACE_CLASS, SECTION_SURFACE_CLASS } from "@/features/landing/lib/landing-content";
import { PixelCorners, SectionHeader, SectionSurface, joinClasses } from "./LandingShared";

interface LandingTrustSectionProps {
  content: LandingContentModel;
}

const ICONS: Record<LandingTrustItem["icon"], typeof Signal> = {
  ban: Ban,
  radar: Radar,
  signal: Signal,
};

export default function LandingTrustSection({ content }: LandingTrustSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const trust = content.landing.trust;

  return (
    <motion.section {...getRevealProps(reduceMotion)} className="space-y-8">
      <SectionHeader eyebrow={trust.eyebrow} title={trust.title} subtitle={trust.subtitle} />

      <SectionSurface className={joinClasses(SECTION_SURFACE_CLASS, "bg-background/86")}>
        <PixelCorners />
        <div className="pointer-events-none absolute inset-y-6 left-1/2 w-1 bg-fs-diamond/18" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-3">
          {content.trustItems.map((item, index) => {
            const Icon = ICONS[item.icon];
            return (
              <motion.article
                key={item.title}
                {...getRevealProps(reduceMotion, index * 0.05)}
                className={joinClasses(CARD_SURFACE_CLASS, "group bg-bg-panel/88")}
              >
                <PixelCorners />
                <div className="relative z-10">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center border-2 border-black bg-fs-diamond/12 text-fs-diamond shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition duration-150 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="border border-success/50 bg-success/10 px-2 py-1 font-ui text-[10px] uppercase tracking-[0.24em] text-success">
                      {item.statusLabel}
                    </span>
                  </div>
                  <h3 className="font-display text-base leading-relaxed tracking-[0.14em] text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-4 font-body text-sm leading-relaxed text-foreground/68">
                    {item.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </SectionSurface>
    </motion.section>
  );
}
