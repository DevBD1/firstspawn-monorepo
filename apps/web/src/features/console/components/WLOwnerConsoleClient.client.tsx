"use client";

import React, { useMemo, useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { WLButton } from "@firstspawn/ui";
import type { PublicServerListItem } from "@/lib/servers-api";
import type {
  AppDictionary,
  OwnerConsoleDictionary,
  RankSignalsDictionary,
} from "@/lib/dictionaries/schema";
import { getCountryOptions } from "@/lib/countries";

const WL_CONSOLE_SECTION_IDS = ["overview", "profile", "media", "trailer", "health"] as const;
type ConsoleSectionId = (typeof WL_CONSOLE_SECTION_IDS)[number];

const subscribeToStaticClientSnapshot = () => () => {};
const getEmptySnapshot = () => "";
const getProvenanceDateSnapshot = () =>
  new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// Console server records merge catalog rows with locally-stored custom drafts,
// so only the fields the console reads are typed; the rest stay opaque.
interface ConsoleServer {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  country_code?: string | null;
  pending?: boolean;
  latest_metrics?: { online_players?: number | null } | null;
  [key: string]: unknown;
}

// Catalog tag tokens double as feature keys, so they stay English.
const WL_ALL_TAGS = [
  "Survival",
  "Whitelist",
  "Economy",
  "Trading",
  "Towny",
  "Skyblock",
  "Quests",
  "RPG",
  "Hardcore",
  "Seasonal",
  "Creative",
  "Builds",
  "Showcase",
  "Dungeons",
  "Family-friendly",
].sort();

interface Signals {
  activity: number;
  trust: number;
  freshness: number;
}

function getServerSignals(name: string): Signals {
  const charSum = name.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const activity = 40 + (charSum % 41);
  const trust = 65 + (charSum % 31);
  const freshness = 80 + (charSum % 18);
  return { activity, trust, freshness };
}

function getConsoleServerTags(server: ConsoleServer): string[] {
  const haystack = `${server.name} ${server.description || ""}`.toLowerCase();
  return WL_ALL_TAGS.filter((tag) => haystack.includes(tag.toLowerCase()));
}

function WLPlaceholder({
  label,
  height = 110,
  tone = "#7d8bb0",
  className = "",
  style = {},
}: {
  label: string;
  height?: number;
  tone?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={{
        height,
        background: `repeating-linear-gradient(45deg, ${tone}26 0 11px, ${tone}10 11px 22px)`,
        ...style,
      }}
    >
      <span className="font-mono text-[10px] tracking-wider text-muted opacity-90 bg-black/20 px-2 py-0.5 rounded select-none">
        {label}
      </span>
    </div>
  );
}

function WLSignalBars({ sig, rankCopy }: { sig: Signals; rankCopy: RankSignalsDictionary }) {
  return (
    <div className="flex flex-col gap-2.5">
      {[
        [rankCopy.activityLabel, sig.activity, rankCopy.activityHint],
        [rankCopy.trustLabel, sig.trust, rankCopy.trustHint],
        [rankCopy.freshnessLabel, sig.freshness, rankCopy.freshnessHint],
      ].map(([label, v, hint]) => (
        <div key={label as string} className="grid grid-cols-[80px_1fr_38px] items-center gap-3">
          <span title={hint as string} className="font-body text-xs font-semibold text-muted">
            {label as string}
          </span>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${v}%` }}></div>
          </div>
          <span className="font-mono text-xs text-foreground text-right">{v}</span>
        </div>
      ))}
    </div>
  );
}

// --- Trailer Studio component ---
function WLTrailerStudio({
  addr,
  slug,
  serverName,
  locked,
  onPublished,
  isPublished,
  copy,
}: {
  addr: string;
  slug: string;
  serverName: string;
  locked: boolean;
  onPublished: () => void;
  isPublished: boolean;
  copy: OwnerConsoleDictionary["trailer"];
}) {
  const [step, setStep] = useState<"address" | "rendering" | "preview" | "published">(
    isPublished ? "published" : "address"
  );
  const [stageIdx, setStageIdx] = useState(0);
  const provenanceDate = useSyncExternalStore(
    subscribeToStaticClientSnapshot,
    getProvenanceDateSnapshot,
    getEmptySnapshot
  );

  useEffect(() => {
    if (step !== "rendering") return;
    if (stageIdx >= copy.stages.length) {
      const t = setTimeout(() => setStep("preview"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStageIdx(stageIdx + 1), 850);
    return () => clearTimeout(t);
  }, [step, stageIdx, copy.stages.length]);

  const startRender = () => {
    setStageIdx(0);
    setStep("rendering");
  };

  const publish = () => {
    setStep("published");
    onPublished();
  };

  return (
    <div className="bg-bg-panel border border-border rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <span className="font-body text-[10px] font-bold tracking-widest text-primary uppercase">
          {copy.title}
        </span>
        <span className="font-mono text-[10px] text-muted">{copy.provenanceNote}</span>
      </div>

      {locked && (
        <div className="flex flex-col gap-3">
          <div className="font-display font-medium text-base text-foreground">
            {copy.lockedTitle}
          </div>
          <div className="font-body text-xs leading-relaxed text-muted mb-2">
            {copy.lockNotePending.replace("{name}", serverName)}
          </div>
          <WLButton
            variant="secondary"
            className="opacity-55 cursor-not-allowed pointer-events-none"
            fullWidth
          >
            {copy.renderCta}
          </WLButton>
        </div>
      )}

      {!locked && step === "address" && (
        <div className="flex flex-col gap-3">
          <div className="font-display font-medium text-base text-foreground">{copy.filmTitle}</div>
          <div className="font-body text-xs leading-relaxed text-muted mb-3">{copy.filmBody}</div>
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
            <span className="font-mono text-xs text-foreground bg-secondary border border-border rounded-lg p-2.5 w-full sm:w-auto sm:flex-1 text-center truncate">
              {addr}
            </span>
            <WLButton variant="primary" onClick={startRender}>
              {copy.renderCta}
            </WLButton>
          </div>
          <div className="font-mono text-[10px] text-muted select-none mt-1">
            {copy.addressNote}
          </div>
        </div>
      )}

      {!locked && step === "rendering" && (
        <div className="flex flex-col gap-3">
          <div className="font-display font-medium text-base text-foreground">
            {copy.renderingTitle}
          </div>
          <div className="font-body text-xs leading-relaxed text-muted mb-2">
            {copy.renderingBody}
          </div>
          <div className="flex flex-col gap-3">
            {copy.stages.map((stage, i) => {
              const state = i < stageIdx ? "done" : i === stageIdx ? "active" : "todo";
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[26px_1fr] gap-3 items-baseline ${state === "todo" ? "opacity-38" : "opacity-100"}`}
                >
                  <span
                    className={`font-mono text-xs font-bold text-center rounded-lg py-0.5 border ${
                      state === "done"
                        ? "text-success border-success"
                        : state === "active"
                          ? "bg-primary text-on-primary border-primary-hover"
                          : "text-muted border-border"
                    }`}
                  >
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  <div>
                    <div className="font-body text-[13px] font-bold text-foreground">
                      {stage.label.replace("{addr}", addr)}
                      {state === "active" && (
                        <span className="animate-[wl-blink_900ms_step-start_infinite] text-primary">
                          {" "}
                          ▍
                        </span>
                      )}
                    </div>
                    {state !== "todo" && (
                      <div className="font-mono text-[10.5px] text-muted mt-0.5">
                        {stage.detail}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!locked && (step === "preview" || step === "published") && (
        <div className="flex flex-col gap-3">
          <div className="font-display font-medium text-base text-foreground">
            {step === "published" ? copy.publishedTitle : copy.previewTitle}
          </div>
          <div className="font-body text-xs leading-relaxed text-muted mb-2">
            {step === "published" ? copy.publishedBody.replace("{slug}", slug) : copy.previewBody}
          </div>
          <div className="relative mb-3 rounded-xl overflow-hidden border border-border">
            <WLPlaceholder
              label={`${slug} · trailer preview · 42s (16:9)`}
              height={230}
              tone="#7d8bb0"
            />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center text-lg shadow-lg cursor-pointer">
              ▶
            </span>
            <span className="absolute left-2.5 bottom-2.5 font-mono text-[10px] text-foreground bg-bg-panel/90 border border-border rounded-lg px-2.5 py-1">
              {copy.provenanceDated.replace("{date}", provenanceDate)}
            </span>
          </div>
          {step === "preview" ? (
            <div className="flex gap-2">
              <WLButton variant="primary" onClick={publish}>
                {copy.publishCta}
              </WLButton>
              <WLButton variant="outline" onClick={startRender}>
                {copy.rerenderCta}
              </WLButton>
            </div>
          ) : (
            <div className="flex gap-3 items-center flex-wrap">
              <span className="font-body text-xs font-bold text-success">
                {copy.publishedBadge}
              </span>
              <WLButton variant="outline" size="sm" onClick={() => setStep("address")}>
                {copy.startOverCta}
              </WLButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Listing Health component ---
function WLListingHealth({
  items,
  copy,
}: {
  items: { ok: boolean; label: string; note: string }[];
  copy: OwnerConsoleDictionary["health"];
}) {
  const okCount = items.filter((i) => i.ok).length;
  return (
    <div className="bg-bg-panel border border-border rounded-xl p-5 flex flex-col">
      <div className="flex justify-between items-baseline gap-2 mb-4">
        <span className="font-body text-[10px] font-bold tracking-widest text-primary uppercase">
          {copy.title}
        </span>
        <span
          className={`font-mono text-sm font-bold ${okCount === items.length ? "text-success" : "text-foreground"}`}
        >
          {okCount}/{items.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <div key={it.label} className="grid grid-cols-[20px_1fr] gap-2.5 items-baseline">
            <span
              className={`font-mono text-xs font-bold ${it.ok ? "text-success" : "text-danger"}`}
            >
              {it.ok ? "✓" : "✗"}
            </span>
            <div>
              <span className="font-body text-xs font-bold text-foreground">{it.label}</span>
              <span className="font-body text-[11.5px] text-muted"> — {it.note}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 font-mono text-[9.5px] leading-relaxed text-muted border-t border-border/60 pt-3 select-none">
        {copy.footnote}
      </div>
    </div>
  );
}

interface WLProfileFormProps {
  server: ConsoleServer;
  lang: string;
  isCustomServer: boolean;
  copy: OwnerConsoleDictionary["profile"];
  countryOptions: ReturnType<typeof getCountryOptions>;
  links: { kind: string; value: string; verified: boolean }[];
  onServerSaved: (server: ConsoleServer) => void;
}

function WLProfileForm({
  server,
  lang,
  isCustomServer,
  copy,
  countryOptions,
  links,
  onServerSaved,
}: WLProfileFormProps) {
  const [editName, setEditName] = useState(server.name);
  const [editBlurb, setEditBlurb] = useState(server.description || "");
  const [editTags, setEditTags] = useState(() => getConsoleServerTags(server));
  const [editCountry, setEditCountry] = useState(server.country_code || "WW");
  const [saved, setSaved] = useState(false);
  const savedTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  const toggleTag = (tag: string) => {
    setEditTags((current) =>
      current.includes(tag)
        ? current.filter((x) => x !== tag)
        : current.length < 4
          ? [...current, tag]
          : current
    );
  };

  const saveProfile = () => {
    if (!isCustomServer) {
      return;
    }

    try {
      const customServersStr = localStorage.getItem("fsproto.custom_servers");
      if (!customServersStr) return;

      const customServers = JSON.parse(customServersStr) as ConsoleServer[];
      const idx = customServers.findIndex((cs) => cs.slug === server.slug);
      if (idx === -1) return;

      const updatedServer = {
        ...server,
        name: editName,
        description: editBlurb,
        country_code: editCountry,
      };

      customServers[idx] = { ...customServers[idx], ...updatedServer };
      localStorage.setItem("fsproto.custom_servers", JSON.stringify(customServers));
      onServerSaved(updatedServer);
      setSaved(true);

      if (savedTimerRef.current) {
        clearTimeout(savedTimerRef.current);
      }
      savedTimerRef.current = setTimeout(() => setSaved(false), 2200);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-5 max-w-[620px]">
      <div className="bg-bg-panel border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm">
        <div>
          <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-1.5">
            {copy.nameLabel}
          </div>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            disabled={!isCustomServer}
            className="font-body text-xs p-2.5 bg-secondary border border-border rounded-lg outline-none text-foreground w-full focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="font-mono text-[10px] text-muted mt-1.5">
            {copy.nameHint.replace("{url}", `firstspawn.com/${lang}/server/${server.slug}`)}
          </div>
        </div>

        <div>
          <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-1.5">
            {copy.blurbLabel.replace("{count}", String(140 - editBlurb.length))}
          </div>
          <input
            value={editBlurb}
            maxLength={140}
            onChange={(e) => setEditBlurb(e.target.value)}
            disabled={!isCustomServer}
            className="font-body text-xs p-2.5 bg-secondary border border-border rounded-lg outline-none text-foreground w-full focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div>
          <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-2">
            {copy.tagsLabel.replace("{count}", String(editTags.length))}
          </div>
          <div className="flex flex-wrap gap-1">
            {WL_ALL_TAGS.map((tag) => (
              <button
                key={tag}
                disabled={!isCustomServer}
                onClick={() => toggleTag(tag)}
                className={`font-body text-xs font-semibold rounded-full px-2.5 py-0.5 cursor-pointer transition border ${
                  editTags.includes(tag)
                    ? "bg-primary border-primary text-on-primary"
                    : "border-border text-muted hover:border-foreground"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-1.5">
            {copy.countryLabel}
          </div>
          <select
            value={editCountry}
            onChange={(e) => setEditCountry(e.target.value)}
            disabled={!isCustomServer}
            className="font-body text-xs p-2.5 bg-secondary border border-border rounded-lg outline-none text-foreground w-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888fa5'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
            }}
          >
            {countryOptions.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-bg-panel border border-border rounded-xl p-5 flex flex-col shadow-sm">
        <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase mb-3.5">
          {copy.linksTitle}
        </div>
        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <div key={link.kind} className="grid grid-cols-[80px_1fr_auto] gap-3 items-center">
              <span className="font-body font-bold text-xs text-foreground">{link.kind}</span>
              <span className="font-mono text-xs text-primary truncate">{link.value}</span>
              {link.verified ? (
                <span className="font-body text-[10px] font-bold text-fs-gold">
                  {copy.linkVerifiedLabel}
                </span>
              ) : (
                <button className="font-body text-xs font-bold text-primary hover:underline cursor-pointer">
                  {copy.linkVerifyCta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3.5 flex-wrap">
        <WLButton variant="primary" onClick={saveProfile} disabled={!isCustomServer}>
          {copy.saveLabel}
        </WLButton>
        {saved && (
          <span className="font-body text-xs font-bold text-success">{copy.savedNote}</span>
        )}
      </div>
    </div>
  );
}

export default function WLOwnerConsoleClient({
  initialServers,
  lang,
  dictionary,
}: {
  initialServers: PublicServerListItem[];
  lang: string;
  dictionary: AppDictionary;
}) {
  const router = useRouter();
  const consoleCopy = dictionary.ownerConsole;
  const rankCopy = dictionary.rankSignals;
  const countries = dictionary.common.countries;
  const countryOptions = useMemo(() => getCountryOptions(lang, countries), [lang, countries]);
  const linkKinds = dictionary.common.linkKinds;

  const [servers, setServers] = useState<ConsoleServer[]>([]);
  const [serverId, setServerId] = useState("");
  const [section, setSection] = useState<ConsoleSectionId>("overview");

  // Custom states
  const [trailerPublishedMap, setTrailerPublishedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load custom servers and trailers from localStorage (SSR-safe: runs post-mount
    // to avoid a hydration mismatch, so setState inside the effect is intentional).
    /* eslint-disable react-hooks/set-state-in-effect -- post-mount localStorage hydration */
    try {
      const customServersStr = localStorage.getItem("fsproto.custom_servers");
      const customServers = customServersStr ? JSON.parse(customServersStr) : [];

      const combined = [
        ...customServers,
        ...initialServers.map((s) => ({
          ...s,
          id: s.slug,
          pending: false,
        })),
      ];

      setServers(combined);

      if (combined.length > 0) {
        setServerId(combined[0].id);
      }

      const storedTrailers = localStorage.getItem("fsproto.published_trailers");
      if (storedTrailers) {
        setTrailerPublishedMap(JSON.parse(storedTrailers));
      }
    } catch (e) {
      console.error(e);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [initialServers]);

  const activeServer = servers.find((s) => s.id === serverId) || servers[0];

  if (!activeServer) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-12 text-center">
        <h2 className="font-display font-medium text-lg text-foreground mb-4">
          {consoleCopy.empty.title}
        </h2>
        <WLButton variant="primary" onClick={() => router.push(`/${lang}/list`)}>
          {consoleCopy.empty.ctaLabel}
        </WLButton>
      </div>
    );
  }

  const sig = getServerSignals(activeServer.name);
  const baseVotes = 1200 + activeServer.name.charCodeAt(0) * 15;
  const isCustomServer = !!activeServer.pending;

  const handleServerSaved = (updatedServer: ConsoleServer) => {
    setServers((current) =>
      current.map((s) => (s.id === updatedServer.id ? { ...s, ...updatedServer } : s))
    );
  };

  const handlePublishTrailer = () => {
    const nextMap = { ...trailerPublishedMap, [activeServer.id]: true };
    setTrailerPublishedMap(nextMap);
    try {
      localStorage.setItem("fsproto.published_trailers", JSON.stringify(nextMap));
    } catch {}
  };

  const isTrailerDone = !!trailerPublishedMap[activeServer.id];

  const healthCopy = consoleCopy.health.items;
  const healthItems = activeServer.pending
    ? [
        { ok: true, label: healthCopy.ownership.label, note: healthCopy.ownership.note },
        { ok: true, label: healthCopy.freshPing.label, note: healthCopy.freshPing.notePending },
        { ok: false, label: healthCopy.links.label, note: healthCopy.links.notePending },
        {
          ok: false,
          label: healthCopy.featureCards.label,
          note: healthCopy.featureCards.notePending,
        },
        { ok: false, label: healthCopy.trailer.label, note: healthCopy.trailer.notePending },
      ]
    : [
        { ok: true, label: healthCopy.ownership.label, note: healthCopy.ownership.note },
        { ok: true, label: healthCopy.links.label, note: healthCopy.links.noteLive },
        {
          ok: getConsoleServerTags(activeServer).length > 0,
          label: healthCopy.featureCards.label,
          note: healthCopy.featureCards.noteLive.replace(
            "{count}",
            String(getConsoleServerTags(activeServer).length)
          ),
        },
        {
          ok: isTrailerDone,
          label: healthCopy.trailer.label,
          note: isTrailerDone
            ? healthCopy.trailer.notePublished
            : healthCopy.trailer.noteUnrendered,
        },
        { ok: true, label: healthCopy.freshPing.label, note: healthCopy.freshPing.noteLive },
      ];

  const links = [
    { kind: linkKinds.website, value: `${activeServer.slug}.net`, verified: true },
    { kind: linkKinds.discord, value: `discord.gg/${activeServer.slug}`, verified: true },
    { kind: linkKinds.store, value: `store.${activeServer.slug}.net`, verified: false },
    { kind: linkKinds.youtube, value: `@${activeServer.slug}`, verified: false },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-7 py-6">
      <div className="flex justify-between items-end gap-4 flex-wrap mb-5">
        <div>
          <h1 className="font-display font-semibold text-2xl text-foreground mb-1">
            {consoleCopy.header.title}
          </h1>
          <p className="font-body text-xs text-muted">
            {consoleCopy.header.summary.replace("{count}", String(servers.length))}
          </p>
        </div>
        <WLButton variant="outline" size="sm" onClick={() => router.push(`/${lang}/list`)}>
          {consoleCopy.header.listAnotherLabel}
        </WLButton>
      </div>

      {/* Switcher tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4 w-full">
        {servers.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setServerId(s.id);
              setSection("overview");
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-xl cursor-pointer transition duration-150 ${
              s.id === serverId
                ? "bg-bg-panel border-primary text-foreground"
                : "border-border text-muted hover:border-foreground"
            }`}
          >
            <WLPlaceholder label="" height={22} tone="#7d8bb0" className="w-5.5 rounded-md" />
            <span className="font-body text-xs font-bold">{s.name}</span>
            <span className="font-mono text-[9px] border border-border px-1 py-0.5 rounded text-muted">
              {s.country_code || "WW"}
            </span>
            {s.pending && (
              <span className="font-body text-[9px] font-bold text-muted border border-dashed border-border rounded-full px-1.5 py-0.5 leading-none">
                {consoleCopy.switcher.pendingBadge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Double Column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
        {/* Navigation Sidebar */}
        <nav className="flex md:flex-col gap-1 w-full md:sticky md:top-20 overflow-x-auto pb-2 md:pb-0">
          {WL_CONSOLE_SECTION_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`text-left px-3 py-2 border rounded-lg font-body text-xs font-bold cursor-pointer transition-all duration-120 whitespace-nowrap ${
                section === id
                  ? "bg-bg-panel border-border text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {consoleCopy.sections[id]}
            </button>
          ))}
        </nav>

        {/* Section Contents */}
        <div className="min-w-0">
          {section === "overview" && (
            <div className="flex flex-col gap-5">
              {activeServer.pending && (
                <div className="border border-dashed border-border rounded-xl p-4 font-body text-xs leading-relaxed text-muted bg-bg-panel/40">
                  <span className="font-bold text-foreground">
                    {consoleCopy.overview.firstCrawlTitle}
                  </span>{" "}
                  {consoleCopy.overview.firstCrawlBody}
                </div>
              )}

              {/* Grid of stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-bg-panel border border-border rounded-xl p-3.5 shadow-sm">
                  <div
                    className={`font-mono text-lg font-bold ${!activeServer.pending ? "text-primary" : "text-muted"}`}
                  >
                    {activeServer.pending ? "—" : "#01"}
                  </div>
                  <div className="font-body text-[11px] text-muted mt-0.5">
                    {consoleCopy.overview.rankLabel}{" "}
                    <span className="opacity-70">
                      ·{" "}
                      {activeServer.pending
                        ? consoleCopy.overview.rankPending
                        : consoleCopy.overview.rankOf.replace("{total}", "2,418")}
                    </span>
                  </div>
                </div>

                <div className="bg-bg-panel border border-border rounded-xl p-3.5 shadow-sm">
                  <div className="font-mono text-lg font-bold text-success">
                    {(activeServer.latest_metrics?.online_players ?? 0).toLocaleString()}
                  </div>
                  <div className="font-body text-[11px] text-muted mt-0.5">
                    {consoleCopy.overview.onlineNowLabel}
                  </div>
                </div>

                <div className="bg-bg-panel border border-border rounded-xl p-3.5 shadow-sm">
                  <div className="font-mono text-lg font-bold text-foreground">{sig.trust}</div>
                  <div className="font-body text-[11px] text-muted mt-0.5">
                    {consoleCopy.overview.standingLabel}
                  </div>
                </div>

                <div className="bg-bg-panel border border-border rounded-xl p-3.5 shadow-sm">
                  <div className="font-mono text-lg font-bold text-foreground">
                    {activeServer.pending ? "0" : `${(baseVotes / 1000).toFixed(1)}k`}
                  </div>
                  <div className="font-body text-[11px] text-muted mt-0.5">
                    {consoleCopy.overview.votesLabel}
                  </div>
                </div>
              </div>

              {/* Signals */}
              <div className="bg-bg-panel border border-border rounded-xl p-4 md:p-5">
                <div className="flex justify-between items-baseline gap-2 mb-3.5">
                  <span className="font-body text-[10px] font-bold tracking-widest text-muted uppercase">
                    {consoleCopy.overview.signalsTitle}
                  </span>
                  <span className="font-mono text-[10.5px] text-muted">
                    {consoleCopy.overview.signalsNote}
                  </span>
                </div>
                <WLSignalBars sig={sig} rankCopy={rankCopy} />
              </div>

              {/* Actions footer */}
              <div className="flex gap-2.5 flex-wrap">
                {!activeServer.pending && (
                  <WLButton
                    variant="secondary"
                    onClick={() => router.push(`/${lang}/server/${activeServer.slug}`)}
                  >
                    {consoleCopy.overview.viewProfileLabel}
                  </WLButton>
                )}
                <WLButton variant="outline" onClick={() => setSection("trailer")}>
                  {consoleCopy.overview.trailerCtaLabel}
                </WLButton>
                <WLButton variant="outline" onClick={() => setSection("health")}>
                  {consoleCopy.overview.healthCtaLabel}
                </WLButton>
              </div>
            </div>
          )}

          {section === "profile" && (
            <WLProfileForm
              key={activeServer.id}
              server={activeServer}
              lang={lang}
              isCustomServer={isCustomServer}
              copy={consoleCopy.profile}
              countryOptions={countryOptions}
              links={links}
              onServerSaved={handleServerSaved}
            />
          )}

          {section === "media" && (
            <div className="flex flex-col gap-6 max-w-[620px]">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 items-start">
                <div>
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <WLPlaceholder label="logo" height={120} tone="#7d8bb0" className="w-[120px]" />
                    <span className="absolute right-1.5 top-1.5 font-body text-[10px] font-bold bg-bg-panel/90 border border-border rounded px-1.5 py-0.5 cursor-pointer">
                      {consoleCopy.media.replaceLabel}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-muted mt-1 text-center">
                    1:1 · rows logo
                  </div>
                </div>

                <div className="w-full">
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <WLPlaceholder
                      label={`${activeServer.slug} · banner (1200×280)`}
                      height={120}
                      tone="#7d8bb0"
                    />
                    <span className="absolute right-1.5 top-1.5 font-body text-[10px] font-bold bg-bg-panel/90 border border-border rounded px-1.5 py-0.5 cursor-pointer">
                      {consoleCopy.media.replaceLabel}
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-muted mt-1.5">
                    wide · profile top banner
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="font-body text-[10.5px] font-bold tracking-widest text-muted uppercase">
                  {consoleCopy.media.screenshotsLabel.replace(
                    "{count}",
                    String(activeServer.pending ? 0 : 3)
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {!activeServer.pending && (
                    <>
                      <WLPlaceholder
                        label="spawn"
                        height={90}
                        tone="#7d8bb0"
                        className="rounded-lg border border-border"
                      />
                      <WLPlaceholder
                        label="builds"
                        height={90}
                        tone="#7d8bb0"
                        className="rounded-lg border border-border"
                      />
                      <WLPlaceholder
                        label="events"
                        height={90}
                        tone="#7d8bb0"
                        className="rounded-lg border border-border"
                      />
                    </>
                  )}
                  <div className="border border-dashed border-border rounded-lg h-[90px] flex items-center justify-center font-body text-xs font-bold text-muted cursor-pointer hover:border-primary/50 transition">
                    {consoleCopy.media.addScreenshotLabel}
                  </div>
                </div>
              </div>

              <div className="font-mono text-[10px] leading-relaxed text-muted select-none">
                {consoleCopy.media.policyNote}
              </div>
            </div>
          )}

          {section === "trailer" && (
            <div className="max-w-[620px]">
              <WLTrailerStudio
                key={`${activeServer.id}:${isTrailerDone ? "published" : "draft"}`}
                slug={activeServer.id}
                addr={`play.${activeServer.slug}.net`}
                serverName={activeServer.name}
                locked={!!activeServer.pending}
                onPublished={handlePublishTrailer}
                isPublished={isTrailerDone}
                copy={consoleCopy.trailer}
              />
            </div>
          )}

          {section === "health" && (
            <div className="max-w-[620px]">
              <WLListingHealth items={healthItems} copy={consoleCopy.health} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
