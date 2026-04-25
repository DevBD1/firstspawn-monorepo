"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

interface ScrollCueProps {
  progress: MotionValue<number>;
  reduceMotion?: boolean;
  className?: string;
  fadeStops?: [number, number, number, number];
  floatDistance?: number;
}

const DOWN_ARROW_BLOCKS = [
  [2, 0],
  [3, 0],
  [2, 1],
  [3, 1],
  [2, 2],
  [3, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 3],
  [4, 3],
  [5, 3],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [2, 5],
  [3, 5],
] as const;

export default function ScrollCue({
  progress,
  reduceMotion = false,
  className,
  fadeStops = [0, 0.035, 0.08, 0.13],
  floatDistance = 8,
}: ScrollCueProps) {
  const opacity = useTransform(progress, fadeStops, [0.9, 1, 0.45, 0]);
  const y = useTransform(progress, [fadeStops[0], fadeStops[2], fadeStops[3]], [0, 8, 18]);

  return (
    <motion.div
      style={{ opacity, y }}
      className={[
        "pointer-events-none fixed inset-x-0 bottom-[12%] z-[30] flex justify-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, floatDistance, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="grid grid-cols-6 gap-[2px] rounded-none border-2 border-black bg-background/88 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px]"
      >
        {DOWN_ARROW_BLOCKS.map(([x, yBlock]) => (
          <span
            key={`${x}-${yBlock}`}
            className="h-2.5 w-2.5 border border-black bg-fs-diamond shadow-[0_0_8px_rgba(34,211,238,0.25)]"
            style={{ gridColumnStart: x + 1, gridRowStart: yBlock + 1 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
