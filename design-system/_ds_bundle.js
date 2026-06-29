/* @ds-bundle: {"format":3,"namespace":"FirstSpawnWorldlightDesignSystem_20af72","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"Sigil","sourcePath":"components/core/Sigil.jsx"},{"name":"WLButton","sourcePath":"components/core/WLButton.jsx"},{"name":"WLCard","sourcePath":"components/core/WLCard.jsx"},{"name":"SignalBars","sourcePath":"components/data/SignalBars.jsx"},{"name":"SignalMeter","sourcePath":"components/data/SignalMeter.jsx"},{"name":"StatusDot","sourcePath":"components/data/StatusDot.jsx"},{"name":"WLInput","sourcePath":"components/forms/WLInput.jsx"},{"name":"WLSelect","sourcePath":"components/forms/WLSelect.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"376761bdf9cd","components/core/Chip.jsx":"66de38dd5ed4","components/core/Sigil.jsx":"13593e5c7a2a","components/core/WLButton.jsx":"d2bc1e2ca8a8","components/core/WLCard.jsx":"63992be1fdf3","components/data/SignalBars.jsx":"38e257ea273f","components/data/SignalMeter.jsx":"085d65361a2c","components/data/StatusDot.jsx":"56aa567d82fb","components/forms/WLInput.jsx":"82e953e81d98","components/forms/WLSelect.jsx":"3dcd5cb28773","ui_kits/admin/Audit.jsx":"f971d681ed55","ui_kits/admin/Collector.jsx":"ca82f6ce11e0","ui_kits/admin/Overview.jsx":"d6ed5b9e821b","ui_kits/admin/Servers.jsx":"a4e938e57c42","ui_kits/admin/Trust.jsx":"fbf76968b913","ui_kits/admin/Verification.jsx":"27dd66dbb016","ui_kits/admin/admin-data.js":"fb723ed49f00","ui_kits/admin/parts.jsx":"0437e20d0a35","ui_kits/web/Discover.jsx":"4575b7872ed6","ui_kits/web/Landing.jsx":"a6824fc269e2","ui_kits/web/Login.jsx":"b6052f41db8f","ui_kits/web/ServerDetail.jsx":"b1d4af8c52e7","ui_kits/web/data.js":"63b0804137dd","ui_kits/web/parts.jsx":"2b04dfb40077"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FirstSpawnWorldlightDesignSystem_20af72 = window.FirstSpawnWorldlightDesignSystem_20af72 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge — small status/label pill. Tones map to the signal system:
 * verified (gold), game (neutral outline), country (mono tag), online/offline,
 * coming-soon (dashed). Used on server cards and rows.
 */
function Badge({
  tone = "neutral",
  children,
  className = "",
  style = {},
  ...props
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontFamily: tone === "country" ? "var(--font-mono)" : "var(--font-ui)",
    fontSize: tone === "country" ? 9 : 9.5,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: tone === "neutral" ? "0.02em" : 0,
    textTransform: tone === "neutral" || tone === "country" ? "uppercase" : "none",
    padding: tone === "country" ? "3px 5px" : "4px 8px",
    borderRadius: tone === "country" ? "var(--radius-tag)" : "var(--radius-pill)",
    border: "1px solid"
  };
  const tones = {
    verified: {
      color: "var(--gold)",
      borderColor: "color-mix(in srgb, var(--gold) 40%, transparent)",
      background: "color-mix(in srgb, var(--panel) 85%, transparent)"
    },
    neutral: {
      color: "var(--text)",
      borderColor: "var(--line)",
      background: "color-mix(in srgb, var(--panel) 85%, transparent)"
    },
    country: {
      color: "var(--muted)",
      borderColor: "var(--line)",
      background: "transparent"
    },
    online: {
      color: "var(--success)",
      borderColor: "color-mix(in srgb, var(--success) 35%, transparent)",
      background: "transparent"
    },
    offline: {
      color: "var(--danger)",
      borderColor: "color-mix(in srgb, var(--danger) 35%, transparent)",
      background: "transparent"
    },
    soon: {
      color: "var(--muted)",
      borderColor: "var(--line)",
      background: "transparent",
      borderStyle: "dashed"
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      ...base,
      ...tones[tone],
      ...style
    }
  }, props), tone === "verified" && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\u2713"), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Chip — a filter/selection pill. Pill radius. Inactive: transparent fill,
 * line border, muted text. Active: accent fill, accentDeep border, onAccent
 * text. Used for tag filters, quick-search tokens, interpreted facets.
 */
function Chip({
  active = false,
  children,
  className = "",
  style = {},
  ...props
}) {
  const base = {
    fontFamily: "var(--font-ui)",
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1,
    padding: "7px 13px",
    borderRadius: "var(--radius-pill)",
    border: "1px solid",
    cursor: "pointer",
    transition: "background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast)"
  };
  const state = active ? {
    background: "var(--accent)",
    color: "var(--on-accent)",
    borderColor: "var(--accent-deep)"
  } : {
    background: "transparent",
    color: "var(--muted)",
    borderColor: "var(--line)"
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    className: className,
    style: {
      ...base,
      ...state,
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/Sigil.jsx
try { (() => {
/**
 * The FirstSpawn pixel sigil — 14 gold cells on a 5×5 grid. Brand mark used
 * in the navbar, footer, and anywhere the identity needs a compact glyph.
 */
function Sigil({
  size = 24,
  color = "var(--accent)",
  className = ""
}) {
  const u = size / 5;
  const cells = [[1, 0], [2, 0], [3, 0], [4, 0], [0, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 3], [0, 4], [1, 4], [2, 4], [3, 4]];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    className: className,
    style: {
      flex: "none",
      display: "block"
    }
  }, cells.map(([x, y], i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: x * 24 / 5,
    y: y * 24 / 5,
    width: 24 / 5,
    height: 24 / 5,
    fill: color
  })));
}
Object.assign(__ds_scope, { Sigil });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Sigil.jsx", error: String((e && e.message) || e) }); }

// components/core/WLButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * WLButton — the Worldlight button recipe. Radius 10, min-height 44 (36 small),
 * 700 weight, 120ms filter transitions. Hover brightens, active darkens.
 * Primary = Dawn Gold; semantic variants for danger/success/gold; quiet/ghost
 * for low-emphasis actions.
 */
function WLButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  href,
  disabled = false,
  children,
  className = "",
  style = {},
  ...props
}) {
  const base = {
    fontFamily: "var(--font-ui)",
    fontWeight: 700,
    fontSize: size === "sm" ? 12.5 : 13.5,
    borderRadius: "var(--radius-control)",
    padding: size === "sm" ? "8px 14px" : size === "lg" ? "13px 24px" : "11px 20px",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    whiteSpace: "nowrap",
    minHeight: size === "sm" ? 36 : size === "lg" ? 48 : 44,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? "100%" : undefined,
    textDecoration: "none"
  };
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--on-accent)",
      borderColor: "var(--accent-deep)"
    },
    quiet: {
      background: "var(--raised)",
      color: "var(--text)",
      borderColor: "var(--line)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text)",
      borderColor: "var(--line)"
    },
    danger: {
      background: "var(--danger)",
      color: "#ffffff",
      borderColor: "var(--danger-hover)"
    },
    success: {
      background: "var(--success)",
      color: "#0e2417",
      borderColor: "var(--success-hover)"
    },
    gold: {
      background: "var(--gold)",
      color: "#2a2107",
      borderColor: "var(--line)"
    }
  };
  const merged = {
    ...base,
    ...variants[variant],
    ...style
  };
  const classes = `wl-btn ${className}`.trim();
  if (href && !disabled) {
    return /*#__PURE__*/React.createElement("a", _extends({
      href: href,
      className: classes,
      style: merged
    }, props), children);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    className: classes,
    style: merged,
    disabled: disabled
  }, props), children);
}
Object.assign(__ds_scope, { WLButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/WLButton.jsx", error: String((e && e.message) || e) }); }

// components/core/WLCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * WLCard — panel surface with 1px line border, radius 12, hairline shadow.
 * Set `clickable` to enable the 2px hover lift + accent border. Use `as` to
 * render a different element (e.g. "a" for a linked card).
 */
function WLCard({
  clickable = false,
  as = "div",
  children,
  className = "",
  style = {},
  ...props
}) {
  const Tag = as;
  const base = {
    background: "var(--panel)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-card)",
    display: "flex",
    flexDirection: "column",
    ...style
  };
  const classes = `wl-card ${clickable ? "wl-card--clickable" : ""} ${className}`.trim();
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: classes,
    style: base
  }, props), children);
}
Object.assign(__ds_scope, { WLCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/WLCard.jsx", error: String((e && e.message) || e) }); }

// components/data/SignalBars.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SignalBars — a segmented activity/trust/freshness meter. Fills `value`%
 * of `segments` with `color` (default success) over a line track. Measured
 * data, so values shown alongside should be mono.
 */
function SignalBars({
  value = 0,
  segments = 12,
  color = "var(--success)",
  width = 96,
  height = 10,
  className = "",
  style = {},
  ...props
}) {
  const filled = Math.round(value / 100 * segments);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      gap: 2,
      width,
      ...style
    }
  }, props), Array.from({
    length: segments
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height,
      borderRadius: 1,
      background: i < filled ? color : "var(--line)"
    }
  })));
}
Object.assign(__ds_scope, { SignalBars });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/SignalBars.jsx", error: String((e && e.message) || e) }); }

// components/data/SignalMeter.jsx
try { (() => {
/**
 * SignalMeter — a labelled horizontal meter row: label · track · mono value.
 * Used inside the rank popover (activity / trust / freshness breakdown).
 */
function SignalMeter({
  label,
  value = 0,
  color = "var(--accent)",
  className = "",
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      display: "grid",
      gridTemplateColumns: "76px 1fr 34px",
      alignItems: "center",
      gap: 10,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 12,
      fontWeight: 600,
      color: "var(--muted)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      height: 6,
      background: "var(--raised)",
      borderRadius: "var(--radius-pill)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      height: "100%",
      width: `${value}%`,
      background: color
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text)",
      textAlign: "right"
    }
  }, value));
}
Object.assign(__ds_scope, { SignalMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/SignalMeter.jsx", error: String((e && e.message) || e) }); }

// components/data/StatusDot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatusDot — an online/offline indicator dot with optional count label.
 * success dot = online, danger = offline. The count renders in mono (measured).
 */
function StatusDot({
  status = "online",
  label,
  className = "",
  style = {},
  ...props
}) {
  const color = status === "online" ? "var(--success)" : "var(--danger)";
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: color,
      flex: "none"
    }
  }), label != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11.5,
      color,
      lineHeight: 1
    }
  }, label));
}
Object.assign(__ds_scope, { StatusDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatusDot.jsx", error: String((e && e.message) || e) }); }

// components/forms/WLInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * WLInput — Worldlight text field. Panel-ish input fill, 1px line border,
 * radius 10, focus border switches to accent. min-height 46 for search,
 * 44 for standard fields.
 */
function WLInput({
  size = "md",
  className = "",
  style = {},
  ...props
}) {
  const base = {
    fontFamily: "var(--font-body)",
    fontSize: 13.5,
    color: "var(--text)",
    background: "var(--input-bg)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-control)",
    padding: size === "lg" ? "12px 16px" : "10px 14px",
    minHeight: size === "lg" ? 46 : 44,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color var(--dur-fast)"
  };
  return /*#__PURE__*/React.createElement("input", _extends({
    className: `wl-input ${className}`.trim(),
    style: {
      ...base,
      ...style
    }
  }, props));
}
Object.assign(__ds_scope, { WLInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/WLInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/WLSelect.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * WLSelect — Worldlight select. Panel fill, line border, radius 10, a custom
 * muted ▼ caret (native arrow hidden). Options passed as {value,label}[].
 */
function WLSelect({
  options = [],
  className = "",
  style = {},
  ...props
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-block",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    className: `wl-select ${className}`.trim(),
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12.5,
      color: "var(--text)",
      background: "var(--panel)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-control)",
      padding: "10px 30px 10px 12px",
      minHeight: 42,
      width: "100%",
      outline: "none",
      appearance: "none",
      WebkitAppearance: "none",
      cursor: "pointer",
      boxSizing: "border-box",
      ...style
    }
  }, props), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      color: "var(--muted)"
    }
  }, "\u25BC"));
}
Object.assign(__ds_scope, { WLSelect });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/WLSelect.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Audit.jsx
try { (() => {
// FirstSpawn admin — Audit log. Every moderation + system action, in order.
// Honest provenance: who (or what system) did what, to which target, when.
const AU_VERB = {
  granted: "var(--success)",
  restored: "var(--success)",
  suspended: "var(--danger)",
  "marked down": "var(--danger)",
  flagged: "var(--danger)",
  escalated: "var(--accent)",
  dismissed: "var(--muted)",
  recomputed: "var(--muted)"
};
function AuRow({
  e,
  last
}) {
  const D = window.FS_ADMIN;
  const system = e.role === "system";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "auto minmax(0,1fr) auto",
      gap: 14,
      alignItems: "flex-start",
      padding: "14px 16px",
      borderBottom: last ? "none" : "1px solid var(--line)"
    },
    className: "fs-trow"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(window.Avatar, {
    name: e.actor,
    system: system,
    size: 30
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13.5,
      color: "var(--text)",
      lineHeight: 1.45
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, e.actor), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: AU_VERB[e.action] || "var(--muted)",
      fontWeight: 600
    }
  }, e.action), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text)"
    }
  }, e.target)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, e.note))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      whiteSpace: "nowrap"
    }
  }, D.ago(e.ageSec)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: "var(--muted)",
      padding: "1px 6px",
      border: "1px solid var(--line)",
      borderRadius: 6
    }
  }, e.id)));
}
function Audit(ctx) {
  const D = window.FS_ADMIN;
  const {
    Chip
  } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const [filter, setFilter] = React.useState("all");
  const list = D.audit.filter(e => filter === "all" ? true : filter === "mod" ? e.role === "mod" : e.role === "system");
  const filters = [["all", "All"], ["mod", "Moderators"], ["system", "System"]];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.PageHead, {
    route: "audit",
    right: /*#__PURE__*/React.createElement(window.ActionBtn, {
      icon: "external",
      tone: "quiet",
      onClick: () => ctx.pushToast({
        title: "Export started",
        body: "audit log · CSV · last 30 days",
        tone: "primary",
        icon: "external"
      })
    }, "Export")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 16,
      flexWrap: "wrap"
    }
  }, filters.map(([id, label]) => /*#__PURE__*/React.createElement(Chip, {
    key: id,
    active: filter === id,
    onClick: () => setFilter(id)
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      margin: "0 2px 10px"
    }
  }, /*#__PURE__*/React.createElement(window.SectionLabel, null, "Today"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: "var(--line)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, list.length, " events")), /*#__PURE__*/React.createElement("div", {
    className: "wl-card",
    style: {
      borderRadius: 14,
      overflow: "hidden"
    }
  }, list.map((e, i) => /*#__PURE__*/React.createElement(AuRow, {
    key: e.id,
    e: e,
    last: i === list.length - 1
  })), list.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "wl-dashed",
    style: {
      margin: 16,
      borderRadius: 12,
      padding: 36,
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--muted)"
    }
  }, "No events for this filter.")));
}
Object.assign(window, {
  Audit
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Audit.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Collector.jsx
try { (() => {
// FirstSpawn admin — Collector. Live ping health across the atlas. Last-ping and
// latency are measured (mono); a blinking dot marks servers pinged this cycle.
function ClPing({
  s
}) {
  const D = window.FS_ADMIN;
  const down = s.status === "offline";
  const slow = !down && s.lastPingSec > 10;
  const live = !down && s.lastPingSec < 6;
  const color = down ? "var(--danger)" : slow ? "var(--muted)" : "var(--success)";
  const label = down ? "Down" : slow ? "Slow" : "OK";
  return /*#__PURE__*/React.createElement("div", {
    className: "fs-trow fs-pad-y",
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1.4fr) 64px 92px 110px 96px",
      gap: 14,
      alignItems: "center",
      padding: "12px 16px",
      borderTop: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: live ? "wl-blink" : "",
    style: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--text)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, s.name)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--muted)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, s.address), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--muted)"
    }
  }, s.country), /*#__PURE__*/React.createElement(window.Measured, {
    size: 12,
    color: down ? "var(--muted)" : slow ? "var(--muted)" : "var(--text)"
  }, s.latency != null ? s.latency + "ms" : "—"), /*#__PURE__*/React.createElement(window.Measured, {
    size: 12,
    color: down ? "var(--danger)" : "var(--muted)"
  }, D.ago(s.lastPingSec)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "var(--font-ui)",
      fontSize: 12,
      fontWeight: 600,
      color,
      justifySelf: "end"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: color
    }
  }), label));
}
function ClStat({
  label,
  value,
  color,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "wl-card",
    style: {
      padding: "15px 17px",
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(window.SectionLabel, null, label), /*#__PURE__*/React.createElement(window.Measured, {
    size: 26,
    weight: 700,
    color: color || "var(--text)"
  }, value), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, sub));
}
function Collector(ctx) {
  const D = window.FS_ADMIN;
  const {
    Chip
  } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const [filter, setFilter] = React.useState("all");
  const tag = s => s.status === "offline" ? "down" : s.lastPingSec > 10 ? "slow" : "ok";
  const list = D.servers.filter(s => filter === "all" ? true : tag(s) === filter).sort((a, b) => (b.status === "offline" ? 2 : b.lastPingSec > 10 ? 1 : 0) - (a.status === "offline" ? 2 : a.lastPingSec > 10 ? 1 : 0));
  const filters = [["all", "All"], ["ok", "OK"], ["slow", "Slow"], ["down", "Down"]];
  const head = ["Server", "Address", "Region", "Latency", "Last ping", "Status"];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.PageHead, {
    route: "collector",
    right: /*#__PURE__*/React.createElement(window.ActionBtn, {
      icon: "refresh",
      tone: "quiet",
      onClick: () => ctx.pushToast({
        title: "Re-polling atlas",
        body: "collector · 96 servers queued",
        tone: "success",
        icon: "refresh"
      })
    }, "Re-poll now")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 14,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(ClStat, {
    label: "24h uptime",
    value: "99.4%",
    color: "var(--success)",
    sub: "ping success rate"
  }), /*#__PURE__*/React.createElement(ClStat, {
    label: "Pinging now",
    value: "96",
    color: "var(--success)",
    sub: "of 100 sampled"
  }), /*#__PURE__*/React.createElement(ClStat, {
    label: "Slow (>120ms)",
    value: "3",
    color: "var(--muted)",
    sub: "degraded, still up"
  }), /*#__PURE__*/React.createElement(ClStat, {
    label: "Down",
    value: "1",
    color: "var(--danger)",
    sub: "no response 90m+"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
      flexWrap: "wrap"
    }
  }, filters.map(([id, label]) => /*#__PURE__*/React.createElement(Chip, {
    key: id,
    active: filter === id,
    onClick: () => setFilter(id)
  }, label)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "wl-blink",
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: "var(--success)"
    }
  }), "polling every 30s")), /*#__PURE__*/React.createElement("div", {
    className: "wl-card",
    style: {
      borderRadius: 14,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1.4fr) 64px 92px 110px 96px",
      gap: 14,
      alignItems: "center",
      padding: "11px 16px",
      background: "var(--raised)"
    }
  }, head.map((h, i) => /*#__PURE__*/React.createElement("span", {
    key: h,
    className: "wl-section-label",
    style: {
      textAlign: i === 5 ? "right" : "left"
    }
  }, h))), list.map(s => /*#__PURE__*/React.createElement(ClPing, {
    key: s.slug,
    s: s
  }))));
}
Object.assign(window, {
  Collector
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Collector.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Overview.jsx
try { (() => {
// FirstSpawn admin — Overview. The "calm observatory": platform KPIs + a triage
// digest of everything that wants a human (verification, flags, collector, audit).
function OvKpi({
  label,
  icon,
  value,
  unit,
  sub,
  delta,
  bar,
  barColor,
  onClick
}) {
  const {
    SignalBars
  } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const up = delta && delta.dir === "up";
  const good = delta && delta.good !== false;
  return /*#__PURE__*/React.createElement("div", {
    className: "wl-card fs-kpi" + (onClick ? " wl-card--clickable" : ""),
    onClick: onClick,
    style: {
      padding: "16px 17px",
      display: "flex",
      flexDirection: "column",
      gap: 11,
      cursor: onClick ? "pointer" : "default"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement(window.SectionLabel, null, label), /*#__PURE__*/React.createElement(window.Icon, {
    name: icon,
    size: 16,
    color: "var(--muted)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(window.Measured, {
    size: 30,
    weight: 700
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--muted)"
    }
  }, unit)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, delta && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      fontFamily: "var(--font-mono)",
      fontSize: 11.5,
      fontWeight: 600,
      color: good ? "var(--success)" : "var(--danger)"
    }
  }, /*#__PURE__*/React.createElement(window.Icon, {
    name: up ? "arrow-up-right" : "arrow-down-right",
    size: 13
  }), delta.text), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, sub)), bar != null && /*#__PURE__*/React.createElement(SignalBars, {
    value: bar,
    color: barColor || "var(--success)",
    segments: 16,
    width: null,
    height: 4,
    style: {
      width: "100%"
    }
  }));
}
const OV_VERB = {
  granted: "var(--success)",
  restored: "var(--success)",
  suspended: "var(--danger)",
  "marked down": "var(--danger)",
  flagged: "var(--danger)",
  escalated: "var(--accent)",
  dismissed: "var(--muted)",
  recomputed: "var(--muted)"
};
function OvAuditRow({
  e
}) {
  const D = window.FS_ADMIN;
  const system = e.role === "system";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 11,
      alignItems: "flex-start",
      padding: "10px 0",
      borderTop: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement(window.Avatar, {
    name: e.actor,
    system: system,
    size: 26
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13,
      color: "var(--text)",
      lineHeight: 1.4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, e.actor), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: OV_VERB[e.action] || "var(--muted)",
      fontWeight: 600
    }
  }, e.action), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text)"
    }
  }, e.target)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      marginTop: 2,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, e.note)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--muted)",
      whiteSpace: "nowrap"
    }
  }, D.ago(e.ageSec)));
}
function OvQueueItem({
  q,
  ctx
}) {
  const D = window.FS_ADMIN;
  const s = D.byId(q.slug);
  const done = ctx.resolved[q.id];
  return /*#__PURE__*/React.createElement("div", {
    className: "fs-trow",
    style: {
      display: "grid",
      gridTemplateColumns: "26px minmax(0,1fr) auto",
      gap: 12,
      alignItems: "center",
      padding: "11px 8px",
      borderTop: "1px solid var(--line)",
      opacity: done ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 26,
      height: 26,
      borderRadius: 8,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: q.kind === "report" ? "var(--danger)" : "var(--muted)",
      border: "1px solid var(--line)",
      background: "var(--canvas)"
    }
  }, /*#__PURE__*/React.createElement(window.Icon, {
    name: q.kind === "report" ? "flag" : "shield-check",
    size: 13
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, q.title), q.escalated && /*#__PURE__*/React.createElement(window.SeverityTag, {
    level: "high"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      marginTop: 2
    }
  }, s.name, " \xB7 ", q.id, " \xB7 ", D.ago(q.ageSec))), done ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 12,
      fontWeight: 600,
      color: done === "rejected" ? "var(--danger)" : "var(--success)"
    }
  }, done) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(window.ActionBtn, {
    icon: "check",
    tone: "success",
    title: "Approve",
    onClick: () => ctx.resolveQueue(q.id, "approved", "Approved · " + q.title)
  }), /*#__PURE__*/React.createElement(window.ActionBtn, {
    icon: "x",
    tone: "quiet",
    title: "Reject",
    onClick: () => ctx.resolveQueue(q.id, "rejected", "Rejected · " + q.title)
  })));
}
function OvFlagRow({
  f,
  ctx
}) {
  const D = window.FS_ADMIN;
  const s = D.byId(f.slug);
  const done = ctx.flagState[f.id];
  return /*#__PURE__*/React.createElement("div", {
    className: "fs-trow",
    style: {
      padding: "12px 8px",
      borderTop: "1px solid var(--line)",
      opacity: done ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(window.Avatar, {
    name: s.name,
    size: 24
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text)"
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, D.flagKindName(f.kind), " \xB7 ", f.id))), /*#__PURE__*/React.createElement(window.SeverityTag, {
    level: f.severity
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      color: "var(--muted)",
      marginTop: 7,
      lineHeight: 1.45
    }
  }, f.detail));
}
function Overview(ctx) {
  const D = window.FS_ADMIN;
  const k = D.kpis;
  const openQueue = D.queue.filter(q => !ctx.resolved[q.id]);
  const openFlags = D.flags.filter(f => !ctx.flagState[f.id]);
  const slow = D.servers.filter(s => s.status === "offline" || s.lastPingSec > 10);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.PageHead, {
    route: "overview",
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(window.ActionBtn, {
      icon: "refresh",
      tone: "quiet",
      onClick: () => ctx.pushToast({
        title: "Atlas refreshed",
        body: "collector · 96 servers re-polled",
        tone: "success",
        icon: "refresh"
      })
    }, "Refresh"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 14,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(OvKpi, {
    label: "Servers tracked",
    icon: "server",
    value: D.num(k.serversActive),
    unit: "/ " + k.serversTotal + " active",
    delta: {
      dir: "up",
      text: "+" + k.serversDelta + " today",
      good: true
    },
    bar: Math.round(k.serversActive / k.serversTotal * 100),
    barColor: "var(--accent)"
  }), /*#__PURE__*/React.createElement(OvKpi, {
    label: "Players online",
    icon: "users",
    value: D.compact(k.playersOnline),
    unit: "measured",
    delta: {
      dir: "up",
      text: "+" + k.playersDeltaPct + "% vs yesterday",
      good: true
    },
    sub: "peak 41.2k"
  }), /*#__PURE__*/React.createElement(OvKpi, {
    label: "Votes today",
    icon: "trending-up",
    value: D.compact(k.votesToday),
    delta: {
      dir: "up",
      text: "+" + D.compact(k.votesDelta),
      good: true
    },
    sub: "from 4,310 voters"
  }), /*#__PURE__*/React.createElement(OvKpi, {
    label: "Collector uptime",
    icon: "dish",
    value: k.collectorUptime,
    unit: "% \xB7 24h",
    delta: {
      dir: "down",
      text: k.collectorUptimeDelta + "pp",
      good: false
    },
    bar: k.collectorUptime,
    barColor: "var(--success)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wl-card wl-card--clickable",
    onClick: () => ctx.go("verification"),
    style: {
      padding: "15px 17px",
      display: "flex",
      alignItems: "center",
      gap: 15,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 42,
      borderRadius: 12,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--accent)",
      border: "1px solid color-mix(in srgb, var(--accent) 40%, var(--line))",
      background: "color-mix(in srgb, var(--accent) 10%, transparent)"
    }
  }, /*#__PURE__*/React.createElement(window.Icon, {
    name: "shield-check",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(window.Measured, {
    size: 22,
    weight: 700,
    color: "var(--accent)"
  }, openQueue.length), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--text)"
    }
  }, "awaiting verification")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      marginTop: 2
    }
  }, openQueue.filter(q => q.priority === "high").length, " high priority \xB7 oldest ", D.ago(Math.max(...openQueue.map(q => q.ageSec), 0)))), /*#__PURE__*/React.createElement(window.Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--muted)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "wl-card wl-card--clickable",
    onClick: () => ctx.go("trust"),
    style: {
      padding: "15px 17px",
      display: "flex",
      alignItems: "center",
      gap: 15,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 42,
      borderRadius: 12,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--danger)",
      border: "1px solid color-mix(in srgb, var(--danger) 40%, var(--line))",
      background: "color-mix(in srgb, var(--danger) 10%, transparent)"
    }
  }, /*#__PURE__*/React.createElement(window.Icon, {
    name: "shield-alert",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(window.Measured, {
    size: 22,
    weight: 700,
    color: "var(--danger)"
  }, openFlags.length), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--text)"
    }
  }, "open trust flags")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      marginTop: 2
    }
  }, openFlags.filter(f => f.severity === "high").length, " high severity \xB7 anomaly detector")), /*#__PURE__*/React.createElement(window.Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--muted)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.5fr 1fr",
      gap: 16,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(window.Panel, {
    title: "Verification queue",
    sub: openQueue.length + " open · " + D.queue.filter(q => q.kind === "claim").length + " claims · " + D.queue.filter(q => q.kind === "report").length + " reports",
    pad: false,
    action: /*#__PURE__*/React.createElement(window.ActionBtn, {
      tone: "quiet",
      onClick: () => ctx.go("verification")
    }, "Open queue")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 8px 6px"
    }
  }, openQueue.slice(0, 4).map(q => /*#__PURE__*/React.createElement(OvQueueItem, {
    key: q.id,
    q: q,
    ctx: ctx
  })), openQueue.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "wl-dashed",
    style: {
      margin: 12,
      borderRadius: 12,
      padding: 24,
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--muted)"
    }
  }, "Queue clear \u2014 nothing awaiting review."))), /*#__PURE__*/React.createElement(window.Panel, {
    title: "Recent activity",
    sub: "moderation + system",
    pad: false,
    action: /*#__PURE__*/React.createElement(window.ActionBtn, {
      tone: "quiet",
      onClick: () => ctx.go("audit")
    }, "Full log")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 16px 8px"
    }
  }, D.audit.slice(0, 6).map(e => /*#__PURE__*/React.createElement(OvAuditRow, {
    key: e.id,
    e: e
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(window.Panel, {
    title: "Trust & abuse",
    sub: openFlags.length + " open flags",
    pad: false,
    action: /*#__PURE__*/React.createElement(window.ActionBtn, {
      tone: "quiet",
      onClick: () => ctx.go("trust")
    }, "Review")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 8px 6px"
    }
  }, openFlags.slice(0, 3).map(f => /*#__PURE__*/React.createElement(OvFlagRow, {
    key: f.id,
    f: f,
    ctx: ctx
  })))), /*#__PURE__*/React.createElement(window.Panel, {
    title: "Collector",
    sub: "96 ok \xB7 3 slow \xB7 1 down"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(window.Measured, {
    size: 26,
    weight: 700,
    color: "var(--success)"
  }, "99.4", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted)"
    }
  }, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(window.SectionLabel, null, "24h ping success"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, (() => {
    const {
      SignalBars
    } = window.FirstSpawnWorldlightDesignSystem_20af72;
    return /*#__PURE__*/React.createElement(SignalBars, {
      value: 99.4,
      color: "var(--success)",
      segments: 20,
      height: 5,
      style: {
        width: "100%"
      }
    });
  })()))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      borderTop: "1px solid var(--line)",
      paddingTop: 4
    }
  }, slow.map(s => {
    const {
      StatusDot
    } = window.FirstSpawnWorldlightDesignSystem_20af72;
    const down = s.status === "offline";
    return /*#__PURE__*/React.createElement("div", {
      key: s.slug,
      className: "fs-trow",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 6px",
        borderRadius: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 999,
        background: down ? "var(--danger)" : "var(--muted)",
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 12.5,
        fontWeight: 600,
        color: "var(--text)"
      }
    }, s.name)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: down ? "var(--danger)" : "var(--muted)"
      }
    }, down ? "down · " + D.ago(s.lastPingSec) : s.latency + "ms · " + D.ago(s.lastPingSec)));
  })), /*#__PURE__*/React.createElement(window.ActionBtn, {
    tone: "quiet",
    onClick: () => ctx.go("collector")
  }, "Open collector"))))));
}
Object.assign(window, {
  Overview
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Overview.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Servers.jsx
try { (() => {
// FirstSpawn admin — Servers. The ranked atlas as a measured table with filters
// and per-row actions. Online counts are collector-measured (mono); rank uses
// the same activity×trust×freshness math shown elsewhere.
function SvRow({
  s,
  rank,
  ctx
}) {
  const D = window.FS_ADMIN;
  const {
    SignalBars,
    Badge
  } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const sig = D.signals(s);
  return /*#__PURE__*/React.createElement("div", {
    className: "fs-trow fs-pad-y",
    style: {
      display: "grid",
      gridTemplateColumns: "44px minmax(0,2.1fr) 1fr 1.1fr 80px 78px 1.2fr 150px",
      gap: 14,
      alignItems: "center",
      padding: "12px 16px",
      borderTop: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      fontWeight: 700,
      color: rank === 1 ? "var(--gold)" : "var(--muted)"
    }
  }, String(rank).padStart(2, "0")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(window.Avatar, {
    name: s.name,
    size: 30
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--text)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, s.name), s.verified && /*#__PURE__*/React.createElement(Badge, {
    tone: "verified"
  }, "Verified")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      marginTop: 2
    }
  }, s.address))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 12.5,
      color: "var(--muted)"
    }
  }, D.gameName(s.game), " \xB7 ", s.country), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(window.Measured, {
    size: 12.5,
    color: s.online > 0 ? "var(--success)" : "var(--muted)"
  }, D.num(s.online)), /*#__PURE__*/React.createElement(SignalBars, {
    value: sig.activity,
    color: s.online > 0 ? "var(--success)" : "var(--line)",
    segments: 12,
    height: 4,
    width: null,
    style: {
      width: "100%"
    }
  })), /*#__PURE__*/React.createElement(window.Measured, {
    size: 12.5,
    color: s.uptime < 90 ? "var(--danger)" : "var(--text)"
  }, s.uptime, "%"), /*#__PURE__*/React.createElement(window.Measured, {
    size: 12.5,
    color: "var(--text)"
  }, D.compact(s.votes)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: sig.trust < 50 ? "var(--danger)" : "var(--muted)"
    }
  }, sig.trust, "/100"), /*#__PURE__*/React.createElement(SignalBars, {
    value: sig.trust,
    color: sig.trust < 50 ? "var(--danger)" : "var(--accent)",
    segments: 12,
    height: 4,
    width: null,
    style: {
      width: "100%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(window.StatusPill, {
    status: s.status
  }), /*#__PURE__*/React.createElement(window.ActionBtn, {
    icon: "eye",
    tone: "quiet",
    title: "View",
    onClick: () => ctx.pushToast({
      title: "Opening " + s.name,
      body: s.address + " · server detail",
      tone: "primary",
      icon: "external"
    })
  })));
}
function Servers(ctx) {
  const D = window.FS_ADMIN;
  const {
    WLInput,
    WLSelect,
    Chip
  } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const [q, setQ] = React.useState("");
  const [game, setGame] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const ranked = [...D.servers].sort((a, b) => {
    const ra = D.signals(a),
      rb = D.signals(b);
    return rb.activity * rb.trust * rb.freshness - ra.activity * ra.trust * ra.freshness;
  });
  const filtered = ranked.filter(s => (game === "all" || s.game === game) && (status === "all" || (status === "flagged" ? s.status === "flagged" : status === "verified" ? s.verified : status === "attention" ? s.status === "flagged" || s.status === "offline" || s.status === "pending" : true)) && (q === "" || s.name.toLowerCase().includes(q.toLowerCase()) || s.address.toLowerCase().includes(q.toLowerCase())));
  const gameOpts = [{
    value: "all",
    label: "All games"
  }, {
    value: "hytale",
    label: "Hytale"
  }, {
    value: "mc_java",
    label: "Minecraft Java"
  }, {
    value: "mc_bedrock",
    label: "Minecraft Bedrock"
  }];
  const statusFilters = [["all", "All"], ["verified", "Verified"], ["attention", "Needs attention"], ["flagged", "Flagged"]];
  const head = ["Rank", "Server", "Game · region", "Online", "Uptime", "Votes", "Trust", "Status"];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.PageHead, {
    route: "servers",
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--muted)"
      }
    }, filtered.length, " of ", D.servers.length, " shown")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      marginBottom: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280,
      maxWidth: "100%"
    }
  }, /*#__PURE__*/React.createElement(WLInput, {
    placeholder: "Search name or address\u2026",
    value: q,
    onChange: e => setQ(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 190
    }
  }, /*#__PURE__*/React.createElement(WLSelect, {
    options: gameOpts,
    value: game,
    onChange: e => setGame(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginLeft: "auto",
      flexWrap: "wrap"
    }
  }, statusFilters.map(([id, label]) => /*#__PURE__*/React.createElement(Chip, {
    key: id,
    active: status === id,
    onClick: () => setStatus(id)
  }, label)))), /*#__PURE__*/React.createElement("div", {
    className: "wl-card",
    style: {
      borderRadius: 14,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "44px minmax(0,2.1fr) 1fr 1.1fr 80px 78px 1.2fr 150px",
      gap: 14,
      alignItems: "center",
      padding: "11px 16px",
      background: "var(--raised)"
    }
  }, head.map((h, i) => /*#__PURE__*/React.createElement("span", {
    key: h,
    className: "wl-section-label",
    style: {
      textAlign: i >= 7 ? "right" : "left"
    }
  }, h))), filtered.map((s, i) => /*#__PURE__*/React.createElement(SvRow, {
    key: s.slug,
    s: s,
    rank: i + 1,
    ctx: ctx
  })), filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "wl-dashed",
    style: {
      margin: 16,
      borderRadius: 12,
      padding: 36,
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--muted)"
    }
  }, "No servers match those filters.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      display: "flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(window.Icon, {
    name: "info",
    size: 13,
    color: "var(--muted)"
  }), "Rank = activity \xD7 trust \xD7 freshness \xB7 same math for every server \xB7 never sold."));
}
Object.assign(window, {
  Servers
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Servers.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Trust.jsx
try { (() => {
// FirstSpawn admin — Trust & abuse. Anomaly-detector flags the detector wants a
// human to confirm. Each flag shows its evidence inline; actions log to audit.
function TrEvidence({
  f
}) {
  const D = window.FS_ADMIN;
  const {
    SignalMeter
  } = window.FirstSpawnWorldlightDesignSystem_20af72;
  if (f.kind === "count_mismatch") {
    const ratio = f.metric.measured > 0 ? (f.metric.declared / f.metric.measured).toFixed(1) : "∞";
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 10.5,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--muted)"
      }
    }, "Declared"), /*#__PURE__*/React.createElement(window.Declared, {
      style: {
        marginTop: 4
      }
    }, D.num(f.metric.declared))), /*#__PURE__*/React.createElement(window.Icon, {
      name: "chevron-right",
      size: 15,
      color: "var(--muted)"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 10.5,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--muted)"
      }
    }, "Measured"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement(window.Measured, {
      size: 15
    }, D.num(f.metric.measured)))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: "auto",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--danger)"
      }
    }, ratio, "\xD7 inflated"));
  }
  if (f.kind === "vote_spike") {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 12,
        color: "var(--muted)"
      }
    }, "Votes in ", f.metric.window), /*#__PURE__*/React.createElement(window.Measured, {
      size: 15,
      color: "var(--danger)"
    }, "+", D.num(f.metric.delta))), /*#__PURE__*/React.createElement(SignalMeter, {
      label: "Velocity",
      value: Math.min(100, Math.round(f.metric.delta / 9)),
      color: "var(--danger)"
    }), /*#__PURE__*/React.createElement(SignalMeter, {
      label: "Source spread",
      value: f.severity === "high" ? 14 : 52,
      color: f.severity === "high" ? "var(--danger)" : "var(--accent)"
    }));
  }
  // uptime_forgery
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 10.5,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--muted)"
    }
  }, "Declared uptime"), /*#__PURE__*/React.createElement(window.Declared, {
    style: {
      marginTop: 4
    }
  }, f.metric.declared, "%")), /*#__PURE__*/React.createElement(window.Icon, {
    name: "chevron-right",
    size: 15,
    color: "var(--muted)"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 10.5,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--muted)"
    }
  }, "Measured 24h"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(window.Measured, {
    size: 15,
    color: "var(--danger)"
  }, f.metric.measured, "%"))));
}
function TrFlagCard({
  f,
  ctx
}) {
  const D = window.FS_ADMIN;
  const s = D.byId(f.slug);
  const done = ctx.flagState[f.id];
  return /*#__PURE__*/React.createElement("div", {
    className: "wl-card",
    style: {
      borderRadius: 14,
      padding: 18,
      opacity: done ? 0.55 : 1,
      borderColor: f.severity === "high" && !done ? "color-mix(in srgb, var(--danger) 30%, var(--line))" : "var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      flexShrink: 0,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: f.severity === "high" ? "var(--danger)" : "var(--muted)",
      border: "1px solid var(--line)",
      background: "var(--canvas)"
    }
  }, /*#__PURE__*/React.createElement(window.Icon, {
    name: "shield-alert",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 15,
      fontWeight: 600,
      color: "var(--text)"
    }
  }, s.name), /*#__PURE__*/React.createElement(window.StatusPill, {
    status: s.status
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      marginTop: 3
    }
  }, D.flagKindName(f.kind), " \xB7 ", f.id, " \xB7 ", f.evidence, " evidence points \xB7 ", D.ago(f.ageSec)))), /*#__PURE__*/React.createElement(window.SeverityTag, {
    level: f.severity
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "13px 0 14px",
      fontFamily: "var(--font-body)",
      fontSize: 13,
      lineHeight: 1.55,
      color: "var(--muted)"
    }
  }, f.detail), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "13px 15px",
      border: "1px solid var(--line)",
      borderRadius: 12,
      background: "var(--canvas)",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(TrEvidence, {
    f: f
  })), done ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      fontFamily: "var(--font-ui)",
      fontSize: 12.5,
      fontWeight: 600,
      color: done === "actioned" ? "var(--danger)" : "var(--success)"
    }
  }, /*#__PURE__*/React.createElement(window.Icon, {
    name: done === "actioned" ? "ban" : "check",
    size: 15
  }), done === "actioned" ? "Server suspended" : "Flag dismissed", " \xB7 logged to audit") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(window.ActionBtn, {
    icon: "eye",
    tone: "quiet",
    onClick: () => ctx.pushToast({
      title: "Investigation opened",
      body: f.id + " · assigned to Mara K.",
      tone: "primary",
      icon: "eye"
    })
  }, "Investigate"), /*#__PURE__*/React.createElement(window.ActionBtn, {
    icon: "ban",
    tone: "danger",
    onClick: () => ctx.resolveFlag(f.id, "actioned", "Suspended · " + s.name)
  }, "Suspend server"), /*#__PURE__*/React.createElement(window.ActionBtn, {
    icon: "check",
    tone: "quiet",
    onClick: () => ctx.resolveFlag(f.id, "dismissed", "Flag dismissed · " + s.name)
  }, "Dismiss")));
}
function Trust(ctx) {
  const D = window.FS_ADMIN;
  const {
    Chip
  } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const [filter, setFilter] = React.useState("open");
  const open = D.flags.filter(f => !ctx.flagState[f.id]);
  let list = D.flags;
  if (filter === "open") list = open;else if (filter === "high") list = D.flags.filter(f => f.severity === "high");else if (filter === "resolved") list = D.flags.filter(f => ctx.flagState[f.id]);
  const filters = [["open", "Open (" + open.length + ")"], ["high", "High severity"], ["resolved", "Resolved"], ["all", "All"]];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.PageHead, {
    route: "trust",
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--muted)"
      }
    }, open.filter(f => f.severity === "high").length, " high \xB7 ", open.length, " open")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 18,
      flexWrap: "wrap"
    }
  }, filters.map(([id, label]) => /*#__PURE__*/React.createElement(Chip, {
    key: id,
    active: filter === id,
    onClick: () => setFilter(id)
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, list.map(f => /*#__PURE__*/React.createElement(TrFlagCard, {
    key: f.id,
    f: f,
    ctx: ctx
  })), list.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "wl-dashed",
    style: {
      borderRadius: 14,
      padding: 40,
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--muted)"
    }
  }, "No flags here. The atlas is quiet.")));
}
Object.assign(window, {
  Trust
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Trust.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/Verification.jsx
try { (() => {
// FirstSpawn admin — Verification. Master/detail triage of claims (prove
// ownership) and reports (dispute data). The detail centers the trust cue:
// owner-DECLARED values (dashed, muted) set against collector-MEASURED values.
function VqEvidence({
  q
}) {
  const D = window.FS_ADMIN;
  const s = D.byId(q.slug);
  const sig = D.signals(s);
  if (q.kind === "claim") {
    const txtFound = q.id !== "VQ-2031";
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(window.SectionLabel, null, "Ownership evidence"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, [["Claimant", q.reporter], ["Listed owner", s.owner], ["Address", s.address], ["Listed since", s.since]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 12.5,
        color: "var(--muted)"
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 12.5,
        color: "var(--text)"
      }
    }, v)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 13px",
        borderRadius: 12,
        border: "1px solid " + (txtFound ? "color-mix(in srgb, var(--success) 40%, var(--line))" : "var(--line)"),
        borderStyle: txtFound ? "solid" : "dashed",
        background: txtFound ? "color-mix(in srgb, var(--success) 8%, transparent)" : "transparent"
      }
    }, /*#__PURE__*/React.createElement(window.Icon, {
      name: txtFound ? "check" : "clock",
      size: 16,
      color: txtFound ? "var(--success)" : "var(--muted)"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 12.5,
        fontWeight: 600,
        color: "var(--text)"
      }
    }, "DNS TXT verification"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--muted)",
        marginTop: 2
      }
    }, txtFound ? "_firstspawn=" + s.slug + "-ok · record detected" : "record not yet detected · claimant notified"))));
  }

  // report — declared vs measured
  const declared = s.declared,
    measured = s.online;
  const ratio = measured > 0 ? (declared / measured).toFixed(1) : "∞";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(window.SectionLabel, null, "Declared vs. measured"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "13px 14px",
      border: "1px dashed var(--line)",
      borderRadius: 12,
      background: "transparent"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--muted)"
    }
  }, "Owner-declared"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 7
    }
  }, /*#__PURE__*/React.createElement(window.Measured, {
    size: 24,
    weight: 700,
    color: "var(--muted)"
  }, D.num(declared))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--muted)",
      marginTop: 3
    }
  }, "self-reported peak")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "13px 14px",
      border: "1px solid color-mix(in srgb, var(--danger) 35%, var(--line))",
      borderRadius: 12,
      background: "color-mix(in srgb, var(--danger) 7%, transparent)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--danger)"
    }
  }, "Collector-measured"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 7
    }
  }, /*#__PURE__*/React.createElement(window.Measured, {
    size: 24,
    weight: 700,
    color: "var(--text)"
  }, D.num(measured))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--muted)",
      marginTop: 3
    }
  }, "30-day measured peak"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--danger)"
    }
  }, /*#__PURE__*/React.createElement(window.Icon, {
    name: "alert",
    size: 14,
    color: "var(--danger)"
  }), "declared is ", ratio, "\xD7 the measured peak"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      borderTop: "1px solid var(--line)",
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement(window.SectionLabel, null, "Live signal breakdown"), (() => {
    const {
      SignalMeter
    } = window.FirstSpawnWorldlightDesignSystem_20af72;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement(SignalMeter, {
      label: "Activity",
      value: sig.activity,
      color: "var(--success)"
    }), /*#__PURE__*/React.createElement(SignalMeter, {
      label: "Trust",
      value: sig.trust,
      color: sig.trust < 50 ? "var(--danger)" : "var(--accent)"
    }), /*#__PURE__*/React.createElement(SignalMeter, {
      label: "Freshness",
      value: sig.freshness,
      color: "var(--accent)"
    }));
  })()));
}
function VqDetail({
  q,
  ctx
}) {
  const D = window.FS_ADMIN;
  const s = D.byId(q.slug);
  const done = ctx.resolved[q.id];
  if (!q) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      textTransform: "uppercase",
      letterSpacing: "0.08em"
    }
  }, q.kind), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, "\xB7 ", q.id), q.escalated && /*#__PURE__*/React.createElement(window.SeverityTag, {
    level: "high"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 20,
      color: "var(--text)"
    }
  }, q.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 9
    }
  }, /*#__PURE__*/React.createElement(window.Avatar, {
    name: s.name,
    size: 24
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--text)"
    }
  }, s.name), (() => {
    const {
      Badge
    } = window.FirstSpawnWorldlightDesignSystem_20af72;
    return /*#__PURE__*/React.createElement(Badge, {
      tone: "country"
    }, s.country);
  })(), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, "\xB7 ", D.gameName(s.game), " \xB7 filed ", D.ago(q.ageSec), " by ", q.reporter))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      lineHeight: 1.6,
      color: "var(--muted)"
    }
  }, q.detail), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      border: "1px solid var(--line)",
      borderRadius: 12,
      background: "var(--canvas)"
    }
  }, /*#__PURE__*/React.createElement(VqEvidence, {
    q: q
  })), done ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "13px 15px",
      borderRadius: 12,
      border: "1px solid var(--line)",
      background: "var(--raised)"
    }
  }, /*#__PURE__*/React.createElement(window.Icon, {
    name: done === "rejected" ? "x" : done === "escalated" ? "arrow-up-right" : "check",
    size: 16,
    color: done === "rejected" ? "var(--danger)" : done === "escalated" ? "var(--accent)" : "var(--success)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text)",
      textTransform: "capitalize"
    }
  }, done), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, "\xB7 logged to audit as Mara K.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(window.ActionBtn, {
    icon: "check",
    tone: "primary",
    onClick: () => ctx.resolveQueue(q.id, "approved", (q.kind === "claim" ? "Claim granted · " : "Report upheld · ") + s.name)
  }, q.kind === "claim" ? "Grant ownership" : "Uphold & flag"), /*#__PURE__*/React.createElement(window.ActionBtn, {
    icon: "x",
    tone: "danger",
    onClick: () => ctx.resolveQueue(q.id, "rejected", "Dismissed · " + q.title)
  }, q.kind === "claim" ? "Deny" : "Dismiss"), /*#__PURE__*/React.createElement(window.ActionBtn, {
    icon: "arrow-up-right",
    tone: "quiet",
    onClick: () => ctx.resolveQueue(q.id, "escalated", "Escalated · " + q.title)
  }, "Escalate"), /*#__PURE__*/React.createElement(window.ActionBtn, {
    icon: "info",
    tone: "quiet",
    onClick: () => ctx.pushToast({
      title: "Info requested",
      body: q.id + " · owner notified",
      tone: "primary",
      icon: "info"
    })
  }, "Request info")));
}
function Verification(ctx) {
  const D = window.FS_ADMIN;
  const {
    Chip
  } = window.FirstSpawnWorldlightDesignSystem_20af72;
  const [filter, setFilter] = React.useState("all");
  const list = D.queue.filter(q => filter === "all" ? true : filter === "escalated" ? q.escalated : q.kind === filter);
  const firstOpen = (D.queue.find(q => !ctx.resolved[q.id]) || D.queue[0]).id;
  const [selId, setSelId] = React.useState(firstOpen);
  const sel = D.queue.find(q => q.id === selId) || list[0];
  const filters = [["all", "All"], ["claim", "Claims"], ["report", "Reports"], ["escalated", "Escalated"]];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(window.PageHead, {
    route: "verification",
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "var(--muted)"
      }
    }, D.queue.filter(q => !ctx.resolved[q.id]).length, " open \xB7 ", D.queue.length, " total")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 16,
      flexWrap: "wrap"
    }
  }, filters.map(([id, label]) => /*#__PURE__*/React.createElement(Chip, {
    key: id,
    active: filter === id,
    onClick: () => setFilter(id)
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(320px, 1fr) 1.5fr",
      gap: 16,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wl-card",
    style: {
      borderRadius: 14,
      overflow: "hidden"
    }
  }, list.map(q => {
    const s = D.byId(q.slug);
    const active = sel && sel.id === q.id;
    const done = ctx.resolved[q.id];
    return /*#__PURE__*/React.createElement("button", {
      key: q.id,
      className: "fs-trow fs-pad-y",
      onClick: () => setSelId(q.id),
      style: {
        display: "grid",
        gridTemplateColumns: "26px minmax(0,1fr) auto",
        gap: 11,
        alignItems: "center",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        padding: "13px 13px",
        borderBottom: "1px solid var(--line)",
        borderLeft: "3px solid " + (active ? "var(--accent)" : "transparent"),
        background: active ? "var(--raised)" : "transparent",
        opacity: done ? 0.55 : 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: q.kind === "report" ? "var(--danger)" : "var(--muted)",
        border: "1px solid var(--line)",
        background: "var(--canvas)"
      }
    }, /*#__PURE__*/React.createElement(window.Icon, {
      name: q.kind === "report" ? "flag" : "shield-check",
      size: 13
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, q.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--muted)",
        marginTop: 2
      }
    }, s.name, " \xB7 ", D.ago(q.ageSec))), done ? /*#__PURE__*/React.createElement(window.Icon, {
      name: "check",
      size: 15,
      color: "var(--success)"
    }) : /*#__PURE__*/React.createElement(window.SeverityTag, {
      level: q.priority
    }));
  })), /*#__PURE__*/React.createElement("div", {
    className: "wl-card",
    style: {
      borderRadius: 14,
      padding: 22,
      position: "sticky",
      top: 84
    }
  }, sel ? /*#__PURE__*/React.createElement(VqDetail, {
    q: sel,
    ctx: ctx
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--muted)"
    }
  }, "Select an item."))));
}
Object.assign(window, {
  Verification
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/Verification.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/admin-data.js
try { (() => {
// FirstSpawn admin console — mock data + helpers.
// Internal staff view: the atlas as a "calm observatory". Measured values are
// what the collector pinged; declared values are owner-submitted (the trust cue).
window.FS_ADMIN = function () {
  // status: live | verified | pending | flagged | suspended | offline
  const servers = [{
    slug: "aether",
    name: "Aether Realms",
    game: "hytale",
    country: "DE",
    online: 1284,
    declared: 1300,
    max: 2000,
    uptime: 99.6,
    votes: 4200,
    votesToday: 312,
    verified: true,
    status: "live",
    lastPingSec: 3,
    latency: 41,
    address: "play.aether.gg",
    owner: "mara.k",
    since: "2024-08"
  }, {
    slug: "lumenvale",
    name: "Lumenvale",
    game: "hytale",
    country: "NO",
    online: 1502,
    declared: 1500,
    max: 2400,
    uptime: 99.8,
    votes: 5100,
    votesToday: 418,
    verified: true,
    status: "live",
    lastPingSec: 1,
    latency: 33,
    address: "play.lumenvale.world",
    owner: "toves",
    since: "2024-05"
  }, {
    slug: "hollowreach",
    name: "Hollowreach",
    game: "hytale",
    country: "JP",
    online: 833,
    declared: 840,
    max: 1400,
    uptime: 99.2,
    votes: 3010,
    votesToday: 207,
    verified: true,
    status: "live",
    lastPingSec: 2,
    latency: 58,
    address: "play.hollowreach.jp",
    owner: "kenji.r",
    since: "2024-11"
  }, {
    slug: "skyhaven",
    name: "Skyhaven SMP",
    game: "mc_java",
    country: "US",
    online: 942,
    declared: 950,
    max: 1500,
    uptime: 99.4,
    votes: 3850,
    votesToday: 266,
    verified: true,
    status: "verified",
    lastPingSec: 6,
    latency: 72,
    address: "mc.skyhaven.net",
    owner: "dana_w",
    since: "2024-03"
  }, {
    slug: "groveholt",
    name: "Groveholt",
    game: "mc_java",
    country: "CA",
    online: 466,
    declared: 470,
    max: 800,
    uptime: 99.1,
    votes: 1980,
    votesToday: 121,
    verified: true,
    status: "verified",
    lastPingSec: 4,
    latency: 64,
    address: "play.groveholt.ca",
    owner: "fern",
    since: "2025-01"
  }, {
    slug: "varskeep",
    name: "Varskeep",
    game: "mc_java",
    country: "FI",
    online: 254,
    declared: 250,
    max: 500,
    uptime: 99.5,
    votes: 1320,
    votesToday: 64,
    verified: true,
    status: "verified",
    lastPingSec: 5,
    latency: 49,
    address: "mc.varskeep.eu",
    owner: "oksi",
    since: "2025-02"
  }, {
    slug: "ironhold",
    name: "Ironhold",
    game: "mc_java",
    country: "GB",
    online: 610,
    declared: 620,
    max: 900,
    uptime: 98.7,
    votes: 2900,
    votesToday: 188,
    verified: false,
    status: "pending",
    lastPingSec: 9,
    latency: 88,
    address: "play.ironhold.gg",
    owner: "b.solace",
    since: "2025-05"
  }, {
    slug: "saltmarsh",
    name: "Saltmarsh",
    game: "mc_java",
    country: "AU",
    online: 177,
    declared: 180,
    max: 400,
    uptime: 98.2,
    votes: 740,
    votesToday: 51,
    verified: false,
    status: "pending",
    lastPingSec: 12,
    latency: 121,
    address: "play.saltmarsh.au",
    owner: "reef.io",
    since: "2025-06"
  }, {
    slug: "emberfall",
    name: "Emberfall",
    game: "hytale",
    country: "TR",
    online: 720,
    declared: 2400,
    max: 1100,
    uptime: 97.9,
    votes: 2210,
    votesToday: 96,
    verified: false,
    status: "flagged",
    lastPingSec: 7,
    latency: 96,
    address: "play.emberfall.gg",
    owner: "atlas99",
    since: "2025-04"
  }, {
    slug: "tideborn",
    name: "Tideborn",
    game: "mc_bedrock",
    country: "BR",
    online: 388,
    declared: 5000,
    max: 700,
    uptime: 96.4,
    votes: 1740,
    votesToday: 47,
    verified: false,
    status: "flagged",
    lastPingSec: 8,
    latency: 134,
    address: "play.tideborn.gg",
    owner: "marejad",
    since: "2025-05"
  }, {
    slug: "nethershore",
    name: "Nethershore",
    game: "mc_bedrock",
    country: "MX",
    online: 512,
    declared: 520,
    max: 900,
    uptime: 98.0,
    votes: 3120,
    votesToday: 812,
    verified: false,
    status: "flagged",
    lastPingSec: 6,
    latency: 102,
    address: "play.nethershore.mx",
    owner: "lobo",
    since: "2025-03"
  }, {
    slug: "cragmoor",
    name: "Cragmoor",
    game: "mc_java",
    country: "PL",
    online: 0,
    declared: 600,
    max: 900,
    uptime: 71.3,
    votes: 1450,
    votesToday: 0,
    verified: true,
    status: "offline",
    lastPingSec: 5400,
    latency: null,
    address: "mc.cragmoor.pl",
    owner: "wisla",
    since: "2024-09"
  }];

  // Verification queue — claims (prove ownership) and reports (dispute data).
  const queue = [{
    id: "VQ-2041",
    kind: "report",
    slug: "tideborn",
    title: "Inflated player count",
    detail: "Owner-declared peak of 5,000 players. Collector has never measured above 700 in 30 days.",
    priority: "high",
    escalated: false,
    ageSec: 240,
    reporter: "system.anomaly"
  }, {
    id: "VQ-2039",
    kind: "report",
    slug: "nethershore",
    title: "Suspected vote manipulation",
    detail: "+812 votes in a 58-minute window from a narrow IP range. Pattern matches a botnet signature.",
    priority: "high",
    escalated: true,
    ageSec: 1080,
    reporter: "system.anomaly"
  }, {
    id: "VQ-2036",
    kind: "claim",
    slug: "ironhold",
    title: "Ownership claim",
    detail: "Claimant added the requested DNS TXT record. Awaiting a final propagation check before grant.",
    priority: "medium",
    escalated: false,
    ageSec: 5400,
    reporter: "b.solace"
  }, {
    id: "VQ-2034",
    kind: "report",
    slug: "emberfall",
    title: "Inflated player count",
    detail: "Declared 2,400 against a measured peak of 760. Below Tideborn severity but trending up.",
    priority: "medium",
    escalated: false,
    ageSec: 9000,
    reporter: "p.castellan"
  }, {
    id: "VQ-2031",
    kind: "claim",
    slug: "saltmarsh",
    title: "Ownership claim",
    detail: "New listing claim. DNS TXT not yet detected — claimant notified, awaiting record.",
    priority: "low",
    escalated: false,
    ageSec: 16200,
    reporter: "reef.io"
  }, {
    id: "VQ-2029",
    kind: "report",
    slug: "cragmoor",
    title: "Re-verify after outage",
    detail: "Collector lost contact 90 minutes ago. Confirm whether the host migrated or went dark.",
    priority: "medium",
    escalated: false,
    ageSec: 5400,
    reporter: "system.collector"
  }, {
    id: "VQ-2025",
    kind: "report",
    slug: "hollowreach",
    title: "Brand impersonation",
    detail: "A second listing reuses Hollowreach's name and sigil. Owner filed a takedown.",
    priority: "low",
    escalated: false,
    ageSec: 28800,
    reporter: "kenji.r"
  }];

  // Trust / anti-abuse flags raised by the anomaly detector.
  const flags = [{
    id: "FL-118",
    slug: "tideborn",
    kind: "count_mismatch",
    severity: "high",
    metric: {
      declared: 5000,
      measured: 388
    },
    detail: "Declared count is 12.9× the 30-day measured peak.",
    evidence: 18,
    ageSec: 240
  }, {
    id: "FL-117",
    slug: "nethershore",
    kind: "vote_spike",
    severity: "high",
    metric: {
      window: "58m",
      delta: 812
    },
    detail: "Vote velocity 41× baseline from a /24 subnet.",
    evidence: 23,
    ageSec: 1080
  }, {
    id: "FL-114",
    slug: "emberfall",
    kind: "count_mismatch",
    severity: "medium",
    metric: {
      declared: 2400,
      measured: 720
    },
    detail: "Declared count 3.3× measured peak. Watch-listed.",
    evidence: 9,
    ageSec: 9000
  }, {
    id: "FL-112",
    slug: "cragmoor",
    kind: "uptime_forgery",
    severity: "medium",
    metric: {
      declared: 99.9,
      measured: 71.3
    },
    detail: "Declared uptime contradicts collector log gaps.",
    evidence: 6,
    ageSec: 5400
  }, {
    id: "FL-109",
    slug: "saltmarsh",
    kind: "vote_spike",
    severity: "low",
    metric: {
      window: "3h",
      delta: 74
    },
    detail: "Mild vote bump, single source. Low confidence.",
    evidence: 3,
    ageSec: 16200
  }];

  // Recent moderation + system activity (audit log).
  const audit = [{
    id: "A-5521",
    actor: "mara.k",
    role: "mod",
    action: "granted",
    target: "Aether Realms",
    note: "ownership verified · DNS TXT",
    ageSec: 600
  }, {
    id: "A-5520",
    actor: "system.collector",
    role: "system",
    action: "marked down",
    target: "Cragmoor",
    note: "no response for 90m",
    ageSec: 5400
  }, {
    id: "A-5519",
    actor: "system.anomaly",
    role: "system",
    action: "flagged",
    target: "Tideborn",
    note: "count_mismatch · severity high",
    ageSec: 240
  }, {
    id: "A-5518",
    actor: "j.okonkwo",
    role: "mod",
    action: "suspended",
    target: "Hollow II",
    note: "brand impersonation · takedown",
    ageSec: 1800
  }, {
    id: "A-5517",
    actor: "system.rank",
    role: "system",
    action: "recomputed",
    target: "atlas",
    note: "142 servers · rank = activity×trust×freshness",
    ageSec: 2700
  }, {
    id: "A-5516",
    actor: "mara.k",
    role: "mod",
    action: "dismissed",
    target: "Varskeep",
    note: "vote_spike · false positive",
    ageSec: 4200
  }, {
    id: "A-5515",
    actor: "p.castellan",
    role: "mod",
    action: "escalated",
    target: "Nethershore",
    note: "vote manipulation · to trust lead",
    ageSec: 1080
  }, {
    id: "A-5514",
    actor: "system.collector",
    role: "system",
    action: "restored",
    target: "Skyhaven SMP",
    note: "ping resumed · 72ms",
    ageSec: 7200
  }];

  // Platform-wide KPIs (the whole atlas, not just the sample above).
  const kpis = {
    serversActive: 96,
    serversTotal: 142,
    serversDelta: 4,
    playersOnline: 38402,
    playersDeltaPct: 6.2,
    votesToday: 12847,
    votesDelta: 2100,
    collectorUptime: 99.4,
    collectorUptimeDelta: -0.3
  };
  const games = {
    mc_java: "Minecraft Java",
    mc_bedrock: "Minecraft Bedrock",
    hytale: "Hytale"
  };
  const gameName = g => games[g] || "Game";
  const flagKindName = k => ({
    count_mismatch: "Count mismatch",
    vote_spike: "Vote spike",
    uptime_forgery: "Uptime forgery"
  })[k] || k;
  function ago(sec) {
    if (sec < 60) return sec + "s ago";
    const m = Math.floor(sec / 60);
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  }
  function num(n) {
    return n.toLocaleString("en-US");
  }
  function compact(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
    return String(n);
  }
  const byId = slug => servers.find(s => s.slug === slug) || {
    name: slug,
    country: "—",
    game: ""
  };

  // Simple Worldlight signal math (mirrors the web kit).
  function signals(s) {
    const activity = s.max > 0 ? Math.min(100, Math.max(4, Math.round(s.online / s.max * 100))) : 0;
    const charSum = s.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const trust = s.status === "flagged" ? 28 + charSum % 18 : 64 + charSum % 31;
    const freshness = s.status === "offline" ? 8 : Math.max(20, 100 - Math.min(80, Math.floor(s.lastPingSec / 6)));
    return {
      activity,
      trust,
      freshness
    };
  }
  return {
    servers,
    queue,
    flags,
    audit,
    kpis,
    signals,
    gameName,
    flagKindName,
    ago,
    num,
    compact,
    byId
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/admin-data.js", error: String((e && e.message) || e) }); }

// ui_kits/admin/parts.jsx
try { (() => {
// FirstSpawn admin console — shared parts. Composes the Worldlight DS bundle.
// Read the namespace lazily so an async bundle load is safe.
const _DS = () => window.FirstSpawnWorldlightDesignSystem_20af72;

/* ----------------------------------------------------------------------------
 * Iconography — inline Lucide path data (stroke ~1.75, rounded joins).
 * The DS mandates Lucide; inlining keeps the console offline-safe.
 * -------------------------------------------------------------------------- */
const FS_ICONS = {
  "dashboard": [["rect", {
    width: 7,
    height: 9,
    x: 3,
    y: 3,
    rx: 1
  }], ["rect", {
    width: 7,
    height: 5,
    x: 14,
    y: 3,
    rx: 1
  }], ["rect", {
    width: 7,
    height: 9,
    x: 14,
    y: 12,
    rx: 1
  }], ["rect", {
    width: 7,
    height: 5,
    x: 3,
    y: 16,
    rx: 1
  }]],
  "server": [["rect", {
    width: 20,
    height: 8,
    x: 2,
    y: 2,
    rx: 2
  }], ["rect", {
    width: 20,
    height: 8,
    x: 2,
    y: 14,
    rx: 2
  }], ["path", {
    d: "M6 6h.01"
  }], ["path", {
    d: "M6 18h.01"
  }]],
  "dish": [["path", {
    d: "M4 10a7.31 7.31 0 0 0 10 10Z"
  }], ["path", {
    d: "m9 15 3-3"
  }], ["path", {
    d: "M17 13a6 6 0 0 0-6-6"
  }], ["path", {
    d: "M21 13A10 10 0 0 0 11 3"
  }]],
  "shield-check": [["path", {
    d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
  }], ["path", {
    d: "m9 12 2 2 4-4"
  }]],
  "shield-alert": [["path", {
    d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
  }], ["path", {
    d: "M12 8v4"
  }], ["path", {
    d: "M12 16h.01"
  }]],
  "history": [["path", {
    d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
  }], ["path", {
    d: "M3 3v5h5"
  }], ["path", {
    d: "M12 7v5l4 2"
  }]],
  "search": [["circle", {
    cx: 11,
    cy: 11,
    r: 8
  }], ["path", {
    d: "m21 21-4.3-4.3"
  }]],
  "bell": [["path", {
    d: "M10.268 21a2 2 0 0 0 3.464 0"
  }], ["path", {
    d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
  }]],
  "check": [["path", {
    d: "M20 6 9 17l-5-5"
  }]],
  "x": [["path", {
    d: "M18 6 6 18"
  }], ["path", {
    d: "m6 6 12 12"
  }]],
  "chevron-right": [["path", {
    d: "m9 18 6-6-6-6"
  }]],
  "chevron-down": [["path", {
    d: "m6 9 6 6 6-6"
  }]],
  "arrow-up-right": [["path", {
    d: "M7 7h10v10"
  }], ["path", {
    d: "M7 17 17 7"
  }]],
  "arrow-down-right": [["path", {
    d: "M7 7v10h10"
  }], ["path", {
    d: "M17 7 7 17"
  }]],
  "users": [["path", {
    d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
  }], ["circle", {
    cx: 9,
    cy: 7,
    r: 4
  }], ["path", {
    d: "M22 21v-2a4 4 0 0 0-3-3.87"
  }], ["path", {
    d: "M16 3.13a4 4 0 0 1 0 7.75"
  }]],
  "trending-up": [["path", {
    d: "M16 7h6v6"
  }], ["path", {
    d: "m22 7-8.5 8.5-5-5L2 17"
  }]],
  "alert": [["path", {
    d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
  }], ["path", {
    d: "M12 9v4"
  }], ["path", {
    d: "M12 17h.01"
  }]],
  "flag": [["path", {
    d: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
  }], ["path", {
    d: "M4 22v-7"
  }]],
  "clock": [["circle", {
    cx: 12,
    cy: 12,
    r: 10
  }], ["path", {
    d: "M12 6v6l4 2"
  }]],
  "eye": [["path", {
    d: "M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"
  }], ["circle", {
    cx: 12,
    cy: 12,
    r: 3
  }]],
  "ban": [["circle", {
    cx: 12,
    cy: 12,
    r: 10
  }], ["path", {
    d: "m4.9 4.9 14.2 14.2"
  }]],
  "refresh": [["path", {
    d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
  }], ["path", {
    d: "M21 3v5h-5"
  }], ["path", {
    d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
  }], ["path", {
    d: "M8 16H3v5"
  }]],
  "database": [["ellipse", {
    cx: 12,
    cy: 5,
    rx: 9,
    ry: 3
  }], ["path", {
    d: "M3 5v14a9 3 0 0 0 18 0V5"
  }], ["path", {
    d: "M3 12a9 3 0 0 0 18 0"
  }]],
  "arrow-up": [["path", {
    d: "m5 12 7-7 7 7"
  }], ["path", {
    d: "M12 19V5"
  }]],
  "filter": [["path", {
    d: "M3 4.5h18l-7 8v6l-4 2v-8z"
  }]],
  "external": [["path", {
    d: "M15 3h6v6"
  }], ["path", {
    d: "M10 14 21 3"
  }], ["path", {
    d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
  }]],
  "logout": [["path", {
    d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
  }], ["path", {
    d: "m16 17 5-5-5-5"
  }], ["path", {
    d: "M21 12H9"
  }]],
  "info": [["circle", {
    cx: 12,
    cy: 12,
    r: 10
  }], ["path", {
    d: "M12 16v-4"
  }], ["path", {
    d: "M12 8h.01"
  }]]
};
function Icon({
  name,
  size = 18,
  sw = 1.75,
  color = "currentColor",
  style
}) {
  const node = FS_ICONS[name];
  if (!node) return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: style
  });
  return /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: "block",
      flexShrink: 0,
      ...style
    }
  }, node.map((c, i) => React.createElement(c[0], {
    key: i,
    ...c[1]
  })));
}

/* ---- Small shared atoms -------------------------------------------------- */

function SectionLabel({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "wl-section-label",
    style: style
  }, children);
}

// Measured number — always mono (the trust cue).
function Measured({
  children,
  color = "var(--text)",
  size = 13,
  weight = 600,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing: "-0.01em",
      ...style
    }
  }, children);
}

// Owner-declared number — muted, set on a dashed well to read as "claimed, not measured".
function Declared({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--muted)",
      border: "1px dashed var(--line)",
      borderRadius: 6,
      padding: "1px 6px",
      ...style
    }
  }, children);
}
const SEV = {
  high: {
    color: "var(--danger)",
    label: "High"
  },
  medium: {
    color: "var(--muted)",
    label: "Medium"
  },
  low: {
    color: "var(--muted)",
    label: "Low"
  }
};
function SeverityTag({
  level
}) {
  const s = SEV[level] || SEV.low;
  const dashed = level !== "high";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: s.color,
      padding: "2px 8px",
      borderRadius: 999,
      border: (dashed ? "1px dashed " : "1px solid ") + (level === "high" ? "color-mix(in srgb, var(--danger) 45%, transparent)" : "var(--line)"),
      background: level === "high" ? "color-mix(in srgb, var(--danger) 12%, transparent)" : "transparent"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: 999,
      background: s.color
    }
  }), s.label);
}

// Status pill for a server's lifecycle state.
const STATUS = {
  live: {
    c: "var(--success)",
    t: "Live"
  },
  verified: {
    c: "var(--success)",
    t: "Verified"
  },
  pending: {
    c: "var(--muted)",
    t: "Pending"
  },
  flagged: {
    c: "var(--danger)",
    t: "Flagged"
  },
  suspended: {
    c: "var(--danger)",
    t: "Suspended"
  },
  offline: {
    c: "var(--muted)",
    t: "Offline"
  }
};
function StatusPill({
  status
}) {
  const s = STATUS[status] || STATUS.pending;
  const quiet = status === "pending" || status === "offline";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "var(--font-ui)",
      fontSize: 11.5,
      fontWeight: 600,
      color: s.c,
      padding: "3px 9px 3px 8px",
      borderRadius: 999,
      border: (quiet ? "1px dashed " : "1px solid ") + "var(--line)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: s.c
    }
  }), s.t);
}

// Tiny owner/system avatar from initials. System actors read as mono glyph tiles.
function Avatar({
  name,
  size = 26,
  system = false
}) {
  const initials = system ? "•" : name.replace(/[^a-zA-Z]/g, " ").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: system ? 8 : 999,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: system ? "var(--font-mono)" : "var(--font-ui)",
      fontWeight: 700,
      fontSize: size * 0.4,
      color: system ? "var(--muted)" : "var(--text)",
      background: "var(--raised)",
      border: "1px solid var(--line)"
    }
  }, initials);
}

// Section panel: hairline card with a labelled header bar.
function Panel({
  title,
  sub,
  action,
  children,
  pad = true,
  style
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "wl-card",
    style: {
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "13px 16px",
      borderBottom: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, title), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, sub)), action), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pad ? 16 : 0,
      flex: 1
    }
  }, children));
}

// A small text/icon action button used inside rows + detail panels.
function ActionBtn({
  icon,
  children,
  tone = "quiet",
  onClick,
  title
}) {
  const tones = {
    quiet: {
      bg: "transparent",
      bd: "var(--line)",
      fg: "var(--text)"
    },
    primary: {
      bg: "var(--accent)",
      bd: "var(--accent-deep)",
      fg: "var(--on-accent)"
    },
    success: {
      bg: "transparent",
      bd: "color-mix(in srgb, var(--success) 55%, var(--line))",
      fg: "var(--success)"
    },
    danger: {
      bg: "transparent",
      bd: "color-mix(in srgb, var(--danger) 55%, var(--line))",
      fg: "var(--danger)"
    }
  };
  const t = tones[tone] || tones.quiet;
  return /*#__PURE__*/React.createElement("button", {
    className: "wl-btn",
    onClick: onClick,
    title: title,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "var(--font-ui)",
      fontSize: 12.5,
      fontWeight: 600,
      cursor: "pointer",
      color: t.fg,
      background: t.bg,
      border: "1px solid " + t.bd,
      borderRadius: 10,
      padding: children ? "7px 12px" : "7px",
      minHeight: 34,
      lineHeight: 1
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15
  }), children);
}

/* ---- Sidebar ------------------------------------------------------------- */

const NAV = [{
  group: "Monitor",
  items: [{
    id: "overview",
    label: "Overview",
    icon: "dashboard"
  }, {
    id: "servers",
    label: "Servers",
    icon: "server"
  }, {
    id: "collector",
    label: "Collector",
    icon: "dish"
  }]
}, {
  group: "Moderate",
  items: [{
    id: "verification",
    label: "Verification",
    icon: "shield-check"
  }, {
    id: "trust",
    label: "Trust & abuse",
    icon: "shield-alert"
  }, {
    id: "audit",
    label: "Audit log",
    icon: "history"
  }]
}];
function Sidebar({
  route,
  onNavigate,
  counts
}) {
  const {
    Sigil
  } = _DS();
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 236,
      flexShrink: 0,
      alignSelf: "flex-start",
      position: "sticky",
      top: 0,
      height: "100vh",
      background: "var(--panel)",
      borderRight: "1px solid var(--line)",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 18px 16px",
      borderBottom: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      border: "1px solid var(--line)",
      background: "var(--canvas)"
    }
  }, /*#__PURE__*/React.createElement(Sigil, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 13,
      letterSpacing: "0.04em",
      color: "var(--text)",
      textTransform: "uppercase"
    }
  }, "FIRST", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, "SPAWN")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--muted)"
    }
  }, "Admin console")))), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "14px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, NAV.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.group,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    style: {
      padding: "0 8px 6px"
    }
  }, g.group), g.items.map(it => {
    const active = route === it.id;
    const badge = counts && counts[it.id];
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onNavigate(it.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
        fontSize: 13.5,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--text)" : "var(--muted)",
        background: active ? "var(--raised)" : "transparent",
        border: "1px solid " + (active ? "var(--line)" : "transparent"),
        borderRadius: 10,
        padding: "8px 10px",
        position: "relative",
        minHeight: 38,
        transition: "background var(--dur-fast), color var(--dur-fast)"
      },
      onMouseEnter: e => {
        if (!active) e.currentTarget.style.background = "color-mix(in srgb, var(--raised) 55%, transparent)";
      },
      onMouseLeave: e => {
        if (!active) e.currentTarget.style.background = "transparent";
      }
    }, active && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: -12,
        top: 9,
        bottom: 9,
        width: 3,
        borderRadius: 999,
        background: "var(--accent)"
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 17,
      color: active ? "var(--accent)" : "currentColor"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, it.label), badge ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 700,
        minWidth: 20,
        textAlign: "center",
        color: it.id === "trust" ? "var(--danger)" : "var(--accent)",
        border: "1px solid " + (it.id === "trust" ? "color-mix(in srgb, var(--danger) 45%, var(--line))" : "color-mix(in srgb, var(--accent) 45%, var(--line))"),
        borderRadius: 999,
        padding: "1px 6px"
      }
    }, badge) : null);
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      borderTop: "1px solid var(--line)",
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--muted)",
      padding: "0 4px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: "var(--success)",
      flexShrink: 0
    },
    className: "wl-blink"
  }), "collector healthy \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--success)"
    }
  }, "96"), " pinging"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 8px",
      border: "1px solid var(--line)",
      borderRadius: 10,
      background: "var(--canvas)"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Mara K",
    size: 28
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.25,
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--text)"
    }
  }, "Mara K."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, "Trust moderator")), /*#__PURE__*/React.createElement(Icon, {
    name: "logout",
    size: 15,
    color: "var(--muted)",
    style: {
      cursor: "pointer"
    }
  }))));
}

/* ---- Topbar -------------------------------------------------------------- */

const ROUTE_TITLE = {
  overview: "Overview",
  servers: "Servers",
  collector: "Collector",
  verification: "Verification",
  trust: "Trust & abuse",
  audit: "Audit log"
};
const ROUTE_BLURB = {
  overview: "A calm observatory of the atlas.",
  servers: "Every tracked world — measured, not declared.",
  collector: "Live ping health across the atlas.",
  verification: "Claims and reports awaiting a decision.",
  trust: "Anomalies the detector wants a human to confirm.",
  audit: "Every moderation and system action, in order."
};
function Topbar({
  route,
  theme,
  onToggleTheme,
  density,
  onToggleDensity,
  onNavigate,
  updated
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      height: 64,
      flexShrink: 0,
      borderBottom: "1px solid var(--line)",
      background: "color-mix(in srgb, var(--canvas) 88%, transparent)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "0 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, "atlas"), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 14,
    color: "var(--muted)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--text)"
    }
  }, ROUTE_TITLE[route] || "Overview"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      marginLeft: 14,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: 999,
      background: "var(--success)"
    },
    className: "wl-blink"
  }), "updated ", updated)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 36,
      padding: "0 12px",
      border: "1px solid var(--line)",
      borderRadius: 999,
      background: "var(--input-bg)",
      color: "var(--muted)",
      minWidth: 210
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search servers, owners, IDs\u2026",
    style: {
      flex: 1,
      background: "transparent",
      border: "none",
      outline: "none",
      color: "var(--text)",
      fontFamily: "var(--font-ui)",
      fontSize: 12.5
    }
  }), /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: "var(--muted)",
      border: "1px solid var(--line)",
      borderRadius: 5,
      padding: "1px 5px"
    }
  }, "/")), /*#__PURE__*/React.createElement(IconBtn, {
    name: "filter",
    title: "Density",
    onClick: onToggleDensity,
    active: density === "compact"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(IconBtn, {
    name: "bell",
    title: "Notifications"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 7,
      height: 7,
      borderRadius: 999,
      background: "var(--danger)",
      border: "1.5px solid var(--canvas)"
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "wl-btn",
    onClick: onToggleTheme,
    title: "Toggle theme",
    style: {
      height: 36,
      padding: "0 13px",
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      cursor: "pointer",
      fontFamily: "var(--font-ui)",
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--muted)",
      background: "transparent",
      border: "1px solid var(--line)",
      borderRadius: 999
    }
  }, theme === "day" ? "☀ Day" : "☾ Dusk")));
}
function IconBtn({
  name,
  title,
  onClick,
  active
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "wl-btn",
    onClick: onClick,
    title: title,
    style: {
      width: 36,
      height: 36,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: active ? "var(--accent)" : "var(--muted)",
      background: active ? "var(--raised)" : "transparent",
      border: "1px solid " + (active ? "color-mix(in srgb, var(--accent) 45%, var(--line))" : "var(--line)"),
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: name,
    size: 17
  }));
}

// Page header inside the content area (big display title + blurb).
function PageHead({
  route,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 26,
      letterSpacing: "-0.01em",
      color: "var(--text)"
    }
  }, ROUTE_TITLE[route]), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "7px 0 0",
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      color: "var(--muted)"
    }
  }, ROUTE_BLURB[route])), right);
}
Object.assign(window, {
  Icon,
  SectionLabel,
  Measured,
  Declared,
  SeverityTag,
  StatusPill,
  Avatar,
  Panel,
  ActionBtn,
  Sidebar,
  Topbar,
  IconBtn,
  PageHead
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/parts.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Discover.jsx
try { (() => {
// FirstSpawn web UI kit — Discover screen (search, smart-match facets, filters, results).
const _DSd = window.FirstSpawnWorldlightDesignSystem_20af72;
const FS_SYNONYMS = {
  smp: "Survival",
  survival: "Survival",
  whitelist: "Whitelist",
  whitelisted: "Whitelist",
  chill: "Family-friendly",
  family: "Family-friendly",
  friendly: "Family-friendly",
  economy: "Economy",
  trading: "Trading",
  trade: "Trading",
  towny: "Towny",
  town: "Towny",
  skyblock: "Skyblock",
  quests: "Quests",
  quest: "Quests",
  rpg: "RPG",
  hardcore: "Hardcore",
  seasonal: "Seasonal",
  creative: "Creative",
  builds: "Builds",
  building: "Builds",
  dungeons: "Dungeons",
  dungeon: "Dungeons",
  pve: "PvE",
  coop: "Co-op",
  events: "Events",
  event: "Events",
  competitive: "Competitive",
  community: "Community",
  showcase: "Showcase",
  adventure: "Adventure"
};
const FS_DEMONYMS = {
  german: "DE",
  germany: "DE",
  turkish: "TR",
  turkey: "TR",
  american: "US",
  usa: "US",
  british: "GB",
  uk: "GB",
  canadian: "CA",
  canada: "CA",
  norwegian: "NO",
  norway: "NO",
  finnish: "FI",
  finland: "FI",
  brazilian: "BR",
  brazil: "BR"
};
const FS_ALLTAGS = Array.from(new Set(Object.values(FS_SYNONYMS))).sort();
function fsInterpret(q) {
  const tokens = q.toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean);
  const out = {
    tags: [],
    game: null,
    country: null,
    rest: []
  };
  for (const t of tokens) {
    if (FS_SYNONYMS[t]) {
      if (!out.tags.includes(FS_SYNONYMS[t])) out.tags.push(FS_SYNONYMS[t]);
      continue;
    }
    if (t === "minecraft" || t === "mc") {
      out.game = "Minecraft";
      continue;
    }
    if (t === "hytale") {
      out.game = "Hytale";
      continue;
    }
    if (FS_DEMONYMS[t]) {
      out.country = FS_DEMONYMS[t];
      continue;
    }
    out.rest.push(t);
  }
  return out;
}
function Discover({
  initialQuery,
  votes,
  onVote,
  rankPop,
  onToggleRank,
  onOpen
}) {
  const {
    WLInput,
    WLSelect,
    Chip
  } = _DSd;
  const D = window.FS_DATA;
  const [query, setQuery] = React.useState(initialQuery || "");
  const [game, setGame] = React.useState("All");
  const [country, setCountry] = React.useState("ALL");
  const [tags, setTags] = React.useState([]);
  const [sort, setSort] = React.useState("Rank");
  const [smartOff, setSmartOff] = React.useState(false);
  React.useEffect(() => {
    setQuery(initialQuery || "");
  }, [initialQuery]);
  const intent = React.useMemo(() => fsInterpret(query), [query]);
  const hasIntents = intent.tags.length > 0 || !!intent.game || !!intent.country;
  const smart = hasIntents && !smartOff;
  const results = React.useMemo(() => {
    let list = [...D.servers];
    const g = smart && intent.game ? intent.game : game;
    if (g === "Minecraft") list = list.filter(s => s.game.startsWith("mc_"));else if (g === "Hytale") list = list.filter(s => s.game === "hytale");
    const c = smart && intent.country ? intent.country : country;
    if (c !== "ALL") list = list.filter(s => s.country === c);
    const activeTags = smart && intent.tags.length ? intent.tags : tags;
    if (activeTags.length) list = list.filter(s => activeTags.every(t => (s.name + " " + s.desc + " " + s.tags.join(" ")).toLowerCase().includes(t.toLowerCase())));
    if (sort === "Votes") list.sort((a, b) => b.votes - a.votes);else if (sort === "Players") list.sort((a, b) => b.online - a.online);else list.sort((a, b) => D.rankScore(D.signals(b)) - D.rankScore(D.signals(a)));
    return list;
  }, [game, country, tags, sort, smart, intent.game, intent.country, intent.tags]);
  const toggleTag = t => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const headCls = {
    fontFamily: "var(--font-ui)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--muted)",
    marginBottom: 10,
    textAlign: "left"
  };
  const sideBtn = on => ({
    fontFamily: "var(--font-ui)",
    fontSize: 12,
    fontWeight: 600,
    padding: "9px 14px",
    borderRadius: 10,
    textAlign: "left",
    cursor: "pointer",
    border: "1px solid " + (on ? "var(--accent-deep)" : "var(--line)"),
    background: on ? "var(--accent)" : "transparent",
    color: on ? "var(--on-accent)" : "var(--muted)"
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "32px 28px",
      width: "100%",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      textAlign: "left",
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 24,
      color: "var(--text)",
      margin: "0 0 14px"
    }
  }, "Discover servers"), /*#__PURE__*/React.createElement(WLInput, {
    size: "lg",
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Search " + D.servers.length + " servers — try 'german survival smp'"
  }), hasIntents && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, smartOff ? "Searching literally:" : "Reading as:"), !smartOff && /*#__PURE__*/React.createElement(React.Fragment, null, intent.game && /*#__PURE__*/React.createElement(Chip, {
    active: true
  }, intent.game), intent.tags.map(t => /*#__PURE__*/React.createElement(Chip, {
    key: t,
    active: true
  }, t)), intent.country && /*#__PURE__*/React.createElement(Chip, {
    active: true
  }, intent.country), intent.rest.length > 0 && /*#__PURE__*/React.createElement("span", null, "+ \"", intent.rest.join(" "), "\"")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSmartOff(!smartOff),
    style: {
      color: "var(--accent)",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontWeight: 700,
      fontFamily: "var(--font-mono)"
    }
  }, smartOff ? "Use smart match" : "Search literally"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      color: "color-mix(in srgb, var(--muted) 60%, transparent)"
    }
  }, "interpreted from your words"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "220px 1fr",
      gap: 32,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24,
      position: "sticky",
      top: 100
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: headCls
  }, "Game"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, ["All", "Minecraft", "Hytale"].map(g => /*#__PURE__*/React.createElement("button", {
    key: g,
    onClick: () => setGame(g),
    style: sideBtn(game === g)
  }, g === "All" ? "All games" : g)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: headCls
  }, "Country"), /*#__PURE__*/React.createElement(WLSelect, {
    value: country,
    onChange: e => setCountry(e.target.value),
    options: [{
      value: "ALL",
      label: "All countries"
    }, {
      value: "DE",
      label: "Germany"
    }, {
      value: "US",
      label: "United States"
    }, {
      value: "GB",
      label: "United Kingdom"
    }, {
      value: "NO",
      label: "Norway"
    }, {
      value: "FI",
      label: "Finland"
    }, {
      value: "BR",
      label: "Brazil"
    }, {
      value: "TR",
      label: "Türkiye"
    }, {
      value: "CA",
      label: "Canada"
    }]
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: headCls
  }, "Tags"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, FS_ALLTAGS.slice(0, 14).map(t => {
    const on = tags.includes(t) || smart && intent.tags.includes(t);
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: () => toggleTag(t),
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 11px",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
        border: "1px solid " + (on ? "var(--accent-deep)" : "var(--line)"),
        background: on ? "var(--accent)" : "transparent",
        color: on ? "var(--on-accent)" : "var(--muted)"
      }
    }, t);
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: headCls
  }, "Sort"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, ["Rank", "Players", "Votes"].map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    onClick: () => setSort(o),
    style: sideBtn(sort === o)
  }, o))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      borderBottom: "1px solid var(--line)",
      paddingBottom: 8,
      marginBottom: 14,
      fontFamily: "var(--font-body)",
      fontSize: 12,
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, results.length, " server", results.length === 1 ? "" : "s", query.trim() && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "color-mix(in srgb, var(--muted) 65%, transparent)"
    }
  }, " matching \"", query.trim(), "\"")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5
    }
  }, "rank is never sold")), results.length > 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      borderTop: "1px solid var(--line)"
    }
  }, results.map((s, i) => /*#__PURE__*/React.createElement(window.ServerRow, {
    key: s.slug,
    s: s,
    rank: i + 1,
    voted: !!votes[s.slug],
    onVote: () => onVote(s.slug),
    openRank: rankPop === s.slug,
    onToggleRank: () => onToggleRank(s.slug),
    onOpen: () => onOpen(s)
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px dashed var(--line)",
      borderRadius: "var(--radius-card)",
      padding: 64,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 500,
      fontSize: 14,
      color: "var(--text)",
      marginBottom: 8
    }
  }, "No servers match those filters"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      color: "var(--muted)"
    }
  }, "Try removing a tag or widening the country filter.")))));
}
window.Discover = Discover;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Discover.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Landing.jsx
try { (() => {
// FirstSpawn web UI kit — Landing screen.
const _DSl = window.FirstSpawnWorldlightDesignSystem_20af72;
function Landing({
  votes,
  onVote,
  rankPop,
  onToggleRank,
  onOpen,
  onNavigate,
  onSearch
}) {
  const {
    WLButton,
    WLInput,
    Chip
  } = _DSl;
  const D = window.FS_DATA;
  const [q, setQ] = React.useState("");
  const active = [...D.servers].sort((a, b) => b.online - a.online).slice(0, 3);
  const ranked = D.ranked.slice(0, 5);
  const totalOnline = D.servers.reduce((a, s) => a + s.online, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      overflow: "hidden",
      borderBottom: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      opacity: 0.92,
      background: "var(--hero-gradient)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 86
    }
  }, /*#__PURE__*/React.createElement(window.WorldRender, {
    label: "hero landscape \xB7 layered world art (commissioned)",
    height: 86
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: 1200,
      margin: "0 auto",
      padding: "64px 28px 128px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 580,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--accent)",
      marginBottom: 16
    }
  }, totalOnline.toLocaleString(), " players online \xB7 ", D.servers.length, " active servers"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 44,
      lineHeight: 1.12,
      color: "var(--text)",
      margin: "0 0 18px"
    }
  }, "Find worlds worth joining."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 15,
      lineHeight: 1.65,
      color: "var(--muted)",
      maxWidth: 460,
      margin: "0 0 30px"
    }
  }, "A trusted atlas of Hytale and Minecraft servers, ranked by real activity, trust, and freshness \u2014 never paid placement."), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onSearch(q);
    },
    style: {
      display: "flex",
      gap: 10,
      maxWidth: 460
    }
  }, /*#__PURE__*/React.createElement(WLInput, {
    size: "lg",
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Try 'german survival smp'",
    style: {
      background: "color-mix(in srgb, var(--panel) 90%, transparent)"
    }
  }), /*#__PURE__*/React.createElement(WLButton, {
    type: "submit",
    variant: "primary"
  }, "Search")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 16
    }
  }, ["Survival", "RPG", "Skyblock", "Events"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => onSearch(t),
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fontWeight: 600,
      color: "var(--muted)",
      background: "color-mix(in srgb, var(--raised) 30%, transparent)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-pill)",
      padding: "5px 13px",
      cursor: "pointer"
    }
  }, t)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "40px 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 500,
      fontSize: 18,
      color: "var(--text)",
      margin: 0
    }
  }, "Active tonight"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate("discover"),
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fontWeight: 700,
      color: "var(--accent)",
      background: "none",
      border: "none",
      cursor: "pointer"
    }
  }, "View all servers \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 16
    }
  }, active.map(s => /*#__PURE__*/React.createElement(window.ServerMiniCard, {
    key: s.slug,
    s: s,
    onOpen: () => onOpen(s)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "40px 28px",
      borderTop: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 24,
      gap: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 500,
      fontSize: 18,
      color: "var(--text)",
      margin: 0
    }
  }, "Top ranked right now"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--muted)"
    }
  }, "rank = activity \xD7 trust \xD7 freshness")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      borderTop: "1px solid var(--line)"
    }
  }, ranked.map((s, i) => /*#__PURE__*/React.createElement(window.ServerRow, {
    key: s.slug,
    s: s,
    rank: i + 1,
    voted: !!votes[s.slug],
    onVote: () => onVote(s.slug),
    openRank: rankPop === s.slug,
    onToggleRank: () => onToggleRank(s.slug),
    onOpen: () => onOpen(s)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "40px 28px",
      borderTop: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-modal)",
      padding: 32,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 24,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 500,
      fontSize: 16,
      color: "var(--text)",
      margin: "0 0 8px"
    }
  }, "Own a server? Earn discovery through real activity."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      lineHeight: 1.6,
      color: "var(--muted)",
      margin: 0
    }
  }, "List your server, keep its profile accurate, and let trust and freshness do the ranking. No paid boosts.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(WLButton, {
    variant: "primary",
    onClick: () => onNavigate("owners")
  }, "List your server"), /*#__PURE__*/React.createElement(WLButton, {
    variant: "ghost",
    onClick: () => onToggleRank(D.ranked[0].slug)
  }, "How ranking works")))));
}
window.Landing = Landing;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Landing.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Login.jsx
try { (() => {
// FirstSpawn web UI kit — Login / auth screen.
const _DSlg = window.FirstSpawnWorldlightDesignSystem_20af72;
function Login({
  onAuth,
  onNavigate
}) {
  const {
    WLButton,
    WLInput,
    Sigil
  } = _DSlg;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "48px 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--hero-gradient)",
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 90
    }
  }, /*#__PURE__*/React.createElement(window.WorldRender, {
    label: "",
    height: 90
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      maxWidth: 400,
      background: "var(--panel)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-modal)",
      boxShadow: "var(--shadow-modal)",
      padding: 32,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(Sigil, {
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 15,
      letterSpacing: "0.04em",
      color: "var(--text)",
      textTransform: "uppercase"
    }
  }, "FIRST", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, "SPAWN"))), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 22,
      color: "var(--text)",
      margin: "0 0 6px"
    }
  }, "Welcome back"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13,
      lineHeight: 1.6,
      color: "var(--muted)",
      margin: "0 0 24px"
    }
  }, "Sign in to vote, save servers to your loot, and track your reputation."), /*#__PURE__*/React.createElement("button", {
    onClick: onAuth,
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      fontFamily: "var(--font-ui)",
      fontWeight: 700,
      fontSize: 13.5,
      color: "#fff",
      background: "#5865f2",
      border: "1px solid #4752c4",
      borderRadius: "var(--radius-control)",
      minHeight: 44,
      cursor: "pointer",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)"
    }
  }, "\u25C6"), " Continue with Discord"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "16px 0",
      color: "var(--muted)",
      fontFamily: "var(--font-mono)",
      fontSize: 10.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: "var(--line)"
    }
  }), "or", /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: "var(--line)"
    }
  })), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onAuth();
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--muted)",
      marginBottom: 6
    }
  }, "Email"), /*#__PURE__*/React.createElement(WLInput, {
    type: "email",
    placeholder: "you@email.com",
    defaultValue: ""
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--muted)",
      marginBottom: 6
    }
  }, "Password"), /*#__PURE__*/React.createElement(WLInput, {
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    defaultValue: ""
  })), /*#__PURE__*/React.createElement(WLButton, {
    type: "submit",
    variant: "primary",
    fullWidth: true
  }, "Sign in")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      color: "var(--muted)",
      textAlign: "center",
      margin: "20px 0 0"
    }
  }, "New to FirstSpawn? ", /*#__PURE__*/React.createElement("button", {
    onClick: onAuth,
    style: {
      color: "var(--accent)",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontWeight: 700,
      fontFamily: "var(--font-body)"
    }
  }, "Create an account"))));
}
window.Login = Login;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Login.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/ServerDetail.jsx
try { (() => {
// FirstSpawn web UI kit — Server detail screen.
const _DSsd = window.FirstSpawnWorldlightDesignSystem_20af72;
function ServerDetail({
  s,
  voted,
  onVote,
  onBack
}) {
  const {
    WLButton,
    Badge,
    StatusDot,
    SignalBars,
    SignalMeter,
    Chip
  } = _DSsd;
  const D = window.FS_DATA;
  const sig = D.signals(s);
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const statTile = (label, value, mono = true, color = "var(--text)") => /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--raised)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-control)",
      padding: "12px 14px",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--muted)",
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
      fontSize: 17,
      color
    }
  }, value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      borderBottom: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--hero-gradient)",
      opacity: 0.9
    }
  }), /*#__PURE__*/React.createElement(window.WorldRender, {
    label: s.name + " · banner art (commissioned)",
    height: 200
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, transparent 30%, var(--canvas) 100%)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "0 28px 48px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fontWeight: 600,
      color: "var(--muted)",
      background: "none",
      border: "none",
      cursor: "pointer",
      margin: "20px 0 0",
      padding: 0
    }
  }, "\u2190 Back to discover"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gap: 32,
      marginTop: 16,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 14,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--line)",
      overflow: "hidden",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(window.WorldRender, {
    label: "",
    height: 64
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 28,
      color: "var(--text)",
      margin: 0
    }
  }, s.name), s.verified && /*#__PURE__*/React.createElement(Badge, {
    tone: "verified"
  }, "Verified")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, D.gameName(s.game)), /*#__PURE__*/React.createElement(Badge, {
    tone: "country"
  }, s.country), /*#__PURE__*/React.createElement(StatusDot, {
    status: "online",
    label: s.online.toLocaleString() + " online"
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: 1.65,
      color: "var(--text)",
      maxWidth: 560,
      textAlign: "left",
      margin: "0 0 16px"
    }
  }, s.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 28
    }
  }, s.tags.map(t => /*#__PURE__*/React.createElement(Chip, {
    key: t
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--muted)",
      marginBottom: 12,
      textAlign: "left"
    }
  }, "Measured signals"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 12,
      marginBottom: 24
    }
  }, statTile("Online", s.online.toLocaleString(), true, "var(--success)"), statTile("Uptime", D.uptime(s) + "%"), statTile("Last ping", D.relTime(s.lastPingMin)), statTile("Votes", (s.votes / 1000).toFixed(1) + "k")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-panel)",
      padding: 20,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontWeight: 700,
      fontSize: 13,
      color: "var(--text)"
    }
  }, "Rank breakdown"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--muted)"
    }
  }, "activity \xD7 trust \xD7 freshness \xB7 never sold")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(SignalMeter, {
    label: "Activity",
    value: sig.activity,
    color: "var(--success)"
  }), /*#__PURE__*/React.createElement(SignalMeter, {
    label: "Trust",
    value: sig.trust,
    color: "var(--accent)"
  }), /*#__PURE__*/React.createElement(SignalMeter, {
    label: "Freshness",
    value: sig.freshness,
    color: "var(--accent)"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "sticky",
      top: 100,
      background: "var(--panel)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-panel)",
      padding: 20,
      boxShadow: "var(--shadow-card)",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--muted)",
      marginBottom: 8
    }
  }, "Server address"), /*#__PURE__*/React.createElement("button", {
    onClick: copy,
    title: "Copy address",
    style: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 8,
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      color: "var(--text)",
      background: "var(--raised)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-control)",
      padding: "12px 14px",
      cursor: "pointer",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", null, s.address), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 700,
      color: copied ? "var(--success)" : "var(--muted)"
    }
  }, copied ? "Copied ✓" : "Copy")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(WLButton, {
    variant: "primary",
    fullWidth: true,
    onClick: onVote,
    style: voted ? {
      background: "transparent",
      color: "var(--success)",
      borderColor: "var(--success)"
    } : {}
  }, voted ? "Voted ✓ — thanks!" : "▲ Vote for this server"), /*#__PURE__*/React.createElement(WLButton, {
    variant: "quiet",
    fullWidth: true
  }, "Add to my loot")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      paddingTop: 16,
      borderTop: "1px solid var(--line)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--muted)",
      marginBottom: 8
    }
  }, "Activity"), /*#__PURE__*/React.createElement(SignalBars, {
    value: sig.activity,
    color: "var(--success)",
    width: 280,
    height: 12
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      marginTop: 8
    }
  }, s.online.toLocaleString(), " / ", s.max.toLocaleString(), " players \xB7 ", sig.activity, "% full")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      paddingTop: 16,
      borderTop: "1px dashed var(--line)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 11.5,
      color: "var(--muted)"
    }
  }, "Owner-declared mods & rules \xB7 "), /*#__PURE__*/React.createElement(Badge, {
    tone: "soon"
  }, "Coming soon"))))));
}
window.ServerDetail = ServerDetail;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/ServerDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/data.js
try { (() => {
// FirstSpawn web UI kit — mock server data + signal helpers.
// Mirrors the product's getServerSignals / getRankScore math.
window.FS_DATA = function () {
  const servers = [{
    slug: "aether",
    name: "Aether Realms",
    game: "hytale",
    country: "DE",
    online: 1284,
    max: 2000,
    desc: "Survival · towny · seasonal events with a curated build economy.",
    tags: ["Survival", "Towny", "Seasonal", "Events"],
    address: "play.aether.gg",
    verified: true,
    lastPingMin: 0,
    votes: 4200
  }, {
    slug: "skyhaven",
    name: "Skyhaven SMP",
    game: "mc_java",
    country: "US",
    online: 942,
    max: 1500,
    desc: "Skyblock progression with co-op islands and weekly quests.",
    tags: ["Skyblock", "Quests", "Co-op"],
    address: "mc.skyhaven.net",
    verified: true,
    lastPingMin: 1,
    votes: 3850
  }, {
    slug: "ironhold",
    name: "Ironhold",
    game: "mc_java",
    country: "GB",
    online: 610,
    max: 900,
    desc: "Hardcore RPG dungeons, ranked PvE and a player-run market.",
    tags: ["RPG", "Dungeons", "PvE", "Economy"],
    address: "play.ironhold.gg",
    verified: false,
    lastPingMin: 3,
    votes: 2900
  }, {
    slug: "lumenvale",
    name: "Lumenvale",
    game: "hytale",
    country: "NO",
    online: 1502,
    max: 2400,
    desc: "Family-friendly creative builds and community showcases.",
    tags: ["Creative", "Builds", "Family-friendly", "Showcase"],
    address: "play.lumenvale.world",
    verified: true,
    lastPingMin: 0,
    votes: 5100
  }, {
    slug: "tideborn",
    name: "Tideborn",
    game: "mc_bedrock",
    country: "BR",
    online: 388,
    max: 700,
    desc: "Seasonal survival with adventure expeditions and trading hubs.",
    tags: ["Survival", "Adventure", "Trading", "Seasonal"],
    address: "play.tideborn.gg",
    verified: false,
    lastPingMin: 6,
    votes: 1740
  }, {
    slug: "varskeep",
    name: "Varskeep",
    game: "mc_java",
    country: "FI",
    online: 254,
    max: 500,
    desc: "Whitelisted relaxed economy SMP, community-first and quiet.",
    tags: ["Whitelist", "Economy", "Family-friendly"],
    address: "mc.varskeep.eu",
    verified: true,
    lastPingMin: 2,
    votes: 1320
  }, {
    slug: "emberfall",
    name: "Emberfall",
    game: "hytale",
    country: "TR",
    online: 720,
    max: 1100,
    desc: "Competitive ranked events with seasonal leaderboards.",
    tags: ["Competitive", "Events", "Seasonal"],
    address: "play.emberfall.gg",
    verified: false,
    lastPingMin: 4,
    votes: 2210
  }, {
    slug: "groveholt",
    name: "Groveholt",
    game: "mc_java",
    country: "CA",
    online: 466,
    max: 800,
    desc: "Cozy towny survival with builders' guilds and markets.",
    tags: ["Towny", "Survival", "Builds", "Community"],
    address: "play.groveholt.ca",
    verified: true,
    lastPingMin: 1,
    votes: 1980
  }];
  function signals(s) {
    const activity = s.max > 0 ? Math.min(100, Math.max(10, Math.round(s.online / s.max * 100))) : 50;
    const charSum = s.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const trust = 65 + charSum % 31;
    const freshness = Math.max(10, 100 - Math.min(90, s.lastPingMin));
    return {
      activity,
      trust,
      freshness
    };
  }
  function rankScore(sig) {
    return sig.activity * sig.trust * sig.freshness;
  }
  function gameName(g) {
    return g === "mc_java" ? "Minecraft Java" : g === "mc_bedrock" ? "Minecraft Bedrock" : g === "hytale" ? "Hytale" : "Game";
  }
  function relTime(min) {
    if (min <= 0) return "just now";
    if (min < 60) return min + "m ago";
    const h = Math.floor(min / 60);
    return h + "h ago";
  }
  function uptime(s) {
    return (98.0 + s.name.length % 20 / 10).toFixed(1);
  }
  const ranked = [...servers].sort((a, b) => rankScore(signals(b)) - rankScore(signals(a)));
  return {
    servers,
    ranked,
    signals,
    rankScore,
    gameName,
    relTime,
    uptime
  };
}();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/data.js", error: String((e && e.message) || e) }); }

// ui_kits/web/parts.jsx
try { (() => {
// FirstSpawn web UI kit — shared parts (navbar, footer, server row, placeholders).
// Composes the design-system primitives from the compiled bundle.
// Read the namespace lazily (inside each component) so an async bundle load is safe.
const _DS = () => window.FirstSpawnWorldlightDesignSystem_20af72;

// Diagonal hatch "world render" placeholder — stands in for commissioned art.
function WorldRender({
  label,
  height = 132,
  radius = 0
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      borderRadius: radius,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
      background: "repeating-linear-gradient(45deg, color-mix(in srgb, var(--art) 15%, transparent) 0 11px, color-mix(in srgb, var(--art) 6%, transparent) 11px 22px)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.06em",
      color: "color-mix(in srgb, var(--muted) 80%, transparent)",
      background: "rgba(18,21,30,0.25)",
      padding: "2px 8px",
      borderRadius: 4
    }
  }, label));
}
function Navbar({
  route,
  onNavigate,
  theme,
  onToggleTheme,
  authed,
  onAuth
}) {
  const {
    Sigil,
    WLButton
  } = _DS();
  const link = (id, label) => {
    const active = route === id;
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => onNavigate(id),
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 13.5,
        fontWeight: 600,
        cursor: "pointer",
        background: "none",
        border: "none",
        borderBottom: "2px solid " + (active ? "var(--accent)" : "transparent"),
        color: active ? "var(--text)" : "var(--muted)",
        padding: "6px 2px",
        minHeight: 36
      }
    }, label);
  };
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 100,
      minHeight: 64,
      borderBottom: "1px solid var(--line)",
      background: "color-mix(in srgb, var(--canvas) 92%, transparent)",
      backdropFilter: "blur(10px)",
      padding: "12px 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate("landing"),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "none",
      border: "none",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Sigil, {
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 14,
      letterSpacing: "0.04em",
      color: "var(--text)",
      textTransform: "uppercase"
    }
  }, "FIRST", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent)"
    }
  }, "SPAWN"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, link("discover", "discover"), link("owners", "for owners"), link("community", "community"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onToggleTheme,
    title: "Toggle theme",
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--muted)",
      background: "transparent",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-pill)",
      padding: "6px 14px",
      minHeight: 36,
      cursor: "pointer"
    }
  }, theme === "day" ? "☀ Day" : "☾ Dusk"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 24,
      background: "var(--line)"
    }
  }), authed ? /*#__PURE__*/React.createElement(WLButton, {
    variant: "danger",
    size: "sm",
    onClick: onAuth
  }, "Log out") : /*#__PURE__*/React.createElement(WLButton, {
    variant: "primary",
    size: "sm",
    onClick: () => onNavigate("login")
  }, "Sign in"))));
}
function RankPopover({
  sig,
  onClose
}) {
  const {
    SignalMeter
  } = _DS();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: "calc(100% + 6px)",
      zIndex: 30,
      width: 300,
      background: "var(--panel)",
      border: "1px solid var(--line)",
      borderRadius: "var(--radius-card)",
      padding: 14,
      boxShadow: "var(--shadow-popover)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontWeight: 700,
      fontSize: 12,
      color: "var(--text)"
    }
  }, "Why this rank?"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: "var(--muted)",
      cursor: "pointer",
      fontSize: 13
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SignalMeter, {
    label: "Activity",
    value: sig.activity
  }), /*#__PURE__*/React.createElement(SignalMeter, {
    label: "Trust",
    value: sig.trust
  }), /*#__PURE__*/React.createElement(SignalMeter, {
    label: "Freshness",
    value: sig.freshness
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      lineHeight: 1.6,
      color: "var(--muted)"
    }
  }, "rank = activity \xD7 trust \xD7 freshness", /*#__PURE__*/React.createElement("br", null), "same math for every server \xB7 never sold"));
}

// Ranked list row used on Landing + Discover.
function ServerRow({
  s,
  rank,
  voted,
  onVote,
  openRank,
  onToggleRank,
  onOpen
}) {
  const {
    Badge,
    SignalBars
  } = _DS();
  const D = window.FS_DATA;
  const sig = D.signals(s);
  return /*#__PURE__*/React.createElement("div", {
    className: "fs-srow",
    style: {
      borderBottom: "1px solid var(--line)",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onToggleRank,
    title: "Why this rank?",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      fontWeight: 700,
      color: rank === 1 ? "var(--gold)" : "var(--muted)",
      background: "none",
      border: "none",
      cursor: "pointer",
      textDecoration: "underline dotted",
      textUnderlineOffset: 4
    }
  }, String(rank).padStart(2, "0")), openRank && /*#__PURE__*/React.createElement(RankPopover, {
    sig: sig,
    onClose: onToggleRank
  })), /*#__PURE__*/React.createElement("div", {
    className: "fs-srow-icon"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 8,
      border: "1px solid var(--line)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(WorldRender, {
    label: "",
    height: 40
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      cursor: "pointer",
      textAlign: "left"
    },
    onClick: onOpen
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontWeight: 700,
      fontSize: 14,
      color: "var(--text)"
    }
  }, s.name), s.verified && /*#__PURE__*/React.createElement(Badge, {
    tone: "verified"
  }, "Verified"), /*#__PURE__*/React.createElement(Badge, {
    tone: "country"
  }, s.country)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 11.5,
      color: "var(--muted)",
      marginTop: 4,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "46ch"
    }
  }, D.gameName(s.game), " \xB7 ", s.desc)), /*#__PURE__*/React.createElement("div", {
    className: "fs-srow-activity",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(SignalBars, {
    value: sig.activity,
    color: "var(--success)",
    width: 96
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--success)",
      lineHeight: 1
    }
  }, s.online.toLocaleString(), " online")), /*#__PURE__*/React.createElement("div", {
    className: "fs-srow-uptime",
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--muted)",
      lineHeight: 1.5
    }
  }, D.uptime(s), "% uptime", /*#__PURE__*/React.createElement("br", null), D.relTime(s.lastPingMin)), /*#__PURE__*/React.createElement("button", {
    onClick: onVote,
    style: {
      fontFamily: "var(--font-ui)",
      fontWeight: 700,
      fontSize: 12,
      borderRadius: 10,
      padding: "8px 12px",
      minHeight: 36,
      width: "100%",
      cursor: "pointer",
      background: voted ? "transparent" : "var(--accent)",
      border: "1px solid " + (voted ? "var(--success)" : "var(--accent-deep)"),
      color: voted ? "var(--success)" : "var(--on-accent)"
    }
  }, voted ? "Voted ✓" : "▲ " + ((s.votes + (voted ? 1 : 0)) / 1000).toFixed(1) + "k"));
}

// "Active tonight" media card.
function ServerMiniCard({
  s,
  onOpen
}) {
  const {
    Badge,
    StatusDot
  } = _DS();
  const D = window.FS_DATA;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onOpen,
    className: "wl-card wl-card--clickable",
    style: {
      borderRadius: "var(--radius-card)",
      overflow: "hidden",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(WorldRender, {
    label: s.name + " · world render",
    height: 128
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 10,
      top: 10,
      display: "flex",
      gap: 6
    }
  }, s.verified && /*#__PURE__*/React.createElement(Badge, {
    tone: "verified"
  }, "Verified"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, D.gameName(s.game)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      flexGrow: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 14,
      color: "var(--text)"
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      lineHeight: 1.5,
      color: "var(--muted)",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden"
    }
  }, s.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement(StatusDot, {
    status: "online",
    label: s.online.toLocaleString() + " online"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)",
      textTransform: "uppercase"
    }
  }, s.country))));
}
function Footer({
  onNavigate
}) {
  const {
    Sigil
  } = _DS();
  const col = (title, items) => /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 12,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--text)",
      marginBottom: 18
    }
  }, title), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      color: "var(--muted)",
      cursor: "not-allowed"
    }
  }, i))));
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: "1px solid var(--line)",
      background: "var(--canvas)",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "56px 28px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr",
      gap: 32,
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      border: "1px solid var(--line)",
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(Sigil, {
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 16,
      letterSpacing: "0.04em",
      color: "var(--text)"
    }
  }, "FirstSpawn")), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: 280,
      fontFamily: "var(--font-body)",
      fontSize: 12,
      lineHeight: 1.6,
      color: "var(--muted)"
    }
  }, "A trusted atlas of player worlds. Discovery is relevance-driven, never pay-to-win.")), col("Platform", ["About", "Trust & ranking", "Badges", "API"]), col("Resources", ["Help center", "Developer API", "Community", "Partners"]), col("Legal", ["Terms", "Privacy", "Cookies", "Acceptable use"])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid var(--line)",
      paddingTop: 28,
      flexWrap: "wrap",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      color: "var(--muted)"
    }
  }, "\xA9 2026 FirstSpawn. All rights reserved."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 22,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u25CF all systems normal"), /*#__PURE__*/React.createElement("span", null, "v0.4.2"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--danger)"
    }
  }, "\u2665 crafted in dusk")))));
}
Object.assign(window, {
  WorldRender,
  Navbar,
  Footer,
  ServerRow,
  ServerMiniCard,
  RankPopover,
  ServerMiniCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/parts.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Sigil = __ds_scope.Sigil;

__ds_ns.WLButton = __ds_scope.WLButton;

__ds_ns.WLCard = __ds_scope.WLCard;

__ds_ns.SignalBars = __ds_scope.SignalBars;

__ds_ns.SignalMeter = __ds_scope.SignalMeter;

__ds_ns.StatusDot = __ds_scope.StatusDot;

__ds_ns.WLInput = __ds_scope.WLInput;

__ds_ns.WLSelect = __ds_scope.WLSelect;

})();
