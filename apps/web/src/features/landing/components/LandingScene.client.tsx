"use client";

import type { ReactNode } from "react";

interface LandingSceneProps {
  children: ReactNode;
}

export default function LandingScene({ children }: LandingSceneProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-80px)] w-full items-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_36%)]" />
        <div className="absolute inset-x-0 top-0 h-28 border-b-4 border-black bg-bg-panel/60" />
        <div className="absolute inset-x-0 bottom-0 h-40 border-t-4 border-black bg-bg-panel/80" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_right,rgba(240,240,240,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(240,240,240,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-20 w-full">{children}</div>

      <div className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_6px] opacity-35" />
      <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-t from-background via-transparent to-background/30" />
    </div>
  );
}
