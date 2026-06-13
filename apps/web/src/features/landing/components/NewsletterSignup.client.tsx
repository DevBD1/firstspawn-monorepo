"use client";

import { motion } from "framer-motion";
import type { FormEvent } from "react";
import { WLButton } from "@firstspawn/ui";
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
    <div className="mx-auto w-full max-w-2xl space-y-4 text-left">
      <div>
        <h3 className="mb-2 font-display text-base tracking-normal text-foreground md:text-lg font-semibold">
          {newsletter.title}
        </h3>
        <p className="max-w-xl font-body text-sm leading-relaxed text-muted">
          {newsletter.description}
        </p>
      </div>

      {isSubscribed ? (
        <div className="border border-success/20 bg-success/10 p-4 text-center font-body text-sm font-semibold text-success rounded-xl shadow-sm">
          {newsletter.subscriptionVerified}
        </div>
      ) : confirmEmailSent ? (
        <div className="border border-primary/20 bg-primary/10 p-4 text-center font-body text-sm font-semibold text-primary rounded-xl shadow-sm">
          {newsletter.checkInbox}
        </div>
      ) : (
        <form className="flex flex-col sm:flex-row gap-3 items-stretch w-full" onSubmit={onSubmit}>
          <input
            id="landing-newsletter-email"
            name="email"
            type="email"
            placeholder={dictionary.common.placeholders.email}
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="min-h-11 flex-grow border border-border bg-secondary px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted rounded-xl outline-none focus:border-primary"
            required
          />
          <WLButton type="submit" variant="primary" size="md" className="min-h-11">
            {newsletter.submitLabel}
          </WLButton>
        </form>
      )}

      {statusMessage ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-mono text-xs text-primary"
        >
          {statusMessage}
        </motion.div>
      ) : null}
    </div>
  );
}
