"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import posthog from "posthog-js";
import { WLButton } from "@firstspawn/ui";
import type { Locale } from "@/lib/i18n-config";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import {
  readStoredCookieConsent,
  writeStoredCookieConsent,
  type CookieConsentMode,
} from "@/lib/cookie-consent";

export interface CookieConsentProps {
  lang: Locale;
  dictionary: AppDictionary;
}

const LINK_CLASS =
  "font-medium text-primary underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary-hover";

interface ConsentToggleProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onToggle?: () => void;
}

function ConsentToggle({ checked, disabled = false, label, onToggle }: ConsentToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={checked}
      className={`flex items-center gap-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
          checked ? "border-primary-hover bg-primary" : "border-border bg-secondary"
        }`}
      >
        <span
          className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all ${
            checked ? "right-[3px] bg-on-primary" : "left-[3px] bg-foreground/70"
          }`}
        />
      </span>
      <span className="font-ui text-sm leading-none text-foreground">{label}</span>
    </button>
  );
}

export default function CookieConsent({ lang, dictionary }: CookieConsentProps) {
  const copy = dictionary.cookieConsent;
  const [isVisible, setIsVisible] = useState(false);
  const [isManagingSettings, setIsManagingSettings] = useState(false);
  const [statisticsEnabled, setStatisticsEnabled] = useState(true);

  const hrefs = useMemo(
    () => ({
      learnMore: `/${lang}/privacy`,
      privacy: `/${lang}/privacy`,
      terms: `/${lang}/terms`,
      services: `/${lang}/terms`,
    }),
    [lang]
  );

  useEffect(() => {
    const consent = readStoredCookieConsent();
    if (consent === null) {
      const timer = setTimeout(() => setIsVisible(true), 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const persistConsent = (mode: CookieConsentMode) => {
    writeStoredCookieConsent(mode);

    if (mode === "all") {
      requestAnimationFrame(() => {
        posthog.capture("cookieConsentUpdated", { mode });
      });
    }

    setIsVisible(false);
    setIsManagingSettings(false);
  };

  const handleAcceptAll = () => persistConsent("all");
  const handleSavePreferences = () => persistConsent(statisticsEnabled ? "all" : "essential");

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-[38rem] rounded-[var(--radius-modal)] border border-border bg-bg-panel px-5 pb-5 pt-6 text-center shadow-[var(--shadow-modal)] sm:px-7 sm:pb-6"
          >
            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-primary">
                {copy.title}
              </span>
            </div>

            {!isManagingSettings ? (
              <>
                <div className="mx-auto max-w-[33.5rem] space-y-3.5 font-body text-sm leading-relaxed text-foreground/80">
                  <p>
                    {copy.introPrefix}{" "}
                    <Link href={hrefs.learnMore} className={LINK_CLASS}>
                      {copy.introLinkLabel}
                    </Link>{" "}
                    {copy.introSuffix}
                  </p>
                  <p>
                    {copy.consentPrefix}{" "}
                    <Link href={hrefs.privacy} className={LINK_CLASS}>
                      {copy.privacyLinkLabel}
                    </Link>{" "}
                    {copy.consentMiddle}{" "}
                    <Link href={hrefs.terms} className={LINK_CLASS}>
                      {copy.termsLinkLabel}
                    </Link>{" "}
                    {copy.consentSuffix}{" "}
                    <Link href={hrefs.services} className={LINK_CLASS}>
                      {copy.servicesLinkLabel}
                    </Link>
                    .
                  </p>
                </div>

                <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                  <WLButton type="button" variant="primary" onClick={handleAcceptAll}>
                    {copy.acceptAll}
                  </WLButton>
                  <WLButton
                    type="button"
                    variant="secondary"
                    onClick={() => setIsManagingSettings(true)}
                  >
                    {copy.manageSettings}
                  </WLButton>
                </div>
              </>
            ) : (
              <div className="mx-auto max-w-[33.5rem] space-y-5">
                <p className="mx-auto max-w-[30rem] font-body text-sm leading-relaxed text-foreground/75">
                  {copy.manageDescription}
                </p>

                <div className="mx-auto grid max-w-[24rem] grid-cols-1 gap-x-8 gap-y-3.5 text-left sm:grid-cols-2">
                  <ConsentToggle checked disabled label={copy.categoryNecessary} />
                  <ConsentToggle checked={false} disabled label={copy.categoryPersonalization} />
                  <ConsentToggle
                    checked={statisticsEnabled}
                    label={copy.categoryStatistics}
                    onToggle={() => setStatisticsEnabled((current) => !current)}
                  />
                  <ConsentToggle checked={false} disabled label={copy.categoryMarketing} />
                </div>

                <p className="font-body text-xs leading-snug text-muted">
                  {copy.categoryUnavailable}
                </p>

                <div className="flex flex-col items-center justify-center gap-2.5 pt-1 sm:flex-row">
                  <WLButton type="button" variant="primary" onClick={handleAcceptAll}>
                    {copy.acceptAll}
                  </WLButton>
                  <WLButton type="button" variant="secondary" onClick={handleSavePreferences}>
                    {copy.acceptSelected}
                  </WLButton>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
