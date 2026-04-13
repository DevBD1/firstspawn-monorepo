"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NewsletterCaptcha from "@/features/captcha/components/NewsletterCaptcha.client";
import { useNewsletterSignup } from "@/features/landing/hooks/useNewsletterSignup";
import type { LandingPageProps } from "@/features/landing/types";
import LandingScene from "./LandingScene.client";
import NewsletterSignup from "./NewsletterSignup.client";
import HeroSearchBar from "./HeroSearchBar";
import QuickTags from "./QuickTags";
import ServerCard from "@/features/server/components/ServerCard";

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

  // Using mock servers for the layout phase to demonstrate the link-equity block
  const mockServers = [
    {
      id: "1",
      slug: "hypixel",
      name: "Hypixel Network",
      gameVersion: "1.20.1",
      onlinePlayers: 45021,
      maxPlayers: 100000,
      isOnline: true,
      modsRequired: false,
    },
    {
      id: "2",
      slug: "wynncraft",
      name: "Wynncraft MMO",
      gameVersion: "1.19.4",
      onlinePlayers: 2154,
      maxPlayers: 5000,
      isOnline: true,
      modsRequired: true,
    },
    {
      id: "3",
      slug: "complex-gaming",
      name: "Complex Gaming",
      gameVersion: "1.16.5",
      onlinePlayers: 1400,
      maxPlayers: 3000,
      isOnline: true,
      modsRequired: true,
    },
    {
      id: "4",
      slug: "manacube",
      name: "ManaCube Search",
      gameVersion: "1.20.1",
      onlinePlayers: 4200,
      maxPlayers: 10000,
      isOnline: true,
      modsRequired: false,
    },
  ];

  return (
    <LandingScene>
      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-28 pt-12 md:px-8 md:pt-20">
        {/* Instant Discovery Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center gap-8 w-full xl:pt-10"
        >
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

          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="font-display text-4xl leading-tight tracking-[0.12em] sm:text-5xl md:text-6xl text-foreground">
              {heroTitle[0]} <span className="text-fs-diamond">{heroTitle[1]}</span>
            </h1>
            <p className="font-body text-base md:text-lg text-foreground/75 uppercase tracking-wide">
              Enter a server name or IP to find the perfect match right now.
            </p>
          </div>

          <div className="w-full mt-4">
            <HeroSearchBar />
            <QuickTags lang={lang} />
          </div>
        </motion.div>

        {/* Live Trending Section */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.25 }}
          className="space-y-6 pt-4 w-full"
        >
          <div className="flex items-center gap-4 border-b-4 border-black pb-4 mb-6">
            <motion.div
              className="h-4 w-4 border-2 border-black bg-success shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <h2 className="font-display text-2xl tracking-[0.1em] text-foreground lowercase">
              T<span className="text-fs-diamond">r</span>ending s
              <span className="text-fs-diamond">e</span>rvers
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            {mockServers.map((server, index) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.06, duration: 0.18 }}
              >
                <ServerCard {...server} lang={lang} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          id="notify-signup"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.25 }}
          className="border-4 border-black bg-background/95 p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] md:p-8 mt-10"
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
