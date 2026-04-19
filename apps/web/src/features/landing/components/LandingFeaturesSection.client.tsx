"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LandingContentModel } from "@/features/landing/types";
import { CARD_SURFACE_CLASS } from "@/features/landing/lib/landing-content";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import { PixelCorners, SectionHeader, joinClasses } from "./LandingShared";

interface LandingFeaturesSectionProps {
  content: LandingContentModel;
}

export default function LandingFeaturesSection({ content }: LandingFeaturesSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  return (
    <motion.section {...getRevealProps(reduceMotion)} className="space-y-8">
      <SectionHeader
        title={content.landing.features_title}
        subtitle={content.landing.features_subtitle}
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {content.features.map((feature, index) => (
          <motion.div key={feature.title} {...getRevealProps(reduceMotion, index * 0.05)}>
            <div className={joinClasses(CARD_SURFACE_CLASS)}>
              <PixelCorners />
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-fs-diamond/12 blur-2xl" />
              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-fs-diamond text-xl text-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    {feature.icon}
                  </div>
                  <span className="font-ui text-[10px] uppercase tracking-[0.28em] text-foreground/45">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mb-3 font-display text-sm leading-relaxed tracking-[0.16em] text-foreground">
                  {feature.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-foreground/68">
                  {feature.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
