"use client";

import NewsletterCaptcha from "@/features/captcha/components/NewsletterCaptcha.client";
import { useNewsletterSignup } from "@/features/landing/hooks/useNewsletterSignup";
import type { LandingDictionary } from "@/features/landing/types";
import LandingNewsletterSection from "./LandingNewsletterSection.client";

interface LandingNewsletterBlockProps {
  dictionary: LandingDictionary;
  lang: string;
}

export default function LandingNewsletterBlock({ dictionary, lang }: LandingNewsletterBlockProps) {
  const {
    confirmEmailSent,
    email,
    isSubscribed,
    showCaptcha,
    statusMessage,
    closeCaptcha,
    handleSubscribe,
    handleVerifySuccess,
    setEmail,
  } = useNewsletterSignup(lang, dictionary);

  return (
    <>
      <LandingNewsletterSection
        dictionary={dictionary}
        confirmEmailSent={confirmEmailSent}
        email={email}
        isSubscribed={isSubscribed}
        onEmailChange={setEmail}
        onSubmit={handleSubscribe}
        statusMessage={statusMessage}
      />

      <NewsletterCaptcha
        isOpen={showCaptcha}
        onClose={closeCaptcha}
        onVerify={handleVerifySuccess}
      />
    </>
  );
}
