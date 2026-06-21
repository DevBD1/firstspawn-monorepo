import { resolveLocaleParam } from "@/lib/resolve-locale";
import { getDictionary } from "@/lib/get-dictionary";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import DiscoverClient from "@/features/discover/components/DiscoverClient.client";
import { getDiscoverCopy } from "@/features/discover/lib/discover-copy";
import { fetchServers, fetchServerStats, type PublicServerListItem } from "@/lib/servers-api";

export const revalidate = 60;

interface DiscoverPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}

const resolveInitialQuery = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
};

export default async function DiscoverPage({ params, searchParams }: DiscoverPageProps) {
  const { lang: langParam } = await params;
  const queryParams = await searchParams;
  const lang = resolveLocaleParam(langParam);
  const initialQuery = resolveInitialQuery(queryParams.q);
  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const copy = getDiscoverCopy(dictionary);

  let initialServers: PublicServerListItem[] = [];
  let initialPagination: { next_cursor: string | null; limit: number } = {
    next_cursor: null,
    limit: 24,
  };
  let globalStats = { checked_recently: 0, total_active_servers: 0, total_online_players: 0 };

  const [serversResult, statsResult] = await Promise.allSettled([
    fetchServers({ limit: 24, sort: "players", q: initialQuery || undefined }),
    fetchServerStats(),
  ]);

  if (serversResult.status === "fulfilled") {
    initialServers = serversResult.value.servers;
    initialPagination = serversResult.value.pagination;
  } else {
    console.warn(
      "Failed to fetch servers for discover:",
      serversResult.reason instanceof Error ? serversResult.reason.message : serversResult.reason
    );
  }

  if (statsResult.status === "fulfilled") {
    globalStats = statsResult.value;
  } else {
    console.warn(
      "Failed to fetch stats for discover:",
      statsResult.reason instanceof Error ? statsResult.reason.message : statsResult.reason
    );
  }

  return (
    <DiscoverClient
      copy={copy.page}
      rowCopy={dictionary.serverCatalog.row}
      rankCopy={dictionary.rankSignals}
      modalCopy={dictionary.serverCatalog.modal}
      countries={dictionary.common.countries}
      lang={lang}
      initialServers={initialServers}
      initialPagination={initialPagination}
      initialGlobalStats={globalStats}
      initialQuery={initialQuery}
    />
  );
}
