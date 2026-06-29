// FirstSpawn admin — Overview. The "calm observatory": platform KPIs + a triage
// digest of everything that wants a human (verification, flags, collector, audit).
function OvKpi({ label, icon, value, unit, sub, delta, bar, barColor, onClick }) {
  const { SignalBars } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const up = delta && delta.dir === "up";
  const good = delta && delta.good !== false;
  return (
    <div className={"wl-card fs-kpi" + (onClick ? " wl-card--clickable" : "")} onClick={onClick}
      style={{ padding: "16px 17px", display: "flex", flexDirection: "column", gap: 11, cursor: onClick ? "pointer" : "default" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <window.SectionLabel>{label}</window.SectionLabel>
        <window.Icon name={icon} size={16} color="var(--muted)" />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <window.Measured size={30} weight={700}>{value}</window.Measured>
        {unit && <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)" }}>{unit}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {delta && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 600, color: good ? "var(--success)" : "var(--danger)" }}>
            <window.Icon name={up ? "arrow-up-right" : "arrow-down-right"} size={13} />{delta.text}
          </span>
        )}
        {sub && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{sub}</span>}
      </div>
      {bar != null && <SignalBars value={bar} color={barColor || "var(--success)"} segments={16} width={null} height={4} style={{ width: "100%" }} />}
    </div>
  );
}

const OV_VERB = {
  granted: "var(--success)", restored: "var(--success)",
  suspended: "var(--danger)", "marked down": "var(--danger)", flagged: "var(--danger)",
  escalated: "var(--accent)", dismissed: "var(--muted)", recomputed: "var(--muted)",
};
function OvAuditRow({ e }) {
  const D = window.FS_ADMIN;
  const system = e.role === "system";
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 0", borderTop: "1px solid var(--line)" }}>
      <window.Avatar name={e.actor} system={system} size={26} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)", lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600 }}>{e.actor}</span>{" "}
          <span style={{ color: OV_VERB[e.action] || "var(--muted)", fontWeight: 600 }}>{e.action}</span>{" "}
          <span style={{ color: "var(--text)" }}>{e.target}</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.note}</div>
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--muted)", whiteSpace: "nowrap" }}>{D.ago(e.ageSec)}</span>
    </div>
  );
}

function OvQueueItem({ q, ctx }) {
  const D = window.FS_ADMIN;
  const s = D.byId(q.slug);
  const done = ctx.resolved[q.id];
  return (
    <div className="fs-trow" style={{ display: "grid", gridTemplateColumns: "26px minmax(0,1fr) auto", gap: 12, alignItems: "center", padding: "11px 8px", borderTop: "1px solid var(--line)", opacity: done ? 0.5 : 1 }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", color: q.kind === "report" ? "var(--danger)" : "var(--muted)", border: "1px solid var(--line)", background: "var(--canvas)" }}>
        <window.Icon name={q.kind === "report" ? "flag" : "shield-check"} size={13} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.title}</span>
          {q.escalated && <window.SeverityTag level="high" />}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.name} · {q.id} · {D.ago(q.ageSec)}</div>
      </div>
      {done
        ? <span style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, color: done === "rejected" ? "var(--danger)" : "var(--success)" }}>{done}</span>
        : <div style={{ display: "flex", gap: 7 }}>
            <window.ActionBtn icon="check" tone="success" title="Approve" onClick={() => ctx.resolveQueue(q.id, "approved", "Approved · " + q.title)} />
            <window.ActionBtn icon="x" tone="quiet" title="Reject" onClick={() => ctx.resolveQueue(q.id, "rejected", "Rejected · " + q.title)} />
          </div>}
    </div>
  );
}

function OvFlagRow({ f, ctx }) {
  const D = window.FS_ADMIN;
  const s = D.byId(f.slug);
  const done = ctx.flagState[f.id];
  return (
    <div className="fs-trow" style={{ padding: "12px 8px", borderTop: "1px solid var(--line)", opacity: done ? 0.5 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <window.Avatar name={s.name} size={24} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{D.flagKindName(f.kind)} · {f.id}</div>
          </div>
        </div>
        <window.SeverityTag level={f.severity} />
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", marginTop: 7, lineHeight: 1.45 }}>{f.detail}</div>
    </div>
  );
}

function Overview(ctx) {
  const D = window.FS_ADMIN;
  const k = D.kpis;
  const openQueue = D.queue.filter((q) => !ctx.resolved[q.id]);
  const openFlags = D.flags.filter((f) => !ctx.flagState[f.id]);
  const slow = D.servers.filter((s) => s.status === "offline" || s.lastPingSec > 10);

  return (
    <div>
      <window.PageHead route="overview" right={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <window.ActionBtn icon="refresh" tone="quiet" onClick={() => ctx.pushToast({ title: "Atlas refreshed", body: "collector · 96 servers re-polled", tone: "success", icon: "refresh" })}>Refresh</window.ActionBtn>
        </div>
      } />

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        <OvKpi label="Servers tracked" icon="server" value={D.num(k.serversActive)} unit={"/ " + k.serversTotal + " active"}
          delta={{ dir: "up", text: "+" + k.serversDelta + " today", good: true }} bar={Math.round((k.serversActive / k.serversTotal) * 100)} barColor="var(--accent)" />
        <OvKpi label="Players online" icon="users" value={D.compact(k.playersOnline)} unit="measured"
          delta={{ dir: "up", text: "+" + k.playersDeltaPct + "% vs yesterday", good: true }} sub="peak 41.2k" />
        <OvKpi label="Votes today" icon="trending-up" value={D.compact(k.votesToday)}
          delta={{ dir: "up", text: "+" + D.compact(k.votesDelta), good: true }} sub="from 4,310 voters" />
        <OvKpi label="Collector uptime" icon="dish" value={k.collectorUptime} unit="% · 24h"
          delta={{ dir: "down", text: k.collectorUptimeDelta + "pp", good: false }} bar={k.collectorUptime} barColor="var(--success)" />
      </div>

      {/* Attention tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div className="wl-card wl-card--clickable" onClick={() => ctx.go("verification")} style={{ padding: "15px 17px", display: "flex", alignItems: "center", gap: 15, cursor: "pointer" }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", border: "1px solid color-mix(in srgb, var(--accent) 40%, var(--line))", background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}><window.Icon name="shield-check" size={20} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <window.Measured size={22} weight={700} color="var(--accent)">{openQueue.length}</window.Measured>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>awaiting verification</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{openQueue.filter((q) => q.priority === "high").length} high priority · oldest {D.ago(Math.max(...openQueue.map((q) => q.ageSec), 0))}</div>
          </div>
          <window.Icon name="chevron-right" size={18} color="var(--muted)" />
        </div>
        <div className="wl-card wl-card--clickable" onClick={() => ctx.go("trust")} style={{ padding: "15px 17px", display: "flex", alignItems: "center", gap: 15, cursor: "pointer" }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--danger)", border: "1px solid color-mix(in srgb, var(--danger) 40%, var(--line))", background: "color-mix(in srgb, var(--danger) 10%, transparent)" }}><window.Icon name="shield-alert" size={20} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <window.Measured size={22} weight={700} color="var(--danger)">{openFlags.length}</window.Measured>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>open trust flags</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{openFlags.filter((f) => f.severity === "high").length} high severity · anomaly detector</div>
          </div>
          <window.Icon name="chevron-right" size={18} color="var(--muted)" />
        </div>
      </div>

      {/* Two-column digest */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <window.Panel title="Verification queue" sub={openQueue.length + " open · " + D.queue.filter((q) => q.kind === "claim").length + " claims · " + D.queue.filter((q) => q.kind === "report").length + " reports"} pad={false}
            action={<window.ActionBtn tone="quiet" onClick={() => ctx.go("verification")}>Open queue</window.ActionBtn>}>
            <div style={{ padding: "0 8px 6px" }}>
              {openQueue.slice(0, 4).map((q) => <OvQueueItem key={q.id} q={q} ctx={ctx} />)}
              {openQueue.length === 0 && <div className="wl-dashed" style={{ margin: 12, borderRadius: 12, padding: 24, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>Queue clear — nothing awaiting review.</div>}
            </div>
          </window.Panel>

          <window.Panel title="Recent activity" sub="moderation + system" pad={false}
            action={<window.ActionBtn tone="quiet" onClick={() => ctx.go("audit")}>Full log</window.ActionBtn>}>
            <div style={{ padding: "0 16px 8px" }}>
              {D.audit.slice(0, 6).map((e) => <OvAuditRow key={e.id} e={e} />)}
            </div>
          </window.Panel>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <window.Panel title="Trust & abuse" sub={openFlags.length + " open flags"} pad={false}
            action={<window.ActionBtn tone="quiet" onClick={() => ctx.go("trust")}>Review</window.ActionBtn>}>
            <div style={{ padding: "0 8px 6px" }}>
              {openFlags.slice(0, 3).map((f) => <OvFlagRow key={f.id} f={f} ctx={ctx} />)}
            </div>
          </window.Panel>

          <window.Panel title="Collector" sub="96 ok · 3 slow · 1 down">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <window.Measured size={26} weight={700} color="var(--success)">99.4<span style={{ fontSize: 13, color: "var(--muted)" }}>%</span></window.Measured>
                <div style={{ flex: 1 }}>
                  <window.SectionLabel>24h ping success</window.SectionLabel>
                  <div style={{ marginTop: 6 }}>{(() => { const { SignalBars } = window.FirstSpawnWorldlightDesignSystem_20af72; return <SignalBars value={99.4} color="var(--success)" segments={20} height={5} style={{ width: "100%" }} />; })()}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, borderTop: "1px solid var(--line)", paddingTop: 4 }}>
                {slow.map((s) => {
                  const { StatusDot } = window.FirstSpawnWorldlightDesignSystem_20af72;
                  const down = s.status === "offline";
                  return (
                    <div key={s.slug} className="fs-trow" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 6px", borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: down ? "var(--danger)" : "var(--muted)", flexShrink: 0 }}></span>
                        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{s.name}</span>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: down ? "var(--danger)" : "var(--muted)" }}>{down ? "down · " + D.ago(s.lastPingSec) : s.latency + "ms · " + D.ago(s.lastPingSec)}</span>
                    </div>
                  );
                })}
              </div>
              <window.ActionBtn tone="quiet" onClick={() => ctx.go("collector")}>Open collector</window.ActionBtn>
            </div>
          </window.Panel>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Overview });
