"use client";

import NewsletterCaptcha from "@/features/captcha/components/NewsletterCaptcha.client";
import { useNewsletterSignup } from "@/features/landing/hooks/useNewsletterSignup";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import LandingNewsletterSection from "./LandingNewsletterSection.client";

interface LandingNewsletterBlockProps {
  dictionary: AppDictionary;
  lang: string;
  id?: string;
}

export default function LandingNewsletterBlock({
  dictionary,
  lang,
  id,
}: LandingNewsletterBlockProps) {
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
        id={id}
        dictionary={dictionary}
        confirmEmailSent={confirmEmailSent}
        email={email}
        isSubscribed={isSubscribed}
        onEmailChange={setEmail}
        onSubmit={handleSubscribe}
        statusMessage={statusMessage}
      />

      <NewsletterCaptcha
        dictionary={dictionary}
        isOpen={showCaptcha}
        onClose={closeCaptcha}
        onVerify={handleVerifySuccess}
      />
    </>
  );
}
