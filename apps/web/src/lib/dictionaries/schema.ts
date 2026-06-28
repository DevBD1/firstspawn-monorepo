export interface CommonDictionary {
  brand: string;
  siteTitle: string;
  tagline: string;
  sourceLabel: string;
  /** Country display names keyed by ISO-style code ("WW" = global). */
  countries: Record<string, string>;
  /** Display names for external link slots on server profiles. */
  linkKinds: {
    website: string;
    discord: string;
    store: string;
    youtube: string;
  };
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
  /** Server reach: where a server is based vs how far it serves. */
  reach: {
    label: string;
    hint: string;
    local: string;
    regional: string;
    global: string;
  };
}

export interface NavigationDictionary {
  console: string;
  discover: string;
  forOwners: string;
  languageMenuLabel: string;
  logIn: string;
  logOut: string;
  menuLabel: string;
  signIn: string;
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
    systemsDegraded: string;
    systemsDown: string;
    version: string;
    crafted: string;
  };
}

export interface ConnectionBannerDictionary {
  down: string;
  degraded: string;
  dismiss: string;
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
    hidePasswordAriaLabel: string;
    identifierLabel: string;
    identifierPlaceholder: string;
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
  hero: {
    /** Supports {players} and {servers} placeholders. */
    statsLine: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    searchPlaceholder: string;
    searchSubmitLabel: string;
  };
  activeTonight: {
    title: string;
    viewAllLabel: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  ranking: {
    title: string;
    formulaHint: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  globe: {
    title: string;
    subtitle: string;
    /** Supports {count}. */
    serversPlaced: string;
    hint: string;
    onlineLabel: string;
    offlineLabel: string;
    /** Supports {count}. */
    playersLabel: string;
    globalLabel: string;
    reach: {
      local: string;
      regional: string;
      global: string;
    };
    emptyTitle: string;
    emptyDescription: string;
  };
  ownerCta: {
    title: string;
    description: string;
    listServerLabel: string;
    howRankingWorksLabel: string;
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
    title: string;
    /** Supports a {count} placeholder for the active server total. */
    searchPlaceholder: string;
    smartMatch: {
      readingAs: string;
      literalActive: string;
      enableLabel: string;
      disableLabel: string;
      /** Supports a {query} placeholder for unmatched search words. */
      extraTermsLabel: string;
      methodNote: string;
    };
    filters: {
      gameTitle: string;
      countryTitle: string;
      tagsTitle: string;
      sortTitle: string;
      allGames: string;
      allCountries: string;
      sortOptions: {
        rank: string;
        players: string;
        votes: string;
      };
    };
    results: {
      /** Supports a {count} placeholder; singular form. */
      countOne: string;
      /** Supports a {count} placeholder; plural form. */
      countOther: string;
      /** Supports a {query} placeholder. */
      matchingQuery: string;
      neverSoldNote: string;
      emptyTitle: string;
      emptyDescription: string;
      loadingMore: string;
      loadError: string;
      retry: string;
    };
  };
}

/**
 * Copy for the ranking-transparency UI (signal bars, "why this rank?"
 * popovers) shared by the landing, discover, server profile, and owner
 * console surfaces.
 */
export interface RankSignalsDictionary {
  popoverTitle: string;
  activityLabel: string;
  trustLabel: string;
  freshnessLabel: string;
  activityHint: string;
  trustHint: string;
  freshnessHint: string;
  formulaLine: string;
  neverSoldLine: string;
  activityMeasuredTooltip: string;
}

/** Copy for the WorldLight list-your-server flow. */
export interface ListFlowDictionary {
  steps: {
    address: string;
    ownership: string;
    profile: string;
    publish: string;
  };
  header: {
    title: string;
    summary: string;
  };
  address: {
    title: string;
    description: string;
    softwareLabel: string;
    geyserLabel: string;
    /** Supports a {port} placeholder (the game's default port). */
    hostPlaceholder: string;
    pingingLabel: string;
    checkServerLabel: string;
    stats: {
      status: string;
      reachable: string;
      software: string;
      version: string;
      onlineNow: string;
      motd: string;
    };
    continueLabel: string;
    supportNote: string;
    errorUnreachable: string;
    errorAddressTaken: string;
  };
  ownership: {
    title: string;
    description: string;
    tokenLabel: string;
    copyLabel: string;
    motdTitle: string;
    motdBody: string;
    dnsTitle: string;
    dnsBodyPrefix: string;
    dnsFallbackDomain: string;
    dnsBodySuffix: string;
    dnsUnavailable: string;
    verifiedLabel: string;
    continueLabel: string;
    checkingLabel: string;
    verifyLabel: string;
    selectHint: string;
    failedLabel: string;
  };
  profile: {
    title: string;
    description: string;
    nameLabel: string;
    nameTakenLabel: string;
    /** Supports a {count} placeholder (characters left). */
    blurbLabel: string;
    blurbPlaceholder: string;
    /** Supports a {count} placeholder (selected tag count). */
    tagsLabel: string;
    countryLabel: string;
    countryHint: string;
    previewLabel: string;
  };
  preview: {
    draftTitle: string;
    draftDescription: string;
    publishedTitle: string;
    publishedDescription: string;
    fallbackName: string;
    fallbackBlurb: string;
    justListedLabel: string;
    /** Supports a {count} placeholder (measured online players). */
    onlineMeasuredLabel: string;
    reachableLabel: string;
    rankUnrankedLabel: string;
    standingLabel: string;
    publishLabel: string;
    editProfileLabel: string;
    openConsoleLabel: string;
    publishingLabel: string;
    publishErrorLabel: string;
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
    mcBedrock: string;
    mcJava: string;
  };
  modsRequired: {
    no: string;
    yes: string;
  };
  /** Copy for the compact list rows and cards used on landing and discover. */
  row: {
    verifiedBadge: string;
    votedLabel: string;
    /** Supports a {count} placeholder. */
    onlineCountLabel: string;
    /** Supports a {value} placeholder (uptime percentage). */
    uptimeLabel: string;
    globalRegionLabel: string;
    noDescription: string;
    gameNames: {
      mcJava: string;
      mcBedrock: string;
      fallback: string;
    };
    relativeTime: {
      justNow: string;
      /** Supports a {count} placeholder. */
      minutesAgo: string;
      /** Supports a {count} placeholder. */
      hoursAgo: string;
      /** Supports a {count} placeholder. */
      daysAgo: string;
      unknown: string;
    };
  };
  /** Copy for the quick-peek server modal opened from list rows and cards. */
  modal: {
    /** Supports a {name} placeholder. */
    bannerLabel: string;
    closeLabel: string;
    onlineNowLabel: string;
    uptimeLabel: string;
    votesLabel: string;
    standingLabel: string;
    verifiedStanding: string;
    copyAddressLabel: string;
    copiedLabel: string;
    voteLabel: string;
    votedLabel: string;
    viewFullProfileLabel: string;
  };
  sortHighlights: {
    lowerIsBetter: string;
    rankedBy: string;
    trendingNow: string;
  };
  /** Feature-card copy keyed by catalog tag token (tag tokens stay English). */
  tagFeatures: Record<string, { title: string; description: string }>;
}

export interface ServerDetailDictionary {
  catalog: {
    active: string;
    archived: string;
  };
  labels: {
    authMode: string;
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
    unknownMode: string;
    version: string;
    website: string;
  };
  /** Copy for the WorldLight server profile page. */
  profile: {
    breadcrumbBack: string;
    gameNames: {
      mcJava: string;
      mcBedrock: string;
    };
    updatedJustNow: string;
    updatedRecently: string;
    links: {
      verifiedTooltip: string;
      unverifiedTooltip: string;
      verifiedByNote: string;
    };
    about: {
      title: string;
    };
    rank: {
      title: string;
      subtitle: string;
    };
    featureCards: {
      title: string;
      subtitle: string;
    };
    media: {
      title: string;
      subtitle: string;
      provenanceChip: string;
    };
    similar: {
      title: string;
    };
    sidebar: {
      joinTitle: string;
      copiedLabel: string;
      copyAddressLabel: string;
      voteLabel: string;
      votedLabel: string;
      stats: {
        onlineNow: string;
        uptime30d: string;
        votes: string;
        standing: string;
      };
      factsTitle: string;
      facts: {
        version: string;
        crossplay: string;
        language: string;
        resets: string;
        listedSince: string;
      };
      factValues: {
        javaBedrock: string;
        pcOnly: string;
        english: string;
        seasonal: string;
        nonePlanned: string;
        mcJavaDefault: string;
      };
      factsFootnote: string;
    };
    voting: {
      heading: string;
      usernameLabel: string;
      usernamePlaceholder: string;
      submitLabel: string;
      submitPendingLabel: string;
      votesThisMonth: string;
      votesAllTime: string;
      successTitle: string;
      successBody: string;
      alreadyVotedTitle: string;
      alreadyVotedBody: string;
      rewardEnabledNote: string;
      rewardNotEnabledNote: string;
      turnstileMissingNote: string;
      checkingStatus: string;
    };
    leaderboard: {
      title: string;
      currentMonth: string;
      previousMonth: string;
      unverifiedNameNote: string;
      emptyState: string;
      rankColumn: string;
      playerColumn: string;
      votesColumn: string;
      loading: string;
      errorState: string;
    };
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

/** Copy for the WorldLight owner console. */
export interface OwnerConsoleDictionary {
  sections: {
    overview: string;
    profile: string;
    media: string;
    trailer: string;
    health: string;
  };
  header: {
    title: string;
    /** Supports a {count} placeholder (number of listed worlds). */
    summary: string;
    listAnotherLabel: string;
  };
  empty: {
    title: string;
    ctaLabel: string;
  };
  /** Supports a {name} placeholder (server being deleted). */
  deleteConfirm: string;
  switcher: {
    pendingBadge: string;
  };
  overview: {
    firstCrawlTitle: string;
    firstCrawlBody: string;
    rankLabel: string;
    rankPending: string;
    /** Supports a {total} placeholder. */
    rankOf: string;
    onlineNowLabel: string;
    standingLabel: string;
    votesLabel: string;
    signalsTitle: string;
    signalsNote: string;
    viewProfileLabel: string;
    trailerCtaLabel: string;
    healthCtaLabel: string;
    deleteLabel: string;
    deletingLabel: string;
  };
  profile: {
    nameLabel: string;
    /** Supports a {url} placeholder (public profile URL). */
    nameHint: string;
    /** Supports a {count} placeholder (characters left). */
    blurbLabel: string;
    /** Supports a {count} placeholder (selected tag count). */
    tagsLabel: string;
    countryLabel: string;
    linksTitle: string;
    linkVerifiedLabel: string;
    linkVerifyCta: string;
    saveLabel: string;
    savedNote: string;
  };
  media: {
    replaceLabel: string;
    /** Supports a {count} placeholder (uploaded screenshot count). */
    screenshotsLabel: string;
    addScreenshotLabel: string;
    policyNote: string;
  };
  trailer: {
    title: string;
    provenanceNote: string;
    lockedTitle: string;
    /** Supports a {name} placeholder (server name). */
    lockNotePending: string;
    renderCta: string;
    filmTitle: string;
    filmBody: string;
    addressNote: string;
    renderingTitle: string;
    renderingBody: string;
    /** Stage labels may use an {addr} placeholder. */
    stages: Array<{ label: string; detail: string }>;
    previewTitle: string;
    previewBody: string;
    publishedTitle: string;
    /** Supports a {slug} placeholder (public profile slug). */
    publishedBody: string;
    /** Supports a {date} placeholder. */
    provenanceDated: string;
    publishCta: string;
    rerenderCta: string;
    publishedBadge: string;
    startOverCta: string;
  };
  health: {
    title: string;
    footnote: string;
    items: {
      ownership: { label: string; note: string };
      freshPing: { label: string; notePending: string; noteLive: string };
      links: { label: string; notePending: string; noteLive: string };
      featureCards: {
        label: string;
        notePending: string;
        /** Supports a {count} placeholder. */
        noteLive: string;
      };
      trailer: {
        label: string;
        notePending: string;
        notePublished: string;
        noteUnrendered: string;
      };
    };
  };
}

export interface LegalPageCopy {
  description: string;
  localeLabel: string;
  title: string;
  /** Status-chip label for the "drafting in progress" placeholder state. */
  noticeBadge: string;
  /** Short reassurance line shown beneath the locale row while the text is drafted. */
  noticeBody: string;
}

export interface ConsolePageCopy {
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
  connectionBanner: ConnectionBannerDictionary;
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
  listFlow: ListFlowDictionary;
  nav: NavigationDictionary;
  ownerConsole: OwnerConsoleDictionary;
  rankSignals: RankSignalsDictionary;
  serverCatalog: ServerCatalogDictionary;
  serverDetail: ServerDetailDictionary;
}
