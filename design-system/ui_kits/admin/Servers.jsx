// FirstSpawn admin — Servers. The ranked atlas as a measured table with filters
// and per-row actions. Online counts are collector-measured (mono); rank uses
// the same activity×trust×freshness math shown elsewhere.
function SvRow({ s, rank, ctx }) {
  const D = window.FS_ADMIN;
  const { SignalBars, Badge } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const sig = D.signals(s);
  return (
    <div className="fs-trow fs-pad-y" style={{ display: "grid", gridTemplateColumns: "44px minmax(0,2.1fr) 1fr 1.1fr 80px 78px 1.2fr 150px", gap: 14, alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: rank === 1 ? "var(--gold)" : "var(--muted)" }}>{String(rank).padStart(2, "0")}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <window.Avatar name={s.name} size={30} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
            {s.verified && <Badge tone="verified">Verified</Badge>}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.address}</div>
        </div>
      </div>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--muted)" }}>{D.gameName(s.game)} · {s.country}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <window.Measured size={12.5} color={s.online > 0 ? "var(--success)" : "var(--muted)"}>{D.num(s.online)}</window.Measured>
        <SignalBars value={sig.activity} color={s.online > 0 ? "var(--success)" : "var(--line)"} segments={12} height={4} width={null} style={{ width: "100%" }} />
      </div>
      <window.Measured size={12.5} color={s.uptime < 90 ? "var(--danger)" : "var(--text)"}>{s.uptime}%</window.Measured>
      <window.Measured size={12.5} color="var(--text)">{D.compact(s.votes)}</window.Measured>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: sig.trust < 50 ? "var(--danger)" : "var(--muted)" }}>{sig.trust}/100</span>
        <SignalBars value={sig.trust} color={sig.trust < 50 ? "var(--danger)" : "var(--accent)"} segments={12} height={4} width={null} style={{ width: "100%" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
        <window.StatusPill status={s.status} />
        <window.ActionBtn icon="eye" tone="quiet" title="View" onClick={() => ctx.pushToast({ title: "Opening " + s.name, body: s.address + " · server detail", tone: "primary", icon: "external" })} />
      </div>
    </div>
  );
}

function Servers(ctx) {
  const D = window.FS_ADMIN;
  const { WLInput, WLSelect, Chip } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const [q, setQ] = React.useState("");
  const [game, setGame] = React.useState("all");
  const [status, setStatus] = React.useState("all");

  const ranked = [...D.servers].sort((a, b) => {
    const ra = D.signals(a), rb = D.signals(b);
    return (rb.activity * rb.trust * rb.freshness) - (ra.activity * ra.trust * ra.freshness);
  });
  const filtered = ranked.filter((s) =>
    (game === "all" || s.game === game) &&
    (status === "all" || (status === "flagged" ? (s.status === "flagged") : status === "verified" ? s.verified : status === "attention" ? (s.status === "flagged" || s.status === "offline" || s.status === "pending") : true)) &&
    (q === "" || s.name.toLowerCase().includes(q.toLowerCase()) || s.address.toLowerCase().includes(q.toLowerCase()))
  );

  const gameOpts = [{ value: "all", label: "All games" }, { value: "hytale", label: "Hytale" }, { value: "mc_java", label: "Minecraft Java" }, { value: "mc_bedrock", label: "Minecraft Bedrock" }];
  const statusFilters = [["all", "All"], ["verified", "Verified"], ["attention", "Needs attention"], ["flagged", "Flagged"]];
  const head = ["Rank", "Server", "Game · region", "Online", "Uptime", "Votes", "Trust", "Status"];

  return (
    <div>
      <window.PageHead route="servers" right={
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{filtered.length} of {D.servers.length} shown</div>
      } />

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ width: 280, maxWidth: "100%" }}>
          <WLInput placeholder="Search name or address…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div style={{ width: 190 }}>
          <WLSelect options={gameOpts} value={game} onChange={(e) => setGame(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
          {statusFilters.map(([id, label]) => <Chip key={id} active={status === id} onClick={() => setStatus(id)}>{label}</Chip>)}
        </div>
      </div>

      <div className="wl-card" style={{ borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "44px minmax(0,2.1fr) 1fr 1.1fr 80px 78px 1.2fr 150px", gap: 14, alignItems: "center", padding: "11px 16px", background: "var(--raised)" }}>
          {head.map((h, i) => <span key={h} className="wl-section-label" style={{ textAlign: i >= 7 ? "right" : "left" }}>{h}</span>)}
        </div>
        {filtered.map((s, i) => <SvRow key={s.slug} s={s} rank={i + 1} ctx={ctx} />)}
        {filtered.length === 0 && <div className="wl-dashed" style={{ margin: 16, borderRadius: 12, padding: 36, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)" }}>No servers match those filters.</div>}
      </div>
      <div style={{ marginTop: 12, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", display: "flex", alignItems: "center", gap: 7 }}>
        <window.Icon name="info" size={13} color="var(--muted)" />
        Rank = activity × trust × freshness · same math for every server · never sold.
      </div>
    </div>
  );
}

Object.assign(window, { Servers });
