"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface HeroSceneProps {
  activeLabel: string;
  mascotAlt: string;
  sceneLabel: string;
  sceneAlt: string;
  statusLabel: string;
}

const MASCOT_FRAMES = 4;

const PIXEL_IMAGE_STYLE = {
  imageRendering: "pixelated",
} as const;

export default function HeroScene({
  activeLabel,
  mascotAlt,
  sceneAlt,
  sceneLabel,
  statusLabel,
}: HeroSceneProps) {
  const reduceMotion = useReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setFrame((current) => (current + 1) % MASCOT_FRAMES);
    }, 220);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <div className="border-4 border-black bg-bg-panel p-3 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
      <div className="mb-3 flex items-center justify-between border-4 border-black bg-background px-3 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 border-2 border-black bg-success" />
          <div className="h-3 w-3 border-2 border-black bg-fs-diamond" />
          <span className="font-ui text-sm tracking-[0.16em] text-foreground/65">
            {statusLabel}
          </span>
        </div>
        <span className="font-display text-[10px] tracking-[0.16em] text-success">
          {activeLabel}
        </span>
      </div>

      <div
        role="img"
        aria-label={sceneAlt}
        className="relative aspect-[16/9] overflow-hidden border-4 border-black bg-background shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
      >
        <div className="absolute inset-0 bg-background" />

        <motion.div
          className="absolute inset-0"
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -2, 0],
                }
          }
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/hero/scene-back.png"
            alt=""
            fill
            priority
            unoptimized
            className="object-cover"
            style={PIXEL_IMAGE_STYLE}
          />
        </motion.div>

        <motion.div
          className="absolute inset-0"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 2, 0],
                }
          }
          transition={{ duration: 5.2, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/hero/scene-mid.png"
            alt=""
            fill
            unoptimized
            className="object-cover"
            style={PIXEL_IMAGE_STYLE}
          />
        </motion.div>

        <motion.div
          className="absolute left-[58%] top-[22%] h-[20%] w-[20%] -translate-x-1/2 -translate-y-1/2"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [0.85, 1.2, 1.3],
                  opacity: [0.15, 0.45, 0],
                }
          }
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/hero/beacon-pulse.png"
            alt=""
            fill
            unoptimized
            className="object-contain"
            style={PIXEL_IMAGE_STYLE}
          />
        </motion.div>

        {["left-[45%] top-[54%]", "left-[64%] top-[42%]"].map((position, index) => (
          <motion.div
            key={position}
            className={`absolute h-[12%] w-[12%] -translate-x-1/2 -translate-y-1/2 ${position}`}
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [0.28, 1, 0.28],
                    scale: [0.94, 1.02, 0.94],
                  }
            }
            transition={{
              duration: 1.1,
              delay: index * 0.24,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Image
              src="/hero/scan-marker.png"
              alt=""
              fill
              unoptimized
              className="object-contain"
              style={PIXEL_IMAGE_STYLE}
            />
          </motion.div>
        ))}

        <motion.div
          className="absolute left-[24%] top-[56%] h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2"
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -6, 0],
                  rotate: [-2, 1, -2],
                }
          }
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          role="img"
          aria-label={mascotAlt}
        >
          <motion.div
            className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2"
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [0.25, 0.5, 0.25],
                    scale: [0.92, 1.04, 0.92],
                  }
            }
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          >
            <Image
              src="/hero/beacon-pulse.png"
              alt=""
              fill
              unoptimized
              className="object-contain"
              style={PIXEL_IMAGE_STYLE}
            />
          </motion.div>
          <div
            className="relative z-10 h-full w-full bg-[url('/hero/mascot-idle-spritesheet.png')] bg-[length:400%_100%] bg-no-repeat"
            style={{
              backgroundPositionX: `${-100 * frame}%`,
              imageRendering: "pixelated",
            }}
          />
        </motion.div>

        <motion.div
          className="absolute inset-0"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, -2, 0],
                }
          }
          transition={{ duration: 4.6, repeat: Infinity, ease: "linear" }}
        >
          <Image
            src="/hero/scene-front.png"
            alt=""
            fill
            unoptimized
            className="object-cover"
            style={PIXEL_IMAGE_STYLE}
          />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_50%,rgba(0,0,0,0.12)_50%)] bg-[length:100%_4px] opacity-20" />
        <div className="pointer-events-none absolute left-3 top-3 border-2 border-black bg-background px-2 py-1 font-ui text-xs tracking-[0.16em] text-foreground/65 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          {sceneLabel}
        </div>
      </div>
    </div>
  );
}
