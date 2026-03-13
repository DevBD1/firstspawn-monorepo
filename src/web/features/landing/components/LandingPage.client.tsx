"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

  return (
    <LandingScene>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-4xl border-4 border-[#FFD700] bg-[#060B10] p-8 text-center md:p-12"
        style={{ boxShadow: "8px 8px 0 #CC5500, 0 0 60px rgba(255,215,0,0.2)" }}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-[#1A1A1A] bg-[#FFD700] px-6 py-2">
          <span className="font-display text-sm font-bold tracking-wider text-[#1A1A1A]">
            ⚠ {landing.under_construction || "UNDER CONSTRUCTION"} ⚠
          </span>
        </div>

        <motion.h1
          className="mt-4 mb-4 bg-gradient-to-b from-[#FFD700] to-[#FF6B00] bg-clip-text font-display text-4xl font-black tracking-tight text-transparent md:text-6xl"
          animate={{
            textShadow: [
              "0 0 20px rgba(255,215,0,0.5)",
              "0 0 40px rgba(255,215,0,0.8)",
              "0 0 20px rgba(255,215,0,0.5)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {dictionary.common?.brand || "FIRSTSPAWN"}
        </motion.h1>

        <div className="relative mb-8 border-2 border-dashed border-[#FFD700]/50 bg-[#0F161C] p-6">
          <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-[#FFD700]" />
          <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-[#FFD700]" />
          <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#FFD700]" />
          <div className="absolute right-0 bottom-0 h-3 w-3 border-r-2 border-b-2 border-[#FFD700]" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="relative">
                <div className="mx-auto h-4 w-8 rounded-t-sm border-b-2 border-[#DAA520] bg-[#FFD700]" />
                <div className="mx-auto h-6 w-6 bg-[#FDBF6F]" />
                <div className="mx-auto h-8 w-8 border-2 border-[#CC5500] bg-[#FF6B00]" />
              </div>
              <div className="text-left">
                <h2 className="mb-2 font-display text-lg text-[#2EBCDA] md:text-xl">
                  {landing.building_title || "BUILDING THE ULTIMATE DISCOVERY ECOSYSTEM"}
                </h2>
                <p className="font-ui text-sm text-[#6D8A99]">
                  {landing.status || "STATUS"}:{" "}
                  <span className="text-[#4ADE80]">
                    {landing.active || "ACTIVE"}
                    {dots}
                  </span>
                </p>
              </div>
            </div>

            <p className="mx-auto mb-4 max-w-xl font-ui text-sm leading-relaxed text-[#9CA3AF] md:text-base">
              {landing.building_desc ||
                "More than just a server list — FirstSpawn is a social network for Minecraft & Hytale players. Sync your cross-platform identity, leave reviews backed by verified playtime, solve puzzles to win prizes, form Guilds, and earn reputation badges."}
            </p>

            <div className="mx-auto max-w-md">
              <div className="mb-2 flex justify-between font-ui text-xs text-[#6D8A99]">
                <span>{landing.progress || "PROGRESS"}</span>
                <span>42%</span>
              </div>
              <div className="h-4 overflow-hidden border border-[#2EBCDA]/30 bg-[#1A2633]">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#4ADE80] via-[#2EBCDA] to-[#4ADE80]"
                  style={{ backgroundSize: "200% 100%" }}
                  initial={{ width: "0%" }}
                  animate={{ width: "42%", backgroundPosition: ["0% 0%", "100% 0%"] }}
                  transition={{
                    width: { duration: 1.5, ease: "easeOut" },
                    backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: "⛏️", label: landing.feature_servers || "MINECRAFT & HYTALE" },
            { icon: "⏱️", label: landing.feature_verified || "VERIFIED PLAYTIME" },
            { icon: "🏰", label: landing.feature_uptime || "GUILDS & BADGES" },
            { icon: "🏆", label: landing.feature_anticheat || "WIN PRIZES" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="border border-[#2EBCDA]/20 bg-[#0F161C] p-3 transition-colors hover:border-[#2EBCDA]/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="mb-1 text-2xl">{feature.icon}</div>
              <div className="font-ui text-[8px] text-[#6D8A99] md:text-xs">{feature.label}</div>
            </motion.div>
          ))}
        </div>

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

      <NewsletterCaptcha
        isOpen={showCaptcha}
        onClose={closeCaptcha}
        onVerify={handleVerifySuccess}
      />
    </LandingScene>
  );
}
