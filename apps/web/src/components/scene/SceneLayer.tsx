"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

interface SceneLayerProps {
  alt: string;
  src: string;
  progress: MotionValue<number>;
  parallax: number;
  mobileParallax?: number;
  reduceMotion: boolean;
  isMobile: boolean;
  zClassName: string;
  className?: string;
  imageClassName?: string;
  objectPosition?: string;
  priority?: boolean;
  idleX?: number;
  idleY?: number;
  idleDuration?: number;
}

export default function SceneLayer({
  alt,
  src,
  progress,
  parallax,
  mobileParallax = 0,
  reduceMotion,
  isMobile,
  zClassName,
  className,
  imageClassName,
  objectPosition = "center center",
  priority = false,
  idleX = 0,
  idleY = 0,
  idleDuration = 16,
}: SceneLayerProps) {
  const distance = reduceMotion ? 0 : isMobile ? mobileParallax : parallax;
  const y = useTransform(progress, [0, 1], [0, -distance]);
  const shouldIdle = !reduceMotion && !isMobile && (idleX !== 0 || idleY !== 0);

  return (
    <motion.div
      style={{ y }}
      className={[
        "pointer-events-none absolute inset-0 transform-gpu will-change-transform",
        zClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <motion.div
        animate={shouldIdle ? { x: [0, idleX, 0], y: [0, idleY, 0] } : undefined}
        transition={
          shouldIdle
            ? {
                duration: idleDuration,
                repeat: Infinity,
                ease: "linear",
              }
            : undefined
        }
        className="relative h-full w-full transform-gpu will-change-transform"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- placeholder scene layers are tiny static art and the optimizer rejected the generated files */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className={["h-full w-full select-none object-cover", imageClassName]
            .filter(Boolean)
            .join(" ")}
          style={{
            imageRendering: "pixelated",
            objectPosition,
          }}
        />
      </motion.div>
    </motion.div>
  );
}
