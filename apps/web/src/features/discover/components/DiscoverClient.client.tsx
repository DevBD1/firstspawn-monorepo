"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useDeferredValue, useEffect, useRef, useTransition } from "react";
import PixelButton from "@/components/ui/PixelButton";
import Link from "next/link";
import type {
  PublicServerGame,
  PublicServerListItem,
  PublicServerSort,
  PublicServerTier,
} from "@/lib/servers-api";
import { loadMoreServers } from "@/app/actions/servers";

const PAGE_SIZE = 100;

// Tier configurations - like item rarities
const tierConfig = {
  common: {
    color: "#9CA3AF",
    gradient: "from-gray-500/20 to-gray-600/10",
    border: "border-gray-500/50",
    glow: "shadow-gray-500/20",
    label: "COMMON",
    icon: "○",
  },
  rare: {
    color: "#22D3EE",
    gradient: "from-cyan-500/20 to-blue-600/10",
    border: "border-cyan-500/50",
    glow: "shadow-cyan-500/20",
    label: "RARE",
    icon: "◆",
  },
  epic: {
    color: "#A855F7",
    gradient: "from-purple-500/20 to-pink-600/10",
    border: "border-purple-500/50",
    glow: "shadow-purple-500/20",
    label: "EPIC",
    icon: "★",
  },
  legendary: {
    color: "#F59E0B",
    gradient: "from-amber-500/30 to-orange-600/20",
    border: "border-amber-500/50",
    glow: "shadow-amber-500/30",
    label: "LEGENDARY",
    icon: "☀",
  },
};

// Status configurations
const statusConfig = {
  online: { color: "#4ADE80", label: "ONLINE", pulse: true },
  offline: { color: "#DC2626", label: "OFFLINE", pulse: false },
};

const getTier = (players: number): "common" | "rare" | "epic" | "legendary" => {
  if (players >= 10000) return "legendary";
  if (players >= 1000) return "epic";
  if (players >= 100) return "rare";
  return "common";
};

interface DiscoverClientProps {
  lang: string;
  initialServers: PublicServerListItem[];
  initialPagination: { next_cursor: string | null; limit: number };
}

type DiscoverGameFilter = "all" | "minecraft" | "hytale";

export default function DiscoverClient({
  lang,
  initialServers,
  initialPagination,
}: DiscoverClientProps) {
  const [servers, setServers] = useState<PublicServerListItem[]>(initialServers);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPagination.next_cursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, startRefreshing] = useTransition();
  const refreshRequestIdRef = useRef(0);
  const hasHydratedRef = useRef(false);

  const [selectedGame, setSelectedGame] = useState<DiscoverGameFilter>("all");
  const [selectedTier, setSelectedTier] = useState<PublicServerTier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const [sortBy, setSortBy] = useState<PublicServerSort>("players");
  const [hoveredServer, setHoveredServer] = useState<string | null>(null);
  const gameFilter: PublicServerGame | undefined =
    selectedGame === "minecraft" ? "mc_java" : selectedGame === "hytale" ? "hytale" : undefined;
  const tierFilter = selectedTier.length > 0 ? selectedTier : undefined;

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const data = await loadMoreServers({
        q: deferredSearchQuery || undefined,
        game: gameFilter,
        tier: tierFilter,
        sort: sortBy,
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
  }, [deferredSearchQuery, gameFilter, isLoadingMore, nextCursor, sortBy, tierFilter]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    const requestId = refreshRequestIdRef.current + 1;
    refreshRequestIdRef.current = requestId;

    startRefreshing(() => {
      void (async () => {
        try {
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
        } catch (err) {
          if (refreshRequestIdRef.current !== requestId) {
            return;
          }

          console.error("Failed to refresh discover servers", err);
        }
      })();
    });
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
                  {onlineServers} SERVERS ONLINE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm text-fs-diamond">
                  {totalPlayers.toLocaleString()}
                </span>
                <span className="font-ui text-sm text-foreground/50">PLAYERS ACTIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-ui text-xs text-foreground/40">SERVER DISCOVERY v2.0</span>
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
                  MATCHMAKING CORE
                </span>
              </div>
              <h1 className="font-display text-3xl tracking-wider text-foreground md:text-4xl">
                DISCOVER WORLDS
              </h1>
              <p className="mt-2 max-w-xl font-body text-foreground/60">
                Find your next adventure. Browse verified servers ranked by real player data.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="font-display text-foreground/40">⌕</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search servers, descriptions..."
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
              { id: "all", label: "ALL WORLDS", icon: "◈" },
              { id: "minecraft", label: "MINECRAFT", icon: "■" },
              { id: "hytale", label: "HYTALE", icon: "●" },
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
                    RARITY FILTER
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
                        {config.label}
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
                    SORT BY
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { id: "players", label: "PLAYER COUNT" },
                    { id: "ping", label: "PING" },
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
                  YOUR STATS
                </div>
                <div className="space-y-2 font-ui text-sm">
                  <div className="flex justify-between text-foreground/60">
                    <span>Servers Visited</span>
                    <span className="text-foreground">0</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Favorites</span>
                    <span className="text-foreground">0</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Server Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex items-center justify-between"
            >
              <span className="font-ui text-sm text-foreground/50">
                FOUND <span className="font-display text-fs-diamond">{servers.length}</span> WORLDS
              </span>
              {isRefreshing && (
                <span className="font-ui text-xs text-foreground/40">SYNCING...</span>
              )}
            </motion.div>

            {/* Server Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {servers.map((server, index) => {
                  const players = server.latest_metrics?.online_players ?? 0;
                  const maxPlayers = server.latest_metrics?.max_players ?? 0;
                  const tier = tierConfig[getTier(players)];
                  const status =
                    server.freshness_status === "online"
                      ? statusConfig.online
                      : statusConfig.offline;
                  const isHovered = hoveredServer === server.slug;

                  return (
                    <motion.div
                      key={server.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: (index % 20) * 0.05 }}
                      onMouseEnter={() => setHoveredServer(server.slug)}
                      onMouseLeave={() => setHoveredServer(null)}
                      className="group relative"
                    >
                      {/* Card Container with Tier Glow */}
                      <div
                        className={`relative overflow-hidden border-2 bg-bg-panel transition-all duration-300 ${
                          tier.border
                        } ${tier.glow} ${isHovered ? "-translate-y-1 shadow-lg" : ""}`}
                        style={{
                          boxShadow: isHovered
                            ? `0 0 30px ${tier.color}30, 4px 4px 0 ${tier.color}40`
                            : undefined,
                        }}
                      >
                        {/* Tier Header Bar */}
                        <div
                          className="flex items-center justify-between border-b px-3 py-2"
                          style={{
                            background: `linear-gradient(90deg, ${tier.color}20, transparent)`,
                            borderColor: `${tier.color}40`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span style={{ color: tier.color }}>{tier.icon}</span>
                            <span
                              className="font-display text-[10px] tracking-wider"
                              style={{ color: tier.color }}
                            >
                              {tier.label}
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          {/* Server Name & Status */}
                          <div className="mb-3 flex items-start justify-between gap-2">
                            <h3 className="font-display text-sm leading-tight tracking-wider text-foreground">
                              {server.name}
                            </h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {status.pulse && (
                                <span
                                  className="h-2 w-2 animate-pulse rounded-full"
                                  style={{ backgroundColor: status.color }}
                                />
                              )}
                              <span
                                className="whitespace-nowrap font-ui text-[10px]"
                                style={{ color: status.color }}
                              >
                                {status.label}
                              </span>
                            </div>
                          </div>

                          {/* Game Badge */}
                          <div className="mb-3 flex items-center gap-2">
                            <span
                              className={`rounded px-2 py-0.5 font-ui text-[10px] ${
                                server.game === "mc_java"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-purple-500/20 text-purple-400"
                              }`}
                            >
                              {server.game === "mc_java" ? "MINECRAFT" : "HYTALE"}
                            </span>
                            <span className="font-ui text-[10px] text-foreground/30">
                              {server.latest_metrics?.minecraft_version ?? "—"}
                            </span>
                            {server.latest_metrics?.ping_ms != null && (
                              <span className="font-ui text-[10px] text-foreground/40">
                                {server.latest_metrics.ping_ms}ms
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="mb-4 line-clamp-2 font-body text-xs leading-relaxed text-foreground/60">
                            {server.description}
                          </p>

                          {/* Player Count Bar */}
                          {server.freshness_status === "online" && (
                            <div className="mb-4">
                              <div className="mb-1 flex justify-between font-ui text-[10px]">
                                <span className="text-foreground/50">PLAYERS</span>
                                <span className="text-foreground">
                                  {players.toLocaleString()} /{" "}
                                  {maxPlayers > 0 ? maxPlayers.toLocaleString() : "?"}
                                </span>
                              </div>
                              {maxPlayers > 0 && (
                                <div className="h-2 overflow-hidden bg-foreground/10">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${Math.min(100, (players / maxPlayers) * 100)}%`,
                                    }}
                                    transition={{ duration: 1, delay: 0.1 }}
                                    className="h-full"
                                    style={{ backgroundColor: tier.color }}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="mt-6">
                            <Link href={`/${lang}/server/${server.slug}`}>
                              <PixelButton variant="primary" size="sm" className="w-full">
                                VIEW WORLD
                              </PixelButton>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
                  {isLoadingMore ? "LOADING..." : "LOAD MORE"}
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
                <p className="font-display text-sm text-foreground/40">NO WORLDS FOUND</p>
                <p className="mt-2 font-body text-sm text-foreground/30">
                  Try adjusting your filters
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
