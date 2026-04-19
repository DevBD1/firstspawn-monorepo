"use client";

import { motion, useReducedMotion } from "framer-motion";
import ServerCard from "@/features/server/components/ServerCard";
import type { LandingContentModel } from "@/features/landing/types";
import { MOCK_SERVERS } from "@/features/landing/lib/landing-content";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import { SectionHeader } from "./LandingShared";

interface LandingProofSectionProps {
  content: LandingContentModel;
  lang: string;
}

export default function LandingProofSection({ content, lang }: LandingProofSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  return (
    <motion.section {...getRevealProps(reduceMotion)} className="space-y-8">
      <SectionHeader eyebrow={content.landing.popular_label} title={content.proofTitle} />
      <div className="grid gap-6 lg:grid-cols-2">
        {MOCK_SERVERS.map((server, index) => (
          <motion.div key={server.id} {...getRevealProps(reduceMotion, index * 0.05)}>
            <ServerCard {...server} lang={lang} variant="landing" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
