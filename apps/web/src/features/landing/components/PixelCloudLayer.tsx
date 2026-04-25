"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

interface PixelCloudLayerProps {
  progress: MotionValue<number>;
  isMobile: boolean;
  reduceMotion: boolean;
  zClassName?: string;
}

interface PixelCloudSpec {
  left: string;
  top: string;
  scale: number;
  opacity: number;
  driftX: number;
  driftY: number;
  parallax: number;
  mobileParallax: number;
  duration: number;
  delay: number;
  blocks: Array<[number, number, number, number]>;
}

const CLOUDS: PixelCloudSpec[] = [
  {
    left: "6%",
    top: "16%",
    scale: 0.9,
    opacity: 0.5,
    driftX: 12,
    driftY: -3,
    parallax: 18,
    mobileParallax: 8,
    duration: 20,
    delay: 0.4,
    blocks: [
      [2, 0, 6, 1],
      [1, 1, 9, 1],
      [0, 2, 11, 1],
      [1, 3, 9, 1],
      [3, 4, 5, 1],
    ],
  },
  {
    left: "58%",
    top: "15%",
    scale: 1.05,
    opacity: 0.44,
    driftX: -10,
    driftY: -2,
    parallax: 22,
    mobileParallax: 10,
    duration: 24,
    delay: 0.9,
    blocks: [
      [3, 0, 5, 1],
      [1, 1, 9, 1],
      [0, 2, 12, 1],
      [1, 3, 10, 1],
      [4, 4, 4, 1],
    ],
  },
  {
    left: "24%",
    top: "26%",
    scale: 0.72,
    opacity: 0.34,
    driftX: 9,
    driftY: -2,
    parallax: 28,
    mobileParallax: 14,
    duration: 18,
    delay: 0.2,
    blocks: [
      [2, 0, 4, 1],
      [1, 1, 7, 1],
      [0, 2, 9, 1],
      [1, 3, 7, 1],
      [3, 4, 3, 1],
    ],
  },
  {
    left: "74%",
    top: "30%",
    scale: 0.8,
    opacity: 0.3,
    driftX: -8,
    driftY: -1,
    parallax: 34,
    mobileParallax: 16,
    duration: 19,
    delay: 0.6,
    blocks: [
      [1, 0, 5, 1],
      [0, 1, 8, 1],
      [1, 2, 9, 1],
      [2, 3, 7, 1],
      [4, 4, 3, 1],
    ],
  },
];

function PixelCloud({
  cloud,
  progress,
  isMobile,
  reduceMotion,
}: {
  cloud: PixelCloudSpec;
  progress: MotionValue<number>;
  isMobile: boolean;
  reduceMotion: boolean;
}) {
  const pixel = isMobile ? 8 : 10;
  const parallaxDistance = isMobile ? cloud.mobileParallax : cloud.parallax;
  const travelY = useTransform(progress, [0, 1], [0, parallaxDistance]);
  const baseOpacity = useTransform(
    progress,
    [0, 0.2, 0.85, 1],
    [cloud.opacity * 0.65, cloud.opacity, cloud.opacity * 0.9, cloud.opacity * 0.72]
  );
  const width = 12 * pixel;
  const height = 5 * pixel;

  return (
    <motion.div
      className="absolute"
      style={{
        left: cloud.left,
        top: cloud.top,
        width,
        height,
        scale: cloud.scale,
        y: travelY,
        opacity: baseOpacity,
      }}
      animate={
        reduceMotion
          ? undefined
          : {
              x: [0, cloud.driftX, 0],
              y: [0, cloud.driftY, 0],
            }
      }
      transition={{
        duration: cloud.duration,
        delay: cloud.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.22), rgba(34,211,238,0) 72%)",
          transform: "scale(1.4)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          filter: "drop-shadow(0 0 12px rgba(34,211,238,0.16))",
        }}
      >
        {cloud.blocks.map(([x, y, w, h], index) => (
          <div
            key={`${cloud.left}-${cloud.top}-${index}`}
            className="absolute"
            style={{
              left: x * pixel,
              top: y * pixel,
              width: w * pixel,
              height: h * pixel,
              background:
                "linear-gradient(180deg, rgba(220,250,255,0.94) 0%, rgba(172,229,242,0.94) 55%, rgba(106,170,188,0.94) 100%)",
              boxShadow:
                "inset 0 -2px 0 rgba(12,46,58,0.42), inset 2px 2px 0 rgba(255,255,255,0.22), 0 0 0 1px rgba(16,52,65,0.18)",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function PixelCloudLayer({
  progress,
  isMobile,
  reduceMotion,
  zClassName = "z-[15]",
}: PixelCloudLayerProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${zClassName}`}>
      {CLOUDS.map((cloud) => (
        <PixelCloud
          key={`${cloud.left}-${cloud.top}`}
          cloud={cloud}
          progress={progress}
          isMobile={isMobile}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}
