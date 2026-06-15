import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import WLLandingClient from "@/features/landing/components/WLLandingClient.client";
import {
  fetchServers,
  fetchServerStats,
  fetchServerGeo,
  type PublicServerListItem,
  type PublicServerStats,
  type ServerGeoPoint,
} from "@/lib/servers-api";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = await getDictionary(lang);

  let servers: PublicServerListItem[] = [];
  let geo: ServerGeoPoint[] = [];
  let stats: PublicServerStats = {
    checked_recently: 0,
    total_active_servers: 0,
    total_online_players: 0,
  };

  const [serversResult, statsResult, geoResult] = await Promise.allSettled([
    fetchServers({ limit: 12, sort: "players" }),
    fetchServerStats(),
    fetchServerGeo(),
  ]);

  if (serversResult.status === "fulfilled") {
    servers = serversResult.value.servers;
  } else {
    console.warn(
      "Failed to fetch servers for landing:",
      serversResult.reason instanceof Error ? serversResult.reason.message : serversResult.reason
    );
  }

  if (statsResult.status === "fulfilled") {
    stats = statsResult.value;
  } else {
    console.warn(
      "Failed to fetch stats for landing:",
      statsResult.reason instanceof Error ? statsResult.reason.message : statsResult.reason
    );
  }

  if (geoResult.status === "fulfilled") {
    geo = geoResult.value;
  } else {
    console.warn(
      "Failed to fetch geo for landing:",
      geoResult.reason instanceof Error ? geoResult.reason.message : geoResult.reason
    );
  }

  return (
    <main className="relative w-full bg-background overflow-hidden min-h-screen">
      <WLLandingClient
        initialServers={servers}
        initialGeo={geo}
        stats={stats}
        lang={lang}
        dictionary={dictionary}
      />
    </main>
  );
}
