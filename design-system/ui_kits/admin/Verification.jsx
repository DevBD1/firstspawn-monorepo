// FirstSpawn admin — Verification. Master/detail triage of claims (prove
// ownership) and reports (dispute data). The detail centers the trust cue:
// owner-DECLARED values (dashed, muted) set against collector-MEASURED values.
function VqEvidence({ q }) {
  const D = window.FS_ADMIN;
  const s = D.byId(q.slug);
  const sig = D.signals(s);

  if (q.kind === "claim") {
    const txtFound = q.id !== "VQ-2031";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <window.SectionLabel>Ownership evidence</window.SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["Claimant", q.reporter], ["Listed owner", s.owner], ["Address", s.address], ["Listed since", s.since]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--muted)" }}>{k}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text)" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, border: "1px solid " + (txtFound ? "color-mix(in srgb, var(--success) 40%, var(--line))" : "var(--line)"), borderStyle: txtFound ? "solid" : "dashed", background: txtFound ? "color-mix(in srgb, var(--success) 8%, transparent)" : "transparent" }}>
          <window.Icon name={txtFound ? "check" : "clock"} size={16} color={txtFound ? "var(--success)" : "var(--muted)"} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>DNS TXT verification</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{txtFound ? "_firstspawn=" + s.slug + "-ok · record detected" : "record not yet detected · claimant notified"}</div>
          </div>
        </div>
      </div>
    );
  }

  // report — declared vs measured
  const declared = s.declared, measured = s.online;
  const ratio = measured > 0 ? (declared / measured).toFixed(1) : "∞";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <window.SectionLabel>Declared vs. measured</window.SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: "13px 14px", border: "1px dashed var(--line)", borderRadius: 12, background: "transparent" }}>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>Owner-declared</div>
          <div style={{ marginTop: 7 }}><window.Measured size={24} weight={700} color="var(--muted)">{D.num(declared)}</window.Measured></div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--muted)", marginTop: 3 }}>self-reported peak</div>
        </div>
        <div style={{ padding: "13px 14px", border: "1px solid color-mix(in srgb, var(--danger) 35%, var(--line))", borderRadius: 12, background: "color-mix(in srgb, var(--danger) 7%, transparent)" }}>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--danger)" }}>Collector-measured</div>
          <div style={{ marginTop: 7 }}><window.Measured size={24} weight={700} color="var(--text)">{D.num(measured)}</window.Measured></div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--muted)", marginTop: 3 }}>30-day measured peak</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--danger)" }}>
        <window.Icon name="alert" size={14} color="var(--danger)" />
        declared is {ratio}× the measured peak
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
        <window.SectionLabel>Live signal breakdown</window.SectionLabel>
        {(() => { const { SignalMeter } = window.FirstSpawnWorldlightDesignSystem_20af72; return (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <SignalMeter label="Activity" value={sig.activity} color="var(--success)" />
            <SignalMeter label="Trust" value={sig.trust} color={sig.trust < 50 ? "var(--danger)" : "var(--accent)"} />
            <SignalMeter label="Freshness" value={sig.freshness} color="var(--accent)" />
          </div>
        ); })()}
      </div>
    </div>
  );
}

function VqDetail({ q, ctx }) {
  const D = window.FS_ADMIN;
  const s = D.byId(q.slug);
  const done = ctx.resolved[q.id];
  if (!q) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{q.kind}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>· {q.id}</span>
          {q.escalated && <window.SeverityTag level="high" />}
        </div>
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "var(--text)" }}>{q.title}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9 }}>
          <window.Avatar name={s.name} size={24} />
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{s.name}</span>
          {(() => { const { Badge } = window.FirstSpawnWorldlightDesignSystem_20af72; return <Badge tone="country">{s.country}</Badge>; })()}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>· {D.gameName(s.game)} · filed {D.ago(q.ageSec)} by {q.reporter}</span>
        </div>
      </div>

      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.6, color: "var(--muted)" }}>{q.detail}</p>

      <div style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 12, background: "var(--canvas)" }}>
        <VqEvidence q={q} />
      </div>

      {done ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 15px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--raised)" }}>
          <window.Icon name={done === "rejected" ? "x" : done === "escalated" ? "arrow-up-right" : "check"} size={16} color={done === "rejected" ? "var(--danger)" : done === "escalated" ? "var(--accent)" : "var(--success)"} />
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--text)", textTransform: "capitalize" }}>{done}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>· logged to audit as Mara K.</span>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <window.ActionBtn icon="check" tone="primary" onClick={() => ctx.resolveQueue(q.id, "approved", (q.kind === "claim" ? "Claim granted · " : "Report upheld · ") + s.name)}>{q.kind === "claim" ? "Grant ownership" : "Uphold & flag"}</window.ActionBtn>
          <window.ActionBtn icon="x" tone="danger" onClick={() => ctx.resolveQueue(q.id, "rejected", "Dismissed · " + q.title)}>{q.kind === "claim" ? "Deny" : "Dismiss"}</window.ActionBtn>
          <window.ActionBtn icon="arrow-up-right" tone="quiet" onClick={() => ctx.resolveQueue(q.id, "escalated", "Escalated · " + q.title)}>Escalate</window.ActionBtn>
          <window.ActionBtn icon="info" tone="quiet" onClick={() => ctx.pushToast({ title: "Info requested", body: q.id + " · owner notified", tone: "primary", icon: "info" })}>Request info</window.ActionBtn>
        </div>
      )}
    </div>
  );
}

function Verification(ctx) {
  const D = window.FS_ADMIN;
  const { Chip } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const [filter, setFilter] = React.useState("all");
  const list = D.queue.filter((q) => filter === "all" ? true : filter === "escalated" ? q.escalated : q.kind === filter);
  const firstOpen = (D.queue.find((q) => !ctx.resolved[q.id]) || D.queue[0]).id;
  const [selId, setSelId] = React.useState(firstOpen);
  const sel = D.queue.find((q) => q.id === selId) || list[0];

  const filters = [["all", "All"], ["claim", "Claims"], ["report", "Reports"], ["escalated", "Escalated"]];

  return (
    <div>
      <window.PageHead route="verification" right={
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{D.queue.filter((q) => !ctx.resolved[q.id]).length} open · {D.queue.length} total</div>
      } />

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(([id, label]) => <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>{label}</Chip>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) 1.5fr", gap: 16, alignItems: "start" }}>
        <div className="wl-card" style={{ borderRadius: 14, overflow: "hidden" }}>
          {list.map((q) => {
            const s = D.byId(q.slug);
            const active = sel && sel.id === q.id;
            const done = ctx.resolved[q.id];
            return (
              <button key={q.id} className="fs-trow fs-pad-y" onClick={() => setSelId(q.id)} style={{
                display: "grid", gridTemplateColumns: "26px minmax(0,1fr) auto", gap: 11, alignItems: "center", width: "100%", textAlign: "left", cursor: "pointer",
                padding: "13px 13px", borderBottom: "1px solid var(--line)", borderLeft: "3px solid " + (active ? "var(--accent)" : "transparent"),
                background: active ? "var(--raised)" : "transparent", opacity: done ? 0.55 : 1,
              }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", color: q.kind === "report" ? "var(--danger)" : "var(--muted)", border: "1px solid var(--line)", background: "var(--canvas)" }}>
                  <window.Icon name={q.kind === "report" ? "flag" : "shield-check"} size={13} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.name} · {D.ago(q.ageSec)}</div>
                </div>
                {done ? <window.Icon name="check" size={15} color="var(--success)" /> : <window.SeverityTag level={q.priority} />}
              </button>
            );
          })}
        </div>

        <div className="wl-card" style={{ borderRadius: 14, padding: 22, position: "sticky", top: 84 }}>
          {sel ? <VqDetail q={sel} ctx={ctx} /> : <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>Select an item.</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Verification });
