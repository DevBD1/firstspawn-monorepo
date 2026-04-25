"use client";

import { motion } from "framer-motion";
import type { LandingContentModel } from "@/features/landing/types";

interface LandingProblemSolutionProps {
  content: LandingContentModel;
}

export default function LandingProblemSolution({ content }: LandingProblemSolutionProps) {
  const copy = content.landing.problemSolution;

  const itemVariants = {
    initial: { opacity: 0, x: -10 },
    whileInView: { opacity: 1, x: 0 },
  };

  const glitchVariants = {
    hover: {
      textShadow: [
        "2px 0px 0px rgba(255,0,0,0.5)",
        "-2px 0px 0px rgba(0,255,255,0.5)",
        "0px 0px 0px rgba(0,0,0,0)",
      ],
      x: [0, -1, 1, -1, 0],
      transition: {
        duration: 0.2,
        repeat: Infinity,
        repeatType: "mirror" as const,
      },
    },
  };

  return (
    <section className="py-24">
      <div className="text-center mb-20">
        <span className="font-ui text-xs uppercase tracking-[0.5em] text-primary mb-4 block">
          {copy.eyebrow}
        </span>
        <h2 className="font-ui text-5xl uppercase text-foreground mb-6">{copy.title}</h2>
        <div className="h-1 w-24 bg-primary mx-auto mb-8 opacity-50" />
        <p className="font-body text-foreground/80 text-lg max-w-2xl mx-auto leading-relaxed">
          {copy.subtitle}
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-2 max-w-6xl mx-auto border-[6px] border-black shadow-[20px_20px_0_0_rgba(0,0,0,1)] bg-black overflow-hidden relative">
        {/* THE PROBLEM - Left Side */}
        <motion.div
          whileHover="hover"
          className="bg-bg-panel p-10 md:p-14 border-b-[6px] lg:border-b-0 lg:border-r-[6px] border-black relative group cursor-crosshair overflow-hidden"
        >
          {/* Phosphor Glow Layer */}
          <motion.div
            variants={{ hover: { opacity: 0.05 } }}
            className="absolute inset-0 bg-[var(--error-glow)] opacity-0 transition-opacity duration-300 pointer-events-none"
          />

          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-[var(--error-glow)] animate-pulse" />
              <span className="font-display text-[9px] uppercase text-[var(--error-glow)] tracking-tighter">
                {copy.problem.statusLabel}
              </span>
            </div>
          </div>

          <motion.h3
            variants={glitchVariants}
            className="font-ui text-4xl uppercase text-foreground mb-10 leading-none tracking-tight relative z-10 whitespace-pre-line"
          >
            {copy.problem.title}
          </motion.h3>

          <div className="space-y-10 relative z-10">
            {copy.problem.items.map((item, i) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                initial="initial"
                whileInView="whileInView"
                transition={{ delay: i * 0.1, duration: 0 }}
                className="flex gap-6 group/item"
              >
                <span className="text-[var(--error-glow)] font-body text-xl font-bold leading-none mt-1">
                  ✕
                </span>
                <div>
                  <h4 className="font-ui text-lg uppercase text-[color-mix(in_srgb,var(--error-glow),transparent_10%)] mb-2 tracking-tight">
                    {item.title}
                  </h4>
                  <p className="font-body text-sm text-foreground/80 leading-relaxed max-w-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scanner Line Effect */}
          <motion.div
            variants={{ hover: { top: ["0%", "100%"], opacity: [0, 1, 0] } }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[2px] bg-[color-mix(in_srgb,var(--error-glow),transparent_80%)] pointer-events-none opacity-0"
          />
        </motion.div>

        {/* THE SOLUTION - Right Side */}
        <motion.div
          whileHover="hover"
          className="bg-bg-panel p-10 md:p-14 relative group cursor-pointer overflow-hidden"
        >
          {/* Phosphor Glow Layer */}
          <motion.div
            variants={{ hover: { opacity: 0.05 } }}
            className="absolute inset-0 bg-primary opacity-0 transition-opacity duration-300 pointer-events-none"
          />

          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-primary animate-retro-pulse" />
              <span className="font-display text-[9px] uppercase text-primary tracking-tighter">
                {copy.solution.statusLabel}
              </span>
            </div>
          </div>

          <motion.h3
            variants={glitchVariants}
            className="font-ui text-4xl uppercase text-foreground mb-10 leading-none tracking-tight relative z-10 whitespace-pre-line"
          >
            {copy.solution.title}
          </motion.h3>

          <div className="space-y-10 relative z-10">
            {copy.solution.items.map((item, i) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                initial="initial"
                whileInView="whileInView"
                transition={{ delay: i * 0.1, duration: 0 }}
                className="flex gap-6 group/item"
              >
                <span className="text-primary font-body text-xl font-bold leading-none mt-1">
                  ✓
                </span>
                <div>
                  <h4 className="font-ui text-lg uppercase text-primary mb-2 tracking-tight">
                    {item.title}
                  </h4>
                  <p className="font-body text-sm text-foreground/80 leading-relaxed max-w-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scanner Line Effect */}
          <motion.div
            variants={{ hover: { top: ["0%", "100%"], opacity: [0, 1, 0] } }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[2px] bg-primary/30 pointer-events-none opacity-0"
          />
        </motion.div>
      </div>
    </section>
  );
}
