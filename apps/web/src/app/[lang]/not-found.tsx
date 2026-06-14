"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sigil, WLButton } from "@firstspawn/ui";
import { PageBackdrop } from "@/components/ui/PagePrimitives";

/**
 * Custom 404 — the "Lost Chunk".
 *
 * This file is the not-found boundary for the entire `[lang]` segment, so it
 * catches both unmatched URLs (the proxy rewrites locale-less paths to
 * `/{locale}/...` first) and explicit `notFound()` calls (e.g. an unknown
 * server slug). Because Next.js does not pass route params to `not-found`
 * files, locale + copy are resolved client-side from the pathname.
 */

type Locale = "en" | "tr" | "de" | "ru" | "es" | "fr";

const LOCALES: readonly Locale[] = ["en", "tr", "de", "ru", "es", "fr"];

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
    hint: "psst — poke the 404 to regenerate the chunk",
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
    hint: "ipucu — parçayı yeniden üretmek için 404'e dokun",
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
    hint: "psst — tippe auf die 404, um den Chunk neu zu erzeugen",
    spawn: "Zum Spawn zurück",
    browse: "Server entdecken",
  },
  ru: {
    eyebrow: "Ошибка 404 · Чанк не найден",
    heading: "Этот узел так и не появился.",
    lead: "Запрошенные координаты ушли за край загруженного мира. Здесь, в пустоте, ничего не отрисовано.",
    console: (p) => [
      `> разрешение маршрута ${p}`,
      "! чанк не загрузился по запрошенным координатам",
      "> генератор мира вернул пустое пространство",
    ],
    coords: "последняя известная позиция",
    hint: "подсказка — нажми на 404, чтобы пересоздать чанк",
    spawn: "Вернуться к спавну",
    browse: "Смотреть серверы",
  },
  es: {
    eyebrow: "Error 404 · Chunk no encontrado",
    heading: "Este nodo nunca apareció.",
    lead: "Las coordenadas que pediste se alejaron del borde del mundo cargado. Aquí, en el vacío, no se renderiza nada.",
    console: (p) => [
      `> resolviendo ruta ${p}`,
      "! el chunk no se cargó en las coordenadas pedidas",
      "> el generador de mundo devolvió espacio vacío",
    ],
    coords: "última posición conocida",
    hint: "psst — toca el 404 para regenerar el chunk",
    spawn: "Volver al spawn",
    browse: "Explorar servidores",
  },
  fr: {
    eyebrow: "Erreur 404 · Chunk introuvable",
    heading: "Ce nœud n'est jamais apparu.",
    lead: "Les coordonnées demandées ont dérivé au-delà du bord du monde chargé. Ici, dans le vide, rien n'est rendu.",
    console: (p) => [
      `> résolution de la route ${p}`,
      "! échec du chargement du chunk aux coordonnées demandées",
      "> le générateur de monde a renvoyé un espace vide",
    ],
    coords: "dernière position connue",
    hint: "psst — touchez le 404 pour régénérer le chunk",
    spawn: "Retour au point d'apparition",
    browse: "Parcourir les serveurs",
  },
};

function resolveLocale(pathname: string | null): Locale {
  const seg = pathname?.split("/").filter(Boolean)[0];
  return LOCALES.includes(seg as Locale) ? (seg as Locale) : "en";
}

/** Deterministic-ish void coordinates; reshuffled on the easter egg. */
function rollCoords(): { x: number; y: number; z: number } {
  const span = () => Math.floor((Math.random() - 0.5) * 60_000_000);
  return { x: span(), y: Math.floor(Math.random() * 384) - 64, z: span() };
}

export default function NotFound() {
  const pathname = usePathname();
  const lang = resolveLocale(pathname);
  const copy = COPY[lang];

  const requestedPath = useMemo(() => {
    if (!pathname) return "/…";
    // Strip the locale prefix so the console reads like an in-world path.
    const rest = pathname.replace(/^\/(en|tr|de|ru|es|fr)(?=\/|$)/, "");
    return rest || "/";
  }, [pathname]);

  const lines = useMemo(() => copy.console(requestedPath), [copy, requestedPath]);

  const [reduced, setReduced] = useState(false);
  const [revealed, setRevealed] = useState(0); // characters revealed across all lines
  const [coords, setCoords] = useState<{ x: number; y: number; z: number } | null>(null);
  const [regen, setRegen] = useState(false);
  const regenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pick the initial void coordinates on the client (avoids hydration drift).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random seed must run post-mount to avoid a hydration mismatch
    setCoords(rollCoords());
  }, []);

  // Honour reduced-motion: skip the typewriter entirely.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- matchMedia state can only be read client-side, post-mount
    setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const totalChars = useMemo(() => lines.reduce((n, l) => n + l.length + 1, 0), [lines]);

  // Typewriter: reveal one character per tick until every line is printed.
  /* eslint-disable react-hooks/set-state-in-effect -- this effect *is* the animation driver; revealed count is advanced from rAF */
  useEffect(() => {
    if (reduced) {
      setRevealed(totalChars);
      return;
    }
    setRevealed(0);
    let raf = 0;
    let last = 0;
    let count = 0;
    const step = (t: number) => {
      if (!last) last = t;
      if (t - last >= 22) {
        last = t;
        count += 1;
        setRevealed(count);
      }
      if (count < totalChars) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced, totalChars]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const typingDone = revealed >= totalChars;

  const regenerate = useCallback(() => {
    setCoords(rollCoords());
    setRegen(true);
    // Restart the glitch-burst timer so rapid clicks don't end it early.
    if (regenTimer.current) clearTimeout(regenTimer.current);
    regenTimer.current = setTimeout(() => {
      setRegen(false);
      regenTimer.current = null;
    }, 600);
  }, []);

  // Clear any pending glitch-burst timer on unmount.
  useEffect(() => {
    return () => {
      if (regenTimer.current) clearTimeout(regenTimer.current);
    };
  }, []);

  // Render the partially-typed console lines. `start` is the cumulative char
  // offset where each line begins (+1 per line for the implicit newline).
  const printed = useMemo(() => {
    return lines.map((line, i) => {
      const start = lines.slice(0, i).reduce((n, l) => n + l.length + 1, 0);
      const take = Math.max(0, Math.min(line.length, revealed - start));
      return line.slice(0, take);
    });
  }, [lines, revealed]);

  return (
    <main className="relative flex min-h-[calc(100vh-84px)] items-center overflow-hidden bg-background py-12 md:py-16">
      <PageBackdrop>
        {/* Void glow + drifting sigils behind the panel. */}
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_22%,transparent)_0%,transparent_70%)]" />
        <div className="fs404-drift absolute left-[12%] top-[22%]" style={{ animationDelay: "0s" }}>
          <Sigil size={26} color="var(--fs-gold)" />
        </div>
        <div
          className="fs404-drift absolute right-[14%] top-[30%]"
          style={{ animationDelay: "1.4s" }}
        >
          <Sigil size={18} color="var(--primary)" />
        </div>
        <div
          className="fs404-drift absolute left-[20%] bottom-[18%]"
          style={{ animationDelay: "2.6s" }}
        >
          <Sigil size={20} color="var(--primary)" />
        </div>
        <div
          className="fs404-drift absolute right-[22%] bottom-[24%]"
          style={{ animationDelay: "3.8s" }}
        >
          <Sigil size={14} color="var(--fs-gold)" />
        </div>
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
            {/* Glitching 404 — clickable easter egg */}
            <button
              type="button"
              onClick={regenerate}
              className="block rounded-lg bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-bg-panel"
              aria-label={copy.hint}
            >
              <span
                className={`fs404-glitch font-display text-[88px] font-bold md:text-[140px] ${
                  regen ? "is-regen" : ""
                }`}
                data-text="404"
              >
                404
              </span>
            </button>

            <p className="mt-2 font-ui text-[11px] uppercase tracking-[0.38em] text-fs-gold/80">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-xl leading-tight tracking-[0.12em] text-foreground md:text-2xl">
              {copy.heading}
            </h1>
            <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-foreground/70 md:text-base">
              {copy.lead}
            </p>

            {/* Terminal log — static copy for screen readers, animated for sighted users. */}
            <div className="sr-only">{lines.join("\n")}</div>
            <div
              aria-hidden="true"
              className="mt-6 rounded-[10px] border border-border bg-background/60 p-4 font-mono text-[12px] leading-relaxed md:text-[13px]"
            >
              {printed.map((line, i) => {
                const isError = lines[i].startsWith("!");
                const isLast = i === lines.length - 1;
                return (
                  <div key={i} className={isError ? "text-danger" : "text-foreground/75"}>
                    {line}
                    {isLast && typingDone ? <span className="wl-blink">▋</span> : null}
                  </div>
                );
              })}
            </div>

            {/* Void coordinates (reroll on regenerate; null until rolled client-side). */}
            <p className="mt-4 min-h-[16px] font-mono text-[11px] tracking-wide text-foreground/45">
              {coords ? (
                <>
                  <span className="uppercase tracking-[0.2em] text-foreground/35">
                    {copy.coords}:
                  </span>{" "}
                  <span className="text-fs-gold">
                    x {coords.x.toLocaleString()} · y {coords.y} · z {coords.z.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="invisible">placeholder</span>
              )}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <WLButton href={`/${lang}`} variant="gold" size="md">
                {copy.spawn}
              </WLButton>
              <WLButton href={`/${lang}/discover`} variant="secondary" size="md">
                {copy.browse}
              </WLButton>
            </div>

            <p className="mt-5 font-body text-[11px] text-foreground/35">{copy.hint}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
