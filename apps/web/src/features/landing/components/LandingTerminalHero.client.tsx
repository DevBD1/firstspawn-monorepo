"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PixelButton, PixelCard } from "@firstspawn/ui";
import ServerCard, { type ServerCardSortHighlight } from "@/features/server/components/ServerCard";
import type { ServerCardCopy } from "@/features/server/lib/server-copy";
import type { LandingContentModel } from "@/features/landing/types";
import type { PublicServerListItem, PublicServerStats } from "@/lib/servers-api";

interface LandingTerminalHeroProps {
  content: LandingContentModel;
  lang: string;
  serverCardCopy: ServerCardCopy;
  servers: PublicServerListItem[];
  stats: PublicServerStats;
}

const formatNumber = (value: number, locale: string) => value.toLocaleString(locale);

const getServerSortHighlight = (
  copy: LandingContentModel["landing"]["discoveryConsole"]["serverPreview"],
  server: PublicServerListItem
): ServerCardSortHighlight => ({
  helper: `${server.latest_metrics.max_players ?? "?"} ${copy.maxPlayersLabel}`,
  label: copy.rankedByLabel,
  tone: "players",
  value: `${server.latest_metrics.online_players ?? 0} ${copy.liveLabel}`,
});

/**
 * LandingTerminalHero renders the homepage's primary discovery console.
 */
export default function LandingTerminalHero({
  content,
  lang,
  serverCardCopy,
  servers,
  stats,
}: LandingTerminalHeroProps) {
  const router = useRouter();
  const copy = content.landing.discoveryConsole;
  const [query, setQuery] = useState("");
  const discoverHref = `/${lang}/discover`;
  const ownerHref = `/${lang}/signup?next=${encodeURIComponent(`/${lang}/console`)}`;

  const previewServers = useMemo(() => servers.slice(0, 6), [servers]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    const nextHref = trimmedQuery
      ? `${discoverHref}?q=${encodeURIComponent(trimmedQuery)}`
      : discoverHref;
    router.push(nextHref);
  };

  return (
    <section
      id="discovery-console"
      aria-label={copy.eyebrow}
      className="relative flex min-h-[88svh] scroll-mt-24 flex-col justify-center py-8 md:py-12"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-60">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute left-1/2 top-0 h-40 w-px bg-primary/30" />
      </div>

      <PixelCard
        variant="panel"
        className="relative z-10 w-full border-primary/50 bg-bg-panel/86 shadow-[12px_12px_0_0_rgba(59,130,246,0.22)]"
      >
        <div className="grid gap-8 xl:grid-cols-[0.86fr_1.14fr] xl:items-start">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h1 className="font-ui text-[clamp(2.5rem,8vw,5.5rem)] uppercase leading-[0.86] text-foreground">
                {copy.title}
              </h1>
              <p className="max-w-2xl border-l-4 border-primary/50 pl-4 font-body text-sm leading-relaxed text-foreground/78 md:text-base">
                {copy.subtitle}
              </p>
            </div>

            <form
              action={discoverHref}
              className="border-4 border-black bg-background/80 p-3 shadow-[6px_6px_0_0_rgba(0,0,0,1)]"
              onSubmit={handleSearchSubmit}
            >
              <label
                htmlFor="landing-discovery-search"
                className="mb-2 block font-display text-[10px] uppercase tracking-[0.24em] text-fs-diamond"
              >
                {copy.searchLabel}
              </label>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  id="landing-discovery-search"
                  name="q"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="min-h-12 w-full rounded-none border-2 border-foreground/20 bg-bg-panel px-4 font-body text-sm text-foreground placeholder:text-muted focus:border-fs-diamond focus:outline-none"
                />
                <PixelButton type="submit" variant="diamond" size="lg" className="min-h-12">
                  {copy.searchSubmitLabel}
                </PixelButton>
              </div>
            </form>

            <div className="flex flex-col gap-3 sm:flex-row">
              <PixelButton href={discoverHref} variant="primary" size="lg" className="flex-1">
                {copy.browseAllLabel}
              </PixelButton>
              <PixelButton href={ownerHref} variant="outline" size="lg" className="flex-1">
                {copy.ownerCtaLabel}
              </PixelButton>
            </div>

            <div className="border-l-4 border-fs-gold/70 pl-4">
              <p className="font-display text-[10px] uppercase tracking-[0.24em] text-fs-gold">
                {copy.ownerLabel}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="min-w-0"
          >
            <dl className="mb-4 grid gap-3 border-b-4 border-black pb-4 sm:grid-cols-3">
              <div className="border-2 border-black bg-background/80 p-3">
                <dt className="font-ui text-[10px] uppercase tracking-widest text-muted">
                  {copy.stats.activeServers}
                </dt>
                <dd className="mt-1 font-display text-base text-fs-diamond">
                  {formatNumber(stats.total_active_servers, lang)}
                </dd>
              </div>
              <div className="border-2 border-black bg-background/80 p-3">
                <dt className="font-ui text-[10px] uppercase tracking-widest text-muted">
                  {copy.stats.checkedRecently}
                </dt>
                <dd className="mt-1 font-display text-base text-fs-diamond">
                  {formatNumber(stats.checked_recently, lang)}
                </dd>
              </div>
              <div className="border-2 border-black bg-background/80 p-3">
                <dt className="font-ui text-[10px] uppercase tracking-widest text-muted">
                  {copy.stats.onlinePlayers}
                </dt>
                <dd className="mt-1 font-display text-base text-fs-diamond">
                  {formatNumber(stats.total_online_players, lang)}
                </dd>
              </div>
            </dl>

            {previewServers.length > 0 ? (
              <div className="grid max-h-[42rem] gap-4 overflow-hidden md:grid-cols-2">
                {previewServers.map((server) => (
                  <ServerCard
                    key={server.slug}
                    copy={serverCardCopy}
                    variant="landing"
                    lang={lang}
                    slug={server.slug}
                    name={server.name}
                    description={server.description}
                    game={server.game}
                    gameVersion={server.latest_metrics.minecraft_version}
                    onlinePlayers={server.latest_metrics.online_players}
                    maxPlayers={server.latest_metrics.max_players}
                    isOnline={server.freshness_status === "online"}
                    pingMs={server.latest_metrics.ping_ms}
                    region={server.country_code}
                    sortHighlight={getServerSortHighlight(copy.serverPreview, server)}
                    tags={[
                      server.catalog_status === "active"
                        ? serverCardCopy.active
                        : serverCardCopy.archived,
                      server.game === "mc_java"
                        ? serverCardCopy.gameLabels.mcJava
                        : serverCardCopy.gameLabels.fallback,
                    ].filter(Boolean)}
                    badges={
                      server.freshness_status === "online"
                        ? [{ label: copy.serverPreview.verifiedLabel, tone: "verified" }]
                        : []
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-80 flex-col justify-center border-4 border-dashed border-foreground/20 bg-background/60 p-6 text-center">
                <p className="font-display text-sm uppercase tracking-[0.2em] text-fs-diamond">
                  {copy.serverPreview.emptyTitle}
                </p>
                <p className="mt-3 font-body text-sm leading-relaxed text-muted">
                  {copy.serverPreview.emptyDescription}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </PixelCard>
    </section>
  );
}
