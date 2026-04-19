"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SECTION_SURFACE_CLASS } from "@/features/landing/lib/landing-content";
import { getRevealProps } from "@/features/landing/lib/landing-motion";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import NewsletterSignup from "./NewsletterSignup.client";
import { PixelCorners, SectionSurface, joinClasses } from "./LandingShared";

interface LandingNewsletterSectionProps {
  dictionary: AppDictionary;
  confirmEmailSent: boolean;
  email: string;
  isSubscribed: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  statusMessage: string;
}

export default function LandingNewsletterSection({
  dictionary,
  confirmEmailSent,
  email,
  isSubscribed,
  onEmailChange,
  onSubmit,
  statusMessage,
}: LandingNewsletterSectionProps) {
  const reduceMotion = Boolean(useReducedMotion());
  return (
    <motion.section {...getRevealProps(reduceMotion)} id="notify-signup">
      <SectionSurface className={joinClasses(SECTION_SURFACE_CLASS, "bg-background/94")}>
        <PixelCorners />
        <div className="relative z-10">
          <NewsletterSignup
            dictionary={dictionary}
            confirmEmailSent={confirmEmailSent}
            email={email}
            isSubscribed={isSubscribed}
            statusMessage={statusMessage}
            onEmailChange={onEmailChange}
            onSubmit={onSubmit}
          />
        </div>
      </SectionSurface>
    </motion.section>
  );
}
