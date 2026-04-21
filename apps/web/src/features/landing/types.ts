import type { AppDictionary } from "@/lib/dictionaries/schema";

export interface LandingRealtimeStats {
  registeredExplorers: number;
  registeredServers: number;
  totalOnlinePlayers: number;
}

export interface LandingHeroExplorerProof {
  count: number;
  label: string;
}

export interface LandingHeroMetric {
  key: "registeredServers" | "registeredExplorers" | "totalOnlinePlayers";
  label: string;
  tone: "diamond" | "gold" | "success";
  value: number;
}

export interface LandingFeatureItem {
  description: string;
  icon: string;
  title: string;
}

export interface LandingDiscoveryRecommendationCard {
  description: string;
  matchLabel: string;
  statusLabel: string;
  tags: string[];
  title: string;
}

// UI model for the landing-only chat demo. This is intentionally separate from any future live chat transport model.
export interface LandingDiscoveryChatDemoModel {
  assistantWaitingMessage: string;
  composer: {
    placeholder: string;
    submitLabel: string;
  };
  demoThread: {
    assistantReply: string;
    recommendationCard: LandingDiscoveryRecommendationCard;
    userPrompt: string;
  };
  title: string;
}

export interface LandingStepItem {
  description: string;
  number: string;
  title: string;
}

export interface LandingProofServer {
  id: string;
  address?: string | null;
  badges?: Array<{ label: string; tone?: "verified" | "featured" | "trending" }>;
  description?: string | null;
  game?: string | null;
  gameVersion?: string | null;
  isOnline?: boolean;
  logoUrl?: string | null;
  maxPlayers?: number | null;
  modsRequired?: boolean | null;
  name: string;
  onlinePlayers?: number | null;
  pingMs?: number | null;
  region?: string | null;
  slug: string;
  sortHighlight?: {
    helper?: string;
    label: string;
    tone?: "players" | "ping" | "trending";
    value: string;
  } | null;
  tags?: string[];
}

export interface LandingContentModel {
  brand: string;
  discoveryChatDemo: LandingDiscoveryChatDemoModel;
  explorerProof: LandingHeroExplorerProof;
  features: LandingFeatureItem[];
  heroMetrics: LandingHeroMetric[];
  heroStatus: string;
  heroTitle: string[];
  landing: AppDictionary["landing"];
  proofTitle: string;
  steps: LandingStepItem[];
}
