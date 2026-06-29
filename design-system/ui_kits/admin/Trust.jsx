// FirstSpawn admin — Trust & abuse. Anomaly-detector flags the detector wants a
// human to confirm. Each flag shows its evidence inline; actions log to audit.
function TrEvidence({ f }) {
  const D = window.FS_ADMIN;
  const { SignalMeter } = window.FirstSpawnWorldlightDesignSystem_20af72;
  if (f.kind === "count_mismatch") {
    const ratio = f.metric.measured > 0 ? (f.metric.declared / f.metric.measured).toFixed(1) : "∞";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div><div style={{ fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>Declared</div><window.Declared style={{ marginTop: 4 }}>{D.num(f.metric.declared)}</window.Declared></div>
        <window.Icon name="chevron-right" size={15} color="var(--muted)" />
        <div><div style={{ fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>Measured</div><div style={{ marginTop: 4 }}><window.Measured size={15}>{D.num(f.metric.measured)}</window.Measured></div></div>
        <div style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--danger)" }}>{ratio}× inflated</div>
      </div>
    );
  }
  if (f.kind === "vote_spike") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--muted)" }}>Votes in {f.metric.window}</span>
          <window.Measured size={15} color="var(--danger)">+{D.num(f.metric.delta)}</window.Measured>
        </div>
        <SignalMeter label="Velocity" value={Math.min(100, Math.round(f.metric.delta / 9))} color="var(--danger)" />
        <SignalMeter label="Source spread" value={f.severity === "high" ? 14 : 52} color={f.severity === "high" ? "var(--danger)" : "var(--accent)"} />
      </div>
    );
  }
  // uptime_forgery
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <div><div style={{ fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>Declared uptime</div><window.Declared style={{ marginTop: 4 }}>{f.metric.declared}%</window.Declared></div>
      <window.Icon name="chevron-right" size={15} color="var(--muted)" />
      <div><div style={{ fontFamily: "var(--font-ui)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>Measured 24h</div><div style={{ marginTop: 4 }}><window.Measured size={15} color="var(--danger)">{f.metric.measured}%</window.Measured></div></div>
    </div>
  );
}

function TrFlagCard({ f, ctx }) {
  const D = window.FS_ADMIN;
  const s = D.byId(f.slug);
  const done = ctx.flagState[f.id];
  return (
    <div className="wl-card" style={{ borderRadius: 14, padding: 18, opacity: done ? 0.55 : 1, borderColor: f.severity === "high" && !done ? "color-mix(in srgb, var(--danger) 30%, var(--line))" : "var(--line)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", color: f.severity === "high" ? "var(--danger)" : "var(--muted)", border: "1px solid var(--line)", background: "var(--canvas)" }}>
            <window.Icon name="shield-alert" size={18} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{s.name}</span>
              <window.StatusPill status={s.status} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{D.flagKindName(f.kind)} · {f.id} · {f.evidence} evidence points · {D.ago(f.ageSec)}</div>
          </div>
        </div>
        <window.SeverityTag level={f.severity} />
      </div>

      <p style={{ margin: "13px 0 14px", fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.55, color: "var(--muted)" }}>{f.detail}</p>

      <div style={{ padding: "13px 15px", border: "1px solid var(--line)", borderRadius: 12, background: "var(--canvas)", marginBottom: 14 }}>
        <TrEvidence f={f} />
      </div>

      {done ? (
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, color: done === "actioned" ? "var(--danger)" : "var(--success)" }}>
          <window.Icon name={done === "actioned" ? "ban" : "check"} size={15} />{done === "actioned" ? "Server suspended" : "Flag dismissed"} · logged to audit
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <window.ActionBtn icon="eye" tone="quiet" onClick={() => ctx.pushToast({ title: "Investigation opened", body: f.id + " · assigned to Mara K.", tone: "primary", icon: "eye" })}>Investigate</window.ActionBtn>
          <window.ActionBtn icon="ban" tone="danger" onClick={() => ctx.resolveFlag(f.id, "actioned", "Suspended · " + s.name)}>Suspend server</window.ActionBtn>
          <window.ActionBtn icon="check" tone="quiet" onClick={() => ctx.resolveFlag(f.id, "dismissed", "Flag dismissed · " + s.name)}>Dismiss</window.ActionBtn>
        </div>
      )}
    </div>
  );
}

function Trust(ctx) {
  const D = window.FS_ADMIN;
  const { Chip } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const [filter, setFilter] = React.useState("open");
  const open = D.flags.filter((f) => !ctx.flagState[f.id]);
  let list = D.flags;
  if (filter === "open") list = open;
  else if (filter === "high") list = D.flags.filter((f) => f.severity === "high");
  else if (filter === "resolved") list = D.flags.filter((f) => ctx.flagState[f.id]);

  const filters = [["open", "Open (" + open.length + ")"], ["high", "High severity"], ["resolved", "Resolved"], ["all", "All"]];

  return (
    <div>
      <window.PageHead route="trust" right={
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{open.filter((f) => f.severity === "high").length} high · {open.length} open</div>
      } />
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {filters.map(([id, label]) => <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>{label}</Chip>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {list.map((f) => <TrFlagCard key={f.id} f={f} ctx={ctx} />)}
        {list.length === 0 && <div className="wl-dashed" style={{ borderRadius: 14, padding: 40, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)" }}>No flags here. The atlas is quiet.</div>}
      </div>
    </div>
  );
}

Object.assign(window, { Trust });
