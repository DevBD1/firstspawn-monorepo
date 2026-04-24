"use client";

import { PixelCard } from "@firstspawn/ui";

export default function LandingProblemSection() {
  return (
    <section id="problem-section" className="py-24 space-y-16">
      <div className="max-w-4xl mx-auto text-left space-y-6 border-l-4 border-danger pl-8">
        <h2 className="font-ui text-4xl uppercase text-foreground">
          System Status: <span className="text-danger">Critical Failure</span>
        </h2>
        <p className="font-body text-foreground/90 text-lg leading-relaxed">
          Discovery has been hijacked. For a decade, server lists have prioritized Votifier-bribes
          and bot-inflated metrics over genuine community growth. The result is a stagnant ecosystem
          where players and &quot;hidden gems&quot; never meet.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <PixelCard variant="panel" className="border-danger/20">
          <div className="mb-6 flex justify-between items-center">
            <span className="text-danger font-display text-[10px] uppercase tracking-tighter">
              [STALE_DATA]
            </span>
            <div className="h-2 w-2 bg-danger animate-pulse" />
          </div>
          <h3 className="font-ui text-xl uppercase mb-3 text-foreground">Votifier Spam</h3>
          <p className="font-body text-sm text-muted leading-relaxed">
            Rankings are sold, not earned. Players are forced to vote for rewards, masking a
            server&apos;s true quality with artificial transaction volume.
          </p>
        </PixelCard>

        <PixelCard variant="panel" className="border-danger/20">
          <div className="mb-6 flex justify-between items-center">
            <span className="text-danger font-display text-[10px] uppercase tracking-tighter">
              [IO_ERROR]
            </span>
            <div className="h-2 w-2 bg-danger animate-pulse" />
          </div>
          <h3 className="font-ui text-xl uppercase mb-3 text-foreground">Fragmented Hubs</h3>
          <p className="font-body text-sm text-muted leading-relaxed">
            Communities thrive on Discord and Forums, but live lists remain isolated directories.
            The communication bridge is permanently broken.
          </p>
        </PixelCard>

        <PixelCard variant="panel" className="border-danger/20">
          <div className="mb-6 flex justify-between items-center">
            <span className="text-danger font-display text-[10px] uppercase tracking-tighter">
              [NULL_TRUST]
            </span>
            <div className="h-2 w-2 bg-danger animate-pulse" />
          </div>
          <h3 className="font-ui text-xl uppercase mb-3 text-foreground">Hidden Gems Lost</h3>
          <p className="font-body text-sm text-muted leading-relaxed">
            Emerging servers are buried under Pay-to-Win giants. Without real-time data integrity,
            you can&apos;t find the &quot;soul&quot; of a new world.
          </p>
        </PixelCard>
      </div>
    </section>
  );
}
