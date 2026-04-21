"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LandingContentModel } from "@/features/landing/types";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import LandingDiscoveryChatDemo from "./LandingDiscoveryChatDemo.client";

interface LandingDiscoverySectionProps {
  content: LandingContentModel;
  lang: string;
}

// Thin motion wrapper for the right-hand landing chat area.
export default function LandingDiscoverySection({ content, lang }: LandingDiscoverySectionProps) {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <motion.div {...getRevealProps(reduceMotion, 0.08)} className="h-full min-w-0">
      <LandingDiscoveryChatDemo
        content={content}
        embedded
        lang={lang}
        statusLabel={content.heroStatus}
      />
    </motion.div>
  );
}
