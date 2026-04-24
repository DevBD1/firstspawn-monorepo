import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import LandingTerminalHero from "@/features/landing/components/LandingTerminalHero.client";
import LandingDiscoveryFork from "@/features/landing/components/LandingDiscoveryFork.client";
import LandingServerGrid from "@/features/landing/components/LandingServerGrid.client";
import LandingFeatureBlocks from "@/features/landing/components/LandingFeatureBlocks.client";
import LandingActionPrompt from "@/features/landing/components/LandingActionPrompt.client";
import LandingNewsletterBlock from "@/features/landing/components/LandingNewsletterBlock.client";
import { getLandingContent } from "@/features/landing/lib/landing-content";
import { fetchServers, type PublicServerListItem } from "@/lib/servers-api";
import LandingProblemSolution from "@/features/landing/components/LandingProblemSolution.client";
import LandingVisualsControl from "@/features/landing/components/LandingVisualsControl.client";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = await getDictionary(lang);
  const content = getLandingContent(dictionary);
  let servers: PublicServerListItem[] = [];

  try {
    const data = await fetchServers({ limit: 6, sort: "players" });
    servers = data.servers;
  } catch (error) {
    console.error("Failed to fetch landing server proof:", error);
  }

  return (
    <main className="relative isolate w-full bg-background overflow-hidden">
      {/* Background System - Animated Scene Toggle */}
      <LandingVisualsControl dictionary={dictionary} />

      <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col px-4 pb-32 md:px-12">
        {/* SIDE RAILS (The Chassis) */}
        <div className="absolute left-4 top-0 bottom-0 w-1 bg-primary/10 hidden md:block" />
        <div className="absolute right-4 top-0 bottom-0 w-1 bg-primary/10 hidden md:block" />

        {/* HERO - The Entry Point */}
        <div className="mx-auto w-full max-w-6xl">
          <LandingTerminalHero content={content} lang={lang} />
        </div>

        {/* MAIN MODULE STACK */}
        <div className="relative mx-auto flex w-full max-w-6xl flex-col space-y-48">
          {/* Section Connector 1 - Central Spine */}
          <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-px bg-primary/20 -z-10" />

          {/* Module: The Problem and The Vision */}
          <div className="relative">
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <LandingProblemSolution />
          </div>

          {/* Module: The Core Shift (Problem vs Solution) */}
          <div className="relative">
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <LandingDiscoveryFork />
          </div>

          {/* Module: The Data Grid */}
          <div className="relative">
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <LandingServerGrid content={content} servers={servers} lang={lang} />
          </div>

          {/* Module: Features */}
          <div className="relative">
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <LandingFeatureBlocks content={content} />
          </div>

          {/* Module: Action Prompt */}
          <div className="relative">
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <LandingActionPrompt content={content} lang={lang} />
          </div>
        </div>

        {/* FOOTER CONNECTOR */}
        <div className="mx-auto mt-32 w-full max-w-6xl pt-32 border-t-4 border-black">
          <LandingNewsletterBlock dictionary={dictionary} lang={lang} id="newsletter" />
        </div>
      </div>
    </main>
  );
}
