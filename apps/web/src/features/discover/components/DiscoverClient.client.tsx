"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useCallback, useDeferredValue, useEffect, useRef, useTransition } from "react";
import ServerCard, { type ServerCardSortHighlight } from "@/features/server/components/ServerCard";
import type { DiscoverDictionary } from "@/lib/dictionaries/schema";
import type { ServerCardCopy } from "@/features/server/lib/server-copy";
import type {
  PublicServerGame,
  PublicServerListItem,
  PublicServerSort,
  PublicServerStats,
  PublicServerTier,
} from "@/lib/servers-api";
import { loadMoreServers, getServerStats } from "@/app/actions/servers";

const PAGE_SIZE = 24;

/**
 * Tier configurations defining the visual style, colors, and icons
 * for different server rarity levels (Common, Rare, Epic, Legendary).
 */
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
  initialGlobalStats: PublicServerStats;
  loadMoreLabel: string;
  serverCardCopy: ServerCardCopy;
}

type DiscoverGameFilter = "all" | "minecraft" | "hytale";

/**
 * Formats large numbers into localized strings (e.g., 1000 -> 1,000).
 */
const formatSortNumber = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString() : "0";

/**
 * Generates the highlight data for the ServerCard based on the current sort criteria.
 * This determines what metric (Ping, Players, etc.) is prominently displayed.
 */
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

/**
 * DiscoverClient is the primary interactive container for the discovery page.
 * It handles server filtering, searching, sorting, and infinite pagination.
 */
export default function DiscoverClient({
  copy,
  lang,
  initialServers,
  initialPagination,
  initialGlobalStats,
  loadMoreLabel,
  serverCardCopy,
}: DiscoverClientProps) {
  const [servers, setServers] = useState<PublicServerListItem[]>(initialServers);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPagination.next_cursor);
  const [globalStats, setGlobalStats] = useState<PublicServerStats>(initialGlobalStats);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const refreshRequestIdRef = useRef(0);
  const observerTarget = useRef<HTMLDivElement>(null);
  const hasHydratedRef = useRef(false);

  const [selectedGame, setSelectedGame] = useState<DiscoverGameFilter>("all");
  const [selectedTier, setSelectedTier] = useState<PublicServerTier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const [sortBy, setSortBy] = useState<PublicServerSort>("players");
  const [appliedSortBy, setAppliedSortBy] = useState<PublicServerSort>("players");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  /**
   * isMobile state tracks the viewport width to handle responsive layout changes.
   * Initialized to true to prevent hydration mismatch (server assumes mobile/default).
   */
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Update isMobile state on mount and window resize
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const gameFilter: PublicServerGame | undefined =
    selectedGame === "minecraft" ? "mc_java" : selectedGame === "hytale" ? "hytale" : undefined;
  const tierFilter = selectedTier.length > 0 ? selectedTier : undefined;

  /**
   * Fetches the next page of servers based on current filters and cursor.
   */
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

  /**
   * Intersection Observer to trigger loadMore when the target element enters the viewport.
   * This provides a "modern" infinite scroll experience.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoadingMore && !isRefreshing) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
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

  /**
   * Effect that triggers a server refresh whenever search, game, sort, or tier filters change.
   * Utilizes useTransition and a request ID ref to handle concurrency and race conditions.
   */
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
        const [serversData, statsData] = await Promise.all([
          loadMoreServers({
            q: deferredSearchQuery || undefined,
            game: gameFilter,
            tier: tierFilter,
            sort: sortBy,
            limit: PAGE_SIZE,
          }),
          getServerStats(),
        ]);

        if (refreshRequestIdRef.current !== requestId) {
          return;
        }

        setServers(serversData.servers);
        setNextCursor(serversData.pagination.next_cursor);
        setGlobalStats(statsData);
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
    });
  }, [deferredSearchQuery, gameFilter, sortBy, tierFilter]);

  const toggleTier = (tier: PublicServerTier) => {
    setSelectedTier((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen bg-background">
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

      {/* Unified Sticky Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? "100%" : isSidebarCollapsed ? 64 : 320,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative z-20 w-full lg:shrink-0 overflow-hidden lg:overflow-visible"
      >
        <div className="sticky top-[80px] flex h-auto flex-col bg-bg-panel/50 lg:h-[calc(100vh-80px)] lg:border-r-2 lg:border-foreground/10">
          {/* Toggle Button */}
          <div className="hidden lg:flex justify-end p-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex h-8 w-8 items-center justify-center border-2 border-foreground/20 bg-background/50 hover:border-fs-diamond transition-colors"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <span className="font-display text-xs text-foreground/60 group-hover:text-fs-diamond">
                {isSidebarCollapsed ? "]" : "["}
              </span>
            </button>
          </div>

          <motion.div
            initial={false}
            animate={{
              opacity: !isMobile && isSidebarCollapsed ? 0 : 1,
              x: !isMobile && isSidebarCollapsed ? -20 : 0,
              display: !isMobile && isSidebarCollapsed ? "none" : "flex",
            }}
            transition={{ duration: 0.15 }}
            className="flex h-auto flex-col gap-6 p-6 pt-0 lg:h-full lg:overflow-y-auto lg:pt-0"
          >
            {/* Top Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 rounded border border-foreground/10 bg-background/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                  <span className="font-ui text-xs tracking-wider text-foreground/70">
                    {globalStats.total_active_servers} {copy.stats.onlineServers}
                  </span>
                </div>
                <span className="font-ui text-[10px] text-foreground/40">{copy.stats.version}</span>
              </div>
              <div className="flex items-center gap-2 border-t border-foreground/5 pt-2">
                <span className="font-display text-xs text-fs-diamond">
                  {globalStats.total_online_players.toLocaleString()}
                </span>
                <span className="font-ui text-[10px] text-foreground/50">
                  {copy.stats.activePlayers}
                </span>
              </div>
            </motion.div>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="font-display text-xs text-foreground/40">⌕</span>
              </div>
              <input
                id="discover-server-search"
                name="q"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="w-full rounded-none border-2 border-foreground/10 bg-background/80 py-2 pl-10 pr-4 font-body text-xs text-foreground placeholder:text-foreground/30 focus:border-fs-diamond focus:outline-none"
              />
            </div>

            {/* Game Filter Tabs */}
            <div className="flex flex-col gap-2">
              {[
                { id: "all", label: copy.gameFilters.all, icon: "◈" },
                { id: "minecraft", label: copy.gameFilters.minecraft, icon: "■" },
                { id: "hytale", label: copy.gameFilters.hytale, icon: "●" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedGame(tab.id as typeof selectedGame)}
                  className={`flex w-full items-center gap-3 border-2 px-4 py-2 transition-all ${
                    selectedGame === tab.id
                      ? "border-fs-diamond bg-fs-diamond/10 text-fs-diamond"
                      : "border-foreground/10 bg-background/50 text-foreground/60 hover:border-foreground/20"
                  }`}
                >
                  <span className="font-display text-[10px]">{tab.icon}</span>
                  <span className="font-display text-[10px] tracking-wider uppercase">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Rarity Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-foreground/10 pb-2">
                <span className="font-display text-[10px] text-fs-diamond">◆</span>
                <span className="font-display text-[10px] tracking-wider text-foreground uppercase">
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
                      className="flex-1 text-left font-ui text-xs"
                      style={{ color: selectedTier.includes(tier) ? config.color : undefined }}
                    >
                      {copy.tiers[tier]}
                    </span>
                    {selectedTier.includes(tier) && (
                      <span className="font-display text-[10px]" style={{ color: config.color }}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-foreground/10 pb-2">
                <span className="font-display text-[10px] text-fs-diamond">⇅</span>
                <span className="font-display text-[10px] tracking-wider text-foreground uppercase">
                  {copy.sortTitle}
                </span>
              </div>
              <div className="space-y-1">
                {[
                  { id: "players", label: copy.sortOptions.players },
                  { id: "ping", label: copy.sortOptions.ping },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id as typeof sortBy)}
                    className={`flex w-full items-center justify-between rounded px-3 py-1.5 font-ui text-xs transition-all ${
                      sortBy === option.id
                        ? "bg-fs-diamond/10 text-fs-diamond"
                        : "text-foreground/60 hover:bg-foreground/5"
                    }`}
                  >
                    {option.label}
                    {sortBy === option.id && <span className="font-display text-[8px]">●</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Panel */}
            <div className="mt-auto border-2 border-fs-diamond/20 bg-fs-diamond/5 p-4">
              <div className="mb-3 font-display text-[10px] tracking-wider text-fs-diamond uppercase">
                {copy.personalStatsTitle}
              </div>
              <div className="space-y-2 font-ui text-xs">
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
          </motion.div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <section className="relative z-10 flex-1 min-w-0 px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header Title/Subtitle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <div className="mb-2 inline-flex items-center gap-2 rounded border border-fs-diamond/30 bg-fs-diamond/5 px-3 py-1">
              <span className="font-display text-[10px] tracking-wider text-fs-diamond uppercase">
                {copy.badgeLabel}
              </span>
            </div>
            <h1 className="font-display text-3xl tracking-wider text-foreground md:text-4xl uppercase">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-xl font-body text-sm text-foreground/60">{copy.subtitle}</p>
          </motion.div>

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
            {(isRefreshing || isPending) && (
              <span className="font-ui text-xs text-foreground/40">{copy.syncingLabel}</span>
            )}
          </motion.div>

          {/* Server Grid */}
          <div
            aria-busy={isRefreshing || isPending}
            className="grid gap-4 overflow-hidden relative"
          >
            {isPending && (
              <div className="absolute inset-0 z-10 bg-background/10 backdrop-blur-[1px] pointer-events-none transition-opacity" />
            )}
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

          {/* Infinite Scroll Observer Target & Loading State */}
          <div ref={observerTarget} className="mt-8 flex justify-center pb-12">
            {nextCursor ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-fs-diamond border-t-transparent" />
                <span className="font-ui text-xs text-foreground/40">{copy.loadingMoreLabel}</span>
              </div>
            ) : servers.length > 0 ? (
              <span className="font-ui text-xs text-foreground/20">
                — {copy.resultsSummary.split("{count}")[0]}
                {servers.length}
                {copy.resultsSummary.split("{count}")[1]} —
              </span>
            ) : null}
          </div>

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
      </section>

      {/* Footer spacer */}
      <div className="h-8" />
    </div>
  );
}
