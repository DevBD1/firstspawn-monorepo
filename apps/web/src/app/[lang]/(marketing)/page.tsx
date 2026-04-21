import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import LandingFinalCtaSection from "@/features/landing/components/LandingFinalCtaSection.client";
import LandingNewsletterBlock from "@/features/landing/components/LandingNewsletterBlock.client";
import LandingProgressionSection from "@/features/landing/components/LandingProgressionSection.client";
import LandingQuestBoardHero from "@/features/landing/components/LandingQuestBoardHero.client";
import LandingRoadmapSection from "@/features/landing/components/LandingRoadmapSection.client";
import LandingServerProofSection from "@/features/landing/components/LandingServerProofSection.client";
import LandingScrollScene from "@/features/landing/components/LandingScrollScene.client";
import LandingTrustSection from "@/features/landing/components/LandingTrustSection.client";
import { getLandingContent } from "@/features/landing/lib/landing-content";
import { getLandingRealtimeStats } from "@/features/landing/lib/landing-stats";
import { getServerCardCopy } from "@/features/server/lib/server-copy";
import { fetchServers, type PublicServerListItem } from "@/lib/servers-api";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const [dictionary, realtimeStats] = await Promise.all([
    getDictionary(lang),
    getLandingRealtimeStats(),
  ]);
  const content = getLandingContent(dictionary, realtimeStats);
  const serverCardCopy = getServerCardCopy(dictionary);
  let servers: PublicServerListItem[] = [];

  try {
    const data = await fetchServers({ limit: 3, sort: "players" });
    servers = data.servers;
  } catch (error) {
    console.error("Failed to fetch landing server proof:", error);
  }

  return (
    <main className="relative isolate w-full overflow-hidden">
      <LandingScrollScene dictionary={dictionary} />

      <div className="relative z-10 mx-auto flex w-full max-w-[96rem] flex-col gap-20 px-4 pb-32 2xl:max-w-[104rem] md:gap-24 md:px-8">
        <LandingQuestBoardHero content={content} lang={lang} />
        <LandingRoadmapSection content={content} />
        <LandingTrustSection content={content} />
        <LandingServerProofSection
          content={content}
          lang={lang}
          serverCardCopy={serverCardCopy}
          servers={servers}
        />
        <LandingProgressionSection content={content} />
        <LandingFinalCtaSection content={content} lang={lang} />
        <LandingNewsletterBlock dictionary={dictionary} lang={lang} />
      </div>
    </main>
  );
}
