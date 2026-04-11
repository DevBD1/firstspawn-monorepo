"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PixelButton from "@/components/ui/PixelButton";
import NewsletterCaptcha from "@/features/captcha/components/NewsletterCaptcha.client";
import { useNewsletterSignup } from "@/features/landing/hooks/useNewsletterSignup";
import type { LandingPageProps } from "@/features/landing/types";
import LandingScene from "./LandingScene.client";
import NewsletterSignup from "./NewsletterSignup.client";

export default function LandingPage({ lang, dictionary }: LandingPageProps) {
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
  } = useNewsletterSignup(lang);

  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((previous) => (previous.length >= 3 ? "" : `${previous}.`));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const landing = dictionary.landing || {};
  const prototype = dictionary.prototype || {};
  const heroTitle = (prototype.hero_title || dictionary.common?.brand || "")
    .split("\n")
    .filter(Boolean);
  const stats = [
    { value: "2,400+", label: prototype.stats_servers || "" },
    { value: "140K+", label: prototype.stats_players || "" },
    { value: "100%", label: prototype.stats_verified || "" },
  ];
  const features = [
    landing.feature_servers,
    landing.feature_verified,
    landing.feature_uptime,
    landing.feature_anticheat,
  ].filter(Boolean);

  return (
    <LandingScene>
      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-28 pt-12 md:px-8 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12"
        >
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 border-4 border-black bg-bg-panel px-4 py-3 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
              <motion.span
                className="h-3 w-3 border-2 border-black bg-success"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
              />
              <span className="font-ui text-base tracking-[0.18em] text-fs-diamond">
                {landing.status} {landing.active}
                {dots}
              </span>
            </div>

            <div className="space-y-5">
              <p className="font-display text-sm tracking-[0.24em] text-foreground">
                {dictionary.common?.brand}
              </p>
              <div className="space-y-3">
                {heroTitle.map((line, index) => (
                  <motion.h1
                    key={line}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.08, duration: 0.2 }}
                    className={`font-display text-4xl leading-tight tracking-[0.12em] sm:text-5xl md:text-6xl xl:text-7xl ${
                      index === heroTitle.length - 1 ? "text-fs-diamond" : "text-foreground"
                    }`}
                  >
                    {line}
                  </motion.h1>
                ))}
              </div>
              <p className="max-w-2xl font-body text-base leading-7 text-foreground/75 md:text-lg">
                {prototype.hero_subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <PixelButton href={`/${lang}/discover`} variant="diamond" size="lg">
                {prototype.cta_primary}
              </PixelButton>
              <PixelButton href={`/${lang}/console`} variant="outline" size="lg">
                {prototype.cta_secondary}
              </PixelButton>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.06, duration: 0.18 }}
                  className="border-4 border-black bg-bg-panel px-4 py-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                >
                  <div className="mb-2 h-2 w-10 bg-fs-diamond" />
                  <p className="font-ui text-base tracking-[0.14em] text-foreground/80">
                    {feature}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            className="border-4 border-black bg-bg-panel p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
          >
            <div className="mb-5 flex items-center justify-between border-b-4 border-black pb-4">
              <div>
                <p className="font-display text-xs tracking-[0.16em] text-fs-diamond">
                  {landing.building_title}
                </p>
                <p className="mt-2 font-ui text-base tracking-[0.16em] text-foreground/65">
                  {landing.under_construction}
                </p>
              </div>
              <div className="border-4 border-black bg-background px-3 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <span className="font-display text-xs tracking-[0.14em] text-success">
                  {landing.active}
                </span>
              </div>
            </div>

            <div className="mb-5 border-4 border-black bg-background p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 24 }).map((_, index) => (
                  <motion.div
                    key={index}
                    className={`aspect-square border-2 border-black ${
                      index % 5 === 0
                        ? "bg-success"
                        : index % 3 === 0
                          ? "bg-fs-diamond"
                          : "bg-secondary"
                    }`}
                    animate={{ opacity: index % 3 === 0 ? [0.55, 1, 0.55] : 1 }}
                    transition={{
                      duration: 1 + (index % 4) * 0.12,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between border-4 border-black bg-background px-4 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                >
                  <span className="font-ui text-sm tracking-[0.16em] text-foreground/65">
                    {stat.label}
                  </span>
                  <span className="font-display text-lg tracking-[0.14em] text-fs-diamond">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-4 border-black bg-background p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="mb-2 flex items-center justify-between font-ui text-sm tracking-[0.16em] text-foreground/65">
                <span>{landing.progress}</span>
                <span>42%</span>
              </div>
              <div className="border-2 border-black bg-secondary p-1">
                <motion.div
                  className="h-4 bg-fs-diamond"
                  initial={{ width: "0%" }}
                  animate={{ width: "42%" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.aside>
        </motion.div>

        <motion.div
          id="notify-signup"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.25 }}
          className="border-4 border-black bg-background/95 p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:p-8"
        >
          <NewsletterSignup
            dictionary={dictionary}
            confirmEmailSent={confirmEmailSent}
            email={email}
            isSubscribed={isSubscribed}
            statusMessage={statusMessage}
            onEmailChange={setEmail}
            onSubmit={handleSubscribe}
          />
        </motion.div>
      </section>

      <NewsletterCaptcha
        isOpen={showCaptcha}
        onClose={closeCaptcha}
        onVerify={handleVerifySuccess}
      />
    </LandingScene>
  );
}
