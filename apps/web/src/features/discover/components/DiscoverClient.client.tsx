"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import PixelButton from "@/components/ui/PixelButton";
import PixelCard from "@/components/ui/PixelCard";
import Link from "next/link";

// Server data types
interface Server {
  id: string;
  name: string;
  game: "minecraft" | "hytale";
  status: "online" | "offline" | "maintenance" | "upcoming";
  players: { current: number; max: number };
  version: string;
  gamemode: string;
  description: string;
  rating: number;
  reviews: number;
  tags: string[];
  tier: "common" | "rare" | "epic" | "legendary";
  uptime: number;
  verified: boolean;
  rewards?: boolean;
  peakRank?: number;
}

// Mock data - gamified
const mockServers: Server[] = [
  {
    id: "1",
    name: "Hypixel Network",
    game: "minecraft",
    status: "online",
    players: { current: 84732, max: 100000 },
    version: "1.20.4",
    gamemode: "Minigames",
    description: "The largest Minecraft server network. SkyBlock, Bed Wars, and 50+ games.",
    rating: 4.8,
    reviews: 12483,
    tags: ["Minigames", "SkyBlock", "PvP", "Ranked"],
    tier: "legendary",
    uptime: 99.9,
    verified: true,
    rewards: true,
    peakRank: 1,
  },
  {
    id: "2",
    name: "HytaleRealms",
    game: "hytale",
    status: "upcoming",
    players: { current: 0, max: 50000 },
    version: "Beta",
    gamemode: "MMORPG",
    description: "The premier Hytale MMORPG experience. Pre-register for exclusive loot!",
    rating: 0,
    reviews: 0,
    tags: ["MMORPG", "Quests", "Open World", "Beta"],
    tier: "epic",
    uptime: 0,
    verified: true,
    rewards: true,
  },
  {
    id: "3",
    name: "PixelForge SMP",
    game: "minecraft",
    status: "online",
    players: { current: 1420, max: 3000 },
    version: "1.20.1",
    gamemode: "Survival",
    description: "Hardcore survival with custom dungeons, bosses, and weekly events.",
    rating: 4.6,
    reviews: 892,
    tags: ["Survival", "Hardcore", "Dungeons", "Events"],
    tier: "rare",
    uptime: 98.5,
    verified: true,
    rewards: true,
    peakRank: 12,
  },
  {
    id: "4",
    name: "SkyBlock Legends",
    game: "minecraft",
    status: "online",
    players: { current: 3421, max: 5000 },
    version: "1.20.4",
    gamemode: "SkyBlock",
    description: "Classic SkyBlock with a twist. Custom islands, trading, and economy.",
    rating: 4.4,
    reviews: 567,
    tags: ["SkyBlock", "Economy", "Casual"],
    tier: "rare",
    uptime: 97.2,
    verified: true,
  },
  {
    id: "5",
    name: "NetherScape",
    game: "minecraft",
    status: "online",
    players: { current: 89, max: 500 },
    version: "1.19.2",
    gamemode: "PvP",
    description: "Small PvP-focused server with ranked seasons and tournaments.",
    rating: 4.2,
    reviews: 123,
    tags: ["PvP", "Ranked", "Tournaments"],
    tier: "common",
    uptime: 94.1,
    verified: false,
  },
  {
    id: "6",
    name: "Craftopia RPG",
    game: "minecraft",
    status: "maintenance",
    players: { current: 0, max: 2000 },
    version: "1.20.4",
    gamemode: "RPG",
    description: "Full MMORPG experience with classes, skills, and massive world.",
    rating: 4.7,
    reviews: 2156,
    tags: ["RPG", "Classes", "Quests", "Bosses"],
    tier: "epic",
    uptime: 96.8,
    verified: true,
    rewards: true,
    peakRank: 8,
  },
  {
    id: "7",
    name: "Hytale Odyssey",
    game: "hytale",
    status: "upcoming",
    players: { current: 0, max: 10000 },
    version: "Pre-Alpha",
    gamemode: "Adventure",
    description: "Story-driven Hytale server with voice acting and cutscenes.",
    rating: 0,
    reviews: 0,
    tags: ["Story", "Adventure", "Voice Acting"],
    tier: "legendary",
    uptime: 0,
    verified: true,
  },
  {
    id: "8",
    name: "RedstoneLabs",
    game: "minecraft",
    status: "online",
    players: { current: 234, max: 1000 },
    version: "1.20.4",
    gamemode: "Creative",
    description: "Build without limits. WorldEdit, custom blocks, and build contests.",
    rating: 4.5,
    reviews: 345,
    tags: ["Creative", "Building", "Contests"],
    tier: "common",
    uptime: 99.1,
    verified: true,
  },
];

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
  maintenance: { color: "#F59E0B", label: "MAINTENANCE", pulse: false },
  upcoming: { color: "#22D3EE", label: "COMING SOON", pulse: true },
};

interface DiscoverClientProps {
  lang: string;
  dictionary: {
    [key: string]: unknown;
  };
}

export default function DiscoverClient({ lang, dictionary }: DiscoverClientProps) {
  const [selectedGame, setSelectedGame] = useState<"all" | "minecraft" | "hytale">("all");
  const [selectedTier, setSelectedTier] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"players" | "rating" | "uptime" | "newest">("players");
  const [hoveredServer, setHoveredServer] = useState<string | null>(null);

  // Filter and sort servers
  const filteredServers = useMemo(() => {
    let filtered = mockServers;

    // Game filter
    if (selectedGame !== "all") {
      filtered = filtered.filter((s) => s.game === selectedGame);
    }

    // Tier filter
    if (selectedTier.length > 0) {
      filtered = filtered.filter((s) => selectedTier.includes(s.tier));
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "players":
          return b.players.current - a.players.current;
        case "rating":
          return b.rating - a.rating;
        case "uptime":
          return b.uptime - a.uptime;
        default:
          return 0;
      }
    });
  }, [selectedGame, selectedTier, searchQuery, sortBy]);

  const toggleTier = (tier: string) => {
    setSelectedTier((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const onlineServers = mockServers.filter((s) => s.status === "online").length;
  const totalPlayers = mockServers.reduce((acc, s) => acc + s.players.current, 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-accent-cyan/5 blur-[100px]"
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
                <span className="font-display text-sm text-accent-cyan">
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
              <div className="mb-2 inline-flex items-center gap-2 rounded border border-accent-cyan/30 bg-accent-cyan/5 px-3 py-1">
                <span className="font-display text-[10px] tracking-wider text-accent-cyan">
                  MATCHMAKING CORE
                </span>
              </div>
              <h1 className="font-display text-3xl tracking-wider text-foreground md:text-4xl">
                DISCOVER WORLDS
              </h1>
              <p className="mt-2 max-w-xl font-body text-foreground/60">
                Find your next adventure. Browse verified Minecraft and Hytale servers ranked by
                real player data.
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
                placeholder="Search servers, gamemodes, tags..."
                className="w-full rounded-none border-2 border-foreground/20 bg-background/80 py-3 pl-12 pr-4 font-body text-sm text-foreground placeholder:text-foreground/30 focus:border-accent-cyan focus:outline-none"
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
                    ? "border-accent-cyan bg-accent-cyan/10"
                    : "border-foreground/20 bg-background/50 hover:border-foreground/40"
                }`}
              >
                <span
                  className={`flex items-center gap-2 font-display text-xs tracking-wider ${
                    selectedGame === tab.id ? "text-accent-cyan" : "text-foreground/60"
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
                  <span className="font-display text-xs text-accent-cyan">◆</span>
                  <span className="font-display text-xs tracking-wider text-foreground">
                    RARITY FILTER
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(tierConfig).map(([tier, config]) => (
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
                  <span className="font-display text-xs text-accent-cyan">⇅</span>
                  <span className="font-display text-xs tracking-wider text-foreground">
                    SORT BY
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { id: "players", label: "PLAYER COUNT" },
                    { id: "rating", label: "RATING" },
                    { id: "uptime", label: "UPTIME" },
                    { id: "newest", label: "NEWEST" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id as typeof sortBy)}
                      className={`flex w-full items-center justify-between rounded px-3 py-2 font-ui text-sm transition-all ${
                        sortBy === option.id
                          ? "bg-accent-cyan/10 text-accent-cyan"
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
              <div className="border-2 border-accent-cyan/20 bg-accent-cyan/5 p-4">
                <div className="mb-3 font-display text-xs tracking-wider text-accent-cyan">
                  YOUR STATS
                </div>
                <div className="space-y-2 font-ui text-sm">
                  <div className="flex justify-between text-foreground/60">
                    <span>Servers Visited</span>
                    <span className="text-foreground">12</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Favorites</span>
                    <span className="text-foreground">3</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Reviews Left</span>
                    <span className="text-foreground">7</span>
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
                FOUND{" "}
                <span className="font-display text-accent-cyan">
                  {filteredServers.length}
                </span>{" "}
                WORLDS
              </span>
              <div className="flex gap-2">
                {/* Mobile filter button would go here */}
              </div>
            </motion.div>

            {/* Server Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredServers.map((server, index) => {
                  const tier = tierConfig[server.tier];
                  const status = statusConfig[server.status];
                  const isHovered = hoveredServer === server.id;

                  return (
                    <motion.div
                      key={server.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      onMouseEnter={() => setHoveredServer(server.id)}
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
                          <div className="flex items-center gap-2">
                            {server.rewards && (
                              <span className="font-display text-xs text-amber-400" title="Rewards">
                                🎁
                              </span>
                            )}
                            {server.verified && (
                              <span className="font-display text-xs text-success" title="Verified">
                                ✓
                              </span>
                            )}
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
                                server.game === "minecraft"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-purple-500/20 text-purple-400"
                              }`}
                            >
                              {server.game.toUpperCase()}
                            </span>
                            <span className="font-ui text-[10px] text-foreground/50">
                              {server.gamemode}
                            </span>
                            <span className="font-ui text-[10px] text-foreground/30">
                              {server.version}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="mb-4 line-clamp-2 font-body text-xs leading-relaxed text-foreground/60">
                            {server.description}
                          </p>

                          {/* Player Count Bar */}
                          {server.status === "online" && (
                            <div className="mb-4">
                              <div className="mb-1 flex justify-between font-ui text-[10px]">
                                <span className="text-foreground/50">PLAYERS</span>
                                <span className="text-foreground">
                                  {server.players.current.toLocaleString()} /{" "}
                                  {server.players.max.toLocaleString()}
                                </span>
                              </div>
                              <div className="h-2 overflow-hidden bg-foreground/10">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${
                                      (server.players.current / server.players.max) * 100
                                    }%`,
                                  }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                  className="h-full"
                                  style={{ backgroundColor: tier.color }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Rating & Reviews */}
                          {server.rating > 0 && (
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <span className="font-display text-xs text-amber-400">★</span>
                                <span className="font-ui text-sm text-foreground">
                                  {server.rating}
                                </span>
                              </div>
                              <span className="font-ui text-xs text-foreground/40">
                                ({server.reviews.toLocaleString()} reviews)
                              </span>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="mb-4 flex flex-wrap gap-1">
                            {server.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded border border-foreground/10 px-1.5 py-0.5 font-ui text-[10px] text-foreground/50"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Action Button */}
                          <Link href={`/server/${server.id}`}>
                            <PixelButton
                              variant={server.status === "upcoming" ? "outline" : "primary"}
                              size="sm"
                              className="w-full"
                            >
                              {server.status === "upcoming" ? "PRE-REGISTER" : "JOIN WORLD"}
                            </PixelButton>
                          </Link>
                        </div>

                        {/* Peak Rank Badge */}
                        {server.peakRank && server.peakRank <= 10 && (
                          <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500/20 shadow-lg">
                            <span className="font-display text-[10px] text-amber-400">
                              #{server.peakRank}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredServers.length === 0 && (
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
