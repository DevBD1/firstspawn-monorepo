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
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h3 className="mb-2 font-display text-lg tracking-wide text-white md:text-xl">
          {landing.notify_title || "BE FIRST TO SPAWN"}
        </h3>
        <p className="font-ui text-[10px] leading-relaxed text-[#6D8A99] md:text-xs">
          {landing.notify_desc ||
            "Join thousands of players waiting for launch. Early subscribers get exclusive access & founding member perks!"}
        </p>
      </div>

      {isSubscribed ? (
        <div className="animate-pulse border border-[#4ADE80]/30 bg-[#4ADE80]/10 p-4 text-center font-display text-[#4ADE80]">
          {landing.subscription_verified || "SUBSCRIPTION VERIFIED"}
        </div>
      ) : confirmEmailSent ? (
        <div className="border border-[#2EBCDA]/30 bg-[#2EBCDA]/10 p-4 text-center font-display text-[#2EBCDA]">
          {landing.check_inbox || "CHECK YOUR INBOX"}
        </div>
      ) : (
        <form
          className="group flex items-stretch gap-0 border-2 border-[#FFD700]/40 transition-colors hover:border-[#FFD700]/80 sm:flex-row"
          onSubmit={onSubmit}
        >
          <input
            type="email"
            placeholder={dictionary.common?.enter_email || "Enter your email"}
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="flex-grow bg-[#0B131A]/50 px-6 py-4 font-ui text-sm text-white placeholder-[#4B5563] focus:outline-none"
            required
          />
          <PixelButton
            type="submit"
            variant="primary"
            className="!m-0 min-w-[120px] !rounded-none !border-none !bg-[#FFD700] !text-[#0F161C] font-bold tracking-wider hover:brightness-110"
          >
            {landing.notify_btn || dictionary.common?.scribe || "NOTIFY ME"}
          </PixelButton>
        </form>
      )}

      {statusMessage ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-ui text-sm text-[#2EBCDA]">
          {statusMessage}
        </motion.div>
      ) : null}
    </div>
  );
}
