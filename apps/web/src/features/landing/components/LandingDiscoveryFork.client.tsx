"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PixelButton } from "@firstspawn/ui";

export default function LandingDiscoveryFork() {
  const [activeSide, setActiveSide] = useState<"player" | "host" | null>(null);

  return (
    <motion.section
      id="discovery-fork"
      className="py-24 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 1 }}
    >
      <div className="text-center mb-16">
        <h2 className="font-ui text-4xl sm:text-5xl uppercase text-foreground mb-4">
          Discovery: Redefined
        </h2>
        <p className="font-body text-muted max-w-2xl mx-auto">
          One platform. Two parallel worlds. Choose your uplink.
        </p>
      </div>

      <div className="flex flex-col md:flex-row min-h-[900px] md:h-[650px] w-full border-[6px] border-black shadow-[10px_10px_0_0_rgba(0,0,0,1)] md:shadow-[20px_20px_0_0_rgba(0,0,0,1)] bg-black overflow-hidden relative">
        {/* PLAYER SIDE */}
        <motion.div
          animate={{ flexGrow: activeSide === "host" ? 1 : activeSide === "player" ? 3 : 2 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          onHoverStart={() => setActiveSide("player")}
          onHoverEnd={() => setActiveSide(null)}
          className="bg-bg-panel p-8 md:p-12 relative flex flex-col justify-center border-b-[6px] md:border-b-0 md:border-r-[6px] border-black cursor-crosshair group overflow-hidden min-h-[450px] md:min-h-0"
        >
          {/* Scanlines Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-20" />

          {/* Hover Glow Effect */}
          <motion.div
            animate={{ opacity: activeSide === "player" ? 0.08 : 0.02 }}
            className="absolute inset-0 bg-primary pointer-events-none transition-opacity z-10"
          />

          <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-30" />

          <div className="relative z-10 space-y-6">
            <span className="font-display text-[10px] text-primary tracking-widest">
              [CHANNEL_01: PLAYER]
            </span>
            <h3 className="font-ui text-4xl md:text-5xl text-white uppercase leading-none">
              Neural
              <br />
              Discovery
            </h3>
            <p className="font-body text-foreground/80 text-sm max-w-xs leading-relaxed">
              Find hidden gems through deep-pulse playtime metrics and community reputation.
            </p>
            <div className="pt-4">
              <PixelButton variant="primary" size="md">
                START_EXPLORING
              </PixelButton>
            </div>
          </div>
        </motion.div>

        {/* HOST SIDE */}
        <motion.div
          animate={{ flexGrow: activeSide === "player" ? 1 : activeSide === "host" ? 3 : 2 }}
          transition={{ duration: 0.2, ease: "circIn" }}
          onHoverStart={() => setActiveSide("host")}
          onHoverEnd={() => setActiveSide(null)}
          className="bg-[#1E1A0A] p-8 md:p-12 relative flex flex-col justify-center cursor-pointer group overflow-hidden min-h-[400px] md:min-h-0"
        >
          {/* Scanlines Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-20" />

          {/* Hover Glow Effect */}
          <motion.div
            animate={{ opacity: activeSide === "host" ? 0.05 : 0 }}
            className="absolute inset-0 bg-fs-gold pointer-events-none transition-opacity z-10"
          />

          <div className="absolute top-0 left-0 w-full h-1 bg-fs-gold opacity-30" />

          <div className="relative z-10 space-y-6 text-right flex flex-col items-end">
            <span className="font-display text-[10px] text-fs-gold tracking-widest">
              [CHANNEL_02: HOST]
            </span>
            <h3 className="font-ui text-4xl md:text-5xl text-white uppercase leading-none">
              Intelligence
              <br />
              Hub
            </h3>
            <p className="font-body text-foreground/80 text-sm max-w-xs leading-relaxed">
              Access real-time growth heatmaps and precision player demographics.
            </p>
            <div className="pt-4">
              <PixelButton variant="gold" size="md">
                ACCESS_DASHBOARD
              </PixelButton>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
