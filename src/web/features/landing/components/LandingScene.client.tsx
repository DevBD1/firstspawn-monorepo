"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface LandingSceneProps {
  children: ReactNode;
}

const CraneHook = () => (
  <motion.div
    className="absolute top-0 right-[15%]"
    animate={{ rotate: [-5, 5, -5] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    style={{ transformOrigin: "top center" }}
  >
    <div className="mx-auto h-32 w-1 bg-[#666]" />
    <div className="mx-auto h-3 w-6 rounded-b-lg border-2 border-[#CC5500] bg-[#FF6B00]" />
    <motion.div
      className="mx-auto mt-1 flex h-8 w-12 items-center justify-center border-2 border-[#1A8A9F] bg-[#2EBCDA]"
      animate={{ rotate: [-3, 3, -3] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="h-2 w-2 animate-pulse rounded-full bg-[#4ADE80]" />
    </motion.div>
  </motion.div>
);

const ConstructionBarrier = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="flex flex-col items-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <div className="relative h-12 w-16">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            className="h-3 bg-gradient-to-r from-[#FFD700] via-[#1A1A1A] to-[#FFD700]"
            style={{ backgroundSize: "200% 100%" }}
            animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
          />
        ))}
      </div>
    </div>
    <div className="h-8 w-3 bg-[#FF6B00]" />
  </motion.div>
);

const FloatingBlocks = () => {
  const blocks = [
    { size: 12, color: "#2EBCDA", delay: 0, x: "10%", duration: 4 },
    { size: 8, color: "#4ADE80", delay: 0.5, x: "30%", duration: 5 },
    { size: 16, color: "#FFD700", delay: 1, x: "60%", duration: 3.5 },
    { size: 10, color: "#FF6B00", delay: 1.5, x: "80%", duration: 4.5 },
    { size: 6, color: "#2EBCDA", delay: 2, x: "90%", duration: 3 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {blocks.map((block, index) => (
        <motion.div
          key={index}
          className="absolute bottom-0"
          style={{
            left: block.x,
            width: block.size,
            height: block.size,
            backgroundColor: block.color,
            boxShadow: "inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.2)",
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, -300, -300], opacity: [0, 1, 0] }}
          transition={{
            duration: block.duration,
            repeat: Infinity,
            delay: block.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default function LandingScene({ children }: LandingSceneProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B0B15] via-[#1A1025] to-[#2D1B4E]">
        <div
          className="absolute inset-0 animate-pulse opacity-40"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[30%] origin-bottom bg-[linear-gradient(to_right,rgba(46,188,218,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(46,188,218,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] opacity-50" />
        <FloatingBlocks />
      </div>

      <CraneHook />

      <div className="absolute bottom-[10%] left-0 right-0 z-10 flex justify-around px-8">
        <ConstructionBarrier delay={0.2} />
        <ConstructionBarrier delay={0.4} />
        <ConstructionBarrier delay={0.6} />
      </div>

      <div className="relative z-20 w-full px-4">{children}</div>

      <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      <div className="pointer-events-none absolute inset-0 z-30 opacity-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
