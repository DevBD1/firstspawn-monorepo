import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import LandingTerminalHero from "@/features/landing/components/LandingTerminalHero.client";
import LandingFeatureBlocks from "@/features/landing/components/LandingFeatureBlocks.client";
import { getLandingContent } from "@/features/landing/lib/landing-content";
import {
  fetchServers,
  fetchServerStats,
  type PublicServerListItem,
  type PublicServerStats,
} from "@/lib/servers-api";
import LandingProblemSolution from "@/features/landing/components/LandingProblemSolution.client";
import LandingReturnCta from "@/features/landing/components/LandingReturnCta.client";
import LandingVisualsControl from "@/features/landing/components/LandingVisualsControl.client";
import { getServerCardCopy } from "@/features/server/lib/server-copy";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = await getDictionary(lang);
  const content = getLandingContent(dictionary);
  const serverCardCopy = getServerCardCopy(dictionary);
  let servers: PublicServerListItem[] = [];
  let stats: PublicServerStats = {
    checked_recently: 0,
    total_active_servers: 0,
    total_online_players: 0,
  };

  try {
    const [serversData, statsData] = await Promise.all([
      fetchServers({ limit: 6, sort: "players" }),
      fetchServerStats(),
    ]);
    servers = serversData.servers;
    stats = statsData;
  } catch (error) {
    console.error("Failed to fetch landing discovery console data:", error);
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
          <LandingTerminalHero
            content={content}
            lang={lang}
            serverCardCopy={serverCardCopy}
            servers={servers}
            stats={stats}
          />
        </div>

        {/* MAIN MODULE STACK */}
        <div className="relative mx-auto flex w-full max-w-6xl flex-col space-y-24 md:space-y-32">
          {/* Section Connector 1 - Central Spine */}
          <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-px bg-primary/20 -z-10" />

          {/* Module: Features */}
          <div className="relative">
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <LandingFeatureBlocks content={content} />
          </div>

          {/* Module: The Problem and The Vision */}
          <div className="relative">
            <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-20 h-px bg-primary/30 hidden lg:block" />
            <LandingProblemSolution content={content} />
            <LandingReturnCta content={content} />
          </div>
        </div>
      </div>
    </main>
  );
}
