import { resolveLocaleParam } from "@/lib/resolve-locale";
import { getDictionary } from "@/lib/get-dictionary";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import DiscoverClient from "@/features/discover/components/DiscoverClient.client";
import { getDiscoverCopy } from "@/features/discover/lib/discover-copy";
import { getServerCardCopy } from "@/features/server/lib/server-copy";
import { fetchServers, type PublicServerListItem } from "@/lib/servers-api";

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
    limit: 100,
  };

  try {
    const data = await fetchServers({ limit: 100, sort: "players" });
    initialServers = data.servers;
    initialPagination = data.pagination;
  } catch (err) {
    console.error("Failed to fetch initial servers for discover page:", err);
  }

  return (
    <main className="w-full">
      <DiscoverClient
        copy={copy.page}
        lang={lang}
        initialServers={initialServers}
        initialPagination={initialPagination}
        loadMoreLabel={dictionary.common.actions.loadMore}
        serverCardCopy={serverCardCopy}
      />
    </main>
  );
}
