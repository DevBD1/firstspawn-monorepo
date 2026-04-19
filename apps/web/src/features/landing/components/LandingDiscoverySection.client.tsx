"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LandingContentModel } from "@/features/landing/types";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import LandingDiscoveryConsole from "./LandingDiscoveryConsole.client";

interface LandingDiscoverySectionProps {
  content: LandingContentModel;
  lang: string;
}

export default function LandingDiscoverySection({ content, lang }: LandingDiscoverySectionProps) {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <motion.div {...getRevealProps(reduceMotion, 0.08)} className="h-full min-w-0">
      <LandingDiscoveryConsole
        content={content}
        embedded
        heroStatus={content.heroStatus}
        lang={lang}
      />
    </motion.div>
  );
}
