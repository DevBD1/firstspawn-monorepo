"use client";

import { motion, useReducedMotion } from "framer-motion";
import PixelButton from "@/components/ui/PixelButton";
import type { LandingContentModel } from "@/features/landing/types";
import { SECTION_SURFACE_CLASS } from "@/features/landing/lib/landing-content";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import { PixelCorners, SectionSurface, joinClasses } from "./LandingShared";

interface LandingFinalCtaSectionProps {
  content: LandingContentModel;
  lang: string;
}

export default function LandingFinalCtaSection({ content, lang }: LandingFinalCtaSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  return (
    <motion.section {...getRevealProps(reduceMotion)}>
      <SectionSurface
        className={joinClasses(
          SECTION_SURFACE_CLASS,
          "bg-bg-panel/92 p-8 text-center md:p-10 lg:p-12"
        )}
      >
        <PixelCorners />
        <motion.div
          animate={reduceMotion ? undefined : { opacity: [0.3, 0.65, 0.3], x: [-10, 12, -10] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full bg-fs-diamond/16 blur-3xl"
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
            {content.landing.cta_section_title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-base leading-relaxed text-foreground/68 md:text-lg">
            {content.landing.cta_section_subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PixelButton href={`/${lang}/discover`} size="lg" variant="success">
              {content.landing.cta_primary}
            </PixelButton>
            <PixelButton href="#notify-signup" size="lg" variant="diamond">
              {content.landing.notify_btn}
            </PixelButton>
          </div>
        </div>
      </SectionSurface>
    </motion.section>
  );
}
