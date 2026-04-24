"use client";

import { PixelButton, PixelCard } from "@firstspawn/ui";
import type { LandingContentModel } from "@/features/landing/types";

interface LandingActionPromptProps {
  content: LandingContentModel;
  lang: string;
}

export default function LandingActionPrompt({ content, lang }: LandingActionPromptProps) {
  const cta = content.landing.finalCta;

  return (
    <section className="py-24">
      <PixelCard
        variant="dark"
        className="max-w-4xl mx-auto p-8 md:p-12 border-primary overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-8 border-b-4 border-black pb-4">
          <div className="flex gap-2">
            <div className="h-3 w-3 bg-danger" />
            <div className="h-3 w-3 bg-fs-orange" />
            <div className="h-3 w-3 bg-success" />
          </div>
          <span className="font-body text-xs text-muted">firstspawn-terminal — 80x24</span>
        </div>

        <div className="font-body text-sm md:text-base mb-12 space-y-2">
          <p className="text-primary font-bold">FirstSpawn OS v2.4.0 (TTY1)</p>
          <p className="text-muted">
            Welcome to FirstSpawn CLI. Connected to workspace: /dev/fs-nodes
          </p>
          <div className="pt-4 space-y-1">
            <p className="flex gap-2">
              <span className="text-muted">[INFO]</span>
              <span>Initializing Discovery Agent...</span>
            </p>
            <p className="flex gap-2">
              <span className="text-success">[OK]</span>
              <span>Connecting to global server nodes (2,451 active)</span>
            </p>
            <p className="flex gap-2">
              <span className="text-success">[OK]</span>
              <span>Bypassing regional player firewalls</span>
            </p>
            <p className="flex gap-2">
              <span className="text-primary animate-retro-pulse">[READY]</span>
              <span>System online. Discovery core standing by.</span>
            </p>
          </div>

          <div className="pt-6 space-y-4">
            <p className="break-all">
              <span className="text-success">user@firstspawn</span>:
              <span className="text-primary">~</span>$ ./launch_discovery.sh --force --no-cache
            </p>
            <p className="text-foreground leading-relaxed pl-4 border-l-4 border-primary/20">
              {cta.title}
            </p>
            <div className="flex items-center">
              <span className="text-success">user@firstspawn</span>:
              <span className="text-primary">~</span>${" "}
              <span className="h-5 w-3 bg-primary animate-retro-pulse ml-2" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <PixelButton
            size="lg"
            variant="success"
            className="flex-1"
            onClick={() => (window.location.href = `/${lang}/discover`)}
          >
            {cta.primaryLabel}
          </PixelButton>
          <PixelButton
            size="lg"
            variant="primary"
            className="flex-1"
            onClick={() => (window.location.href = `/${lang}/auth/register`)}
          >
            {cta.secondaryLabel}
          </PixelButton>
        </div>
      </PixelCard>
    </section>
  );
}
