import type {
  LandingContentModel,
  LandingDictionary,
  LandingDiscoveryDemoModel,
  LandingFeatureItem,
  LandingProofServer,
  LandingRealtimeStats,
  LandingStepItem,
} from "@/features/landing/types";

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

const buildFeatures = (landing: LandingContentModel["landing"]): LandingFeatureItem[] => [
  { desc: landing.feature_1_desc, icon: FEATURE_ICONS[0], title: landing.feature_1_title },
  { desc: landing.feature_2_desc, icon: FEATURE_ICONS[1], title: landing.feature_2_title },
  { desc: landing.feature_3_desc, icon: FEATURE_ICONS[2], title: landing.feature_3_title },
  { desc: landing.feature_4_desc, icon: FEATURE_ICONS[3], title: landing.feature_4_title },
];

const buildSteps = (landing: LandingContentModel["landing"]): LandingStepItem[] => [
  { desc: landing.step_1_desc, num: "01", title: landing.step_1_title },
  { desc: landing.step_2_desc, num: "02", title: landing.step_2_title },
  { desc: landing.step_3_desc, num: "03", title: landing.step_3_title },
];

const buildDiscoveryDemo = (
  landing: LandingContentModel["landing"]
): LandingDiscoveryDemoModel => ({
  card: {
    description: landing.discovery_demo_card_description,
    match: landing.discovery_demo_card_match,
    status: landing.discovery_demo_card_status,
    tags: [...landing.discovery_demo_card_tags],
    title: landing.discovery_demo_card_title,
  },
  composerPlaceholder: landing.discovery_composer_placeholder,
  panelLabel: landing.discovery_label,
  pendingMessage: landing.discovery_pending,
  prompt: landing.discovery_demo_prompt,
  response: landing.discovery_demo_response,
  submitLabel: landing.discovery_submit,
});

const buildHeroMetrics = (landing: LandingContentModel["landing"], stats: LandingRealtimeStats) => [
  {
    key: "registeredServers" as const,
    label: landing.metric_registered_servers,
    tone: "diamond" as const,
    value: stats.registeredServers,
  },
  {
    key: "registeredExplorers" as const,
    label: landing.metric_registered_explorers,
    tone: "gold" as const,
    value: stats.registeredExplorers,
  },
  {
    key: "totalOnlinePlayers" as const,
    label: landing.metric_live_players,
    tone: "success" as const,
    value: stats.totalOnlinePlayers,
  },
];

export const getLandingContent = (
  dictionary: LandingDictionary,
  stats: LandingRealtimeStats
): LandingContentModel => {
  const landing = {
    ...dictionary.landing,
    discovery_demo_card_tags: [...(dictionary.landing?.discovery_demo_card_tags ?? [])],
  } as LandingContentModel["landing"];
  const brand = dictionary.common?.brand ?? "";
  const heroTitle = landing.hero_title.split("\n").filter(Boolean);

  return {
    brand,
    discoveryDemo: buildDiscoveryDemo(landing),
    explorerProof: {
      count: stats.registeredExplorers,
      label: landing.explorers_label,
    },
    features: buildFeatures(landing),
    heroMetrics: buildHeroMetrics(landing, stats),
    heroStatus: `${landing.status} ${landing.active}`,
    heroTitle,
    landing,
    proofTitle: `${landing.popular_label} ${landing.stats_servers}`,
    steps: buildSteps(landing),
  };
};
