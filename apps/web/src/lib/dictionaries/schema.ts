export interface CommonDictionary {
  brand: string;
  siteTitle: string;
  tagline: string;
  sourceLabel: string;
  actions: {
    addServer: string;
    backHome: string;
    close: string;
    loadMore: string;
    logIn: string;
    logOut: string;
    manageSettings: string;
    notifyMe: string;
    reset: string;
    retry: string;
    savePreferences: string;
    send: string;
    signUp: string;
    startExploring: string;
    verify: string;
  };
  fields: {
    confirmPassword: string;
    email: string;
    emailOrUsername: string;
    password: string;
    username: string;
  };
  placeholders: {
    confirmPassword: string;
    email: string;
    password: string;
    username: string;
  };
  status: {
    active: string;
    archived: string;
    offline: string;
    online: string;
    systemsNormal: string;
    verified: string;
  };
}

export interface NavigationDictionary {
  console: string;
  discover: string;
  languageMenuLabel: string;
  logIn: string;
  logOut: string;
  menuLabel: string;
  myLoot: string;
  signUp: string;
  verifyEmail: string;
  verifyEmailTitle: string;
}

export interface CookieConsentDictionary {
  title: string;
  introPrefix: string;
  introLinkLabel: string;
  introSuffix: string;
  consentPrefix: string;
  privacyLinkLabel: string;
  consentMiddle: string;
  termsLinkLabel: string;
  consentSuffix: string;
  servicesLinkLabel: string;
  acceptAll: string;
  manageSettings: string;
  savePreferences: string;
  acceptSelected: string;
  essentialOnly: string;
  back: string;
  essentialTitle: string;
  essentialDescription: string;
  analyticsTitle: string;
  analyticsDescription: string;
  manageDescription: string;
  categoryNecessary: string;
  categoryStatistics: string;
  categoryPersonalization: string;
  categoryMarketing: string;
  categoryUnavailable: string;
  stateOn: string;
  stateOff: string;
}

export interface FooterDictionary {
  cta: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    getStarted: string;
    owners: string;
  };
  stats: {
    title: string;
    fakeVotes: string;
    fakeVotesValue: string;
    uptime: string;
    uptimeValue: string;
    filters: string;
    filtersValue: string;
  };
  brand: {
    name: string;
    description: string;
  };
  columns: {
    platform: {
      title: string;
      about: string;
      trust: string;
      badges: string;
      api: string;
    };
    resources: {
      title: string;
      help: string;
      api: string;
      community: string;
      partners: string;
    };
    legal: {
      title: string;
      terms: string;
      privacy: string;
      cookie: string;
      acceptable: string;
    };
  };
  bottom: {
    copyright: string;
    systemsNormal: string;
    version: string;
    crafted: string;
  };
}

export interface AuthShellCopy {
  brandStatement: {
    title: string;
    highlight: string;
    description: string;
  };
  benefitItems: Array<{
    description: string;
    title: string;
  }>;
  legalLine: string;
}

export interface AuthLoginCopy {
  page: {
    title: string;
    subtitle: string;
    registeredSuccess: string;
  };
  form: {
    alternateCta: string;
    alternatePrompt: string;
    dividerLabel: string;
    discordCta: string;
    hidePasswordAriaLabel: string;
    identifierLabel: string;
    identifierPlaceholder: string;
    passkeyCta: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    showPasswordAriaLabel: string;
    submitLabel: string;
    submitPendingLabel: string;
  };
}

export interface AuthRegisterCopy {
  page: {
    title: string;
    subtitle: string;
  };
  form: {
    alternateCta: string;
    alternatePrompt: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    discordCta: string;
    dividerLabel: string;
    emailLabel: string;
    emailPlaceholder: string;
    hidePasswordAriaLabel: string;
    legalDisclaimer: string;
    marketingConsentLabel: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    privacyLabelCta: string;
    privacyLabelPrefix: string;
    showPasswordAriaLabel: string;
    submitLabel: string;
    submitPendingLabel: string;
    termsLabelCta: string;
    termsLabelPrefix: string;
    usernameLabel: string;
    usernamePlaceholder: string;
  };
}

export interface AuthActivationCopy {
  backLabel: string;
  fallbackEmail: string;
  instruction: string;
  message: string;
  providerWarning: string;
  spamWarning: string;
  title: string;
}

export interface AuthDictionary {
  activation: AuthActivationCopy;
  login: AuthLoginCopy;
  register: AuthRegisterCopy;
  shell: AuthShellCopy;
}

export interface LandingDictionary {
  scene: {
    alt: string;
  };
  questBoard: {
    eyebrow: string;
    title: string;
    subtitle: string;
    statusLabel: string;
    statusValue: string;
    betaLabel: string;
    primaryLabel: string;
    secondaryLabel: string;
    quests: Array<{
      title: string;
      description: string;
      rewardLabel: string;
      rewardValue: string;
      statusLabel: string;
      statusValue: string;
    }>;
  };
  roadmap: {
    eyebrow: string;
    title: string;
    items: Array<{
      title: string;
      statusLabel: string;
      description: string;
    }>;
  };
  problemSolution: {
    eyebrow: string;
    title: string;
    subtitle: string;
    problem: {
      statusLabel: string;
      title: string;
      items: Array<{
        title: string;
        description: string;
      }>;
    };
    solution: {
      statusLabel: string;
      title: string;
      items: Array<{
        title: string;
        description: string;
      }>;
    };
  };
  discoveryFork: {
    title: string;
    subtitle: string;
    player: {
      channelLabel: string;
      title: string;
      description: string;
      actionLabel: string;
    };
    host: {
      channelLabel: string;
      title: string;
      description: string;
      actionLabel: string;
    };
  };
  trust: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
      statusLabel: string;
    }>;
  };
  serverProof: {
    eyebrow: string;
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
    liveLabel: string;
    rankedByLabel: string;
    playerHelperSuffix: string;
    viewAllLabel: string;
    verifiedLabel: string;
  };
  progression: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
      stateLabel: string;
    }>;
  };
  hero: {
    statusLabel: string;
    statusValue: string;
    title: string;
    subtitle: string;
    explorerLabel: string;
    metrics: {
      livePlayers: string;
      registeredExplorers: string;
      registeredServers: string;
    };
    actions: {
      primaryLabel: string;
      secondaryLabel: string;
    };
  };
  features: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Array<{
      description: string;
      title: string;
    }>;
  };
  howItWorks: {
    title: string;
    items: Array<{
      description: string;
      title: string;
    }>;
  };
  discoveryChat: {
    title: string;
    assistantWaitingMessage: string;
    composer: {
      placeholder: string;
      submitLabel: string;
    };
    demoThread: {
      userPrompt: string;
      assistantReply: string;
      recommendationCard: {
        description: string;
        matchLabel: string;
        statusLabel: string;
        tags: string[];
        title: string;
      };
    };
  };
  proof: {
    eyebrow: string;
    title: string;
  };
  finalCta: {
    title: string;
    subtitle: string;
    primaryLabel: string;
    secondaryLabel: string;
  };
  newsletter: {
    title: string;
    description: string;
    submitLabel: string;
    subscriptionVerified: string;
    checkInbox: string;
    verifying: string;
    errorMessage: string;
  };
}

export interface DiscoverDictionary {
  page: {
    badgeLabel: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    gameFilters: {
      all: string;
      minecraft: string;
      hytale: string;
    };
    rarityFilterTitle: string;
    sortTitle: string;
    sortOptions: {
      ping: string;
      players: string;
    };
    personalStatsTitle: string;
    personalStats: {
      favorites: string;
      serversVisited: string;
    };
    resultsSummary: string;
    syncingLabel: string;
    loadingMoreLabel: string;
    emptyStateTitle: string;
    emptyStateDescription: string;
    stats: {
      activePlayers: string;
      onlineServers: string;
      version: string;
    };
    ranking: {
      lowerIsBetter: string;
      rankedBy: string;
    };
    tiers: {
      common: string;
      rare: string;
      epic: string;
      legendary: string;
    };
    tierFilterTitle: string;
  };
}

export interface RelativeTimeDictionaryUnit {
  one: string;
  other: string;
  few?: string;
  many?: string;
}

export interface ServerCatalogDictionary {
  badges: {
    featured: string;
    trending: string;
    verified: string;
  };
  card: {
    address: string;
    liveData: string;
    maxPlayers: string;
    mods: string;
    profilePageFallback: string;
    viewWorld: string;
  };
  games: {
    fallback: string;
    hytale: string;
    mcBedrock: string;
    mcJava: string;
  };
  modsRequired: {
    no: string;
    yes: string;
  };
  sortHighlights: {
    lowerIsBetter: string;
    rankedBy: string;
    trendingNow: string;
  };
}

export interface ServerDetailDictionary {
  catalog: {
    active: string;
    archived: string;
  };
  labels: {
    back: string;
    discord: string;
    host: string;
    lastSeen: string;
    maxPlayers: string;
    notAvailable: string;
    offlineMode: string;
    onlineMode: string;
    onlinePlayers: string;
    ping: string;
    port: string;
    region: string;
    version: string;
    website: string;
  };
  relativeTime: {
    justNow: string;
    day: RelativeTimeDictionaryUnit;
    hour: RelativeTimeDictionaryUnit;
    minute: RelativeTimeDictionaryUnit;
    month: RelativeTimeDictionaryUnit;
    second: RelativeTimeDictionaryUnit;
    year: RelativeTimeDictionaryUnit;
  };
  status: {
    offline: string;
    online: string;
  };
}

export interface LegalPageCopy {
  description: string;
  localeLabel: string;
  title: string;
}

export interface ConsolePageCopy {
  badge: string;
  fallbackUsername: string;
  title: string;
  description: string;
}

export interface LootPageCopy {
  badge: string;
  fallbackUsername: string;
  title: string;
  description: string;
}

export interface DebugPageCopy {
  ogPreviewTitle: string;
  ogPreviewPathLabel: string;
  ogPreviewImageAlt: string;
}

export interface CaptchaDictionary {
  screw: {
    idleMessage: string;
    verifyingMessage: string;
  };
  modal: {
    attemptsLabel: string;
    clearedLabel: string;
    closeAriaLabel: string;
    processingLabel: string;
    resetAriaLabel: string;
    resetLabel: string;
    retryLabel: string;
    rotateLabel: string;
    sliderLeftLabel: string;
    sliderRightLabel: string;
    subtitle: string;
    successTitle: string;
    title: string;
    verifyLabel: string;
  };
}

export interface AppDictionary {
  auth: AuthDictionary;
  captcha: CaptchaDictionary;
  common: CommonDictionary;
  consolePage: ConsolePageCopy;
  cookieConsent: CookieConsentDictionary;
  debugPages: DebugPageCopy;
  discover: DiscoverDictionary;
  footer: FooterDictionary;
  landing: LandingDictionary;
  legal: {
    privacy: LegalPageCopy;
    terms: LegalPageCopy;
  };
  lootPage: LootPageCopy;
  nav: NavigationDictionary;
  serverCatalog: ServerCatalogDictionary;
  serverDetail: ServerDetailDictionary;
}
