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

export interface LandingDiscoveryDemoCard {
  description: string;
  match: string;
  status: string;
  tags: string[];
  title: string;
}

export interface LandingDiscoveryDemoModel {
  card: LandingDiscoveryDemoCard;
  composerPlaceholder: string;
  panelLabel: string;
  pendingMessage: string;
  prompt: string;
  response: string;
  submitLabel: string;
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
  discoveryDemo: LandingDiscoveryDemoModel;
  explorerProof: LandingHeroExplorerProof;
  features: LandingFeatureItem[];
  heroMetrics: LandingHeroMetric[];
  heroStatus: string;
  heroTitle: string[];
  landing: AppDictionary["landing"];
  proofTitle: string;
  steps: LandingStepItem[];
}
