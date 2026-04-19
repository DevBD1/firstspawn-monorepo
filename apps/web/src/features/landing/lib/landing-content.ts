import type {
  LandingContentModel,
  LandingDiscoveryDemoModel,
  LandingFeatureItem,
  LandingProofServer,
  LandingRealtimeStats,
  LandingStepItem,
} from "@/features/landing/types";
import type { AppDictionary } from "@/lib/dictionaries/schema";

export const SECTION_SURFACE_CLASS =
  "relative overflow-hidden border-4 border-black bg-background/72 p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px] md:p-8";
export const CARD_SURFACE_CLASS =
  "relative h-full overflow-hidden border-4 border-black bg-bg-panel/72 p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px]";

const FEATURE_ICONS = ["⚡", "✓", "◆", "★"] as const;

export const MOCK_SERVERS: LandingProofServer[] = [
  {
    id: "1",
    slug: "hypixel",
    name: "Hypixel Network",
    address: "mc.hypixel.net",
    description:
      "Massive minigame network with fast queues, seasonal events, and real-time community activity.",
    game: "mc_java",
    gameVersion: "1.20.1",
    onlinePlayers: 45021,
    maxPlayers: 100000,
    isOnline: true,
    modsRequired: false,
    pingMs: 42,
    region: "GLOBAL",
    sortHighlight: {
      helper: "100,000 MAX",
      label: "TRENDING NOW",
      tone: "trending",
      value: "45,021 LIVE PLAYERS",
    },
    tags: ["MINIGAMES", "SKYBLOCK", "PVP"],
    badges: [
      { label: "VERIFIED", tone: "verified" },
      { label: "TRENDING", tone: "trending" },
    ],
  },
  {
    id: "2",
    slug: "wynncraft",
    name: "Wynncraft MMO",
    address: "play.wynncraft.com",
    description:
      "A long-running adventure MMO world with quests, guilds, and persistent progression.",
    game: "mc_java",
    gameVersion: "1.19.4",
    onlinePlayers: 2154,
    maxPlayers: 5000,
    isOnline: true,
    modsRequired: true,
    pingMs: 58,
    region: "EU/NA",
    sortHighlight: {
      helper: "5,000 MAX",
      label: "TRENDING NOW",
      tone: "trending",
      value: "2,154 LIVE PLAYERS",
    },
    tags: ["MMO", "QUESTS", "RPG"],
    badges: [{ label: "FEATURED", tone: "featured" }],
  },
  {
    id: "3",
    slug: "complex-gaming",
    name: "Complex Gaming",
    address: "hub.mc-complex.com",
    description:
      "Modded and vanilla game modes with strong uptime, active hubs, and broad version support.",
    game: "mc_java",
    gameVersion: "1.16.5",
    onlinePlayers: 1400,
    maxPlayers: 3000,
    isOnline: true,
    modsRequired: true,
    pingMs: 64,
    region: "NA",
    sortHighlight: {
      helper: "3,000 MAX",
      label: "TRENDING NOW",
      tone: "trending",
      value: "1,400 LIVE PLAYERS",
    },
    tags: ["MODDED", "SURVIVAL", "PIXELMON"],
    badges: [{ label: "VERIFIED", tone: "verified" }],
  },
  {
    id: "4",
    slug: "manacube",
    name: "ManaCube Search",
    address: "play.manacube.com",
    description:
      "Popular survival and parkour network with approachable modes and active player loops.",
    game: "mc_java",
    gameVersion: "1.20.1",
    onlinePlayers: 4200,
    maxPlayers: 10000,
    isOnline: true,
    modsRequired: false,
    pingMs: 37,
    region: "GLOBAL",
    sortHighlight: {
      helper: "10,000 MAX",
      label: "TRENDING NOW",
      tone: "trending",
      value: "4,200 LIVE PLAYERS",
    },
    tags: ["SURVIVAL", "PARKOUR", "SKYBLOCK"],
    badges: [{ label: "TRENDING", tone: "trending" }],
  },
];

const buildFeatures = (landing: LandingContentModel["landing"]): LandingFeatureItem[] =>
  landing.features.items.map((item, index) => ({
    description: item.description,
    icon: FEATURE_ICONS[index] ?? FEATURE_ICONS[FEATURE_ICONS.length - 1],
    title: item.title,
  }));

const buildSteps = (landing: LandingContentModel["landing"]): LandingStepItem[] =>
  landing.howItWorks.items.map((item, index) => ({
    description: item.description,
    number: `${index + 1}`.padStart(2, "0"),
    title: item.title,
  }));

const buildDiscoveryDemo = (
  landing: LandingContentModel["landing"]
): LandingDiscoveryDemoModel => ({
  card: {
    description: landing.discovery.demo.card.description,
    match: landing.discovery.demo.card.matchLabel,
    status: landing.discovery.demo.card.statusLabel,
    tags: [...landing.discovery.demo.card.tags],
    title: landing.discovery.demo.card.title,
  },
  composerPlaceholder: landing.discovery.composer.placeholder,
  panelLabel: landing.discovery.panelLabel,
  pendingMessage: landing.discovery.pendingMessage,
  prompt: landing.discovery.demo.prompt,
  response: landing.discovery.demo.response,
  submitLabel: landing.discovery.composer.submitLabel,
});

const buildHeroMetrics = (landing: LandingContentModel["landing"], stats: LandingRealtimeStats) => [
  {
    key: "registeredServers" as const,
    label: landing.hero.metrics.registeredServers,
    tone: "diamond" as const,
    value: stats.registeredServers,
  },
  {
    key: "registeredExplorers" as const,
    label: landing.hero.metrics.registeredExplorers,
    tone: "gold" as const,
    value: stats.registeredExplorers,
  },
  {
    key: "totalOnlinePlayers" as const,
    label: landing.hero.metrics.livePlayers,
    tone: "success" as const,
    value: stats.totalOnlinePlayers,
  },
];

export const getLandingContent = (
  dictionary: AppDictionary,
  stats: LandingRealtimeStats
): LandingContentModel => {
  const landing = dictionary.landing;
  const brand = dictionary.common.brand;
  const heroTitle = landing.hero.title.split("\n").filter(Boolean);

  return {
    brand,
    discoveryDemo: buildDiscoveryDemo(landing),
    explorerProof: {
      count: stats.registeredExplorers,
      label: landing.hero.explorerLabel,
    },
    features: buildFeatures(landing),
    heroMetrics: buildHeroMetrics(landing, stats),
    heroStatus: `${landing.hero.statusLabel} ${landing.hero.statusValue}`,
    heroTitle,
    landing,
    proofTitle: landing.proof.title,
    steps: buildSteps(landing),
  };
};
