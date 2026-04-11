"use client";

import { motion } from "framer-motion";
import type { FormEvent } from "react";
import PixelButton from "@/components/ui/PixelButton";
import type { LandingDictionary } from "@/features/landing/types";

interface NewsletterSignupProps {
  dictionary: LandingDictionary;
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
  const landing = dictionary.landing || {};

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div>
        <h3 className="mb-2 font-display text-base tracking-wider text-foreground md:text-lg">
          {landing.notify_title || "BE FIRST TO SPAWN"}
        </h3>
        <p className="max-w-xl font-body text-sm leading-relaxed text-foreground/70">
          {landing.notify_desc ||
            "Join thousands of players waiting for launch. Early subscribers get exclusive access & founding member perks!"}
        </p>
      </div>

      {isSubscribed ? (
        <div className="border-4 border-black bg-success/15 p-4 text-center font-display text-sm tracking-wider text-success shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          {landing.subscription_verified || "SUBSCRIPTION VERIFIED"}
        </div>
      ) : confirmEmailSent ? (
        <div className="border-4 border-black bg-fs-diamond/10 p-4 text-center font-display text-sm tracking-wider text-fs-diamond shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          {landing.check_inbox || "CHECK YOUR INBOX"}
        </div>
      ) : (
        <form
          className="group flex flex-col items-stretch gap-0 border-4 border-black bg-bg-panel shadow-[8px_8px_0_0_rgba(0,0,0,1)] sm:flex-row"
          onSubmit={onSubmit}
        >
          <input
            type="email"
            placeholder={dictionary.common?.enter_email || "Enter your email"}
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
            {landing.notify_btn || dictionary.common?.scribe || "NOTIFY ME"}
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
