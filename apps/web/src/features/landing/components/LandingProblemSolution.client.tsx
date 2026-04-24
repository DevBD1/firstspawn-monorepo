"use client";

import { motion } from "framer-motion";

export default function LandingProblemSolution() {
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
          System Comparison
        </span>
        <h2 className="font-ui text-5xl uppercase text-foreground mb-6">Discovery: Redefined</h2>
        <div className="h-1 w-24 bg-primary mx-auto mb-8 opacity-50" />
        <p className="font-body text-foreground/80 text-lg max-w-2xl mx-auto leading-relaxed">
          We didn&apos;t just build a better server list. We engineered a definitive protocol to fix
          a decade of bot-driven stagnation.
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
            className="absolute inset-0 bg-[#E28C8C] opacity-0 transition-opacity duration-300 pointer-events-none"
          />

          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-[#E28C8C] animate-pulse" />
              <span className="font-display text-[9px] uppercase text-[#E28C8C] tracking-tighter">
                ERR://DECAY_DETECTED
              </span>
            </div>
          </div>

          <motion.h3
            variants={glitchVariants}
            className="font-ui text-4xl uppercase text-foreground mb-10 leading-none tracking-tight relative z-10"
          >
            The Decay <br />
            of Listing
          </motion.h3>

          <div className="space-y-10 relative z-10">
            {[
              {
                title: "Synthetic Vanity",
                desc: "Rankings built on bribes and bot-loops. Synthetic metrics that mask a server's true pulse.",
              },
              {
                title: "Rotting Architecture",
                desc: "Static phonebooks for ghosts. Disconnected directories that haven't evolved since 2012.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                initial="initial"
                whileInView="whileInView"
                transition={{ delay: i * 0.1, duration: 0 }}
                className="flex gap-6 group/item"
              >
                <span className="text-[#E28C8C] font-body text-xl font-bold leading-none mt-1">
                  ✕
                </span>
                <div>
                  <h4 className="font-ui text-lg uppercase text-[#E28C8C]/90 mb-2 tracking-tight">
                    {item.title}
                  </h4>
                  <p className="font-body text-sm text-foreground/80 leading-relaxed max-w-sm">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scanner Line Effect */}
          <motion.div
            variants={{ hover: { top: ["0%", "100%"], opacity: [0, 1, 0] } }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[2px] bg-[#E28C8C]/20 pointer-events-none opacity-0"
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
                SYS://ORIGIN_ACTIVE
              </span>
            </div>
          </div>

          <motion.h3
            variants={glitchVariants}
            className="font-ui text-4xl uppercase text-foreground mb-10 leading-none tracking-tight relative z-10"
          >
            The Standard <br />
            of Origin
          </motion.h3>

          <div className="space-y-10 relative z-10">
            {[
              {
                title: "Deep-Pulse Integrity",
                desc: "FSVotifier-backed reputation. Real-time metrics that prove community health and trust.",
              },
              {
                title: "Neural Discovery",
                desc: "A living bridge. We connect players directly to the hidden gems that matter.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
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
                    {item.desc}
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
