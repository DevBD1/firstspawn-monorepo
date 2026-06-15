"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import createGlobe from "cobe";

import { useTheme } from "@/components/providers/ThemeProvider.client";
import { getCountryName, type CountryNameOverrides } from "@/lib/countries";
import type { LandingDictionary } from "@/lib/dictionaries/schema";
import type { ServerGeoPoint } from "@/lib/servers-api";
import { buildBeacons, type BeaconStatus, type GlobeBeacon } from "@/lib/globe/markers";
import { depthOpacity, depthScale, projectMarker } from "@/lib/globe/projection";

const SIZE_MAX = 560;
// Gentle idle drift; pauses while a beacon is hovered, while dragging, and on
// prefers-reduced-motion.
const AUTO_SPIN_PER_FRAME = 0.0016;
const DRAG_SENSITIVITY = 0.005;
// cobe renders the sphere inside |ndc| <= 0.8 (its shader's `c <= 0.64` disc), so
// the on-screen globe radius is 0.8 * (size / 2) — NOT the full half-width. Using
// the full half-width pushes limb beacons off the sphere into the atmosphere.
const GLOBE_DISC_RATIO = 0.8;
// Scroll-to-zoom bounds (cobe `scale` uniform; 1 = default framing).
const MIN_ZOOM = 1;
const MAX_ZOOM = 1.9;
// Clamp vertical drag tilt so the globe can't flip past the poles.
const THETA_MIN = -1.1;
const THETA_MAX = 1.1;

// cobe colours per theme. baseColor is the dotted landmass tone; glowColor is the
// atmosphere; mapBaseBrightness is the ocean/background floor that fills the sphere
// into a coherent body. Derived from WorldLight tokens — day reads as a warm sand
// globe matching the hero gradient (ends #e8c9a0), dusk stays a blue-grey night.
const THEME_COLORS = {
  dusk: {
    dark: 1,
    diffuse: 1.05,
    mapBrightness: 5.3,
    mapBaseBrightness: 0.035,
    base: [0.25, 0.29, 0.4] as [number, number, number],
    marker: [0.898, 0.627, 0.298] as [number, number, number],
    glow: [0.07, 0.075, 0.12] as [number, number, number],
    opacity: 0.95,
  },
  // In cobe's light mode (dark:0) the OCEAN takes baseColor and continents render
  // dark — so baseColor here is a soft warm cream tuned close to the page bg
  // (#f2efe7), letting the sphere melt into the page instead of reading as a solid
  // golden ball. A low mapBaseBrightness keeps it airy; continents come out warm-dark.
  day: {
    dark: 0,
    diffuse: 1.1,
    mapBrightness: 7.5,
    mapBaseBrightness: 0.04,
    base: [0.91, 0.86, 0.76] as [number, number, number],
    marker: [0.7, 0.44, 0.12] as [number, number, number],
    glow: [0.93, 0.87, 0.74] as [number, number, number],
    opacity: 0.92,
  },
};

// Soft radial backdrop behind the transparent WebGL canvas — warms the globe's
// edges into the page without becoming a gold aura. Near-invisible in dusk.
const BACKDROP: Record<"dusk" | "day", string> = {
  day: "radial-gradient(circle at 50% 46%, rgba(232,201,160,0.18) 0%, rgba(178,111,31,0.05) 55%, transparent 72%)",
  dusk: "radial-gradient(circle at 50% 46%, rgba(120,140,200,0.10) 0%, transparent 70%)",
};

function statusColor(status: BeaconStatus): string {
  if (status === "online") return "var(--success)";
  if (status === "offline") return "var(--danger)";
  return "var(--muted)";
}

interface WLGlobeProps {
  servers: ServerGeoPoint[];
  lang: string;
  copy: LandingDictionary["globe"];
  countryOverrides?: CountryNameOverrides;
  /** Called with the server slug when a beacon is clicked (opens the quick-peek). */
  onSelect: (slug: string) => void;
}

export default function WLGlobe({ servers, lang, copy, countryOverrides, onSelect }: WLGlobeProps) {
  const { theme } = useTheme();

  const beacons = useMemo(() => buildBeacons(servers), [servers]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const beaconRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const phiRef = useRef(0);
  const thetaRef = useRef(0.25);
  const sizeRef = useRef(0);
  const beaconsRef = useRef<GlobeBeacon[]>(beacons);
  const hoveredRef = useRef<number | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);
  const scaleRef = useRef(1);
  const reduceMotionRef = useRef(false);

  const [size, setSize] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  // Keep refs that the per-frame callback reads in sync with React state.
  useEffect(() => {
    beaconsRef.current = beacons;
    beaconRefs.current.length = beacons.length;
  }, [beacons]);

  const setHover = useCallback((index: number | null) => {
    hoveredRef.current = index;
    setHovered(index);
  }, []);

  // Measure the container so the (square) globe fills the available width.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setSize(Math.min(el.clientWidth, SIZE_MAX));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track reduced-motion preference for the auto-spin (CSS handles the beacon FX).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
    const handler = () => {
      reduceMotionRef.current = mq.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Re-project every beacon (and the tooltip) onto the canvas for the current
  // rotation. Runs once per cobe frame; mutates DOM directly to stay cheap.
  const updateBeacons = useCallback(() => {
    const s = sizeRef.current;
    if (!s) return;
    const center = s / 2;
    // Match cobe's rendered sphere radius (and follow zoom) so beacons sit on the
    // surface at the limb, not out in the atmosphere.
    const radius = (s / 2) * GLOBE_DISC_RATIO * scaleRef.current;
    const orientation = { phi: phiRef.current, theta: thetaRef.current };
    const list = beaconsRef.current;

    for (let i = 0; i < list.length; i++) {
      const el = beaconRefs.current[i];
      if (!el) continue;
      const b = list[i]!;
      const p = projectMarker(b.lat, b.lng, orientation);
      if (!p.visible) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        continue;
      }
      const px = center + p.x * radius;
      const py = center - p.y * radius;
      el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%) scale(${depthScale(
        p.depth
      )})`;
      el.style.opacity = String(depthOpacity(p.depth));
      el.style.pointerEvents = "auto";
      el.style.zIndex = String(Math.round(p.depth * 100) + 100);

      if (hoveredRef.current === i && tooltipRef.current) {
        tooltipRef.current.style.transform = `translate(${px}px, ${py}px) translate(-50%, calc(-100% - 14px))`;
      }
    }
  }, []);

  // Create (and recreate on resize / theme change) the cobe globe.
  useEffect(() => {
    if (!canvasRef.current || size === 0) return;
    sizeRef.current = size;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const colors = theme === "day" ? THEME_COLORS.day : THEME_COLORS.dusk;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: colors.dark,
      diffuse: colors.diffuse,
      mapSamples: 16000,
      mapBrightness: colors.mapBrightness,
      mapBaseBrightness: colors.mapBaseBrightness,
      baseColor: colors.base,
      markerColor: colors.marker,
      glowColor: colors.glow,
      markers: [],
      opacity: colors.opacity,
      onRender: (state) => {
        // Idle drift only while nothing is being inspected: pause on beacon hover
        // and while dragging (so the thing under the cursor holds still).
        const idle = pointerStartX.current === null && hoveredRef.current === null;
        if (idle && !reduceMotionRef.current) {
          phiRef.current += AUTO_SPIN_PER_FRAME;
        }
        state.phi = phiRef.current;
        state.theta = thetaRef.current;
        state.scale = scaleRef.current;
        state.width = size * dpr;
        state.height = size * dpr;
        updateBeacons();
      },
    });

    return () => globe.destroy();
  }, [size, theme, updateBeacons]);

  // Drag-to-rotate, bound to the canvas so beacon clicks aren't swallowed. Horizontal
  // drag spins (phi); vertical drag tilts (theta), clamped so it can't flip the poles.
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    e.currentTarget.style.cursor = "grabbing";
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (pointerStartX.current === null || pointerStartY.current === null) return;
    const deltaX = e.clientX - pointerStartX.current;
    const deltaY = e.clientY - pointerStartY.current;
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    phiRef.current += deltaX * DRAG_SENSITIVITY;
    thetaRef.current = Math.min(
      THETA_MAX,
      Math.max(THETA_MIN, thetaRef.current + deltaY * DRAG_SENSITIVITY)
    );
  }, []);
  const endDrag = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerStartX.current = null;
    pointerStartY.current = null;
    e.currentTarget.style.cursor = "grab";
  }, []);

  // Scroll-to-zoom on the globe (native non-passive listener so we can preventDefault
  // the page scroll). Mutates scaleRef; the cobe frame + beacon radius read it live.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      scaleRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scaleRef.current * factor));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const hoveredBeacon = hovered === null ? null : (beacons[hovered] ?? null);

  const playersLabel = (players: number | null) =>
    players === null ? "—" : copy.playersLabel.replace("{count}", players.toLocaleString(lang));
  const statusLabel = (status: BeaconStatus) =>
    status === "online" ? copy.onlineLabel : copy.offlineLabel;
  const reachLabel = (reach: GlobeBeacon["reach"]) => copy.reach[reach];

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col items-start gap-1 text-left">
        <h2 className="font-display font-medium text-lg text-foreground">{copy.title}</h2>
        <p className="font-body text-sm leading-relaxed text-muted max-w-xl">{copy.subtitle}</p>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto aspect-square w-full"
        style={{ maxWidth: SIZE_MAX }}
      >
        {/* Warm radial backdrop behind the transparent WebGL edges. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: "-8%",
            zIndex: 0,
            background: theme === "day" ? BACKDROP.day : BACKDROP.dusk,
            filter: "blur(18px)",
          }}
        />
        {/* Circular viewport: clips the canvas + beacons to the globe disc so a
            zoomed-in view reads as a clean round magnifier, not a square crop. The
            backdrop glow and tooltip live outside this clip. */}
        <div className="absolute inset-0 z-[1] overflow-hidden rounded-full">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            style={{
              width: size ? `${size}px` : "100%",
              height: size ? `${size}px` : "100%",
              cursor: "grab",
              touchAction: "pan-y",
              contain: "layout paint size",
            }}
            aria-hidden="true"
          />

          {/* Interactive beacon overlay. Positions are set per-frame in updateBeacons. */}
          <div className="pointer-events-none absolute inset-0 z-[2]">
            {beacons.map((b, i) => (
              <button
                key={b.slug}
                ref={(el) => {
                  beaconRefs.current[i] = el;
                }}
                type="button"
                className="wl-beacon"
                style={{
                  width: `${b.radius * 2}px`,
                  height: `${b.radius * 2}px`,
                  color: statusColor(b.status),
                  opacity: 0,
                }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => onSelect(b.slug)}
                aria-label={b.name}
              >
                <span className="wl-beacon-dot" />
                {b.isGlobal && <span className="wl-beacon-halo" />}
                {b.isGlobal && <span className="wl-beacon-ripple" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tooltip — its transform is positioned per-frame while a beacon is hovered. */}
        {hoveredBeacon && (
          <div
            ref={tooltipRef}
            className="pointer-events-none absolute left-0 top-0 z-[300] w-max max-w-[220px] rounded-xl border border-border bg-bg-panel px-3 py-2 text-left shadow-xl"
          >
            <div className="font-body text-xs font-bold text-foreground">{hoveredBeacon.name}</div>
            <div className="mt-0.5 font-body text-[11px] text-muted">
              {getCountryName(hoveredBeacon.countryCode, lang, countryOverrides)}
              {" · "}
              {hoveredBeacon.isGlobal ? copy.globalLabel : reachLabel(hoveredBeacon.reach)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px]">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: statusColor(hoveredBeacon.status) }}
              />
              <span className="text-foreground">{statusLabel(hoveredBeacon.status)}</span>
              <span className="text-muted">· {playersLabel(hoveredBeacon.players)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-center font-mono text-xs text-muted">
        {beacons.length > 0
          ? `${copy.hint} · ${copy.serversPlaced.replace("{count}", String(beacons.length))}`
          : copy.emptyDescription}
      </div>
    </div>
  );
}
