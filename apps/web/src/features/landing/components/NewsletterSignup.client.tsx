"use client";

import { motion } from "framer-motion";
import type { FormEvent } from "react";
import { PixelButton } from "@firstspawn/ui";
import type { AppDictionary } from "@/lib/dictionaries/schema";

interface NewsletterSignupProps {
  dictionary: AppDictionary;
  confirmEmailSent: boolean;
  email: string;
  isSubscribed: boolean;
  statusMessage: string;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export default function NewsletterSignup({
  dictionary,
  confirmEmailSent,
  email,
  isSubscribed,
  statusMessage,
  onEmailChange,
  onSubmit,
}: NewsletterSignupProps) {
  const newsletter = dictionary.landing.newsletter;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div>
        <h3 className="mb-2 font-display text-base tracking-wider text-foreground md:text-lg">
          {newsletter.title}
        </h3>
        <p className="max-w-xl font-body text-sm leading-relaxed text-foreground/70">
          {newsletter.description}
        </p>
      </div>

      {isSubscribed ? (
        <div className="border-4 border-black bg-success/15 p-4 text-center font-display text-sm tracking-wider text-success shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          {newsletter.subscriptionVerified}
        </div>
      ) : confirmEmailSent ? (
        <div className="border-4 border-black bg-fs-diamond/10 p-4 text-center font-display text-sm tracking-wider text-fs-diamond shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          {newsletter.checkInbox}
        </div>
      ) : (
        <form
          className="group flex flex-col items-stretch gap-0 border-4 border-black bg-bg-panel shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:flex-row"
          onSubmit={onSubmit}
        >
          <input
            id="landing-newsletter-email"
            name="email"
            type="email"
            placeholder={dictionary.common.placeholders.email}
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="min-h-14 flex-grow border-b-4 border-black bg-background px-4 py-4 font-body text-sm text-foreground placeholder:text-foreground/35 focus:outline-none sm:border-b-0 sm:border-r-4"
            required
          />
          <PixelButton
            type="submit"
            variant="diamond"
            className="!m-0 min-h-14 !border-0 text-center"
          >
            {newsletter.submitLabel}
          </PixelButton>
        </form>
      )}

      {statusMessage ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-ui text-sm tracking-wide text-fs-diamond"
        >
          {statusMessage}
        </motion.div>
      ) : null}
    </div>
  );
}
