# Vertical Reactive Discovery Fork

Date: 2026-04-24

Migrated from:

- `docs/superpowers/plans/2026-04-24-vertical-reactive-fork.md`
- `docs/superpowers/specs/2026-04-24-vertical-reactive-fork-design.md`

## Purpose

Build `LandingDiscoveryFork.client.tsx` and integrate it into the landing page
as a high-fidelity split module for players and server hosts.

The idea was a dual-column layout where attention shifts mechanically between
two user groups:

- Player side: trustworthy server discovery.
- Host side: growth and server-owner insight.

## Design Spec

Concept:

- A terminal-style module split into two parallel logic streams.
- 8-bit mechanical visual language with strict grid alignment.
- Vertical split handled with flexbox for responsive reliability.

Visual roles:

- Player stream: `bg-bg-panel`, Retro Blue accents.
- Host stream: `bg-bg-host-panel` or equivalent host panel token, Legendary
  Gold accents.
- Central divider: thick black mechanical divider.
- Scanline overlay: allowed as terminal atmosphere.

Content modules:

- Player header: `CHANNEL_01: PLAYER`.
- Player title: `Neural Discovery`.
- Player action: `START_EXPLORING`.
- Host header: `CHANNEL_02: HOST`.
- Host title: `Intelligence Hub`.
- Host action: `ACCESS_DASHBOARD`.

Interaction:

- Default state: both columns share space evenly.
- Player hover: player column expands, host column shrinks.
- Host hover: host column expands, player column shrinks.
- Motion should use short stepped transitions, around `duration: 0.25` with
  `steps(4)`.
- Focused side may increase opacity and trigger a subtle retro pulse.

Responsive requirement:

- On mobile, the split should become a vertical stack with player first and
  host second.

Validation notes:

- Check gold text contrast on dark host background.
- Check desktop and mobile responsiveness.
- Verify stepped motion feels mechanical without becoming disruptive.

## Implementation Plan

Target files:

- Create `apps/web/src/features/landing/components/LandingDiscoveryFork.client.tsx`.
- Modify `apps/web/src/app/[lang]/(marketing)/page.tsx`.

Component behavior:

- Use a client component.
- Track active side with local state: `player`, `host`, or `null`.
- Use `framer-motion` for layout transitions.
- Use `PixelButton` from `@firstspawn/ui`.
- Route player action to Discover.
- Route host action to Console or the server-owner surface available at the
  time.

Original component sketch:

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PixelButton } from "@firstspawn/ui";

export default function LandingDiscoveryFork({ lang }: { lang: string }) {
  const [activeSide, setActiveSide] = useState<"player" | "host" | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-24"
    >
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-ui text-4xl uppercase text-foreground">
          Discovery: Redefined
        </h2>
        <p className="mx-auto max-w-2xl font-body text-muted">
          One platform. Two parallel worlds. Choose your uplink.
        </p>
      </div>

      <div className="relative flex h-[600px] w-full overflow-hidden border-[6px] border-black bg-black shadow-[20px_20px_0_0_rgba(0,0,0,1)]">
        <motion.div
          animate={{
            flex: activeSide === "host" ? 1 : activeSide === "player" ? 3 : 2,
          }}
          transition={{ duration: 0.3, ease: "steps(4)" as never }}
          onHoverStart={() => setActiveSide("player")}
          onHoverEnd={() => setActiveSide(null)}
          className="relative flex cursor-crosshair flex-col justify-center overflow-hidden border-r-[6px] border-black bg-bg-panel p-12"
        >
          <span className="font-display text-[9px] tracking-widest text-primary">
            [CHANNEL_01: PLAYER]
          </span>
          <h3 className="font-ui text-4xl uppercase leading-none text-foreground">
            Neural
            <br />
            Discovery
          </h3>
          <p className="max-w-xs font-body text-sm leading-relaxed text-foreground/80">
            Find hidden gems through deep-pulse playtime metrics and community
            reputation.
          </p>
          <PixelButton variant="primary" size="md" href={`/${lang}/discover`}>
            START_EXPLORING
          </PixelButton>
        </motion.div>

        <motion.div
          animate={{
            flex: activeSide === "player" ? 1 : activeSide === "host" ? 3 : 2,
          }}
          transition={{ duration: 0.3, ease: "steps(4)" as never }}
          onHoverStart={() => setActiveSide("host")}
          onHoverEnd={() => setActiveSide(null)}
          className="relative flex cursor-pointer flex-col items-end justify-center overflow-hidden bg-bg-host-panel p-12 text-right"
        >
          <span className="font-display text-[9px] tracking-widest text-fs-gold">
            [CHANNEL_02: HOST]
          </span>
          <h3 className="font-ui text-4xl uppercase leading-none text-foreground">
            Intelligence
            <br />
            Hub
          </h3>
          <p className="max-w-xs font-body text-sm leading-relaxed text-foreground/80">
            Access real-time growth heatmaps and precision player demographics.
          </p>
          <PixelButton variant="gold" size="md" href={`/${lang}/console`}>
            ACCESS_DASHBOARD
          </PixelButton>
        </motion.div>
      </div>
    </motion.section>
  );
}
```

Integration sketch:

```tsx
import LandingDiscoveryFork from "@/features/landing/components/LandingDiscoveryFork.client";

<div className="relative flex flex-col space-y-48">
  <div className="absolute left-1/2 -z-10 h-full w-px -translate-x-1/2 bg-primary/20" />
  <LandingDiscoveryFork lang={lang} />
  <LandingServerGrid content={content} servers={servers} lang={lang} />
</div>;
```

Expected validation:

```bash
pnpm --filter @firstspawn/web build
```
