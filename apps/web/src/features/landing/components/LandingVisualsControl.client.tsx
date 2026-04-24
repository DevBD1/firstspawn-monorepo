"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingScrollScene from "./LandingScrollScene.client";
import type { AppDictionary } from "@/lib/dictionaries/schema";

interface LandingVisualsControlProps {
  dictionary: AppDictionary;
}

export default function LandingVisualsControl({ dictionary }: LandingVisualsControlProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fs-visuals-enabled");
    if (saved === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEnabled(true);
    }
     
    setIsMounted(true);
  }, []);

  const toggleVisuals = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem("fs-visuals-enabled", String(newState));
  };

  if (!isMounted) return null;

  return (
    <>
      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <LandingScrollScene dictionary={dictionary} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FX Control Button */}
      <div className="fixed bottom-6 right-6 z-[100] md:bottom-8 md:right-8">
        <button
          onClick={toggleVisuals}
          className={`group relative flex h-10 items-center gap-2 border-2 border-black px-3 font-ui text-[10px] uppercase tracking-widest transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${
            isEnabled
              ? "bg-fs-diamond text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              : "bg-bg-panel text-foreground/50 grayscale shadow-none"
          }`}
          title={isEnabled ? "Disable Background FX" : "Enable Background FX"}
        >
          {/* Pixel Corners */}
          <div className="absolute -left-1 -top-1 h-1.5 w-1.5 bg-black" />
          <div className="absolute -right-1 -top-1 h-1.5 w-1.5 bg-black" />
          <div className="absolute -bottom-1 -left-1 h-1.5 w-1.5 bg-black" />
          <div className="absolute -bottom-1 -right-1 h-1.5 w-1.5 bg-black" />

          <span className="relative flex h-2 w-2">
            {isEnabled && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-75"></span>
            )}
            <span
              className={`relative inline-flex h-2 w-2 border border-black ${isEnabled ? "bg-black" : "bg-transparent"}`}
            ></span>
          </span>

          <span>FX: {isEnabled ? "ON" : "OFF"}</span>
        </button>
      </div>
    </>
  );
}
