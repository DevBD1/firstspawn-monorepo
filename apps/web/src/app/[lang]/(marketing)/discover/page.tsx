import { resolveLocaleParam } from "@/lib/resolve-locale";
import { getDictionary } from "@/lib/get-dictionary";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import DiscoverClient from "@/features/discover/components/DiscoverClient.client";
import { getDiscoverCopy } from "@/features/discover/lib/discover-copy";
import { getServerCardCopy } from "@/features/server/lib/server-copy";
import { fetchServers, fetchServerStats, type PublicServerListItem } from "@/lib/servers-api";

export const revalidate = 60;

export default async function DiscoverPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const copy = getDiscoverCopy(dictionary);
  const serverCardCopy = getServerCardCopy(dictionary);

  let initialServers: PublicServerListItem[] = [];
  let initialPagination: { next_cursor: string | null; limit: number } = {
    next_cursor: null,
    limit: 24,
  };
  let globalStats = { total_active_servers: 0, total_online_players: 0 };

  try {
    const [serversData, statsData] = await Promise.all([
      fetchServers({ limit: 24, sort: "players" }),
      fetchServerStats(),
    ]);
    initialServers = serversData.servers;
    initialPagination = serversData.pagination;
    globalStats = statsData;
  } catch (err) {
    console.error("Failed to fetch initial data for discover page:", err);
  }

  return (
    <DiscoverClient
      copy={copy.page}
      lang={lang}
      initialServers={initialServers}
      initialPagination={initialPagination}
      initialGlobalStats={globalStats}
      serverCardCopy={serverCardCopy}
    />
  );
}
