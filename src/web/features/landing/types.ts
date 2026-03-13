export interface LandingCopy {
  under_construction?: string;
  building_title?: string;
  status?: string;
  active?: string;
  building_desc?: string;
  progress?: string;
  feature_servers?: string;
  feature_verified?: string;
  feature_uptime?: string;
  feature_anticheat?: string;
  notify_title?: string;
  notify_desc?: string;
  notify_btn?: string;
  subscription_verified?: string;
  check_inbox?: string;
}

export interface LandingDictionary {
  common?: {
    brand?: string;
    enter_email?: string;
    scribe?: string;
  };
  landing?: LandingCopy;
}

export interface LandingPageProps {
  lang: string;
  dictionary: LandingDictionary;
}
