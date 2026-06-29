// FirstSpawn admin — Collector. Live ping health across the atlas. Last-ping and
// latency are measured (mono); a blinking dot marks servers pinged this cycle.
function ClPing({ s }) {
  const D = window.FS_ADMIN;
  const down = s.status === "offline";
  const slow = !down && s.lastPingSec > 10;
  const live = !down && s.lastPingSec < 6;
  const color = down ? "var(--danger)" : slow ? "var(--muted)" : "var(--success)";
  const label = down ? "Down" : slow ? "Slow" : "OK";
  return (
    <div className="fs-trow fs-pad-y" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1.4fr) 64px 92px 110px 96px", gap: 14, alignItems: "center", padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <span className={live ? "wl-blink" : ""} style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }}></span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.address}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{s.country}</span>
      <window.Measured size={12} color={down ? "var(--muted)" : slow ? "var(--muted)" : "var(--text)"}>{s.latency != null ? s.latency + "ms" : "—"}</window.Measured>
      <window.Measured size={12} color={down ? "var(--danger)" : "var(--muted)"}>{D.ago(s.lastPingSec)}</window.Measured>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color, justifySelf: "end" }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: color }}></span>{label}
      </span>
    </div>
  );
}

function ClStat({ label, value, color, sub }) {
  return (
    <div className="wl-card" style={{ padding: "15px 17px", display: "flex", flexDirection: "column", gap: 7 }}>
      <window.SectionLabel>{label}</window.SectionLabel>
      <window.Measured size={26} weight={700} color={color || "var(--text)"}>{value}</window.Measured>
      {sub && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{sub}</span>}
    </div>
  );
}

function Collector(ctx) {
  const D = window.FS_ADMIN;
  const { Chip } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const [filter, setFilter] = React.useState("all");

  const tag = (s) => s.status === "offline" ? "down" : s.lastPingSec > 10 ? "slow" : "ok";
  const list = D.servers.filter((s) => filter === "all" ? true : tag(s) === filter)
    .sort((a, b) => (b.status === "offline" ? 2 : b.lastPingSec > 10 ? 1 : 0) - (a.status === "offline" ? 2 : a.lastPingSec > 10 ? 1 : 0));

  const filters = [["all", "All"], ["ok", "OK"], ["slow", "Slow"], ["down", "Down"]];
  const head = ["Server", "Address", "Region", "Latency", "Last ping", "Status"];

  return (
    <div>
      <window.PageHead route="collector" right={
        <window.ActionBtn icon="refresh" tone="quiet" onClick={() => ctx.pushToast({ title: "Re-polling atlas", body: "collector · 96 servers queued", tone: "success", icon: "refresh" })}>Re-poll now</window.ActionBtn>
      } />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <ClStat label="24h uptime" value="99.4%" color="var(--success)" sub="ping success rate" />
        <ClStat label="Pinging now" value="96" color="var(--success)" sub="of 100 sampled" />
        <ClStat label="Slow (>120ms)" value="3" color="var(--muted)" sub="degraded, still up" />
        <ClStat label="Down" value="1" color="var(--danger)" sub="no response 90m+" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(([id, label]) => <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>{label}</Chip>)}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
          <span className="wl-blink" style={{ width: 6, height: 6, borderRadius: 999, background: "var(--success)" }}></span>
          polling every 30s
        </span>
      </div>

      <div className="wl-card" style={{ borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1.4fr) 64px 92px 110px 96px", gap: 14, alignItems: "center", padding: "11px 16px", background: "var(--raised)" }}>
          {head.map((h, i) => <span key={h} className="wl-section-label" style={{ textAlign: i === 5 ? "right" : "left" }}>{h}</span>)}
        </div>
        {list.map((s) => <ClPing key={s.slug} s={s} />)}
      </div>
    </div>
  );
}

Object.assign(window, { Collector });
