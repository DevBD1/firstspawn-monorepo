// FirstSpawn admin — Audit log. Every moderation + system action, in order.
// Honest provenance: who (or what system) did what, to which target, when.
const AU_VERB = {
  granted: "var(--success)", restored: "var(--success)",
  suspended: "var(--danger)", "marked down": "var(--danger)", flagged: "var(--danger)",
  escalated: "var(--accent)", dismissed: "var(--muted)", recomputed: "var(--muted)",
};

function AuRow({ e, last }) {
  const D = window.FS_ADMIN;
  const system = e.role === "system";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", gap: 14, alignItems: "flex-start", padding: "14px 16px", borderBottom: last ? "none" : "1px solid var(--line)" }} className="fs-trow">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <window.Avatar name={e.actor} system={system} size={30} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--text)", lineHeight: 1.45 }}>
          <span style={{ fontWeight: 600 }}>{e.actor}</span>{" "}
          <span style={{ color: AU_VERB[e.action] || "var(--muted)", fontWeight: 600 }}>{e.action}</span>{" "}
          <span style={{ color: "var(--text)" }}>{e.target}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{e.note}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>{D.ago(e.ageSec)}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", padding: "1px 6px", border: "1px solid var(--line)", borderRadius: 6 }}>{e.id}</span>
      </div>
    </div>
  );
}

function Audit(ctx) {
  const D = window.FS_ADMIN;
  const { Chip } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const [filter, setFilter] = React.useState("all");
  const list = D.audit.filter((e) => filter === "all" ? true : filter === "mod" ? e.role === "mod" : e.role === "system");
  const filters = [["all", "All"], ["mod", "Moderators"], ["system", "System"]];

  return (
    <div>
      <window.PageHead route="audit" right={
        <window.ActionBtn icon="external" tone="quiet" onClick={() => ctx.pushToast({ title: "Export started", body: "audit log · CSV · last 30 days", tone: "primary", icon: "external" })}>Export</window.ActionBtn>
      } />

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(([id, label]) => <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>{label}</Chip>)}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 2px 10px" }}>
        <window.SectionLabel>Today</window.SectionLabel>
        <span style={{ flex: 1, height: 1, background: "var(--line)" }}></span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{list.length} events</span>
      </div>

      <div className="wl-card" style={{ borderRadius: 14, overflow: "hidden" }}>
        {list.map((e, i) => <AuRow key={e.id} e={e} last={i === list.length - 1} />)}
        {list.length === 0 && <div className="wl-dashed" style={{ margin: 16, borderRadius: 12, padding: 36, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)" }}>No events for this filter.</div>}
      </div>
    </div>
  );
}

Object.assign(window, { Audit });
