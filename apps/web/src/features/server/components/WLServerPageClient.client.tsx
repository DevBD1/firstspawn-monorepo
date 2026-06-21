"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WLButton } from "@firstspawn/ui";
import type { PublicServerDetail, PublicServerListItem } from "@/lib/servers-api";
import { getGameName } from "@/features/server/lib/server-copy";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import { getCountryName } from "@/lib/countries";
import { ServerAnalyticsPanel } from "@/features/analytics/components/ServerAnalyticsPanel.client";

interface Props {
  s: PublicServerDetail;
  lang: string;
  similarServers: PublicServerListItem[];
  dictionary: AppDictionary;
}

/** Public server profile separates measured probe data from owner-declared metadata. */
export default function WLServerPageClient({ s, lang, similarServers, dictionary }: Props) {
  const profile = dictionary.serverDetail.profile;
  const originLabel = getCountryName(
    (s.country_code || "WW").toUpperCase(),
    lang,
    dictionary.common.countries
  );
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);
  const address = s.port === 25565 ? s.host : `${s.host}:${s.port}`;
  const copyAddress = async () => {
    await navigator.clipboard.writeText(address).catch(() => undefined);
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 1600);
  };
  const availability = s.availability_30d.percent;
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href={`/${lang}/discover`} className="font-mono text-xs text-muted hover:text-primary">
        {profile.breadcrumbBack}
      </Link>
      <header className="mt-7 border-b border-border pb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {getGameName(s.game, profile.gameNames)} · {originLabel}
            </p>
            <h1 className="mt-2 font-display text-4xl text-foreground">{s.name}</h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">{s.description}</p>
          </div>
          <span
            className={`border px-3 py-2 font-mono text-xs uppercase ${s.latest_observation.status === "online" ? "border-success/40 text-success" : "border-border text-muted"}`}
          >
            {dictionary.serverDetail.status[s.latest_observation.status]}
          </span>
        </div>
      </header>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-8">
          <ServerAnalyticsPanel
            slug={s.slug}
            title={profile.analytics.title}
            availabilityLabel={profile.analytics.availabilityLabel}
            playersLabel={profile.analytics.playersLabel}
            coverageLabel={profile.analytics.coverageLabel}
            provenanceNote={profile.analytics.provenanceNote}
          />
          <section>
            <h2 className="font-display text-xl text-foreground">{profile.about.title}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">{s.description}</p>
          </section>
          {s.socials.length > 0 && (
            <section>
              <h2 className="font-display text-xl text-foreground">{profile.sidebar.factsTitle}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    rel="noreferrer"
                    target="_blank"
                    className="border border-border px-3 py-2 text-xs text-primary"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
              <p className="mt-2 font-mono text-[10px] text-muted">
                {profile.analytics.ownerDeclaredNote}
              </p>
            </section>
          )}
          {similarServers.length > 0 && (
            <section>
              <h2 className="font-display text-xl text-foreground">{profile.similar.title}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {similarServers.map((item) => {
                  const itemStatus = item.latest_observation.status;
                  const itemAvailability = item.availability_30d.percent;
                  return (
                    <Link
                      key={item.slug}
                      href={`/${lang}/server/${item.slug}`}
                      className="group flex h-full flex-col border border-border p-4 transition-colors hover:border-primary"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="truncate font-display text-sm text-foreground group-hover:text-primary">
                          {item.name}
                        </strong>
                        <span
                          className={`shrink-0 font-mono text-[10px] uppercase ${itemStatus === "online" ? "text-success" : "text-muted"}`}
                        >
                          {dictionary.serverDetail.status[itemStatus]}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-muted">{item.description}</p>
                      <div className="mt-3 flex items-center justify-between gap-2 font-mono text-[10px] text-muted">
                        <span>
                          {item.latest_observation.online_players?.toLocaleString() ?? "—"}{" "}
                          {profile.sidebar.stats.onlineNow}
                        </span>
                        <span>
                          {itemAvailability === null ? "—" : `${itemAvailability.toFixed(2)}%`}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-4">
          <section className="border border-border bg-bg-panel p-5">
            <h2 className="font-display text-lg text-foreground">{profile.sidebar.joinTitle}</h2>
            <code className="mt-3 block break-all font-mono text-sm text-primary">{address}</code>
            <WLButton fullWidth variant="primary" className="mt-4" onClick={copyAddress}>
              {copied ? profile.sidebar.copiedLabel : profile.sidebar.copyAddressLabel}
            </WLButton>
          </section>
          <section className="grid grid-cols-2 gap-2">
            <div className="border border-border p-3">
              <strong className="block font-mono text-lg text-success">
                {s.latest_observation.online_players?.toLocaleString() ?? "—"}
              </strong>
              <span className="text-xs text-muted">{profile.sidebar.stats.onlineNow}</span>
            </div>
            <div className="border border-border p-3">
              <strong className="block font-mono text-lg text-foreground">
                {availability === null ? "—" : `${availability.toFixed(2)}%`}
              </strong>
              <span className="text-xs text-muted">{profile.sidebar.stats.uptime30d}</span>
              <small className="mt-1 block font-mono text-[9px] text-muted">
                {s.availability_30d.coverage_percent.toFixed(1)}% {profile.analytics.coverageLabel}
              </small>
            </div>
          </section>
          <p className="font-mono text-[10px] leading-relaxed text-muted">
            {profile.analytics.provenanceNote}
          </p>
        </aside>
      </div>
    </main>
  );
}
