import type { AppDictionary } from "@/lib/dictionaries/schema";

export interface LandingFeatureItem {
  description: string;
  icon: string;
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
  features: LandingFeatureItem[];
  landing: AppDictionary["landing"];
}
