"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface LandingSceneProps {
  children: ReactNode;
}

const SignalRig = () => (
  <motion.div
    className="absolute right-[12%] top-0 hidden origin-top lg:block"
    animate={{ rotate: [-5, 5, -5] }}
    transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
  >
    <div className="mx-auto h-28 w-1 bg-foreground/30" />
    <div className="mx-auto h-4 w-8 border-2 border-black bg-secondary shadow-[4px_4px_0_0_rgba(0,0,0,1)]" />
    <motion.div
      className="mx-auto mt-2 flex h-10 w-14 items-center justify-center border-4 border-black bg-fs-diamond shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
      animate={{ y: [0, 4, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        className="h-3 w-3 border-2 border-black bg-success"
        animate={{ opacity: [1, 0.45, 1] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  </motion.div>
);

const BeaconStrip = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="flex items-end gap-1"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    {[0, 1, 2].map((column) => (
      <motion.div
        key={column}
        className="w-4 border-2 border-black bg-fs-diamond shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        animate={{ height: [20 + column * 8, 32 + column * 8, 20 + column * 8] }}
        transition={{ duration: 1 + column * 0.15, repeat: Infinity, delay: delay + column * 0.12 }}
      />
    ))}
  </motion.div>
);

const FloatingBlocks = () => {
  const blocks = [
    { size: "h-3 w-3", tone: "bg-fs-diamond", delay: 0, x: "left-[10%]", duration: 3.8 },
    { size: "h-2 w-2", tone: "bg-success", delay: 0.5, x: "left-[26%]", duration: 4.6 },
    { size: "h-4 w-4", tone: "bg-primary", delay: 1, x: "left-[58%]", duration: 3.2 },
    { size: "h-3 w-3", tone: "bg-secondary", delay: 1.4, x: "left-[78%]", duration: 4.2 },
    { size: "h-2 w-2", tone: "bg-fs-diamond", delay: 1.9, x: "left-[90%]", duration: 2.8 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {blocks.map((block, index) => (
        <motion.div
          key={index}
          className={`absolute bottom-10 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${block.size} ${block.tone} ${block.x}`}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, -220, -220], opacity: [0, 1, 0] }}
          transition={{
            duration: block.duration,
            repeat: Infinity,
            delay: block.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function LandingScene({ children }: LandingSceneProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-80px)] w-full items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_45%)]" />
        <div className="absolute inset-x-0 top-0 h-20 border-b-4 border-black bg-bg-panel/70" />
        <div className="absolute inset-x-0 bottom-0 h-44 border-t-4 border-black bg-bg-panel" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(to_right,rgba(240,240,240,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(240,240,240,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <FloatingBlocks />
      </div>

      <SignalRig />

      <div className="absolute bottom-12 left-0 right-0 z-10 flex justify-around px-8">
        <BeaconStrip delay={0.2} />
        <BeaconStrip delay={0.35} />
        <BeaconStrip delay={0.5} />
      </div>

      <div className="relative z-20 w-full">{children}</div>

      <div className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_6px] opacity-35" />
      <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-t from-background via-transparent to-background/30" />
    </div>
  );
}
