"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import SceneLayer from "@/components/scene/SceneLayer";
import ScrollCue from "@/components/ui/ScrollCue";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import PixelCloudLayer from "./PixelCloudLayer";

interface LandingScrollSceneProps {
  dictionary: AppDictionary;
}

interface LandingSceneBackdropProps {
  progress: MotionValue<number>;
  isMobile: boolean;
  reduceMotion: boolean;
}

const SPARKLES = [
  { left: "8%", top: "14%", delay: 0.2, duration: 1.5 },
  { left: "24%", top: "24%", delay: 0.4, duration: 1.9 },
  { left: "73%", top: "19%", delay: 0.7, duration: 1.4 },
  { left: "83%", top: "34%", delay: 0.3, duration: 1.8 },
  { left: "64%", top: "51%", delay: 0.9, duration: 1.3 },
  { left: "34%", top: "58%", delay: 0.5, duration: 1.6 },
];

function SceneSparkle({
  progress,
  sparkle,
}: {
  progress: MotionValue<number>;
  sparkle: (typeof SPARKLES)[number];
}) {
  const opacity = useTransform(progress, [0, 0.2, 0.75, 1], [0.18, 1, 0.7, 0.35]);

  return (
    <motion.div
      style={{ left: sparkle.left, top: sparkle.top, opacity }}
      animate={{ scale: [0.8, 1.2, 0.8] }}
      transition={{
        duration: sparkle.duration,
        delay: sparkle.delay,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute z-[70] h-2 w-2 bg-fs-diamond/80 shadow-[0_0_10px_rgba(34,211,238,0.65)]"
    />
  );
}

function LandingSceneBackdrop({ progress, isMobile, reduceMotion }: LandingSceneBackdropProps) {
  const haloOpacity = useTransform(progress, [0, 0.3, 0.75, 1], [0.32, 0.4, 0.28, 0.22]);
  const gridOpacity = useTransform(progress, [0, 0.25, 0.65, 1], [0.14, 0.2, 0.15, 0.12]);
  const topVeilOpacity = useTransform(progress, [0, 0.35, 0.8, 1], [0.12, 0.2, 0.28, 0.34]);
  const lowerFogOpacity = useTransform(progress, [0, 0.45, 0.85, 1], [0.18, 0.26, 0.34, 0.4]);
  const stageGlowY = useTransform(progress, [0, 1], [0, isMobile ? 32 : 72]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background via-bg-panel to-background" />
      <motion.div
        style={{ opacity: haloOpacity }}
        className="pointer-events-none absolute left-1/2 top-0 z-0 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-fs-diamond/20 blur-3xl"
      />
      <motion.div
        style={{ opacity: gridOpacity }}
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]"
      />

      <SceneLayer
        alt=""
        src="/landing-scene/stars-moon.svg"
        progress={progress}
        parallax={18}
        mobileParallax={0}
        reduceMotion={reduceMotion}
        isMobile={isMobile}
        zClassName="z-10"
        priority
        idleY={-6}
        idleDuration={22}
        objectPosition="center top"
      />

      <PixelCloudLayer progress={progress} isMobile={isMobile} reduceMotion={reduceMotion} />

      <SceneLayer
        alt=""
        src="/landing-scene/mountains-far.svg"
        progress={progress}
        parallax={42}
        mobileParallax={22}
        reduceMotion={reduceMotion}
        isMobile={isMobile}
        zClassName="z-20"
        idleY={-6}
        idleDuration={18}
        objectPosition="center center"
      />

      <SceneLayer
        alt=""
        src="/landing-scene/islands-back.svg"
        progress={progress}
        parallax={78}
        mobileParallax={24}
        reduceMotion={reduceMotion}
        isMobile={isMobile}
        zClassName="z-30"
        idleX={8}
        idleY={-8}
        idleDuration={14}
        objectPosition="center bottom"
      />

      <SceneLayer
        alt=""
        src="/landing-scene/islands-mid.svg"
        progress={progress}
        parallax={112}
        mobileParallax={62}
        reduceMotion={reduceMotion}
        isMobile={isMobile}
        zClassName="z-40"
        priority
        idleX={-10}
        idleY={-10}
        idleDuration={12}
        objectPosition="center bottom"
      />

      <SceneLayer
        alt=""
        src="/landing-scene/islands-front.svg"
        progress={progress}
        parallax={142}
        mobileParallax={84}
        reduceMotion={reduceMotion}
        isMobile={isMobile}
        zClassName="z-50"
        idleX={12}
        idleY={-12}
        idleDuration={11}
        objectPosition="center bottom"
      />

      <SceneLayer
        alt=""
        src="/landing-scene/foliage-occluders.svg"
        progress={progress}
        parallax={182}
        mobileParallax={24}
        reduceMotion={reduceMotion}
        isMobile={isMobile}
        zClassName="z-[60]"
        idleX={16}
        idleY={-14}
        idleDuration={10}
        objectPosition="center bottom"
      />
      {reduceMotion
        ? null
        : SPARKLES.map((sparkle) => (
            <SceneSparkle
              key={`${sparkle.left}-${sparkle.top}`}
              progress={progress}
              sparkle={sparkle}
            />
          ))}

      <motion.div
        style={{ y: stageGlowY }}
        className="pointer-events-none absolute left-1/2 top-[18%] z-[72] h-72 w-[32rem] -translate-x-1/2 rounded-full bg-fs-diamond/10 blur-3xl"
      />

      <motion.div
        style={{ opacity: lowerFogOpacity }}
        className="pointer-events-none absolute inset-0 z-[70] bg-[radial-gradient(circle_at_bottom,rgba(34,211,238,0.08),transparent_40%),linear-gradient(180deg,transparent_0%,rgba(2,6,23,0.18)_60%,rgba(2,6,23,0.52)_100%)]"
      />
      <motion.div
        style={{ opacity: topVeilOpacity }}
        className="pointer-events-none absolute inset-0 z-[74] bg-[linear-gradient(180deg,rgba(2,6,23,0.16)_0%,rgba(2,6,23,0.08)_26%,rgba(2,6,23,0.14)_52%,rgba(2,6,23,0.28)_100%)]"
      />
      <div className="pointer-events-none absolute inset-0 z-[76] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_50%,rgba(0,0,0,0.16)_50%)] bg-[length:100%_4px] opacity-20" />
    </div>
  );
}

export default function LandingScrollScene({ dictionary }: LandingScrollSceneProps) {
  const landing = dictionary.landing;
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);

    update();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return (
    <>
      <div
        aria-hidden="true"
        data-scene={landing.scene.alt}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-x-0 bottom-0 top-[var(--fs-nav-height)] overflow-hidden">
          <LandingSceneBackdrop
            progress={scrollYProgress}
            isMobile={isMobile}
            reduceMotion={Boolean(reduceMotion)}
          />
        </div>
      </div>
      <ScrollCue progress={scrollYProgress} reduceMotion={Boolean(reduceMotion)} />
    </>
  );
}
