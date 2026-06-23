"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { WLButton } from "@firstspawn/ui";
import type { PublicServerListItem, PublicServerStats, ServerGeoPoint } from "@/lib/servers-api";
import type {
  AppDictionary,
  RankSignalsDictionary,
  ServerCatalogDictionary,
} from "@/lib/dictionaries/schema";
import { getCountryName as getLocalizedCountryName } from "@/lib/countries";
import ServerQuickPeekModal from "@/features/server/components/ServerQuickPeekModal.client";

// The globe is WebGL/canvas-only, so render it client-side after first paint to
// keep it out of the SSR/initial bundle.
const WLGlobe = dynamic(() => import("./WLGlobe.client"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto aspect-square w-full max-w-[560px] animate-pulse rounded-full bg-bg-panel/40" />
  ),
});

type ServerRowCopy = ServerCatalogDictionary["row"];

interface WLLandingClientProps {
  initialServers: PublicServerListItem[];
  initialGeo: ServerGeoPoint[];
  stats: PublicServerStats;
  lang: string;
  dictionary: AppDictionary;
}

// Catalog tag tokens double as discover search queries, so they stay English.
const QUICK_SEARCH_TAGS = ["Survival", "RPG", "Skyblock", "Events"];

interface Signals {
  activity: number;
  trust: number;
  freshness: number;
}

function getServerSignals(s: PublicServerListItem): Signals {
  const online = s.latest_metrics.online_players ?? 0;
  const max = s.latest_metrics.max_players ?? 100;
  const activity = max > 0 ? Math.min(100, Math.max(10, Math.round((online / max) * 100))) : 50;

  const charSum = s.name.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const trust = 65 + (charSum % 31);

  let freshness = 90;
  if (s.last_ping_at) {
    const elapsedMs = Date.now() - new Date(s.last_ping_at).getTime();
    const elapsedMins = Math.floor(elapsedMs / 60000);
    freshness = Math.max(10, 100 - Math.min(90, elapsedMins));
  }

  return { activity, trust, freshness };
}

function getRankScore(sig: Signals) {
  return sig.activity * sig.trust * sig.freshness;
}

function getRelativeTime(s: PublicServerListItem, rt: ServerRowCopy["relativeTime"]) {
  if (!s.last_ping_at) return rt.unknown;
  const elapsedMs = Date.now() - new Date(s.last_ping_at).getTime();
  const elapsedMins = Math.floor(elapsedMs / 60000);
  if (elapsedMins <= 0) return rt.justNow;
  if (elapsedMins < 60) return rt.minutesAgo.replace("{count}", String(elapsedMins));
  const elapsedHours = Math.floor(elapsedMins / 60);
  if (elapsedHours < 24) return rt.hoursAgo.replace("{count}", String(elapsedHours));
  return rt.daysAgo.replace("{count}", String(Math.floor(elapsedHours / 24)));
}

function getGameName(game: string, gameNames: ServerRowCopy["gameNames"]) {
  if (game === "mc_java") return gameNames.mcJava;
  if (game === "mc_bedrock") return gameNames.mcBedrock;
  return gameNames.fallback;
}

function RankPopover({
  sig,
  copy,
  onClose,
}: {
  sig: Signals;
  copy: RankSignalsDictionary;
  onClose: () => void;
}) {
  const bar = (label: string, v: number) => (
    <div className="grid grid-cols-[76px_1fr_34px] items-center gap-2.5 text-left">
      <span className="font-body text-xs font-semibold text-muted">{label}</span>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${v}%` }}></div>
      </div>
      <span className="font-mono text-xs text-foreground text-right">{v}</span>
    </div>
  );

  return (
    <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-[300px] bg-bg-panel border border-border rounded-xl p-3.5 shadow-xl">
      <div className="flex justify-between items-center mb-2.5">
        <span className="font-body font-bold text-xs text-foreground">{copy.popoverTitle}</span>
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground cursor-pointer text-sm p-1"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {bar(copy.activityLabel, sig.activity)}
        {bar(copy.trustLabel, sig.trust)}
        {bar(copy.freshnessLabel, sig.freshness)}
      </div>
      <div className="mt-2.5 font-mono text-[10px] leading-relaxed text-muted text-left">
        {copy.formulaLine}
        <br />
        {copy.neverSoldLine}
      </div>
    </div>
  );
}

function LandingServerCard({
  s,
  rowCopy,
  onOpen,
}: {
  s: PublicServerListItem;
  rowCopy: ServerRowCopy;
  onOpen: () => void;
}) {
  const online = s.latest_metrics.online_players ?? 0;
  const isVerified = s.name.length % 3 === 0;

  return (
    <div
      onClick={onOpen}
      className="bg-bg-panel border border-border rounded-xl overflow-hidden flex flex-col cursor-pointer shadow-[0_1px_0_rgba(0,0,0,0.4)] transition-all duration-120 hover:-translate-y-0.5 hover:border-primary"
    >
      <div className="h-32 bg-[repeating-linear-gradient(45deg,rgba(125,139,176,0.15)_0_11px,rgba(125,139,176,0.06)_11px_22px)] flex items-center justify-center relative select-none">
        <span className="font-mono text-[10px] tracking-wider text-muted/80 bg-background/25 px-2 py-0.5 rounded">
          {s.name} · world render
        </span>
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {isVerified && (
            <span className="font-body text-[9.5px] font-bold tracking-wide text-fs-gold border border-fs-gold/40 rounded-full px-2 py-0.5 bg-bg-panel/85">
              {rowCopy.verifiedBadge}
            </span>
          )}
          <span className="font-body text-[9.5px] font-bold text-foreground bg-bg-panel/85 border border-border rounded-full px-2 py-0.5 uppercase">
            {getGameName(s.game, rowCopy.gameNames)}
          </span>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <div className="font-display font-medium text-sm text-foreground line-clamp-1 leading-normal">
          {s.name}
        </div>
        <div className="font-body text-xs leading-normal text-muted line-clamp-2">
          {s.description || rowCopy.noDescription}
        </div>
        <div className="mt-auto flex justify-between items-center pt-2">
          <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
            {rowCopy.onlineCountLabel.replace("{count}", online.toLocaleString())}
          </span>
          <span className="font-mono text-[11px] text-muted uppercase">
            {s.country_code === "WW" || !s.country_code
              ? rowCopy.globalRegionLabel
              : s.country_code}
          </span>
        </div>
      </div>
    </div>
  );
}

function LandingServerRow({
  s,
  rank,
  voted,
  onVote,
  openRank,
  onToggleRank,
  onOpen,
  rowCopy,
  rankCopy,
}: {
  s: PublicServerListItem;
  rank: number;
  voted: boolean;
  onVote: () => void;
  openRank: boolean;
  onToggleRank: () => void;
  onOpen: () => void;
  rowCopy: ServerRowCopy;
  rankCopy: RankSignalsDictionary;
}) {
  const sig = getServerSignals(s);
  const isVerified = s.name.length % 3 === 0;
  const relativeTime = getRelativeTime(s, rowCopy.relativeTime);
  const uptime = (98.0 + (s.name.length % 20) / 10).toFixed(1);
  const online = s.latest_metrics.online_players ?? 0;
  const baseVotes = 1200 + s.name.charCodeAt(0) * 15;

  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_96px] sm:grid-cols-[44px_40px_minmax(0,1fr)_110px_96px] md:grid-cols-[44px_40px_minmax(0,1fr)_110px_88px_96px] items-center gap-4 py-3 px-2 border-b border-border transition-colors duration-120 hover:bg-secondary/40 relative">
      <div className="relative">
        <button
          onClick={onToggleRank}
          title={rankCopy.popoverTitle}
          className="font-mono text-sm font-bold text-muted hover:text-foreground cursor-pointer underline decoration-dotted underline-offset-4"
        >
          {String(rank).padStart(2, "0")}
        </button>
        {openRank && <RankPopover sig={sig} copy={rankCopy} onClose={onToggleRank} />}
      </div>
      <div className="hidden sm:block flex-none">
        <div className="w-10 h-10 rounded-lg bg-[repeating-linear-gradient(45deg,rgba(125,139,176,0.1)_0_6px,rgba(125,139,176,0.03)_6px_12px)] flex items-center justify-center text-[8px] font-mono text-muted/65 border border-border select-none">
          icon
        </div>
      </div>
      <div className="min-w-0 cursor-pointer text-left" onClick={onOpen}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body font-bold text-sm text-foreground line-clamp-1 leading-normal">
            {s.name}
          </span>
          {isVerified && (
            <span className="font-body text-[9.5px] font-bold tracking-wide text-fs-gold border border-fs-gold/30 rounded-full px-1.5 py-0.5 leading-none">
              {rowCopy.verifiedBadge}
            </span>
          )}
          <span className="font-mono text-[9px] font-bold text-muted border border-border rounded px-1.5 py-0.5 leading-none uppercase">
            {s.country_code || "WW"}
          </span>
        </div>
        <div className="font-body text-[11px] text-muted mt-1 truncate">
          {getGameName(s.game, rowCopy.gameNames)} · {s.description}
        </div>
      </div>
      <div
        className="hidden sm:flex flex-col gap-1 flex-none text-left"
        title={rankCopy.activityMeasuredTooltip}
      >
        <div className="flex gap-0.5 w-24">
          {Array.from({ length: 12 }).map((_, i) => {
            const filled = Math.round((sig.activity / 100) * 12);
            return (
              <span
                key={i}
                className="flex-1 h-2.5 rounded-[1px]"
                style={{ backgroundColor: i < filled ? "var(--success)" : "var(--border)" }}
              ></span>
            );
          })}
        </div>
        <span className="font-mono text-[10.5px] text-success leading-none">
          {rowCopy.onlineCountLabel.replace("{count}", online.toLocaleString())}
        </span>
      </div>
      <div className="hidden md:block font-mono text-[10.5px] text-muted leading-tight text-left">
        {rowCopy.uptimeLabel.replace("{value}", uptime)}
        <br />
        {relativeTime}
      </div>
      <button
        onClick={onVote}
        className={`font-ui font-bold text-xs rounded-lg px-3 py-1.5 min-h-[36px] w-full text-center transition-all cursor-pointer ${
          voted
            ? "bg-transparent border border-success text-success"
            : "bg-primary border border-primary-hover text-on-primary"
        }`}
      >
        {voted ? rowCopy.votedLabel : `▲ ${((baseVotes + (voted ? 1 : 0)) / 1000).toFixed(1)}k`}
      </button>
    </div>
  );
}

export default function WLLandingClient({
  initialServers,
  initialGeo,
  stats,
  lang,
  dictionary,
}: WLLandingClientProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const [rankPop, setRankPop] = useState<string | null>(null);
  const [peekServer, setPeekServer] = useState<PublicServerListItem | null>(null);

  const copy = dictionary.landing;
  const rowCopy = dictionary.serverCatalog.row;
  const rankCopy = dictionary.rankSignals;
  const modalCopy = dictionary.serverCatalog.modal;

  const getCountryName = (code: string | null) =>
    getLocalizedCountryName((code || "WW").toUpperCase(), lang, dictionary.common.countries);

  // Load votes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fsproto.votes");
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe localStorage hydration must run post-mount to avoid a hydration mismatch
        setVotes(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleVote = (id: string) => {
    const nextVotes = { ...votes, [id]: !votes[id] };
    setVotes(nextVotes);
    try {
      localStorage.setItem("fsproto.votes", JSON.stringify(nextVotes));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryStr = q.trim();
    if (queryStr) {
      router.push(`/${lang}/discover?q=${encodeURIComponent(queryStr)}`);
    } else {
      router.push(`/${lang}/discover`);
    }
  };

  const activeTonight = useMemo(() => {
    return [...initialServers]
      .sort(
        (a, b) => (b.latest_metrics.online_players ?? 0) - (a.latest_metrics.online_players ?? 0)
      )
      .slice(0, 3);
  }, [initialServers]);

  const rankedList = useMemo(() => {
    return [...initialServers]
      .sort((a, b) => getRankScore(getServerSignals(b)) - getRankScore(getServerSignals(a)))
      .slice(0, 5);
  }, [initialServers]);

  const handleOpenServer = (s: PublicServerListItem) => {
    setPeekServer(s);
  };

  const handleOpenFull = (s: PublicServerListItem) => {
    router.push(`/${lang}/server/${s.slug}`);
  };

  // Globe beacon click → open the same quick-peek used by the lists. The geo set can
  // include servers beyond the landing list, so fall back to the profile page.
  const handleGlobeSelect = (slug: string) => {
    const match = initialServers.find((s) => s.slug === slug);
    if (match) {
      setPeekServer(match);
    } else {
      router.push(`/${lang}/server/${slug}`);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Header Atmospheric Layer */}
      <div className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-[0.92]"
          style={{ background: "var(--hero-gradient)" }}
        ></div>
        <div className="absolute left-0 right-0 bottom-0 h-[86px]">
          <div
            className="h-[86px] flex items-center justify-center relative select-none"
            style={{
              background:
                "repeating-linear-gradient(45deg, color-mix(in srgb, var(--art) 15%, transparent) 0 11px, color-mix(in srgb, var(--art) 6%, transparent) 11px 22px)",
            }}
          >
            <span className="font-mono text-[9px] tracking-widest text-muted/60 bg-background/25 px-2 py-0.5 rounded">
              hero landscape · layered world art (commissioned)
            </span>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 pb-32">
          <div className="max-w-2xl text-left">
            <div className="font-body text-[11px] font-bold tracking-[0.16em] uppercase text-primary mb-4">
              {copy.hero.statsLine
                .replace("{players}", stats.total_online_players.toLocaleString())
                .replace("{servers}", stats.total_active_servers.toLocaleString())}
            </div>
            <h1 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.12] mb-5">
              {copy.hero.titleLine1}
              <br />
              {copy.hero.titleLine2}
            </h1>
            <p className="font-body text-sm sm:text-base leading-relaxed text-muted max-w-lg mb-8">
              {copy.hero.subtitle}
            </p>
            <form onSubmit={handleSearchSubmit} className="flex gap-2.5 max-w-md w-full">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={copy.hero.searchPlaceholder}
                className="flex-1 font-body text-sm px-4 py-3 bg-bg-panel/90 text-foreground border border-border rounded-xl outline-none focus:border-primary min-h-[46px]"
              />
              <WLButton type="submit" variant="primary">
                {copy.hero.searchSubmitLabel}
              </WLButton>
            </form>
            <div className="flex flex-wrap gap-2 mt-4 items-center">
              {QUICK_SEARCH_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => router.push(`/${lang}/discover?q=${encodeURIComponent(tag)}`)}
                  className="font-body text-xs font-semibold text-muted hover:text-foreground bg-secondary/30 border border-border rounded-full px-3 py-1 cursor-pointer transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive globe: servers around the world */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-border">
        <WLGlobe
          servers={initialGeo}
          lang={lang}
          copy={copy.globe}
          countryOverrides={dictionary.common.countries}
          onSelect={handleGlobeSelect}
        />
      </div>

      {/* Featured: Active Tonight */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-baseline mb-6">
          <h2 className="font-display font-medium text-lg text-foreground">
            {copy.activeTonight.title}
          </h2>
          <Link
            href={`/${lang}/discover`}
            className="font-body text-xs font-bold text-primary hover:underline"
          >
            {copy.activeTonight.viewAllLabel}
          </Link>
        </div>
        {activeTonight.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTonight.map((s) => (
              <LandingServerCard
                key={s.slug}
                s={s}
                rowCopy={rowCopy}
                onOpen={() => handleOpenServer(s)}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-10 text-center">
            <div className="font-display font-medium text-sm text-foreground mb-1.5">
              {copy.activeTonight.emptyTitle}
            </div>
            <div className="font-body text-xs text-muted">
              {copy.activeTonight.emptyDescription}
            </div>
          </div>
        )}
      </div>

      {/* Ranking List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2 mb-6">
          <h2 className="font-display font-medium text-lg text-foreground">{copy.ranking.title}</h2>
          <span className="font-mono text-xs text-muted">{copy.ranking.formulaHint}</span>
        </div>
        {rankedList.length > 0 ? (
          <div className="flex flex-col border-t border-border">
            {rankedList.map((s, idx) => (
              <LandingServerRow
                key={s.slug}
                s={s}
                rank={idx + 1}
                voted={!!votes[s.slug]}
                onVote={() => handleVote(s.slug)}
                openRank={rankPop === s.slug}
                onToggleRank={() => setRankPop(rankPop === s.slug ? null : s.slug)}
                onOpen={() => handleOpenServer(s)}
                rowCopy={rowCopy}
                rankCopy={rankCopy}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-10 text-center">
            <div className="font-display font-medium text-sm text-foreground mb-1.5">
              {copy.ranking.emptyTitle}
            </div>
            <div className="font-body text-xs text-muted">{copy.ranking.emptyDescription}</div>
          </div>
        )}
      </div>

      {/* Owner CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-border">
        <div className="bg-bg-panel border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 text-left">
          <div className="max-w-xl">
            <h3 className="font-display font-medium text-base text-foreground mb-2">
              {copy.ownerCta.title}
            </h3>
            <p className="font-body text-sm text-muted leading-relaxed">
              {copy.ownerCta.description}
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap flex-shrink-0">
            <WLButton href={`/${lang}/list`} variant="primary">
              {copy.ownerCta.listServerLabel}
            </WLButton>
            <Link
              href={`/${lang}/discover`}
              className="inline-flex items-center justify-center font-ui font-bold text-sm bg-transparent border border-border text-foreground hover:bg-secondary rounded-lg px-4 py-2 min-h-[44px]"
            >
              {copy.ownerCta.howRankingWorksLabel}
            </Link>
          </div>
        </div>
      </div>

      {peekServer && (
        <ServerQuickPeekModal
          server={peekServer}
          lang={lang}
          voted={!!votes[peekServer.slug]}
          onVote={() => handleVote(peekServer.slug)}
          onClose={() => setPeekServer(null)}
          onOpenFull={() => {
            const target = peekServer;
            setPeekServer(null);
            handleOpenFull(target);
          }}
          rowCopy={rowCopy}
          rankCopy={rankCopy}
          modalCopy={modalCopy}
          getCountryName={getCountryName}
        />
      )}
    </div>
  );
}
