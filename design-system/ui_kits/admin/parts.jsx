// FirstSpawn admin console — shared parts. Composes the Worldlight DS bundle.
// Read the namespace lazily so an async bundle load is safe.
const _DS = () => window.FirstSpawnWorldlightDesignSystem_20af72;

/* ----------------------------------------------------------------------------
 * Iconography — inline Lucide path data (stroke ~1.75, rounded joins).
 * The DS mandates Lucide; inlining keeps the console offline-safe.
 * -------------------------------------------------------------------------- */
const FS_ICONS = {
  "dashboard": [["rect", { width: 7, height: 9, x: 3, y: 3, rx: 1 }], ["rect", { width: 7, height: 5, x: 14, y: 3, rx: 1 }], ["rect", { width: 7, height: 9, x: 14, y: 12, rx: 1 }], ["rect", { width: 7, height: 5, x: 3, y: 16, rx: 1 }]],
  "server": [["rect", { width: 20, height: 8, x: 2, y: 2, rx: 2 }], ["rect", { width: 20, height: 8, x: 2, y: 14, rx: 2 }], ["path", { d: "M6 6h.01" }], ["path", { d: "M6 18h.01" }]],
  "dish": [["path", { d: "M4 10a7.31 7.31 0 0 0 10 10Z" }], ["path", { d: "m9 15 3-3" }], ["path", { d: "M17 13a6 6 0 0 0-6-6" }], ["path", { d: "M21 13A10 10 0 0 0 11 3" }]],
  "shield-check": [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { d: "m9 12 2 2 4-4" }]],
  "shield-alert": [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { d: "M12 8v4" }], ["path", { d: "M12 16h.01" }]],
  "history": [["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ["path", { d: "M3 3v5h5" }], ["path", { d: "M12 7v5l4 2" }]],
  "search": [["circle", { cx: 11, cy: 11, r: 8 }], ["path", { d: "m21 21-4.3-4.3" }]],
  "bell": [["path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }], ["path", { d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" }]],
  "check": [["path", { d: "M20 6 9 17l-5-5" }]],
  "x": [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]],
  "chevron-right": [["path", { d: "m9 18 6-6-6-6" }]],
  "chevron-down": [["path", { d: "m6 9 6 6 6-6" }]],
  "arrow-up-right": [["path", { d: "M7 7h10v10" }], ["path", { d: "M7 17 17 7" }]],
  "arrow-down-right": [["path", { d: "M7 7v10h10" }], ["path", { d: "M17 7 7 17" }]],
  "users": [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }], ["circle", { cx: 9, cy: 7, r: 4 }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }], ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }]],
  "trending-up": [["path", { d: "M16 7h6v6" }], ["path", { d: "m22 7-8.5 8.5-5-5L2 17" }]],
  "alert": [["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }], ["path", { d: "M12 9v4" }], ["path", { d: "M12 17h.01" }]],
  "flag": [["path", { d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" }], ["path", { d: "M4 22v-7" }]],
  "clock": [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M12 6v6l4 2" }]],
  "eye": [["path", { d: "M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" }], ["circle", { cx: 12, cy: 12, r: 3 }]],
  "ban": [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "m4.9 4.9 14.2 14.2" }]],
  "refresh": [["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }], ["path", { d: "M21 3v5h-5" }], ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }], ["path", { d: "M8 16H3v5" }]],
  "database": [["ellipse", { cx: 12, cy: 5, rx: 9, ry: 3 }], ["path", { d: "M3 5v14a9 3 0 0 0 18 0V5" }], ["path", { d: "M3 12a9 3 0 0 0 18 0" }]],
  "arrow-up": [["path", { d: "m5 12 7-7 7 7" }], ["path", { d: "M12 19V5" }]],
  "filter": [["path", { d: "M3 4.5h18l-7 8v6l-4 2v-8z" }]],
  "external": [["path", { d: "M15 3h6v6" }], ["path", { d: "M10 14 21 3" }], ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }]],
  "logout": [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }], ["path", { d: "m16 17 5-5-5-5" }], ["path", { d: "M21 12H9" }]],
  "info": [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M12 16v-4" }], ["path", { d: "M12 8h.01" }]],
};

function Icon({ name, size = 18, sw = 1.75, color = "currentColor", style }) {
  const node = FS_ICONS[name];
  if (!node) return <svg width={size} height={size} style={style} />;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0, ...style }}>
      {node.map((c, i) => React.createElement(c[0], { key: i, ...c[1] }))}
    </svg>
  );
}

/* ---- Small shared atoms -------------------------------------------------- */

function SectionLabel({ children, style }) {
  return <div className="wl-section-label" style={style}>{children}</div>;
}

// Measured number — always mono (the trust cue).
function Measured({ children, color = "var(--text)", size = 13, weight = 600, style }) {
  return <span style={{ fontFamily: "var(--font-mono)", fontSize: size, fontWeight: weight, color, letterSpacing: "-0.01em", ...style }}>{children}</span>;
}

// Owner-declared number — muted, set on a dashed well to read as "claimed, not measured".
function Declared({ children, style }) {
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)",
      border: "1px dashed var(--line)", borderRadius: 6, padding: "1px 6px", ...style,
    }}>{children}</span>
  );
}

const SEV = {
  high:   { color: "var(--danger)",  label: "High" },
  medium: { color: "var(--muted)",   label: "Medium" },
  low:    { color: "var(--muted)",   label: "Low" },
};
function SeverityTag({ level }) {
  const s = SEV[level] || SEV.low;
  const dashed = level !== "high";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-ui)",
      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
      color: s.color, padding: "2px 8px", borderRadius: 999,
      border: (dashed ? "1px dashed " : "1px solid ") + (level === "high" ? "color-mix(in srgb, var(--danger) 45%, transparent)" : "var(--line)"),
      background: level === "high" ? "color-mix(in srgb, var(--danger) 12%, transparent)" : "transparent",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: s.color }}></span>{s.label}
    </span>
  );
}

// Status pill for a server's lifecycle state.
const STATUS = {
  live:      { c: "var(--success)", t: "Live" },
  verified:  { c: "var(--success)", t: "Verified" },
  pending:   { c: "var(--muted)",   t: "Pending" },
  flagged:   { c: "var(--danger)",  t: "Flagged" },
  suspended: { c: "var(--danger)",  t: "Suspended" },
  offline:   { c: "var(--muted)",   t: "Offline" },
};
function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.pending;
  const quiet = status === "pending" || status === "offline";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)",
      fontSize: 11.5, fontWeight: 600, color: s.c, padding: "3px 9px 3px 8px", borderRadius: 999,
      border: (quiet ? "1px dashed " : "1px solid ") + "var(--line)",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.c }}></span>{s.t}
    </span>
  );
}

// Tiny owner/system avatar from initials. System actors read as mono glyph tiles.
function Avatar({ name, size = 26, system = false }) {
  const initials = system
    ? "•"
    : name.replace(/[^a-zA-Z]/g, " ").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <span style={{
      width: size, height: size, flexShrink: 0, borderRadius: system ? 8 : 999,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: system ? "var(--font-mono)" : "var(--font-ui)", fontWeight: 700,
      fontSize: size * 0.4, color: system ? "var(--muted)" : "var(--text)",
      background: "var(--raised)", border: "1px solid var(--line)",
    }}>{initials}</span>
  );
}

// Section panel: hairline card with a labelled header bar.
function Panel({ title, sub, action, children, pad = true, style }) {
  return (
    <section className="wl-card" style={{ borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", ...style }}>
      {title && (
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <SectionLabel>{title}</SectionLabel>
            {sub && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>{sub}</span>}
          </div>
          {action}
        </header>
      )}
      <div style={{ padding: pad ? 16 : 0, flex: 1 }}>{children}</div>
    </section>
  );
}

// A small text/icon action button used inside rows + detail panels.
function ActionBtn({ icon, children, tone = "quiet", onClick, title }) {
  const tones = {
    quiet:   { bg: "transparent", bd: "var(--line)", fg: "var(--text)" },
    primary: { bg: "var(--accent)", bd: "var(--accent-deep)", fg: "var(--on-accent)" },
    success: { bg: "transparent", bd: "color-mix(in srgb, var(--success) 55%, var(--line))", fg: "var(--success)" },
    danger:  { bg: "transparent", bd: "color-mix(in srgb, var(--danger) 55%, var(--line))", fg: "var(--danger)" },
  };
  const t = tones[tone] || tones.quiet;
  return (
    <button className="wl-btn" onClick={onClick} title={title} style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-ui)", fontSize: 12.5,
      fontWeight: 600, cursor: "pointer", color: t.fg, background: t.bg, border: "1px solid " + t.bd,
      borderRadius: 10, padding: children ? "7px 12px" : "7px", minHeight: 34, lineHeight: 1,
    }}>
      {icon && <Icon name={icon} size={15} />}{children}
    </button>
  );
}

/* ---- Sidebar ------------------------------------------------------------- */

const NAV = [
  { group: "Monitor", items: [
    { id: "overview",  label: "Overview",   icon: "dashboard" },
    { id: "servers",   label: "Servers",    icon: "server" },
    { id: "collector", label: "Collector",  icon: "dish" },
  ] },
  { group: "Moderate", items: [
    { id: "verification", label: "Verification", icon: "shield-check" },
    { id: "trust",        label: "Trust & abuse", icon: "shield-alert" },
    { id: "audit",        label: "Audit log",     icon: "history" },
  ] },
];

function Sidebar({ route, onNavigate, counts }) {
  const { Sigil } = _DS();
  return (
    <aside style={{
      width: 236, flexShrink: 0, alignSelf: "flex-start", position: "sticky", top: 0, height: "100vh",
      background: "var(--panel)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "18px 18px 16px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ display: "inline-flex", width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid var(--line)", background: "var(--canvas)" }}><Sigil size={20} /></span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, lineHeight: 1 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, letterSpacing: "0.04em", color: "var(--text)", textTransform: "uppercase" }}>FIRST<span style={{ color: "var(--accent)" }}>SPAWN</span></span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Admin console</span>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 16 }}>
        {NAV.map((g) => (
          <div key={g.group} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <SectionLabel style={{ padding: "0 8px 6px" }}>{g.group}</SectionLabel>
            {g.items.map((it) => {
              const active = route === it.id;
              const badge = counts && counts[it.id];
              return (
                <button key={it.id} onClick={() => onNavigate(it.id)} style={{
                  display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", cursor: "pointer",
                  fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: active ? 600 : 500,
                  color: active ? "var(--text)" : "var(--muted)",
                  background: active ? "var(--raised)" : "transparent",
                  border: "1px solid " + (active ? "var(--line)" : "transparent"),
                  borderRadius: 10, padding: "8px 10px", position: "relative", minHeight: 38,
                  transition: "background var(--dur-fast), color var(--dur-fast)",
                }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "color-mix(in srgb, var(--raised) 55%, transparent)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  {active && <span style={{ position: "absolute", left: -12, top: 9, bottom: 9, width: 3, borderRadius: 999, background: "var(--accent)" }}></span>}
                  <Icon name={it.icon} size={17} color={active ? "var(--accent)" : "currentColor"} />
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {badge ? (
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, minWidth: 20, textAlign: "center",
                      color: it.id === "trust" ? "var(--danger)" : "var(--accent)",
                      border: "1px solid " + (it.id === "trust" ? "color-mix(in srgb, var(--danger) 45%, var(--line))" : "color-mix(in srgb, var(--accent) 45%, var(--line))"),
                      borderRadius: 999, padding: "1px 6px",
                    }}>{badge}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--muted)", padding: "0 4px" }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--success)", flexShrink: 0 }} className="wl-blink"></span>
          collector healthy · <span style={{ color: "var(--success)" }}>96</span> pinging
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--canvas)" }}>
          <Avatar name="Mara K" size={28} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0, flex: 1 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>Mara K.</span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--muted)" }}>Trust moderator</span>
          </div>
          <Icon name="logout" size={15} color="var(--muted)" style={{ cursor: "pointer" }} />
        </div>
      </div>
    </aside>
  );
}

/* ---- Topbar -------------------------------------------------------------- */

const ROUTE_TITLE = {
  overview: "Overview", servers: "Servers", collector: "Collector",
  verification: "Verification", trust: "Trust & abuse", audit: "Audit log",
};
const ROUTE_BLURB = {
  overview: "A calm observatory of the atlas.",
  servers: "Every tracked world — measured, not declared.",
  collector: "Live ping health across the atlas.",
  verification: "Claims and reports awaiting a decision.",
  trust: "Anomalies the detector wants a human to confirm.",
  audit: "Every moderation and system action, in order.",
};

function Topbar({ route, theme, onToggleTheme, density, onToggleDensity, onNavigate, updated }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50, height: 64, flexShrink: 0,
      borderBottom: "1px solid var(--line)", background: "color-mix(in srgb, var(--canvas) 88%, transparent)",
      backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, padding: "0 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>atlas</span>
        <Icon name="chevron-right" size={14} color="var(--muted)" />
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{ROUTE_TITLE[route] || "Overview"}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 14, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--success)" }} className="wl-blink"></span>
          updated {updated}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 12px", border: "1px solid var(--line)", borderRadius: 999, background: "var(--input-bg)", color: "var(--muted)", minWidth: 210 }}>
          <Icon name="search" size={15} />
          <input placeholder="Search servers, owners, IDs…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontFamily: "var(--font-ui)", fontSize: 12.5 }} />
          <kbd style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted)", border: "1px solid var(--line)", borderRadius: 5, padding: "1px 5px" }}>/</kbd>
        </label>
        <IconBtn name="filter" title="Density" onClick={onToggleDensity} active={density === "compact"} />
        <div style={{ position: "relative" }}>
          <IconBtn name="bell" title="Notifications" />
          <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: 999, background: "var(--danger)", border: "1.5px solid var(--canvas)" }}></span>
        </div>
        <button className="wl-btn" onClick={onToggleTheme} title="Toggle theme" style={{
          height: 36, padding: "0 13px", display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
          fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, color: "var(--muted)",
          background: "transparent", border: "1px solid var(--line)", borderRadius: 999,
        }}>{theme === "day" ? "☀ Day" : "☾ Dusk"}</button>
      </div>
    </header>
  );
}

function IconBtn({ name, title, onClick, active }) {
  return (
    <button className="wl-btn" onClick={onClick} title={title} style={{
      width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
      color: active ? "var(--accent)" : "var(--muted)", background: active ? "var(--raised)" : "transparent",
      border: "1px solid " + (active ? "color-mix(in srgb, var(--accent) 45%, var(--line))" : "var(--line)"), borderRadius: 10,
    }}><Icon name={name} size={17} /></button>
  );
}

// Page header inside the content area (big display title + blurb).
function PageHead({ route, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, letterSpacing: "-0.01em", color: "var(--text)" }}>{ROUTE_TITLE[route]}</h1>
        <p style={{ margin: "7px 0 0", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--muted)" }}>{ROUTE_BLURB[route]}</p>
      </div>
      {right}
    </div>
  );
}

Object.assign(window, { Icon, SectionLabel, Measured, Declared, SeverityTag, StatusPill, Avatar, Panel, ActionBtn, Sidebar, Topbar, IconBtn, PageHead });
