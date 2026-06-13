import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import WLLandingClient from "@/features/landing/components/WLLandingClient.client";
import {
  fetchServers,
  fetchServerStats,
  type PublicServerListItem,
  type PublicServerStats,
} from "@/lib/servers-api";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = await getDictionary(lang);

  let servers: PublicServerListItem[] = [];
  let stats: PublicServerStats = {
    checked_recently: 0,
    total_active_servers: 0,
    total_online_players: 0,
  };

  try {
    const [serversData, statsData] = await Promise.all([
      fetchServers({ limit: 12, sort: "players" }),
      fetchServerStats(),
    ]);
    servers = serversData.servers;
    stats = statsData;
  } catch (error) {
    console.error("Failed to fetch landing discovery console data:", error);
  }

  return (
    <main className="relative w-full bg-background overflow-hidden min-h-screen">
      <WLLandingClient initialServers={servers} stats={stats} lang={lang} dictionary={dictionary} />
    </main>
  );
}
