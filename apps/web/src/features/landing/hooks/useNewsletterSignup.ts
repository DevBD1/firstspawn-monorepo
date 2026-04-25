"use client";

import { useEffect, useState, type FormEvent } from "react";
import { trackNewsletterFormSubmitted } from "@/features/landing/lib/analytics";
import type { AppDictionary } from "@/lib/dictionaries/schema";

interface UseNewsletterSignupReturn {
  confirmEmailSent: boolean;
  email: string;
  isSubscribed: boolean;
  showCaptcha: boolean;
  statusMessage: string;
  closeCaptcha: () => void;
  handleSubscribe: (event: FormEvent) => void;
  handleVerifySuccess: () => Promise<void>;
  setEmail: (value: string) => void;
}

export function useNewsletterSignup(
  lang: string,
  dictionary?: AppDictionary
): UseNewsletterSignupReturn {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const newsletter = dictionary?.landing.newsletter;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("confirmed") === "true") {
      setIsSubscribed(true);
    }
  }, []);

  const handleSubscribe = (event: FormEvent) => {
    event.preventDefault();
    trackNewsletterFormSubmitted(email, lang);
    setShowCaptcha(true);
  };

  const handleVerifySuccess = async () => {
    setShowCaptcha(false);
    setStatusMessage(newsletter?.verifying ?? "");

    const { subscribeToNewsletter } = await import("@/app/actions/newsletter");
    const result = await subscribeToNewsletter(email);

    if (result.success) {
      setConfirmEmailSent(true);
      setStatusMessage("");
      return;
    }

    setStatusMessage(result.message || newsletter?.errorMessage || "");
    setTimeout(() => setStatusMessage(""), 3000);
  };

  return {
    confirmEmailSent,
    email,
    isSubscribed,
    showCaptcha,
    statusMessage,
    closeCaptcha: () => setShowCaptcha(false),
    handleSubscribe,
    handleVerifySuccess,
    setEmail,
  };
}
