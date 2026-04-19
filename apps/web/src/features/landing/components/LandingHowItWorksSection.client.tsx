"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LandingContentModel } from "@/features/landing/types";
import { CARD_SURFACE_CLASS } from "@/features/landing/lib/landing-content";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import { PixelCorners, SectionHeader, joinClasses } from "./LandingShared";

interface LandingHowItWorksSectionProps {
  content: LandingContentModel;
}

export default function LandingHowItWorksSection({ content }: LandingHowItWorksSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  return (
    <motion.section {...getRevealProps(reduceMotion)} className="space-y-8">
      <SectionHeader title={content.landing.how_it_works_title} />
      <div className="relative grid gap-6 lg:grid-cols-3 lg:pt-12">
        <div className="absolute left-[11%] right-[11%] top-4 hidden h-1 bg-fs-diamond/35 lg:block" />
        {content.steps.map((step, index) => (
          <motion.div key={step.num} {...getRevealProps(reduceMotion, index * 0.06)}>
            <div className={joinClasses(CARD_SURFACE_CLASS)}>
              <PixelCorners />
              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-background font-display text-lg text-fs-diamond shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    {step.num}
                  </div>
                  <div className="h-1 flex-1 bg-fs-diamond/40" />
                </div>
                <h3 className="mb-3 font-display text-lg tracking-[0.16em] text-foreground">
                  {step.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-foreground/68">{step.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
