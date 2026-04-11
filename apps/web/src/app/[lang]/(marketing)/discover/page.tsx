import { resolveLocaleParam } from "@/lib/resolve-locale";
import DiscoverClient from "@/features/discover/components/DiscoverClient.client";
import { fetchServers, type PublicServerListItem } from "@/lib/servers-api";

export const revalidate = 60;

export default async function DiscoverPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);

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
        lang={lang}
        initialServers={initialServers}
        initialPagination={initialPagination}
      />
    </main>
  );
}
