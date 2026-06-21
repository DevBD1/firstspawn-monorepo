"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deleteListingAction, type MyListing } from "@/app/actions/listing";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import { ServerAnalyticsPanel } from "@/features/analytics/components/ServerAnalyticsPanel.client";

/** Owner overview uses the same measured analytics contract as the public profile. */
export default function WLOwnerConsoleClient({
  initialServers,
  lang,
  dictionary,
}: {
  initialServers: MyListing[];
  lang: string;
  dictionary: AppDictionary;
}) {
  const [servers, setServers] = useState(initialServers);
  const [serverId, setServerId] = useState(initialServers[0]?.id ?? "");
  const active = useMemo(
    () => servers.find((server) => server.id === serverId) ?? servers[0],
    [serverId, servers]
  );
  const copy = dictionary.ownerConsole;
  const analytics = dictionary.serverDetail.profile.analytics;
  if (!active)
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-3xl text-foreground">{copy.header.title}</h1>
        <p className="mt-5 text-muted">{copy.empty.title}</p>
        <Link href={`/${lang}/list`} className="mt-5 inline-block text-primary">
          {copy.empty.ctaLabel}
        </Link>
      </main>
    );
  const remove = async () => {
    const result = await deleteListingAction(active.id);
    if (result.ok) {
      const next = servers.filter((server) => server.id !== active.id);
      setServers(next);
      setServerId(next[0]?.id ?? "");
    }
  };
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            {copy.header.title}
          </p>
          <h1 className="mt-2 font-display text-3xl text-foreground">{active.name}</h1>
        </div>
        <select
          value={active.id}
          onChange={(event) => setServerId(event.target.value)}
          className="border border-border bg-bg-panel px-3 py-2 text-sm text-foreground"
        >
          {servers.map((server) => (
            <option key={server.id} value={server.id}>
              {server.name}
            </option>
          ))}
        </select>
      </div>
      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="border border-border p-4">
          <strong className="font-mono text-2xl text-success">
            {active.latest_observation.online_players?.toLocaleString() ?? "—"}
          </strong>
          <p className="mt-1 text-xs text-muted">{copy.overview.onlineNowLabel}</p>
        </div>
        <div className="border border-border p-4">
          <strong className="font-mono text-2xl text-foreground">
            {dictionary.serverDetail.status[active.freshness_status]}
          </strong>
          <p className="mt-1 text-xs text-muted">{analytics.provenanceNote}</p>
        </div>
      </section>
      <div className="mt-8">
        <ServerAnalyticsPanel
          slug={active.slug}
          title={analytics.title}
          availabilityLabel={analytics.availabilityLabel}
          playersLabel={analytics.playersLabel}
          coverageLabel={analytics.coverageLabel}
          provenanceNote={analytics.provenanceNote}
        />
      </div>
      <div className="mt-8 flex gap-3">
        <Link
          href={`/${lang}/server/${active.slug}`}
          className="border border-primary px-4 py-2 text-sm text-primary"
        >
          {copy.overview.viewProfileLabel}
        </Link>
        <button
          type="button"
          onClick={remove}
          className="border border-danger/40 px-4 py-2 text-sm text-danger"
        >
          {copy.overview.deleteLabel}
        </button>
      </div>
    </main>
  );
}
