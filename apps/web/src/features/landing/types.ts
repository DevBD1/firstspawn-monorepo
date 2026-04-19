export interface LandingCopy {
  active?: string;
  cta_primary?: string;
  cta_secondary?: string;
  cta_section_subtitle?: string;
  cta_section_title?: string;
  check_inbox?: string;
  discovery_composer_placeholder?: string;
  discovery_demo_card_description?: string;
  discovery_demo_card_match?: string;
  discovery_demo_card_status?: string;
  discovery_demo_card_tags?: string[];
  discovery_demo_card_title?: string;
  discovery_demo_prompt?: string;
  discovery_demo_response?: string;
  discovery_label?: string;
  discovery_pending?: string;
  discovery_submit?: string;
  explorers_label?: string;
  feature_1_desc?: string;
  feature_1_title?: string;
  feature_2_desc?: string;
  feature_2_title?: string;
  feature_3_desc?: string;
  feature_3_title?: string;
  feature_4_desc?: string;
  feature_4_title?: string;
  features_subtitle?: string;
  features_title?: string;
  hero_subtitle?: string;
  hero_title?: string;
  how_it_works_title?: string;
  metric_live_players?: string;
  metric_registered_explorers?: string;
  metric_registered_servers?: string;
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
  desc: string;
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
  discoveryDemo: LandingDiscoveryDemoModel;
  explorerProof: LandingHeroExplorerProof;
  features: LandingFeatureItem[];
  heroMetrics: LandingHeroMetric[];
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
      | "discovery_composer_placeholder"
      | "discovery_demo_card_description"
      | "discovery_demo_card_match"
      | "discovery_demo_card_status"
      | "discovery_demo_card_tags"
      | "discovery_demo_card_title"
      | "discovery_demo_prompt"
      | "discovery_demo_response"
      | "discovery_label"
      | "discovery_pending"
      | "discovery_submit"
      | "explorers_label"
      | "feature_1_desc"
      | "feature_1_title"
      | "feature_2_desc"
      | "feature_2_title"
      | "feature_3_desc"
      | "feature_3_title"
      | "feature_4_desc"
      | "feature_4_title"
      | "features_subtitle"
      | "features_title"
      | "hero_subtitle"
      | "hero_title"
      | "how_it_works_title"
      | "metric_live_players"
      | "metric_registered_explorers"
      | "metric_registered_servers"
      | "notify_btn"
      | "notify_desc"
      | "notify_title"
      | "popular_label"
      | "stats_servers"
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
