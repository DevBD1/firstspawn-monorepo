"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import PixelButton from "@/components/ui/PixelButton";
import PixelCard from "@/components/ui/PixelCard";
import Link from "next/link";

interface PrototypeDictionary {
  prototype?: {
    hero_title: string;
    hero_subtitle: string;
    cta_primary: string;
    cta_secondary: string;
    stats_servers: string;
    stats_players: string;
    stats_verified: string;
    features_title: string;
    features_subtitle: string;
    feature_1_title: string;
    feature_1_desc: string;
    feature_2_title: string;
    feature_2_desc: string;
    feature_3_title: string;
    feature_3_desc: string;
    feature_4_title: string;
    feature_4_desc: string;
    how_it_works_title: string;
    step_1_title: string;
    step_1_desc: string;
    step_2_title: string;
    step_2_desc: string;
    step_3_title: string;
    step_3_desc: string;
    cta_section_title: string;
    cta_section_subtitle: string;
  };
  [key: string]: unknown;
}

interface PrototypeLandingProps {
  lang: string;
  dictionary: PrototypeDictionary;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.215, 0.61, 0.355, 1] as const,
    },
  },
};

// const floatAnimation = {
//   y: [0, -10, 0],
//   transition: {
//     duration: 3,
//     repeat: Infinity,
//     ease: "easeInOut",
//   },
// };

// const pulseGlow = {
//   boxShadow: [
//     "0 0 20px rgba(34, 211, 238, 0.3)",
//     "0 0 40px rgba(34, 211, 238, 0.6)",
//     "0 0 20px rgba(34, 211, 238, 0.3)",
//   ],
//   transition: {
//     duration: 2,
//     repeat: Infinity,
//     ease: "easeInOut",
//   },
// };

export default function PrototypeLanding({ dictionary }: PrototypeLandingProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const d = dictionary.prototype || {
    hero_title: "DISCOVER YOUR NEXT\nADVENTURE",
    hero_subtitle:
      "The first verified discovery platform for Minecraft and Hytale servers. Real players. Real uptime. Real communities.",
    cta_primary: "START EXPLORING",
    cta_secondary: "ADD YOUR SERVER",
    stats_servers: "SERVERS",
    stats_players: "PLAYERS",
    stats_verified: "VERIFIED",
    features_title: "WHY FIRSTSPAWN?",
    features_subtitle: "Built differently for the voxel gaming community",
    feature_1_title: "VERIFIED UPTIME",
    feature_1_desc:
      "No more fake online counts. Our bots verify every server's status in real-time.",
    feature_2_title: "PROOF OF PLAY",
    feature_2_desc: "Reviews backed by actual playtime. Only real players can leave ratings.",
    feature_3_title: "CROSS-PLATFORM ID",
    feature_3_desc: "One identity across Minecraft, Hytale, and beyond. Sync your journey.",
    feature_4_title: "GUILD SYSTEM",
    feature_4_desc: "Form alliances, compete on leaderboards, and unlock exclusive rewards.",
    how_it_works_title: "HOW IT WORKS",
    step_1_title: "DISCOVER",
    step_1_desc: "Browse verified servers with real player reviews and live uptime data.",
    step_2_title: "CONNECT",
    step_2_desc: "Join with one click. Your profile syncs across all supported games.",
    step_3_title: "CONTRIBUTE",
    step_3_desc: "Leave reviews, earn badges, and climb the reputation ladder.",
    cta_section_title: "READY TO SPAWN?",
    cta_section_subtitle: "Join thousands of players finding their forever servers.",
  };

  const features = [
    { title: d.feature_1_title, desc: d.feature_1_desc, icon: "⚡" },
    { title: d.feature_2_title, desc: d.feature_2_desc, icon: "✓" },
    { title: d.feature_3_title, desc: d.feature_3_desc, icon: "◆" },
    { title: d.feature_4_title, desc: d.feature_4_desc, icon: "★" },
  ];

  const steps = [
    { num: "01", title: d.step_1_title, desc: d.step_1_desc },
    { num: "02", title: d.step_2_title, desc: d.step_2_desc },
    { num: "03", title: d.step_3_title, desc: d.step_3_desc },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated Background Grid */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      {/* Floating Orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-accent-cyan/5 blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -right-32 bottom-40 h-96 w-96 rounded-full bg-primary/5 blur-[100px]"
      />

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/5 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              <span className="font-ui text-lg tracking-wider text-accent-cyan">
                SYSTEM OPERATIONAL
              </span>
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="mb-6 whitespace-pre-line font-display text-4xl leading-tight tracking-wider text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {d.hero_title.split("\n").map((line, i) => (
              <span key={i} className={i === 1 ? "text-accent-cyan" : ""}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mx-auto mb-10 max-w-2xl font-body text-lg leading-relaxed text-foreground/70 sm:text-xl"
          >
            {d.hero_subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/discover">
              <PixelButton variant="primary" size="lg">
                {d.cta_primary}
              </PixelButton>
            </Link>
            <Link href="/console">
              <PixelButton variant="outline" size="lg">
                {d.cta_secondary}
              </PixelButton>
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-8 border-y border-foreground/10 py-8"
          >
            {[
              { value: "2,400+", label: d.stats_servers },
              { value: "140K+", label: d.stats_players },
              { value: "100%", label: d.stats_verified },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-2xl text-accent-cyan sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 font-ui text-sm tracking-wider text-foreground/50">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-ui text-xs tracking-widest text-foreground/40">SCROLL</span>
            <div className="h-8 w-5 rounded-full border-2 border-foreground/30 p-1">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-accent-cyan"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-display text-3xl tracking-wider text-foreground sm:text-4xl">
              {d.features_title}
            </h2>
            <p className="font-body text-lg text-foreground/60">{d.features_subtitle}</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative"
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    hoveredFeature === i ? "-translate-y-2" : ""
                  }`}
                >
                  <PixelCard className="h-full">
                    <div className="flex h-full flex-col">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-accent-cyan/40 bg-accent-cyan/10">
                        <span className="font-display text-xl text-accent-cyan">
                          {feature.icon}
                        </span>
                      </div>
                      <h3 className="mb-2 font-display text-sm tracking-wider text-foreground">
                        {feature.title}
                      </h3>
                      <p className="flex-1 font-body text-sm leading-relaxed text-foreground/60">
                        {feature.desc}
                      </p>
                    </div>
                  </PixelCard>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 bg-bg-panel/50 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 font-display text-3xl tracking-wider text-foreground sm:text-4xl">
              {d.how_it_works_title}
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-accent-cyan/50 via-accent-cyan/20 to-transparent md:block" />

            <div className="space-y-12">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className={`relative flex items-center gap-8 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div
                      className={`inline-flex items-center gap-4 ${
                        i % 2 === 0 ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      <span className="font-display text-5xl text-accent-cyan/20">{step.num}</span>
                      <div>
                        <h3 className="mb-2 font-display text-xl tracking-wider text-foreground">
                          {step.title}
                        </h3>
                        <p className="max-w-sm font-body text-foreground/60">{step.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Center Node */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="relative z-10 hidden h-4 w-4 rounded-full border-2 border-accent-cyan bg-background shadow-[0_0_20px_rgba(34,211,238,0.5)] md:block"
                  />

                  {/* Spacer */}
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          <div className="relative overflow-hidden border-4 border-accent-cyan/30 bg-bg-panel p-8 shadow-[8px_8px_0_rgba(34,211,238,0.1)] sm:p-12">
            {/* Decorative Corners */}
            <div className="absolute -left-1 -top-1 h-4 w-4 border-l-4 border-t-4 border-accent-cyan" />
            <div className="absolute -right-1 -top-1 h-4 w-4 border-r-4 border-t-4 border-accent-cyan" />
            <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-4 border-l-4 border-accent-cyan" />
            <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-4 border-r-4 border-accent-cyan" />

            {/* Animated background effect */}
            <motion.div
              animate={{
                background: [
                  "radial-gradient(circle at 20% 50%, rgba(34,211,238,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 50%, rgba(34,211,238,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 50%, rgba(34,211,238,0.1) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute inset-0"
            />

            <div className="relative z-10 text-center">
              <h2 className="mb-4 font-display text-3xl tracking-wider text-foreground sm:text-4xl">
                {d.cta_section_title}
              </h2>
              <p className="mx-auto mb-8 max-w-xl font-body text-lg text-foreground/60">
                {d.cta_section_subtitle}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <PixelButton variant="success" size="lg">
                    CREATE ACCOUNT
                  </PixelButton>
                </Link>
                <Link href="/discover">
                  <PixelButton variant="secondary" size="lg">
                    BROWSE SERVERS
                  </PixelButton>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer spacer */}
      <div className="h-8" />
    </div>
  );
}
