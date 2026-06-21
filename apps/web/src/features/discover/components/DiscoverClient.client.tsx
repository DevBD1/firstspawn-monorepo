"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DiscoverDictionary, ServerCatalogDictionary } from "@/lib/dictionaries/schema";
import type { PublicServerListItem, PublicServerStats, PublicServerSort } from "@/lib/servers-api";
import { loadMoreServers } from "@/app/actions/servers";
import { getCountryName } from "@/lib/countries";
import ServerQuickPeekModal from "@/features/server/components/ServerQuickPeekModal.client";

interface Props {
  copy: DiscoverDictionary["page"];
  rowCopy: ServerCatalogDictionary["row"];
  modalCopy: ServerCatalogDictionary["modal"];
  countries: Record<string, string>;
  lang: string;
  initialServers: PublicServerListItem[];
  initialPagination: { next_cursor: string | null; limit: number };
  initialGlobalStats: PublicServerStats;
  initialQuery?: string;
}

/** Discovery ranks only by explicit measured fields; no synthetic rank or vote proxy is shown. */
export default function DiscoverClient({
  copy,
  rowCopy,
  modalCopy,
  countries,
  lang,
  initialServers,
  initialPagination,
  initialGlobalStats,
  initialQuery = "",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [servers, setServers] = useState(initialServers);
  const [cursor, setCursor] = useState(initialPagination.next_cursor);
  const [sort, setSort] = useState<PublicServerSort>("players");
  const [peek, setPeek] = useState<PublicServerListItem | null>(null);
  const [loading, setLoading] = useState(false);
  const visible = useMemo(
    () =>
      servers.filter((server) =>
        `${server.name} ${server.description}`.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [query, servers]
  );
  const applySort = async (next: PublicServerSort) => {
    setSort(next);
    setLoading(true);
    try {
      const data = await loadMoreServers({
        q: query.trim() || undefined,
        sort: next,
        limit: initialPagination.limit,
      });
      setServers(data.servers);
      setCursor(data.pagination.next_cursor);
    } finally {
      setLoading(false);
    }
  };
  const loadMore = async () => {
    if (!cursor) return;
    setLoading(true);
    try {
      const data = await loadMoreServers({
        q: query.trim() || undefined,
        sort,
        limit: initialPagination.limit,
        cursor,
      });
      setServers((current) => [...current, ...data.servers]);
      setCursor(data.pagination.next_cursor);
    } finally {
      setLoading(false);
    }
  };
  const country = (code: string | null) =>
    getCountryName((code || "WW").toUpperCase(), lang, countries);
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-4xl text-foreground">{copy.title}</h1>
          <p className="mt-2 font-mono text-xs text-muted">
            {copy.results.countOther.replace(
              "{count}",
              initialGlobalStats.total_active_servers.toLocaleString()
            )}{" "}
            · {modalCopy.provenanceNote}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => applySort("players")}
            className={`border px-3 py-2 text-xs ${sort === "players" ? "border-primary text-primary" : "border-border text-muted"}`}
          >
            {copy.filters.sortOptions.players}
          </button>
          <button
            onClick={() => applySort("availability")}
            className={`border px-3 py-2 text-xs ${sort === "availability" ? "border-primary text-primary" : "border-border text-muted"}`}
          >
            {rowCopy.uptimeLabel.replace("{value}", "30d")}
          </button>
        </div>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mt-7 w-full border border-border bg-bg-panel px-4 py-3 text-foreground"
        placeholder={copy.searchPlaceholder.replace(
          "{count}",
          String(initialGlobalStats.total_active_servers)
        )}
      />
      <div className="mt-7 divide-y divide-border border-y border-border">
        {visible.map((server) => (
          <button
            type="button"
            key={server.slug}
            onClick={() => setPeek(server)}
            className="grid w-full grid-cols-[minmax(0,1fr)_100px_100px] items-center gap-5 px-2 py-4 text-left hover:bg-secondary/30"
          >
            <span className="min-w-0">
              <strong className="block truncate text-sm text-foreground">{server.name}</strong>
              <span className="mt-1 block truncate text-xs text-muted">
                {country(server.country_code)} · {server.description}
              </span>
            </span>
            <span className="text-right font-mono text-sm text-success">
              {server.latest_observation.online_players?.toLocaleString() ?? "—"}
            </span>
            <span className="text-right font-mono text-xs text-muted">
              {server.availability_30d.percent === null
                ? "—"
                : `${server.availability_30d.percent.toFixed(2)}%`}
            </span>
          </button>
        ))}
      </div>
      {cursor && (
        <button
          type="button"
          disabled={loading}
          onClick={loadMore}
          className="mt-6 w-full border border-border py-3 font-mono text-xs text-muted"
        >
          {loading ? "…" : copy.results.loadingMore}
        </button>
      )}
      {peek && (
        <ServerQuickPeekModal
          server={peek}
          lang={lang}
          onClose={() => setPeek(null)}
          onOpenFull={() => router.push(`/${lang}/server/${peek.slug}`)}
          rowCopy={rowCopy}
          modalCopy={modalCopy}
          getCountryName={country}
        />
      )}
    </main>
  );
}
