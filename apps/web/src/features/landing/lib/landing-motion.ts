export const getRevealProps = (reduceMotion: boolean, delay = 0) =>
  reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-120px" },
        transition: { duration: 0.35, delay, ease: "easeOut" as const },
      };
