"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Gift, Star } from "lucide-react";
import type { LandingContentModel, LandingProgressionItem } from "@/features/landing/types";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import { PixelCorners, SectionHeader } from "./LandingShared";

interface LandingProgressionSectionProps {
  content: LandingContentModel;
}

const ICONS: Record<LandingProgressionItem["icon"], typeof BadgeCheck> = {
  badge: BadgeCheck,
  gift: Gift,
  star: Star,
};

export default function LandingProgressionSection({ content }: LandingProgressionSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const progression = content.landing.progression;

  return (
    <motion.section {...getRevealProps(reduceMotion)} className="space-y-8">
      <SectionHeader
        eyebrow={progression.eyebrow}
        title={progression.title}
        subtitle={progression.subtitle}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {content.progressionItems.map((item, index) => {
          const Icon = ICONS[item.icon];
          return (
            <motion.article
              key={item.title}
              {...getRevealProps(reduceMotion, index * 0.05)}
              className="group relative overflow-hidden border-4 border-black bg-background/86 p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px] transition duration-150 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)]"
            >
              <PixelCorners />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-fs-gold/70 opacity-0 transition duration-150 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center border-2 border-black bg-fs-gold/12 text-fs-gold shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="border border-fs-gold/60 bg-fs-gold/10 px-2 py-1 font-ui text-[10px] uppercase tracking-[0.24em] text-fs-gold">
                    {item.stateLabel}
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
    </motion.section>
  );
}
