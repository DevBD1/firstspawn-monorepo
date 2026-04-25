# Vertical Reactive Discovery Fork Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `LandingDiscoveryFork.client.tsx` component and integrate it into the landing page as a high-fidelity narrative "Yin-Yang" split.

**Architecture:** A dual-column `flex` layout using `framer-motion` to animate `flex` property values with `steps(4)` easing for a mechanical feel.

**Tech Stack:** React, Next.js, Tailwind CSS, Framer Motion, @firstspawn/ui.

---

### Task 1: Create the Discovery Fork Component

**Files:**
- Create: `apps/web/src/features/landing/components/LandingDiscoveryFork.client.tsx`

- [ ] **Step 1: Write the initial component structure**

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PixelButton } from "@firstspawn/ui";

export default function LandingDiscoveryFork({ lang }: { lang: string }) {
  const [activeSide, setActiveSide] = useState<"player" | "host" | null>(null);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  };

  const transition = {
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1], // steps(4) will be applied in CSS or via keyframes
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      className="py-24"
    >
      <div className="text-center mb-16">
        <h2 className="font-ui text-4xl uppercase text-foreground mb-4">Discovery: Redefined</h2>
        <p className="font-body text-muted max-w-2xl mx-auto">One platform. Two parallel worlds. Choose your uplink.</p>
      </div>

      <div className="flex h-[600px] w-full border-[6px] border-black shadow-[20px_20px_0_0_rgba(0,0,0,1)] bg-black overflow-hidden relative">
        
        {/* PLAYER SIDE */}
        <motion.div
          animate={{ flex: activeSide === "host" ? 1 : activeSide === "player" ? 3 : 2 }}
          transition={{ duration: 0.3, ease: "steps(4)" as any }}
          onHoverStart={() => setActiveSide("player")}
          onHoverEnd={() => setActiveSide(null)}
          className="bg-bg-panel p-12 relative flex flex-col justify-center border-r-[6px] border-black cursor-crosshair group overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-30" />
          <div className="relative z-10 space-y-6">
            <span className="font-display text-[9px] text-primary tracking-widest">[CHANNEL_01: PLAYER]</span>
            <h3 className="font-ui text-4xl text-white uppercase leading-none">Neural<br/>Discovery</h3>
            <p className="font-body text-foreground/80 text-sm max-w-xs leading-relaxed">Find hidden gems through deep-pulse playtime metrics and community reputation.</p>
            <div className="pt-4">
              <PixelButton variant="primary" size="md">START_EXPLORING</PixelButton>
            </div>
          </div>
        </motion.div>

        {/* HOST SIDE */}
        <motion.div
          animate={{ flex: activeSide === "player" ? 1 : activeSide === "host" ? 3 : 2 }}
          transition={{ duration: 0.3, ease: "steps(4)" as any }}
          onHoverStart={() => setActiveSide("host")}
          onHoverEnd={() => setActiveSide(null)}
          className="bg-[#1E1A0A] p-12 relative flex flex-col justify-center cursor-pointer group overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-fs-gold opacity-30" />
          <div className="relative z-10 space-y-6 text-right flex flex-col items-end">
            <span className="font-display text-[9px] text-fs-gold tracking-widest">[CHANNEL_02: HOST]</span>
            <h3 className="font-ui text-4xl text-white uppercase leading-none">Intelligence<br/>Hub</h3>
            <p className="font-body text-foreground/80 text-sm max-w-xs leading-relaxed">Access real-time growth heatmaps and precision player demographics.</p>
            <div className="pt-4">
              <PixelButton variant="gold" size="md">ACCESS_DASHBOARD</PixelButton>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
```

- [ ] **Step 2: Add visual polish (Scanlines and Glow)**

```tsx
// Inside the component return, add the scanline overlay to each side
<div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-20" />

// Add hover glow effects
<motion.div 
  animate={{ opacity: activeSide === "player" ? 0.05 : 0 }}
  className="absolute inset-0 bg-primary pointer-events-none transition-opacity" 
/>
```

- [ ] **Step 3: Commit component**

```bash
git add apps/web/src/features/landing/components/LandingDiscoveryFork.client.tsx
git commit -m "feat: add LandingDiscoveryFork interactive component"
```

---

### Task 2: Integrate into the Landing Page

**Files:**
- Modify: `apps/web/src/app/[lang]/(marketing)/page.tsx`

- [ ] **Step 1: Replace LandingProblemSolution with the new Fork**

```tsx
import LandingDiscoveryFork from "@/features/landing/components/LandingDiscoveryFork.client";

// ... in Home component return:
<div className="relative flex flex-col space-y-48">
  <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-primary/20 -z-10" />
  
  {/* The Core Shift is now handled by the Reactive Fork */}
  <LandingDiscoveryFork lang={lang} />

  <LandingServerGrid content={content} servers={servers} lang={lang} />
  {/* ... */}
</div>
```

- [ ] **Step 2: Verify build and responsiveness**

Run: `pnpm build`
Expected: Build passes without type errors.

- [ ] **Step 3: Commit integration**

```bash
git add apps/web/src/app/[lang]/(marketing)/page.tsx
git commit -m "feat: integrate Discovery Fork into landing page flow"
```
