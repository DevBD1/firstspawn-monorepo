"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PixelButton, PixelCard } from "@firstspawn/ui";
import type { LandingContentModel } from "@/features/landing/types";

interface LandingTerminalHeroProps {
  content: LandingContentModel;
  lang: string;
}

export default function LandingTerminalHero({ content, lang }: LandingTerminalHeroProps) {
  const [mountedData, setMountedData] = useState<{ isMounted: boolean; voidData: string[][] }>({
    isMounted: false,
    voidData: [],
  });
  const terminalEyebrow = content.landing.questBoard.eyebrow;

  useEffect(() => {
    // Generate static void data once on mount to avoid re-render loops and hydration issues
    const data = Array.from({ length: 40 }, () =>
      Array.from({ length: 100 }, () =>
        Math.random() > 0.99 ? (Math.random() > 0.5 ? "0" : "1") : " "
      )
    );

    // Defer to next frame to satisfy strict 'no-sync-setstate-in-effect' linting
    requestAnimationFrame(() => {
      setMountedData({ isMounted: true, voidData: data });
    });
  }, []);

  return (
    <section
      aria-label={terminalEyebrow}
      className="relative flex min-h-[85svh] flex-col items-center justify-center py-12"
    >
      {/* Background Ambience: The "Void" */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none overflow-hidden">
        {mountedData.isMounted && (
          <pre className="text-[10px] leading-none font-body select-none">
            {mountedData.voidData.map((row, i) => (
              <div key={i}>{row.join("")}</div>
            ))}
          </pre>
        )}
      </div>

      <PixelCard
        variant="panel"
        className="relative z-10 w-full max-w-5xl border-primary/50 shadow-[12px_12px_0_0_rgba(59,130,246,0.3)]"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-8">
          <div className="flex gap-2">
            <div className="h-3 w-3 bg-danger" />
            <div className="h-3 w-3 bg-fs-orange" />
            <div className="h-3 w-3 bg-success" />
          </div>
          <span className="font-body text-xs text-muted uppercase tracking-widest">
            Source: [TRUSTED_ORIGIN_V2]
          </span>
        </div>

        <div className="flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <span className="bg-primary text-black px-3 py-1 font-ui text-sm uppercase tracking-[0.2em] font-bold">
              Establishing Uplink...
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h1 className="font-ui text-[clamp(2rem,8vw,5rem)] leading-[0.9] text-foreground uppercase">
              The End of{" "}
              <span className="text-muted line-through decoration-danger decoration-4">
                Dead Lists
              </span>
              .
              <br />
              <span className="text-primary">The Birth of Discovery.</span>
            </h1>

            <p className="max-w-3xl font-body text-base md:text-lg text-foreground/80 leading-relaxed border-l-4 border-primary/30 pl-6">
              Conventional server lists are directories of the past. FirstSpawn is a{" "}
              <span className="text-primary font-bold">trusted point of origin</span>. We bridge the
              gap between players and &quot;hidden gem&quot; communities through tangible reputation
              and real-time data insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex flex-wrap gap-6"
          >
            <PixelButton
              size="lg"
              variant="primary"
              className="animate-retro-pulse"
              href={`/${lang}/discover`}
            >
              Initialize Search
            </PixelButton>
            <PixelButton
              size="lg"
              variant="secondary"
              className="border-white/20 text-white"
              onClick={() =>
                document.getElementById("discovery-fork")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Analyze The Problem
            </PixelButton>
          </motion.div>
        </div>

        {/* Decorative Data Feed */}
        <div className="absolute bottom-6 right-6 hidden lg:block text-[9px] font-body text-primary/40 leading-tight text-right">
          <p>REP_ENGINE_ACTIVE: TRUE</p>
          <p>NODES_SYNCED: 4,521</p>
          <p>SIGNAL_STRENGTH: 98.4%</p>
          <p>ORIGIN_POINT: [0,0,0]</p>
        </div>
      </PixelCard>
    </section>
  );
}
