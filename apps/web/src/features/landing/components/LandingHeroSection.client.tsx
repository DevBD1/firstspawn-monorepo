"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import PixelButton from "@/components/ui/PixelButton";
import type { LandingContentModel } from "@/features/landing/types";
import { SECTION_SURFACE_CLASS } from "@/features/landing/lib/landing-content";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import { PixelCorners, SectionSurface, joinClasses } from "./LandingShared";

interface LandingHeroSectionProps {
  content: LandingContentModel;
  lang: string;
}

export default function LandingHeroSection({ content, lang }: LandingHeroSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const { heroStats, heroStatus, heroTitle, landing } = content;

  return (
    <motion.div {...getRevealProps(reduceMotion)} className="mx-auto max-w-5xl">
      <SectionSurface
        className={joinClasses(
          SECTION_SURFACE_CLASS,
          "bg-background/78 p-6 sm:p-8 md:p-10 lg:p-12"
        )}
      >
        <PixelCorners />
        <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-72 -translate-x-1/2 rounded-full bg-fs-diamond/15 blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-3 border-2 border-black bg-bg-panel/95 px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <motion.span
                animate={reduceMotion ? undefined : { opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                className="h-3 w-3 border-2 border-black bg-success"
              />
              <span className="font-ui text-sm uppercase tracking-[0.28em] text-fs-diamond">
                {heroStatus}
              </span>
            </span>
          </div>

          <h1 className="mb-6 font-display text-4xl leading-tight tracking-[0.08em] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            {heroTitle.map((line, index) => (
              <Fragment key={`${line}-${index}`}>
                <span className={index === 1 ? "text-fs-diamond" : ""}>{line}</span>
                {index < heroTitle.length - 1 ? <br /> : null}
              </Fragment>
            ))}
          </h1>

          <p className="mx-auto max-w-3xl font-body text-base leading-relaxed text-foreground/72 md:text-lg">
            {landing.hero_subtitle}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PixelButton href={`/${lang}/discover`} size="lg" variant="primary">
              {landing.cta_primary}
            </PixelButton>
            <PixelButton href={`/${lang}/console`} size="lg" variant="outline" disabled>
              {landing.cta_secondary}
            </PixelButton>
          </div>

          <div className="mt-10 grid gap-4 border-t-4 border-black pt-6 md:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="border-2 border-black bg-bg-panel/80 px-5 py-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                <div className="font-display text-2xl text-fs-diamond md:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-2 font-ui text-xs uppercase tracking-[0.28em] text-foreground/55">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionSurface>
    </motion.div>
  );
}
