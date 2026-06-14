"use client";

import React, { useState, useEffect, useMemo, useTransition, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type {
  DiscoverDictionary,
  RankSignalsDictionary,
  ServerCatalogDictionary,
} from "@/lib/dictionaries/schema";
import type {
  PublicServerListItem,
  PublicServerStats,
  PublicServerGame,
  PublicServerSort,
} from "@/lib/servers-api";
import { loadMoreServers, getServerStats } from "@/app/actions/servers";
import { getCountryName as getLocalizedCountryName, getCountryOptions } from "@/lib/countries";
import ServerQuickPeekModal from "@/features/server/components/ServerQuickPeekModal.client";

type ServerRowCopy = ServerCatalogDictionary["row"];

// Constants for word-to-facet parsing. Tag tokens are matched against
// English search words and server text, so they stay untranslated data.
const WL_QUERY_SYNONYMS: Record<string, string> = {
  smp: "Survival",
  survival: "Survival",
  whitelist: "Whitelist",
  whitelisted: "Whitelist",
  chill: "Family-friendly",
  relaxed: "Family-friendly",
  family: "Family-friendly",
  friendly: "Family-friendly",
  economy: "Economy",
  market: "Economy",
  markets: "Economy",
  trading: "Trading",
  trade: "Trading",
  towny: "Towny",
  towns: "Towny",
  town: "Towny",
  skyblock: "Skyblock",
  quests: "Quests",
  quest: "Quests",
  rpg: "RPG",
  hardcore: "Hardcore",
  seasonal: "Seasonal",
  seasons: "Seasonal",
  creative: "Creative",
  builds: "Builds",
  building: "Builds",
  builders: "Builds",
  dungeons: "Dungeons",
  dungeon: "Dungeons",
  pve: "PvE",
  coop: "Co-op",
  cooperative: "Co-op",
  events: "Events",
  event: "Events",
  competitive: "Competitive",
  ranked: "Competitive",
  community: "Community",
  showcase: "Showcase",
  adventure: "Adventure",
  expeditions: "Adventure",
};

const WL_QUERY_DEMONYMS: Record<string, string> = {
  german: "DE",
  germany: "DE",
  turkish: "TR",
  turkey: "TR",
  korean: "KR",
  korea: "KR",
  american: "US",
  usa: "US",
  british: "GB",
  uk: "GB",
  canadian: "CA",
  canada: "CA",
  norwegian: "NO",
  norway: "NO",
  finnish: "FI",
  finland: "FI",
  brazilian: "BR",
  brazil: "BR",
  global: "WW",
  worldwide: "WW",
};

const WL_ALL_TAGS = Array.from(new Set(Object.values(WL_QUERY_SYNONYMS))).sort();

interface Signals {
  activity: number;
  trust: number;
  freshness: number;
}

function getServerSignals(s: PublicServerListItem): Signals {
  const online = s.latest_metrics?.online_players ?? 0;
  const max = s.latest_metrics?.max_players ?? 100;
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
  if (game === "hytale") return gameNames.hytale;
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

function DiscoverServerRow({
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
  const online = s.latest_metrics?.online_players ?? 0;
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

function wlInterpretQuery(q: string) {
  const tokens = q
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter(Boolean);
  const out: { tags: string[]; game: string | null; country: string | null; rest: string[] } = {
    tags: [],
    game: null,
    country: null,
    rest: [],
  };

  for (const t of tokens) {
    const tag = WL_QUERY_SYNONYMS[t];
    if (tag && WL_ALL_TAGS.includes(tag)) {
      if (!out.tags.includes(tag)) out.tags.push(tag);
      continue;
    }
    if (t === "minecraft" || t === "mc") {
      out.game = "Minecraft";
      continue;
    }
    if (t === "hytale") {
      out.game = "Hytale";
      continue;
    }
    if (WL_QUERY_DEMONYMS[t]) {
      out.country = WL_QUERY_DEMONYMS[t];
      continue;
    }
    out.rest.push(t);
  }
  return out;
}

interface DiscoverClientProps {
  copy: DiscoverDictionary["page"];
  rowCopy: ServerRowCopy;
  rankCopy: RankSignalsDictionary;
  modalCopy: ServerCatalogDictionary["modal"];
  countries: Record<string, string>;
  lang: string;
  initialServers: PublicServerListItem[];
  initialPagination: { next_cursor: string | null; limit: number };
  initialGlobalStats: PublicServerStats;
  initialQuery?: string;
}

export default function DiscoverClient({
  copy,
  rowCopy,
  rankCopy,
  modalCopy,
  countries,
  lang,
  initialServers,
  initialPagination,
  initialGlobalStats,
  initialQuery = "",
}: DiscoverClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [servers, setServers] = useState<PublicServerListItem[]>(initialServers);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPagination.next_cursor);
  const [globalStats, setGlobalStats] = useState<PublicServerStats>(initialGlobalStats);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, startTransition] = useTransition();

  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const [rankPop, setRankPop] = useState<string | null>(null);
  const [peekServer, setPeekServer] = useState<PublicServerListItem | null>(null);

  // Filters State
  const [selectedGame, setSelectedGame] = useState<"All" | "Minecraft" | "Hytale">("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"Rank" | "Players" | "Votes">("Rank");
  const [smartMatchOff, setSmartMatchOff] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);
  const refreshRequestIdRef = useRef(0);
  const hasHydratedRef = useRef(false);
  const countryOptions = useMemo(() => getCountryOptions(lang, countries), [lang, countries]);

  const getCountryName = (code: string | null) => {
    if (!code) return getLocalizedCountryName("WW", lang, countries);
    return getLocalizedCountryName(code.toUpperCase(), lang, countries);
  };

  // Internal filter values stay stable tokens; only their labels localize.
  const gameFilterLabels: Record<"All" | "Minecraft" | "Hytale", string> = {
    All: copy.filters.allGames,
    Minecraft: "Minecraft",
    Hytale: "Hytale",
  };
  const sortLabels: Record<"Rank" | "Players" | "Votes", string> = {
    Rank: copy.filters.sortOptions.rank,
    Players: copy.filters.sortOptions.players,
    Votes: copy.filters.sortOptions.votes,
  };

  // Load votes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fsproto.votes");
      if (saved) {
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

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query]);

  // Interpret search query
  const intent = useMemo(() => wlInterpretQuery(debouncedQuery), [debouncedQuery]);
  const hasIntents = intent.tags.length > 0 || !!intent.game || !!intent.country;
  const isSmartActive = hasIntents && !smartMatchOff;

  // Toggle dynamic tag chips
  const toggleTag = (t: string) => {
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  // Perform search and filter updates on transition
  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    const requestId = refreshRequestIdRef.current + 1;
    refreshRequestIdRef.current = requestId;
    setIsRefreshing(true);

    startTransition(async () => {
      try {
        // Map filters to API parameters
        let apiGame: PublicServerGame | undefined = undefined;
        if (selectedGame === "Minecraft") apiGame = "mc_java";
        else if (selectedGame === "Hytale") apiGame = "hytale";

        // If smart match is active, override with interpreted fields
        if (isSmartActive) {
          if (intent.game === "Minecraft") apiGame = "mc_java";
          else if (intent.game === "Hytale") apiGame = "hytale";
        }

        const apiSort: PublicServerSort = sortBy === "Players" ? "players" : "ping";

        const [serversData, statsData] = await Promise.all([
          loadMoreServers({
            q: debouncedQuery.trim() || undefined,
            game: apiGame,
            sort: apiSort,
            limit: 24,
          }),
          getServerStats(),
        ]);

        if (refreshRequestIdRef.current !== requestId) return;

        // Apply client-side filters for tags & country codes if selected/parsed
        let filteredServers = serversData.servers;

        const activeCountryCode =
          isSmartActive && intent.country ? intent.country : selectedCountry;
        if (activeCountryCode !== "ALL") {
          filteredServers = filteredServers.filter(
            (s) => s.country_code?.toUpperCase() === activeCountryCode.toUpperCase()
          );
        }

        const activeTags = isSmartActive && intent.tags.length > 0 ? intent.tags : selectedTags;
        if (activeTags.length > 0) {
          filteredServers = filteredServers.filter((s) => {
            // Note: Since tags aren't returned explicitly in PublicServerListItem, we mock them based on description keywords or name
            const haystack = `${s.name} ${s.description || ""}`.toLowerCase();
            return activeTags.every((t) => haystack.includes(t.toLowerCase()));
          });
        }

        // Apply client-side sorting if Votes selected (not handled by backend API yet)
        if (sortBy === "Votes") {
          filteredServers.sort((a, b) => {
            const votesA = 1200 + a.name.charCodeAt(0) * 15;
            const votesB = 1200 + b.name.charCodeAt(0) * 15;
            return votesB - votesA;
          });
        } else if (sortBy === "Rank") {
          filteredServers.sort((a, b) => {
            return getRankScore(getServerSignals(b)) - getRankScore(getServerSignals(a));
          });
        }

        setServers(filteredServers);
        setNextCursor(serversData.pagination.next_cursor);
        setGlobalStats(statsData);
      } catch (err) {
        if (refreshRequestIdRef.current !== requestId) return;
        console.error("Failed to refresh discover servers", err);
      } finally {
        if (refreshRequestIdRef.current === requestId) {
          setIsRefreshing(false);
        }
      }
    });
  }, [
    debouncedQuery,
    selectedGame,
    selectedCountry,
    selectedTags,
    sortBy,
    isSmartActive,
    intent.game,
    intent.tags,
    intent.country,
  ]);

  // Load more trigger
  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore || isRefreshing) return;
    setIsLoadingMore(true);
    try {
      let apiGame: PublicServerGame | undefined = undefined;
      if (selectedGame === "Minecraft") apiGame = "mc_java";
      else if (selectedGame === "Hytale") apiGame = "hytale";
      const apiSort: PublicServerSort = sortBy === "Players" ? "players" : "ping";

      const data = await loadMoreServers({
        q: debouncedQuery.trim() || undefined,
        game: apiGame,
        sort: apiSort,
        cursor: nextCursor,
        limit: 24,
      });

      let nextServers = data.servers;
      const activeCountryCode = isSmartActive && intent.country ? intent.country : selectedCountry;
      if (activeCountryCode !== "ALL") {
        nextServers = nextServers.filter(
          (s) => s.country_code?.toUpperCase() === activeCountryCode.toUpperCase()
        );
      }

      setServers((prev) => [...prev, ...nextServers]);
      setNextCursor(data.pagination.next_cursor);
    } catch (err) {
      console.error("Failed to load more servers", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    nextCursor,
    isLoadingMore,
    isRefreshing,
    selectedGame,
    sortBy,
    debouncedQuery,
    isSmartActive,
    intent.country,
    selectedCountry,
  ]);

  // Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoadingMore && !isRefreshing) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "150px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [nextCursor, isLoadingMore, isRefreshing, loadMore]);

  const handleOpenServer = (s: PublicServerListItem) => {
    setPeekServer(s);
  };

  const handleOpenFull = (s: PublicServerListItem) => {
    router.push(`/${lang}/server/${s.slug}`);
  };

  const filterHeadingClass =
    "font-body text-[11px] font-bold tracking-[0.12em] uppercase text-muted mb-2.5 text-left";

  const resultsCountLabel = (
    servers.length === 1 ? copy.results.countOne : copy.results.countOther
  ).replace("{count}", String(servers.length));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Section */}
      <div className="max-w-2xl text-left mb-8">
        <h1 className="font-display font-semibold text-2xl text-foreground mb-3">{copy.title}</h1>
        <div className="flex gap-2.5 w-full">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder.replace(
              "{count}",
              String(globalStats.total_active_servers)
            )}
            className="flex-grow font-body text-sm px-4 py-3 bg-bg-panel/90 text-foreground border border-border rounded-xl outline-none focus:border-primary min-h-[46px]"
          />
        </div>

        {/* Interpret facets chips block */}
        {hasIntents && (
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono text-muted">
            <span>{smartMatchOff ? copy.smartMatch.literalActive : copy.smartMatch.readingAs}</span>
            {!smartMatchOff && (
              <>
                {intent.game && (
                  <span className="font-body text-xs font-semibold text-on-primary bg-primary border border-primary-hover rounded-full px-3 py-1">
                    {intent.game}
                  </span>
                )}
                {intent.tags.map((t) => (
                  <span
                    key={t}
                    className="font-body text-xs font-semibold text-on-primary bg-primary border border-primary-hover rounded-full px-3 py-1"
                  >
                    {t}
                  </span>
                ))}
                {intent.country && (
                  <span className="font-body text-xs font-semibold text-on-primary bg-primary border border-primary-hover rounded-full px-3 py-1">
                    {getCountryName(intent.country)}
                  </span>
                )}
                {intent.rest.length > 0 && (
                  <span className="font-mono text-muted">
                    {copy.smartMatch.extraTermsLabel.replace("{query}", intent.rest.join(" "))}
                  </span>
                )}
              </>
            )}
            <button
              onClick={() => setSmartMatchOff(!smartMatchOff)}
              className="text-primary hover:underline cursor-pointer font-bold ml-1 font-mono"
            >
              {smartMatchOff ? copy.smartMatch.enableLabel : copy.smartMatch.disableLabel}
            </button>
            <span className="ml-auto hidden sm:inline text-muted/60">
              {copy.smartMatch.methodNote}
            </span>
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-[100px] z-10 bg-background lg:bg-transparent py-4 lg:py-0 border-b lg:border-b-0 border-border">
          {/* Game Selection */}
          <div>
            <h3 className={filterHeadingClass}>{copy.filters.gameTitle}</h3>
            <div className="flex flex-col gap-1.5">
              {(["All", "Minecraft", "Hytale"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGame(g)}
                  className={`font-body text-xs font-semibold px-4 py-2 rounded-lg border text-left cursor-pointer transition-colors ${
                    selectedGame === g
                      ? "bg-primary border-primary-hover text-on-primary"
                      : "bg-transparent border-border text-muted hover:text-foreground"
                  }`}
                  disabled={isSmartActive && !!intent.game}
                >
                  {gameFilterLabels[g]}
                </button>
              ))}
            </div>
          </div>

          {/* Country Selection */}
          <div>
            <h3 className={filterHeadingClass}>{copy.filters.countryTitle}</h3>
            <div className="relative">
              <select
                value={isSmartActive && intent.country ? intent.country : selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="font-body text-xs w-full bg-bg-panel text-foreground border border-border rounded-lg px-3 py-2.5 outline-none cursor-pointer appearance-none select-none"
                disabled={isSmartActive && !!intent.country}
              >
                <option value="ALL">{copy.filters.allCountries}</option>
                {countryOptions.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted font-mono text-[9px]">
                ▼
              </div>
            </div>
          </div>

          {/* Tags Selection */}
          <div>
            <h3 className={filterHeadingClass}>{copy.filters.tagsTitle}</h3>
            <div className="flex flex-wrap gap-1.5">
              {WL_ALL_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`font-body text-[11px] font-semibold px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                    selectedTags.includes(t) || (isSmartActive && intent.tags.includes(t))
                      ? "bg-primary border-primary-hover text-on-primary"
                      : "bg-transparent border-border text-muted hover:text-foreground hover:bg-secondary/40"
                  }`}
                  disabled={isSmartActive && intent.tags.includes(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting Selection */}
          <div>
            <h3 className={filterHeadingClass}>{copy.filters.sortTitle}</h3>
            <div className="flex flex-col gap-1.5">
              {(["Rank", "Players", "Votes"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setSortBy(o)}
                  className={`font-body text-xs font-semibold px-4 py-2 rounded-lg border text-left cursor-pointer transition-colors ${
                    sortBy === o
                      ? "bg-primary border-primary-hover text-on-primary"
                      : "bg-transparent border-border text-muted hover:text-foreground"
                  }`}
                >
                  {sortLabels[o]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div>
          <div className="flex justify-between items-baseline mb-3.5 border-b border-border pb-2 text-muted font-body text-xs">
            <span>
              {resultsCountLabel}
              {query.trim() && (
                <span className="text-muted/65 font-medium">
                  {" "}
                  {copy.results.matchingQuery.replace("{query}", query.trim())}
                </span>
              )}
            </span>
            <span className="font-mono text-[10.5px]">{copy.results.neverSoldNote}</span>
          </div>

          {servers.length > 0 ? (
            <div className="flex flex-col border-t border-border">
              {servers.map((s, idx) => (
                <DiscoverServerRow
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
            <div className="border border-dashed border-border rounded-xl p-16 text-center">
              <div className="font-display font-medium text-sm text-foreground mb-2">
                {copy.results.emptyTitle}
              </div>
              <div className="font-body text-xs text-muted">{copy.results.emptyDescription}</div>
            </div>
          )}

          {/* Observer Infinite Loading Spinner */}
          <div ref={observerTarget} className="mt-8 flex justify-center pb-12">
            {nextCursor && !isLoadingMore && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-6 w-6 animate-spin rounded-full border border-primary border-t-transparent" />
                <span className="font-ui text-xs text-muted">{copy.results.loadingMore}</span>
              </div>
            )}
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
