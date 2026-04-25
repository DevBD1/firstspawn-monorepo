"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useCallback, useDeferredValue, useEffect, useRef } from "react";
import { PixelButton } from "@firstspawn/ui";
import ServerCard, { type ServerCardSortHighlight } from "@/features/server/components/ServerCard";
import type { DiscoverDictionary } from "@/lib/dictionaries/schema";
import type { ServerCardCopy } from "@/features/server/lib/server-copy";
import type {
  PublicServerGame,
  PublicServerListItem,
  PublicServerSort,
  PublicServerTier,
} from "@/lib/servers-api";
import { loadMoreServers } from "@/app/actions/servers";

const PAGE_SIZE = 100;
const LIST_EXIT_DELAY_MS = 160;

// Tier configurations - like item rarities
const tierConfig = {
  common: {
    color: "#9CA3AF",
    gradient: "from-gray-500/20 to-gray-600/10",
    border: "border-gray-500/50",
    glow: "shadow-gray-500/20",
    icon: "○",
  },
  rare: {
    color: "#22D3EE",
    gradient: "from-cyan-500/20 to-blue-600/10",
    border: "border-cyan-500/50",
    glow: "shadow-cyan-500/20",
    icon: "◆",
  },
  epic: {
    color: "#A855F7",
    gradient: "from-purple-500/20 to-pink-600/10",
    border: "border-purple-500/50",
    glow: "shadow-purple-500/20",
    icon: "★",
  },
  legendary: {
    color: "#F59E0B",
    gradient: "from-amber-500/30 to-orange-600/20",
    border: "border-amber-500/50",
    glow: "shadow-amber-500/30",
    icon: "☀",
  },
};

interface DiscoverClientProps {
  copy: DiscoverDictionary["page"];
  lang: string;
  initialServers: PublicServerListItem[];
  initialPagination: { next_cursor: string | null; limit: number };
  loadMoreLabel: string;
  serverCardCopy: ServerCardCopy;
}

type DiscoverGameFilter = "all" | "minecraft" | "hytale";

const formatSortNumber = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString() : "0";

const getServerSortHighlight = (
  copy: ServerCardCopy,
  rankingCopy: DiscoverDictionary["page"]["ranking"],
  sortBy: PublicServerSort,
  server: PublicServerListItem
): ServerCardSortHighlight => {
  const metrics = server.latest_metrics;

  if (sortBy === "ping") {
    return {
      helper: rankingCopy.lowerIsBetter,
      label: rankingCopy.rankedBy,
      tone: "ping",
      value: `${copy.ping} ${
        typeof metrics?.ping_ms === "number" ? `${metrics.ping_ms}MS` : "N/A"
      }`,
    };
  }

  return {
    helper: `${metrics?.max_players ? formatSortNumber(metrics.max_players) : "?"} ${copy.maxPlayers}`,
    label: rankingCopy.rankedBy,
    tone: "players",
    value: `${formatSortNumber(metrics?.online_players)} ${copy.online}`,
  };
};

export default function DiscoverClient({
  copy,
  lang,
  initialServers,
  initialPagination,
  loadMoreLabel,
  serverCardCopy,
}: DiscoverClientProps) {
  const [servers, setServers] = useState<PublicServerListItem[]>(initialServers);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPagination.next_cursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshRequestIdRef = useRef(0);
  const hasHydratedRef = useRef(false);

  const [selectedGame, setSelectedGame] = useState<DiscoverGameFilter>("all");
  const [selectedTier, setSelectedTier] = useState<PublicServerTier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const [sortBy, setSortBy] = useState<PublicServerSort>("players");
  const [appliedSortBy, setAppliedSortBy] = useState<PublicServerSort>("players");
  const gameFilter: PublicServerGame | undefined =
    selectedGame === "minecraft" ? "mc_java" : selectedGame === "hytale" ? "hytale" : undefined;
  const tierFilter = selectedTier.length > 0 ? selectedTier : undefined;

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore || isRefreshing) return;
    setIsLoadingMore(true);
    try {
      const data = await loadMoreServers({
        q: deferredSearchQuery || undefined,
        game: gameFilter,
        tier: tierFilter,
        sort: appliedSortBy,
        cursor: nextCursor,
        limit: PAGE_SIZE,
      });
      setServers((prev) => [...prev, ...data.servers]);
      setNextCursor(data.pagination.next_cursor);
    } catch (err) {
      console.error("Failed to load more servers", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    appliedSortBy,
    deferredSearchQuery,
    gameFilter,
    isLoadingMore,
    isRefreshing,
    nextCursor,
    tierFilter,
  ]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    const requestId = refreshRequestIdRef.current + 1;
    refreshRequestIdRef.current = requestId;
    setIsRefreshing(true);
    setServers([]);
    setNextCursor(null);

    void (async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, LIST_EXIT_DELAY_MS));

        if (refreshRequestIdRef.current !== requestId) {
          return;
        }

        const data = await loadMoreServers({
          q: deferredSearchQuery || undefined,
          game: gameFilter,
          tier: tierFilter,
          sort: sortBy,
          limit: PAGE_SIZE,
        });

        if (refreshRequestIdRef.current !== requestId) {
          return;
        }

        setServers(data.servers);
        setNextCursor(data.pagination.next_cursor);
        setAppliedSortBy(sortBy);
      } catch (err) {
        if (refreshRequestIdRef.current !== requestId) {
          return;
        }

        console.error("Failed to refresh discover servers", err);
      } finally {
        if (refreshRequestIdRef.current === requestId) {
          setIsRefreshing(false);
        }
      }
    })();
  }, [deferredSearchQuery, gameFilter, sortBy, tierFilter]);

  const toggleTier = (tier: PublicServerTier) => {
    setSelectedTier((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const onlineServers = servers.filter((s) => s.freshness_status === "online").length;
  const totalPlayers = servers.reduce((acc, s) => acc + (s.latest_metrics?.online_players ?? 0), 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-cyan-500/5 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -right-32 bottom-40 h-96 w-96 rounded-full bg-purple-500/5 blur-[100px]"
        />
      </div>

      {/* Hero Header */}
      <section className="relative z-10 border-b border-foreground/10 bg-gradient-to-b from-bg-panel/50 to-transparent px-4 pb-8 pt-6">
        <div className="mx-auto max-w-7xl">
          {/* Top Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-foreground/10 bg-background/50 px-4 py-3"
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="font-ui text-sm tracking-wider text-foreground/70">
                  {onlineServers} {copy.stats.onlineServers}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm text-fs-diamond">
                  {totalPlayers.toLocaleString()}
                </span>
                <span className="font-ui text-sm text-foreground/50">
                  {copy.stats.activePlayers}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-ui text-xs text-foreground/40">{copy.stats.version}</span>
            </div>
          </motion.div>

          {/* Main Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded border border-fs-diamond/30 bg-fs-diamond/5 px-3 py-1">
                <span className="font-display text-[10px] tracking-wider text-fs-diamond">
                  {copy.badgeLabel}
                </span>
              </div>
              <h1 className="font-display text-3xl tracking-wider text-foreground md:text-4xl">
                {copy.title}
              </h1>
              <p className="mt-2 max-w-xl font-body text-foreground/60">{copy.subtitle}</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="font-display text-foreground/40">⌕</span>
              </div>
              <input
                id="discover-server-search"
                name="q"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full rounded-none border-2 border-foreground/20 bg-background/80 py-3 pl-12 pr-4 font-body text-sm text-foreground placeholder:text-foreground/30 focus:border-fs-diamond focus:outline-none"
              />
            </div>
          </motion.div>

          {/* Game Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex gap-2"
          >
            {[
              { id: "all", label: copy.gameFilters.all, icon: "◈" },
              { id: "minecraft", label: copy.gameFilters.minecraft, icon: "■" },
              { id: "hytale", label: copy.gameFilters.hytale, icon: "●" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedGame(tab.id as typeof selectedGame)}
                className={`group relative overflow-hidden border-2 px-4 py-2 transition-all ${
                  selectedGame === tab.id
                    ? "border-fs-diamond bg-fs-diamond/10"
                    : "border-foreground/20 bg-background/50 hover:border-foreground/40"
                }`}
              >
                <span
                  className={`flex items-center gap-2 font-display text-xs tracking-wider ${
                    selectedGame === tab.id ? "text-fs-diamond" : "text-foreground/60"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 flex gap-6 px-4 py-8">
        <div className="mx-auto flex w-full max-w-7xl gap-6">
          {/* Sidebar Filters - Quest Style */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden w-64 shrink-0 lg:block"
          >
            <div className="sticky top-24 space-y-6">
              {/* Rarity Filter */}
              <div className="border-2 border-foreground/10 bg-bg-panel/50 p-4">
                <div className="mb-4 flex items-center gap-2 border-b border-foreground/10 pb-2">
                  <span className="font-display text-xs text-fs-diamond">◆</span>
                  <span className="font-display text-xs tracking-wider text-foreground">
                    {copy.rarityFilterTitle}
                  </span>
                </div>
                <div className="space-y-2">
                  {(
                    Object.entries(tierConfig) as Array<
                      [PublicServerTier, (typeof tierConfig)[PublicServerTier]]
                    >
                  ).map(([tier, config]) => (
                    <button
                      key={tier}
                      onClick={() => toggleTier(tier)}
                      className={`flex w-full items-center gap-3 rounded border px-3 py-2 transition-all ${
                        selectedTier.includes(tier)
                          ? `bg-opacity-20 ${config.border}`
                          : "border-transparent hover:bg-foreground/5"
                      }`}
                      style={{
                        backgroundColor: selectedTier.includes(tier)
                          ? `${config.color}20`
                          : undefined,
                      }}
                    >
                      <span style={{ color: config.color }}>{config.icon}</span>
                      <span
                        className="flex-1 text-left font-ui text-sm"
                        style={{ color: selectedTier.includes(tier) ? config.color : undefined }}
                      >
                        {copy.tiers[tier]}
                      </span>
                      {selectedTier.includes(tier) && (
                        <span className="font-display text-xs" style={{ color: config.color }}>
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="border-2 border-foreground/10 bg-bg-panel/50 p-4">
                <div className="mb-4 flex items-center gap-2 border-b border-foreground/10 pb-2">
                  <span className="font-display text-xs text-fs-diamond">⇅</span>
                  <span className="font-display text-xs tracking-wider text-foreground">
                    {copy.sortTitle}
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { id: "players", label: copy.sortOptions.players },
                    { id: "ping", label: copy.sortOptions.ping },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id as typeof sortBy)}
                      className={`flex w-full items-center justify-between rounded px-3 py-2 font-ui text-sm transition-all ${
                        sortBy === option.id
                          ? "bg-fs-diamond/10 text-fs-diamond"
                          : "text-foreground/60 hover:bg-foreground/5"
                      }`}
                    >
                      {option.label}
                      {sortBy === option.id && <span className="font-display text-xs">●</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Panel */}
              <div className="border-2 border-fs-diamond/20 bg-fs-diamond/5 p-4">
                <div className="mb-3 font-display text-xs tracking-wider text-fs-diamond">
                  {copy.personalStatsTitle}
                </div>
                <div className="space-y-2 font-ui text-sm">
                  <div className="flex justify-between text-foreground/60">
                    <span>{copy.personalStats.serversVisited}</span>
                    <span className="text-foreground">0</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>{copy.personalStats.favorites}</span>
                    <span className="text-foreground">0</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Server Grid */}
          <div className="min-w-0 flex-1">
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex items-center justify-between"
            >
              <span className="font-ui text-sm text-foreground/50">
                {copy.resultsSummary.split("{count}")[0]}
                <span className="font-display text-fs-diamond">{servers.length}</span>
                {copy.resultsSummary.split("{count}")[1]}
              </span>
              {isRefreshing && (
                <span className="font-ui text-xs text-foreground/40">{copy.syncingLabel}</span>
              )}
            </motion.div>

            {/* Server Cards Grid */}
            <div aria-busy={isRefreshing} className="grid gap-4 overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                {servers.map((server, index) => (
                  <motion.div
                    key={server.slug}
                    layout
                    initial={{ opacity: 0, x: 72 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 96 }}
                    transition={{
                      delay: servers.length > 0 ? (index % 16) * 0.018 : 0,
                      duration: 0.27,
                      ease: "easeOut",
                    }}
                    className="min-w-0"
                  >
                    <ServerCard
                      copy={serverCardCopy}
                      variant="discover"
                      lang={lang}
                      slug={server.slug}
                      name={server.name}
                      description={server.description}
                      game={server.game}
                      gameVersion={server.latest_metrics?.minecraft_version}
                      onlinePlayers={server.latest_metrics?.online_players}
                      maxPlayers={server.latest_metrics?.max_players}
                      isOnline={server.freshness_status === "online"}
                      pingMs={server.latest_metrics?.ping_ms}
                      region={server.region}
                      sortHighlight={getServerSortHighlight(
                        serverCardCopy,
                        copy.ranking,
                        appliedSortBy,
                        server
                      )}
                      tags={[
                        server.catalog_status === "active"
                          ? serverCardCopy.active
                          : serverCardCopy.archived,
                        server.game === "mc_java"
                          ? serverCardCopy.gameLabels.mcJava
                          : server.game.toUpperCase(),
                      ].filter(Boolean)}
                      badges={
                        server.freshness_status === "online"
                          ? [{ label: serverCardCopy.badges.verified, tone: "verified" }]
                          : []
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Load More Button */}
            {nextCursor && (
              <div className="mt-8 flex justify-center">
                <PixelButton
                  onClick={loadMore}
                  disabled={isLoadingMore || isRefreshing}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  {isLoadingMore ? copy.loadingMoreLabel : loadMoreLabel}
                </PixelButton>
              </div>
            )}

            {/* Empty State */}
            {servers.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-foreground/20 py-16"
              >
                <span className="mb-4 font-display text-4xl text-foreground/20">◈</span>
                <p className="font-display text-sm text-foreground/40">{copy.emptyStateTitle}</p>
                <p className="mt-2 font-body text-sm text-foreground/30">
                  {copy.emptyStateDescription}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-8" />
    </div>
  );
}
