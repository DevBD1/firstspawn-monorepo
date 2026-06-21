"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import type { PublicServerListItem, PublicServerStats, ServerGeoPoint } from "@/lib/servers-api";
import ServerQuickPeekModal from "@/features/server/components/ServerQuickPeekModal.client";
import { getCountryName as getLocalizedCountryName } from "@/lib/countries";

const WLGlobe = dynamic(() => import("./WLGlobe.client"), {
  ssr: false,
  loading: () => <div className="aspect-square animate-pulse rounded-full bg-bg-panel/40" />,
});
interface Props {
  initialServers: PublicServerListItem[];
  initialGeo: ServerGeoPoint[];
  stats: PublicServerStats;
  lang: string;
  dictionary: AppDictionary;
}

/** Landing discovery uses only current probe players and coverage-qualified availability. */
export default function WLLandingClient({
  initialServers,
  initialGeo,
  stats,
  lang,
  dictionary,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [peek, setPeek] = useState<PublicServerListItem | null>(null);
  const rowCopy = dictionary.serverCatalog.row;
  const modalCopy = dictionary.serverCatalog.modal;
  const servers = useMemo(
    () =>
      [...initialServers]
        .sort(
          (a, b) =>
            (b.latest_observation.online_players ?? -1) -
            (a.latest_observation.online_players ?? -1)
        )
        .slice(0, 8),
    [initialServers]
  );
  const countryName = (code: string | null) =>
    getLocalizedCountryName((code || "WW").toUpperCase(), lang, dictionary.common.countries);
  return (
    <main>
      <section className="border-b border-border px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="font-display text-4xl text-foreground md:text-6xl">
              {dictionary.landing.hero.titleLine1}
              <br />
              {dictionary.landing.hero.titleLine2}
            </h1>
            <p className="mt-5 max-w-xl text-muted">{dictionary.landing.hero.subtitle}</p>
            <form
              className="mt-7 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                router.push(
                  `/${lang}/discover${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`
                );
              }}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 border border-border bg-bg-panel px-4 py-3 text-foreground"
                placeholder={dictionary.landing.hero.searchPlaceholder}
              />
              <button className="bg-primary px-5 font-ui font-bold text-on-primary">
                {dictionary.landing.hero.searchSubmitLabel}
              </button>
            </form>
            <div className="mt-6 font-mono text-xs text-muted">
              {dictionary.landing.hero.statsLine
                .replace("{players}", stats.total_online_players.toLocaleString())
                .replace("{servers}", stats.total_active_servers.toLocaleString())}
            </div>
          </div>
          <WLGlobe
            servers={initialGeo}
            lang={lang}
            copy={dictionary.landing.globe}
            countryOverrides={dictionary.common.countries}
            onSelect={(slug) => {
              const found = initialServers.find((server) => server.slug === slug);
              found ? setPeek(found) : router.push(`/${lang}/server/${slug}`);
            }}
          />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl text-foreground">
              {dictionary.landing.activeTonight.title}
            </h2>
            <p className="mt-1 font-mono text-[10px] text-muted">
              {dictionary.serverDetail.profile.analytics.provenanceNote}
            </p>
          </div>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {servers.map((server) => (
            <button
              type="button"
              key={server.slug}
              onClick={() => setPeek(server)}
              className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-5 px-2 py-4 text-left hover:bg-secondary/30"
            >
              <span>
                <strong className="block text-sm text-foreground">{server.name}</strong>
                <span className="mt-1 block truncate text-xs text-muted">{server.description}</span>
              </span>
              <span className="font-mono text-sm text-success">
                {server.latest_observation.online_players?.toLocaleString() ?? "—"}{" "}
                {rowCopy.onlineCountLabel.replace("{count}", "").trim()}
              </span>
              <span className="w-24 text-right font-mono text-xs text-muted">
                {server.availability_30d.percent === null
                  ? "—"
                  : `${server.availability_30d.percent.toFixed(2)}%`}
              </span>
            </button>
          ))}
        </div>
      </section>
      {peek && (
        <ServerQuickPeekModal
          server={peek}
          lang={lang}
          onClose={() => setPeek(null)}
          onOpenFull={() => router.push(`/${lang}/server/${peek.slug}`)}
          rowCopy={rowCopy}
          modalCopy={modalCopy}
          getCountryName={countryName}
        />
      )}
    </main>
  );
}
