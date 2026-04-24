import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import LandingTerminalHero from "@/features/landing/components/LandingTerminalHero.client";
import LandingProblemSolution from "@/features/landing/components/LandingProblemSolution.client";
import LandingServerGrid from "@/features/landing/components/LandingServerGrid.client";
import LandingFeatureBlocks from "@/features/landing/components/LandingFeatureBlocks.client";
import LandingActionPrompt from "@/features/landing/components/LandingActionPrompt.client";
import LandingNewsletterBlock from "@/features/landing/components/LandingNewsletterBlock.client";
import { getLandingContent } from "@/features/landing/lib/landing-content";
import { getLandingRealtimeStats } from "@/features/landing/lib/landing-stats";
import { fetchServers, type PublicServerListItem } from "@/lib/servers-api";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const [dictionary, realtimeStats] = await Promise.all([
    getDictionary(lang),
    getLandingRealtimeStats(),
  ]);
  const content = getLandingContent(dictionary, realtimeStats);
  let servers: PublicServerListItem[] = [];

  try {
    const data = await fetchServers({ limit: 6, sort: "players" });
    servers = data.servers;
  } catch (error) {
    console.error("Failed to fetch landing server proof:", error);
  }

  return (
    <main className="relative isolate w-full bg-background overflow-hidden">
      {/* CRT Overlay Effect */}
      <div className="crt-overlay pointer-events-none opacity-20" />

      {/* Background System Grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--primary) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-col px-4 pb-32 md:px-12">
        {/* SIDE RAILS (The Chassis) */}
        <div className="absolute left-4 top-0 bottom-0 w-1 bg-primary/10 hidden md:block" />
        <div className="absolute right-4 top-0 bottom-0 w-1 bg-primary/10 hidden md:block" />

        {/* HERO - The Entry Point */}
        <LandingTerminalHero content={content} lang={lang} />

        {/* MAIN MODULE STACK */}
        <div className="relative flex flex-col space-y-48">
          {/* Section Connector 1 */}
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-primary/20 -z-10" />

          {/* Module: The Core Shift (Problem vs Solution) */}
          <LandingProblemSolution />

          {/* Module: The Data Grid */}
          <div className="relative">
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-px bg-primary hidden md:block" />
            <LandingServerGrid content={content} servers={servers} lang={lang} />
          </div>

          {/* Module: Features */}
          <div className="relative">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-px bg-primary hidden md:block" />
            <LandingFeatureBlocks content={content} />
          </div>

          {/* Module: Action Prompt */}
          <div className="relative">
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-px bg-primary hidden md:block" />
            <LandingActionPrompt content={content} lang={lang} />
          </div>
        </div>

        {/* FOOTER CONNECTOR */}
        <div className="mt-32 pt-32 border-t-4 border-black">
          <LandingNewsletterBlock dictionary={dictionary} lang={lang} id="newsletter" />
        </div>
      </div>
    </main>
  );
}
