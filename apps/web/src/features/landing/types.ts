export interface LandingCopy {
  active?: string;
  cta_primary?: string;
  cta_secondary?: string;
  cta_section_subtitle?: string;
  cta_section_title?: string;
  check_inbox?: string;
  feature_1_desc?: string;
  feature_1_title?: string;
  feature_2_desc?: string;
  feature_2_title?: string;
  feature_3_desc?: string;
  feature_3_title?: string;
  feature_4_desc?: string;
  feature_4_title?: string;
  feature_anticheat?: string;
  feature_servers?: string;
  feature_uptime?: string;
  feature_verified?: string;
  features_subtitle?: string;
  features_title?: string;
  hero_subtitle?: string;
  hero_title?: string;
  how_it_works_title?: string;
  notify_btn?: string;
  notify_desc?: string;
  notify_title?: string;
  popular_label?: string;
  popular_tags?: string[];
  scene_alt?: string;
  search_button?: string;
  search_placeholder?: string;
  stats_players?: string;
  stats_servers?: string;
  stats_verified?: string;
  status?: string;
  step_1_desc?: string;
  step_1_title?: string;
  step_2_desc?: string;
  step_2_title?: string;
  step_3_desc?: string;
  step_3_title?: string;
  subscription_verified?: string;
  verify_error?: string;
  verifying?: string;
}

export interface LandingHeroStat {
  label: string;
  value: string;
}

export interface LandingFeatureItem {
  desc: string;
  icon: string;
  title: string;
}

export interface LandingStepItem {
  desc: string;
  num: string;
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
  heroSignals: string[];
  heroStats: LandingHeroStat[];
  heroStatus: string;
  heroTitle: string[];
  landing: Required<
    Pick<
      LandingCopy,
      | "active"
      | "cta_primary"
      | "cta_secondary"
      | "cta_section_subtitle"
      | "cta_section_title"
      | "check_inbox"
      | "feature_1_desc"
      | "feature_1_title"
      | "feature_2_desc"
      | "feature_2_title"
      | "feature_3_desc"
      | "feature_3_title"
      | "feature_4_desc"
      | "feature_4_title"
      | "feature_anticheat"
      | "feature_servers"
      | "feature_uptime"
      | "feature_verified"
      | "features_subtitle"
      | "features_title"
      | "hero_subtitle"
      | "hero_title"
      | "how_it_works_title"
      | "notify_btn"
      | "notify_desc"
      | "notify_title"
      | "popular_label"
      | "popular_tags"
      | "search_button"
      | "search_placeholder"
      | "stats_players"
      | "stats_servers"
      | "stats_verified"
      | "status"
      | "step_1_desc"
      | "step_1_title"
      | "step_2_desc"
      | "step_2_title"
      | "step_3_desc"
      | "step_3_title"
      | "subscription_verified"
      | "verify_error"
      | "verifying"
    >
  >;
  proofTitle: string;
  steps: LandingStepItem[];
}

export interface LandingDictionary {
  common?: {
    brand?: string;
    enter_email?: string;
    scribe?: string;
  };
  landing?: LandingCopy;
}
