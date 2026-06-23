import { Sigil } from "@firstspawn/ui";
import { PageBackdrop } from "@/components/ui/PagePrimitives";

/**
 * Custom 404 — the "Lost Chunk".
 *
 * MUST be a Server Component (no `"use client"`, no client children). In
 * Next.js 16 a not-found boundary at the root segment that contains any client
 * component is silently ignored and the built-in default 404 renders instead —
 * this app has no real `app/layout.tsx` (html/body live in `[lang]/layout.tsx`),
 * so `[lang]/not-found.tsx` IS that root boundary.
 *
 * Consequences: all motion is pure CSS (glitch, drift, scanline, blink), the
 * coordinates are rolled per request on the server, and the CTAs are plain
 * anchors (not the client `WLButton`). Locale is resolved from the `x-pathname`
 * header the proxy forwards, since not-found files receive no route params.
 */

type Locale = "en" | "tr" | "de";

const LOCALES: readonly Locale[] = ["en", "tr", "de"];

interface Copy {
  eyebrow: string;
  heading: string;
  lead: string;
  console: (path: string) => string[];
  coords: string;
  hint: string;
  spawn: string;
  browse: string;
}

const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: "Error 404 · Chunk not found",
    heading: "This node never spawned.",
    lead: "The coordinates you requested drifted past the edge of the loaded world. There's nothing rendered out here in the void.",
    console: (p) => [
      `> resolving route ${p}`,
      "! chunk failed to load at requested coordinates",
      "> the world generator returned empty space",
    ],
    coords: "last known position",
    hint: "this chunk is gone — head back to a loaded region",
    spawn: "Return to spawn",
    browse: "Browse servers",
  },
  tr: {
    eyebrow: "Hata 404 · Parça bulunamadı",
    heading: "Bu düğüm hiç doğmadı.",
    lead: "İstediğin koordinatlar yüklü dünyanın kenarından kaydı. Bu boşlukta render edilmiş hiçbir şey yok.",
    console: (p) => [
      `> rota çözümleniyor ${p}`,
      "! parça istenen koordinatlarda yüklenemedi",
      "> dünya üreteci boş alan döndürdü",
    ],
    coords: "son bilinen konum",
    hint: "bu parça kayboldu — yüklü bir bölgeye geri dön",
    spawn: "Doğuş noktasına dön",
    browse: "Sunuculara göz at",
  },
  de: {
    eyebrow: "Fehler 404 · Chunk nicht gefunden",
    heading: "Dieser Knoten ist nie gespawnt.",
    lead: "Die angeforderten Koordinaten sind über den Rand der geladenen Welt hinausgetrieben. Hier draußen im Nichts wird nichts gerendert.",
    console: (p) => [
      `> Route wird aufgelöst ${p}`,
      "! Chunk an den angeforderten Koordinaten nicht geladen",
      "> der Weltgenerator lieferte leeren Raum",
    ],
    coords: "letzte bekannte Position",
    hint: "dieser Chunk ist weg — kehre in eine geladene Region zurück",
    spawn: "Zum Spawn zurück",
    browse: "Server entdecken",
  },
};

function resolveLocale(pathname: string): Locale {
  const seg = pathname.split("/").filter(Boolean)[0];
  return LOCALES.includes(seg as Locale) ? (seg as Locale) : "en";
}

/** Void coordinates, rolled per request on the server. */
function rollCoords() {
  const span = () => Math.floor((Math.random() - 0.5) * 60_000_000);
  return { x: span(), y: Math.floor(Math.random() * 384) - 64, z: span() };
}

const SIGILS = [
  { className: "left-[12%] top-[22%]", size: 26, color: "var(--fs-gold)", delay: "0s" },
  { className: "right-[14%] top-[30%]", size: 18, color: "var(--primary)", delay: "1.4s" },
  { className: "left-[20%] bottom-[18%]", size: 20, color: "var(--primary)", delay: "2.6s" },
  { className: "right-[22%] bottom-[24%]", size: 14, color: "var(--fs-gold)", delay: "3.8s" },
];

export default function LostChunk({ pathname }: { pathname: string }) {
  const lang = resolveLocale(pathname);
  const copy = COPY[lang];

  // Strip the locale prefix so the console reads like an in-world path.
  const requestedPath = pathname.replace(/^\/(en|tr|de)(?=\/|$)/, "") || "/";
  const lines = copy.console(requestedPath);
  const coords = rollCoords();

  const ctaBase =
    "wl-btn inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-control,8px)] border px-5 py-[11px] font-ui text-[13.5px] font-bold no-underline transition-opacity hover:opacity-90 active:opacity-80";

  return (
    <main className="relative flex min-h-[calc(100vh-84px)] items-center overflow-hidden bg-background py-12 md:py-16">
      <PageBackdrop>
        {/* Void glow + drifting sigils behind the panel. */}
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_22%,transparent)_0%,transparent_70%)]" />
        {SIGILS.map((s, i) => (
          <div
            key={i}
            className={`fs404-drift absolute ${s.className}`}
            style={{ animationDelay: s.delay }}
          >
            <Sigil size={s.size} color={s.color} />
          </div>
        ))}
      </PageBackdrop>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 md:px-8">
        <section className="fs404-scan relative overflow-hidden rounded-[12px] border border-border bg-bg-panel shadow-[0_1px_0_rgba(0,0,0,0.4)] backdrop-blur-[2px]">
          {/* Console title bar */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-6">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 bg-danger/80" />
              <span className="h-2.5 w-2.5 bg-fs-gold/80" />
              <span className="h-2.5 w-2.5 bg-success/80" />
            </div>
            <span className="font-mono text-[11px] tracking-[0.18em] text-foreground/55 uppercase">
              fs://void/lost-chunk
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-danger uppercase">
              <span className="wl-blink h-1.5 w-1.5 rounded-full bg-danger" />
              rec
            </span>
          </div>

          <div className="px-5 py-8 md:px-10 md:py-12">
            {/* Glitching 404 (pure CSS) */}
            <span
              className="fs404-glitch font-display text-[88px] font-bold md:text-[140px]"
              data-text="404"
            >
              404
            </span>

            <p className="mt-2 font-ui text-[11px] uppercase tracking-[0.38em] text-fs-gold/80">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-xl leading-tight tracking-[0.12em] text-foreground md:text-2xl">
              {copy.heading}
            </h1>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-foreground/70 md:text-base">
              {copy.lead}
            </p>

            {/* Terminal log */}
            <div className="mt-6 rounded-[10px] border border-border bg-background/60 p-4 font-mono text-[12px] leading-relaxed md:text-[13px]">
              {lines.map((line, i) => {
                const isError = line.startsWith("!");
                const isLast = i === lines.length - 1;
                return (
                  <div key={i} className={isError ? "text-danger" : "text-foreground/75"}>
                    {line}
                    {isLast ? <span className="wl-blink">▋</span> : null}
                  </div>
                );
              })}
            </div>

            {/* Void coordinates */}
            <p className="mt-4 font-mono text-[11px] tracking-wide text-foreground/45">
              <span className="uppercase tracking-[0.2em] text-foreground/35">{copy.coords}:</span>{" "}
              <span className="text-fs-gold">
                x {coords.x.toLocaleString()} · y {coords.y} · z {coords.z.toLocaleString()}
              </span>
            </p>

            {/* CTAs (plain anchors — no client component allowed in not-found tree) */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`/${lang}`}
                className={ctaBase}
                style={{
                  background: "var(--fs-gold)",
                  color: "#1c1304",
                  borderColor: "var(--border)",
                }}
              >
                {copy.spawn}
              </a>
              <a
                href={`/${lang}/discover`}
                className={ctaBase}
                style={{
                  background: "var(--secondary)",
                  color: "var(--foreground)",
                  borderColor: "var(--border)",
                }}
              >
                {copy.browse}
              </a>
            </div>

            <p className="mt-5 font-body text-[11px] text-foreground/35">{copy.hint}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
