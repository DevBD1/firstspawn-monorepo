// FirstSpawn admin console — mock data + helpers.
// Internal staff view: the atlas as a "calm observatory". Measured values are
// what the collector pinged; declared values are owner-submitted (the trust cue).
window.FS_ADMIN = (function () {
  // status: live | verified | pending | flagged | suspended | offline
  const servers = [
    { slug: "aether",     name: "Aether Realms", game: "hytale",      country: "DE", online: 1284, declared: 1300, max: 2000, uptime: 99.6, votes: 4200, votesToday: 312, verified: true,  status: "live",      lastPingSec: 3,    latency: 41,  address: "play.aether.gg",        owner: "mara.k",     since: "2024-08" },
    { slug: "lumenvale",  name: "Lumenvale",     game: "hytale",      country: "NO", online: 1502, declared: 1500, max: 2400, uptime: 99.8, votes: 5100, votesToday: 418, verified: true,  status: "live",      lastPingSec: 1,    latency: 33,  address: "play.lumenvale.world",  owner: "toves",      since: "2024-05" },
    { slug: "hollowreach",name: "Hollowreach",   game: "hytale",      country: "JP", online: 833,  declared: 840,  max: 1400, uptime: 99.2, votes: 3010, votesToday: 207, verified: true,  status: "live",      lastPingSec: 2,    latency: 58,  address: "play.hollowreach.jp",   owner: "kenji.r",    since: "2024-11" },
    { slug: "skyhaven",   name: "Skyhaven SMP",  game: "mc_java",     country: "US", online: 942,  declared: 950,  max: 1500, uptime: 99.4, votes: 3850, votesToday: 266, verified: true,  status: "verified",  lastPingSec: 6,    latency: 72,  address: "mc.skyhaven.net",       owner: "dana_w",     since: "2024-03" },
    { slug: "groveholt",  name: "Groveholt",     game: "mc_java",     country: "CA", online: 466,  declared: 470,  max: 800,  uptime: 99.1, votes: 1980, votesToday: 121, verified: true,  status: "verified",  lastPingSec: 4,    latency: 64,  address: "play.groveholt.ca",     owner: "fern",       since: "2025-01" },
    { slug: "varskeep",   name: "Varskeep",      game: "mc_java",     country: "FI", online: 254,  declared: 250,  max: 500,  uptime: 99.5, votes: 1320, votesToday: 64,  verified: true,  status: "verified",  lastPingSec: 5,    latency: 49,  address: "mc.varskeep.eu",        owner: "oksi",       since: "2025-02" },
    { slug: "ironhold",   name: "Ironhold",      game: "mc_java",     country: "GB", online: 610,  declared: 620,  max: 900,  uptime: 98.7, votes: 2900, votesToday: 188, verified: false, status: "pending",   lastPingSec: 9,    latency: 88,  address: "play.ironhold.gg",      owner: "b.solace",   since: "2025-05" },
    { slug: "saltmarsh",  name: "Saltmarsh",     game: "mc_java",     country: "AU", online: 177,  declared: 180,  max: 400,  uptime: 98.2, votes: 740,  votesToday: 51,  verified: false, status: "pending",   lastPingSec: 12,   latency: 121, address: "play.saltmarsh.au",     owner: "reef.io",    since: "2025-06" },
    { slug: "emberfall",  name: "Emberfall",     game: "hytale",      country: "TR", online: 720,  declared: 2400, max: 1100, uptime: 97.9, votes: 2210, votesToday: 96,  verified: false, status: "flagged",   lastPingSec: 7,    latency: 96,  address: "play.emberfall.gg",     owner: "atlas99",    since: "2025-04" },
    { slug: "tideborn",   name: "Tideborn",      game: "mc_bedrock",  country: "BR", online: 388,  declared: 5000, max: 700,  uptime: 96.4, votes: 1740, votesToday: 47,  verified: false, status: "flagged",   lastPingSec: 8,    latency: 134, address: "play.tideborn.gg",      owner: "marejad",    since: "2025-05" },
    { slug: "nethershore",name: "Nethershore",   game: "mc_bedrock",  country: "MX", online: 512,  declared: 520,  max: 900,  uptime: 98.0, votes: 3120, votesToday: 812, verified: false, status: "flagged",   lastPingSec: 6,    latency: 102, address: "play.nethershore.mx",   owner: "lobo",       since: "2025-03" },
    { slug: "cragmoor",   name: "Cragmoor",      game: "mc_java",     country: "PL", online: 0,    declared: 600,  max: 900,  uptime: 71.3, votes: 1450, votesToday: 0,   verified: true,  status: "offline",   lastPingSec: 5400, latency: null,address: "mc.cragmoor.pl",       owner: "wisla",      since: "2024-09" },
  ];

  // Verification queue — claims (prove ownership) and reports (dispute data).
  const queue = [
    { id: "VQ-2041", kind: "report", slug: "tideborn",    title: "Inflated player count",      detail: "Owner-declared peak of 5,000 players. Collector has never measured above 700 in 30 days.", priority: "high",     escalated: false, ageSec: 240,   reporter: "system.anomaly" },
    { id: "VQ-2039", kind: "report", slug: "nethershore", title: "Suspected vote manipulation", detail: "+812 votes in a 58-minute window from a narrow IP range. Pattern matches a botnet signature.", priority: "high",     escalated: true,  ageSec: 1080,  reporter: "system.anomaly" },
    { id: "VQ-2036", kind: "claim",  slug: "ironhold",    title: "Ownership claim",            detail: "Claimant added the requested DNS TXT record. Awaiting a final propagation check before grant.", priority: "medium",   escalated: false, ageSec: 5400,  reporter: "b.solace" },
    { id: "VQ-2034", kind: "report", slug: "emberfall",   title: "Inflated player count",      detail: "Declared 2,400 against a measured peak of 760. Below Tideborn severity but trending up.", priority: "medium",   escalated: false, ageSec: 9000,  reporter: "p.castellan" },
    { id: "VQ-2031", kind: "claim",  slug: "saltmarsh",   title: "Ownership claim",            detail: "New listing claim. DNS TXT not yet detected — claimant notified, awaiting record.",        priority: "low",      escalated: false, ageSec: 16200, reporter: "reef.io" },
    { id: "VQ-2029", kind: "report", slug: "cragmoor",    title: "Re-verify after outage",     detail: "Collector lost contact 90 minutes ago. Confirm whether the host migrated or went dark.",   priority: "medium",   escalated: false, ageSec: 5400,  reporter: "system.collector" },
    { id: "VQ-2025", kind: "report", slug: "hollowreach", title: "Brand impersonation",        detail: "A second listing reuses Hollowreach's name and sigil. Owner filed a takedown.",            priority: "low",      escalated: false, ageSec: 28800, reporter: "kenji.r" },
  ];

  // Trust / anti-abuse flags raised by the anomaly detector.
  const flags = [
    { id: "FL-118", slug: "tideborn",    kind: "count_mismatch",  severity: "high",   metric: { declared: 5000, measured: 388 },  detail: "Declared count is 12.9× the 30-day measured peak.", evidence: 18, ageSec: 240 },
    { id: "FL-117", slug: "nethershore", kind: "vote_spike",      severity: "high",   metric: { window: "58m", delta: 812 },       detail: "Vote velocity 41× baseline from a /24 subnet.",     evidence: 23, ageSec: 1080 },
    { id: "FL-114", slug: "emberfall",   kind: "count_mismatch",  severity: "medium", metric: { declared: 2400, measured: 720 },   detail: "Declared count 3.3× measured peak. Watch-listed.",  evidence: 9,  ageSec: 9000 },
    { id: "FL-112", slug: "cragmoor",    kind: "uptime_forgery",  severity: "medium", metric: { declared: 99.9, measured: 71.3 },  detail: "Declared uptime contradicts collector log gaps.",   evidence: 6,  ageSec: 5400 },
    { id: "FL-109", slug: "saltmarsh",   kind: "vote_spike",      severity: "low",    metric: { window: "3h", delta: 74 },         detail: "Mild vote bump, single source. Low confidence.",    evidence: 3,  ageSec: 16200 },
  ];

  // Recent moderation + system activity (audit log).
  const audit = [
    { id: "A-5521", actor: "mara.k",          role: "mod",    action: "granted",   target: "Aether Realms", note: "ownership verified · DNS TXT",          ageSec: 600 },
    { id: "A-5520", actor: "system.collector",role: "system", action: "marked down",target: "Cragmoor",      note: "no response for 90m",                   ageSec: 5400 },
    { id: "A-5519", actor: "system.anomaly",  role: "system", action: "flagged",    target: "Tideborn",      note: "count_mismatch · severity high",        ageSec: 240 },
    { id: "A-5518", actor: "j.okonkwo",       role: "mod",    action: "suspended",  target: "Hollow II",     note: "brand impersonation · takedown",        ageSec: 1800 },
    { id: "A-5517", actor: "system.rank",     role: "system", action: "recomputed", target: "atlas",         note: "142 servers · rank = activity×trust×freshness", ageSec: 2700 },
    { id: "A-5516", actor: "mara.k",          role: "mod",    action: "dismissed",  target: "Varskeep",      note: "vote_spike · false positive",           ageSec: 4200 },
    { id: "A-5515", actor: "p.castellan",     role: "mod",    action: "escalated",  target: "Nethershore",   note: "vote manipulation · to trust lead",     ageSec: 1080 },
    { id: "A-5514", actor: "system.collector",role: "system", action: "restored",   target: "Skyhaven SMP",  note: "ping resumed · 72ms",                   ageSec: 7200 },
  ];

  // Platform-wide KPIs (the whole atlas, not just the sample above).
  const kpis = {
    serversActive: 96, serversTotal: 142, serversDelta: 4,
    playersOnline: 38402, playersDeltaPct: 6.2,
    votesToday: 12847, votesDelta: 2100,
    collectorUptime: 99.4, collectorUptimeDelta: -0.3,
  };

  const games = { mc_java: "Minecraft Java", mc_bedrock: "Minecraft Bedrock", hytale: "Hytale" };
  const gameName = (g) => games[g] || "Game";
  const flagKindName = (k) => ({ count_mismatch: "Count mismatch", vote_spike: "Vote spike", uptime_forgery: "Uptime forgery" }[k] || k);

  function ago(sec) {
    if (sec < 60) return sec + "s ago";
    const m = Math.floor(sec / 60);
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }
  function num(n) { return n.toLocaleString("en-US"); }
  function compact(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
    return String(n);
  }
  const byId = (slug) => servers.find((s) => s.slug === slug) || { name: slug, country: "—", game: "" };

  // Simple Worldlight signal math (mirrors the web kit).
  function signals(s) {
    const activity = s.max > 0 ? Math.min(100, Math.max(4, Math.round((s.online / s.max) * 100))) : 0;
    const charSum = s.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const trust = s.status === "flagged" ? 28 + (charSum % 18) : 64 + (charSum % 31);
    const freshness = s.status === "offline" ? 8 : Math.max(20, 100 - Math.min(80, Math.floor(s.lastPingSec / 6)));
    return { activity, trust, freshness };
  }

  return { servers, queue, flags, audit, kpis, signals, gameName, flagKindName, ago, num, compact, byId };
})();
