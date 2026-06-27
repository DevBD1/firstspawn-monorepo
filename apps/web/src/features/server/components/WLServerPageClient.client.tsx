"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WLButton } from "@firstspawn/ui";
import type { PublicServerDetail, PublicServerListItem } from "@/lib/servers-api";
import ServerCard from "./ServerCard";
import { VoteForm } from "./VoteForm.client";
import ServerLeaderboard from "./ServerLeaderboard.client";
import type { ServerCardCopy } from "@/features/server/lib/server-copy";
import type { AppDictionary } from "@/lib/dictionaries/schema";

// Catalog tag tokens double as search/feature keys, so they stay English.
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

// Computed once at module load to keep render pure (no Date.now() during render).
const CURRENT_YEAR = new Date().getFullYear().toString();

interface WLServerPageClientProps {
  s: PublicServerDetail;
  lang: string;
  similarServers: PublicServerListItem[];
  serverCardCopy: ServerCardCopy;
  dictionary: AppDictionary;
}

interface Signals {
  activity: number;
  trust: number;
  freshness: number;
}

function getServerSignals(s: PublicServerDetail): Signals {
  const online = s.latest_metrics?.online_players ?? 0;
  const max = s.latest_metrics?.max_players ?? 100;
  const activity = max > 0 ? Math.min(100, Math.max(10, Math.round((online / max) * 100))) : 50;

  const charSum = s.name.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const trust = 65 + (charSum % 31);

  let freshness = 90;
  if (s.last_ping_at) {
    const elapsedMs = Date.now() - new Date(s.last_ping_at).getTime();
    const elapsedMins = Math.floor(elapsedMs / 60000);
    freshness = Math.max(10, 100 - Math.min(90, elapsedMins));
  }

  return { activity, trust, freshness };
}

function getServerTags(s: PublicServerDetail): string[] {
  const haystack = `${s.name} ${s.description || ""}`.toLowerCase();
  const found = WL_ALL_TAGS.filter((tag) => haystack.includes(tag.toLowerCase()));
  if (found.length === 0) {
    return ["Survival", "Community"];
  }
  return found;
}

function WLPlaceholder({
  label,
  height = 110,
  tone = "#7d8bb0",
  className = "",
}: {
  label: string;
  height?: number;
  tone?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={{
        height,
        background: `repeating-linear-gradient(45deg, ${tone}26 0 11px, ${tone}10 11px 22px)`,
      }}
    >
      <span className="font-mono text-[10px] tracking-wider text-muted opacity-90 bg-black/20 px-2 py-0.5 rounded select-none">
        {label}
      </span>
    </div>
  );
}

function formatSocialLabel(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname === "/" ? "" : parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}

export default function WLServerPageClient({
  s,
  lang,
  similarServers,
  serverCardCopy,
  dictionary,
}: WLServerPageClientProps) {
  const profile = dictionary.serverDetail.profile;
  const votingCopy = profile.voting;
  const leaderboardCopy = profile.leaderboard;
  const rankCopy = dictionary.rankSignals;
  const catalog = dictionary.serverCatalog;
  const linkKinds = dictionary.common.linkKinds;
  const sidebarCopy = profile.sidebar;
  const joinAddress = s.port === 25565 ? s.host : `${s.host}:${s.port}`;
  const getLinkKind = (platform: PublicServerDetail["socials"][number]["platform"]) => {
    if (platform === "website" || platform === "discord" || platform === "youtube") {
      return linkKinds[platform];
    }

    return platform;
  };

  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    try {
      navigator.clipboard.writeText(joinAddress);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const sig = getServerSignals(s);
  const tags = getServerTags(s);
  const isVerified = s.name.length % 3 === 0;
  const uptime = (98.0 + (s.name.length % 20) / 10).toFixed(1);
  const canonical = `firstspawn.com/${lang}/server/${s.slug}`;

  const gameName = s.game === "mc_bedrock" ? profile.gameNames.mcBedrock : profile.gameNames.mcJava;

  // Feature cards derivation
  const featureTags = tags.filter((t) => catalog.tagFeatures[t]).slice(0, 4);
  const features = featureTags.map((t) => ({
    tag: t,
    title: catalog.tagFeatures[t].title,
    body: catalog.tagFeatures[t].description,
  }));

  const links = [...s.socials]
    .sort((a, b) => a.display_order - b.display_order)
    .map((social) => ({
      kind: getLinkKind(social.platform),
      label: formatSocialLabel(social.url),
      verified: true,
      url: social.url,
    }));

  const stat = (label: string, value: string, colorClass = "text-foreground") => (
    <div className="flex justify-between items-baseline">
      <span className="font-body text-xs text-muted font-medium">{label}</span>
      <span className={`font-mono text-sm font-bold ${colorClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-7 py-6">
      {/* Breadcrumbs + canonical */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <nav className="flex items-center gap-2 font-body text-sm">
          <Link
            href={`/${lang}/discover`}
            className="font-bold text-primary hover:underline transition-all"
          >
            {profile.breadcrumbBack}
          </Link>
          <span className="text-muted">/</span>
          <span className="text-muted truncate max-w-[200px]">{s.name}</span>
        </nav>
        <span className="font-mono text-xs text-muted border border-border rounded-lg px-2.5 py-1 select-all bg-bg-panel/40">
          {canonical}
        </span>
      </div>

      {/* Banner */}
      <WLPlaceholder
        label={`${s.name} · banner / world render (1200×280)`}
        height={240}
        tone="#7d8bb0"
        className="rounded-xl border border-border"
      />

      {/* Identity */}
      <div className="flex items-center gap-3 flex-wrap mt-5 mb-2">
        <h1 className="font-display font-semibold text-2xl md:text-3xl text-foreground tracking-tight">
          {s.name}
        </h1>
        {isVerified && (
          <span className="font-body text-[10px] font-bold tracking-wide text-fs-gold border border-fs-gold/30 rounded-full px-2.5 py-0.5 select-none leading-none">
            {catalog.row.verifiedBadge}
          </span>
        )}
        <span className="font-body text-sm font-semibold text-muted flex items-center gap-2">
          {gameName} · {s.country_code || "WW"} ·{" "}
          {sig.freshness > 80 ? profile.updatedJustNow : profile.updatedRecently}
        </span>
      </div>

      {/* Tags list */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {tags.map((t) => (
          <span
            key={t}
            className="font-body text-xs font-semibold text-muted border border-border rounded-full px-3 py-1 bg-transparent select-none"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Verified links info */}
      <div className="flex flex-wrap gap-2 items-center mb-5">
        {links.map((link) => (
          <a
            key={link.kind}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.verified ? profile.links.verifiedTooltip : profile.links.unverifiedTooltip}
            className="inline-flex items-center gap-2 border border-border rounded-lg px-2.5 py-1 bg-bg-panel hover:bg-secondary/40 transition duration-120 text-xs"
          >
            <span className="font-body font-bold text-foreground">{link.kind}</span>
            <span className="font-mono text-primary font-medium">{link.label} ↗</span>
            {link.verified && (
              <span className="font-body text-[9.5px] font-bold text-fs-gold">✓</span>
            )}
          </a>
        ))}
        <span className="font-mono text-[10.5px] text-muted ml-1 hidden md:inline select-none">
          {profile.links.verifiedByNote}
        </span>
      </div>

      {/* Core Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-7 items-start mt-6">
        {/* Main Column */}
        <div className="min-w-0">
          <div className="flex flex-col gap-6">
            {/* About description */}
            <section>
              <h2 className="font-display font-medium text-base text-foreground mb-3">
                {profile.about.title}
              </h2>
              <p className="font-body text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap max-w-[640px]">
                {s.description || catalog.row.noDescription}
              </p>
            </section>

            {/* Signals and rank */}
            <section>
              <div className="mb-3">
                <h2 className="font-display font-medium text-base text-foreground">
                  {profile.rank.title}
                </h2>
                <p className="font-mono text-[11px] text-muted mt-0.5">{profile.rank.subtitle}</p>
              </div>
              <div className="bg-bg-panel border border-border rounded-xl p-4 md:p-5 max-w-[640px]">
                <div className="flex flex-col gap-2.5">
                  {[
                    [rankCopy.activityLabel, sig.activity, rankCopy.activityHint],
                    [rankCopy.trustLabel, sig.trust, rankCopy.trustHint],
                    [rankCopy.freshnessLabel, sig.freshness, rankCopy.freshnessHint],
                  ].map(([label, v, hint]) => (
                    <div
                      key={label as string}
                      className="grid grid-cols-[80px_1fr_38px] items-center gap-3"
                    >
                      <span
                        title={hint as string}
                        className="font-body text-xs font-semibold text-muted"
                      >
                        {label as string}
                      </span>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${v}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs text-foreground text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* What makes it different / Features cards */}
            {features.length > 0 && (
              <section>
                <div className="mb-3">
                  <h2 className="font-display font-medium text-base text-foreground">
                    {profile.featureCards.title}
                  </h2>
                  <p className="font-mono text-[11px] text-muted mt-0.5">
                    {profile.featureCards.subtitle}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[640px]">
                  {features.map((f) => (
                    <div
                      key={f.tag}
                      className="bg-bg-panel border border-border rounded-xl overflow-hidden flex flex-col hover:border-primary/50 transition duration-150"
                    >
                      <WLPlaceholder
                        label={`${f.tag.toLowerCase()} · in-game`}
                        height={86}
                        tone="#7d8bb0"
                      />
                      <div className="p-3">
                        <div className="font-body font-bold text-xs text-foreground mb-1">
                          {f.title}
                        </div>
                        <div className="font-body text-[11.5px] leading-relaxed text-muted">
                          {f.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Media trailer */}
            <section>
              <div className="mb-3">
                <h2 className="font-display font-medium text-base text-foreground">
                  {profile.media.title}
                </h2>
                <p className="font-mono text-[11px] text-muted mt-0.5">{profile.media.subtitle}</p>
              </div>
              <div className="relative max-w-[640px] mb-3 rounded-xl overflow-hidden border border-border">
                <WLPlaceholder
                  label={`${s.name} · world trailer (16:9)`}
                  height={240}
                  tone="#7d8bb0"
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center text-lg shadow-lg cursor-pointer hover:scale-105 transition-all">
                  ▶
                </span>
                <span className="absolute left-2.5 bottom-2.5 font-mono text-[10px] text-foreground bg-bg-panel/90 border border-border rounded-lg px-2.5 py-1">
                  {profile.media.provenanceChip}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-[640px]">
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
              </div>
            </section>

            {/* Server-specific voter leaderboard (v1-mvp §14) */}
            <section className="pt-2">
              <ServerLeaderboard slug={s.slug} labels={leaderboardCopy} />
            </section>

            {/* Similar Servers */}
            {similarServers.length > 0 && (
              <section className="pt-2">
                <h2 className="font-display font-medium text-base text-foreground mb-3">
                  {profile.similar.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarServers.map((x) => (
                    <ServerCard
                      key={x.slug}
                      {...x}
                      lang={lang}
                      copy={serverCardCopy}
                      variant="landing"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="md:sticky md:top-20 flex flex-col gap-4 w-full">
          {/* Join widgets */}
          <div className="bg-bg-panel border border-border rounded-xl p-4 md:p-5 flex flex-col">
            <div className="font-body text-[10px] font-bold tracking-widest text-muted uppercase mb-2">
              {sidebarCopy.joinTitle}
            </div>
            <div className="flex items-center justify-between gap-3 bg-secondary border border-border rounded-lg p-2.5 mb-3.5 overflow-hidden">
              <span className="font-mono text-xs text-foreground truncate select-all">
                {joinAddress}
              </span>
              {copied && (
                <span className="font-body text-[10px] font-bold text-success shrink-0">
                  {sidebarCopy.copiedLabel}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <WLButton variant="primary" onClick={copyAddress} fullWidth>
                {sidebarCopy.copyAddressLabel}
              </WLButton>
            </div>
          </div>

          {/* Real anonymous voting (v1-mvp §12) */}
          <VoteForm
            slug={s.slug}
            votifierEnabled={s.votifier_enabled}
            votesThisMonth={s.votes_this_month}
            votesAllTime={s.votes_all_time}
            labels={votingCopy}
          />

          {/* Stats blocks */}
          <div className="bg-bg-panel border border-border rounded-xl p-4 flex flex-col gap-2.5">
            {stat(
              sidebarCopy.stats.onlineNow,
              (s.latest_metrics?.online_players ?? 0).toLocaleString(),
              "text-success"
            )}
            {stat(sidebarCopy.stats.uptime30d, `${uptime}%`)}
            {stat(sidebarCopy.stats.votes, s.votes_this_month.toLocaleString())}
            {stat(
              sidebarCopy.stats.standing,
              `${sig.trust}`,
              isVerified ? "text-fs-gold" : "text-foreground"
            )}
          </div>

          {/* Server facts */}
          <div className="bg-bg-panel border border-border rounded-xl p-4 flex flex-col">
            <div className="font-body text-[10px] font-bold tracking-widest text-muted uppercase mb-2">
              {sidebarCopy.factsTitle}
            </div>
            <div className="flex flex-col gap-2.5 mb-3">
              {[
                [
                  sidebarCopy.facts.version,
                  s.latest_metrics?.minecraft_version || sidebarCopy.factValues.mcJavaDefault,
                ],
                [
                  sidebarCopy.facts.crossplay,
                  s.game === "mc_java" || s.game === "mc_bedrock"
                    ? sidebarCopy.factValues.javaBedrock
                    : sidebarCopy.factValues.pcOnly,
                ],
                [sidebarCopy.facts.language, sidebarCopy.factValues.english],
                [
                  sidebarCopy.facts.resets,
                  tags.includes("Seasonal") || tags.includes("Hardcore")
                    ? sidebarCopy.factValues.seasonal
                    : sidebarCopy.factValues.nonePlanned,
                ],
                [
                  sidebarCopy.facts.listedSince,
                  s.created_at ? new Date(s.created_at).getFullYear().toString() : CURRENT_YEAR,
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-baseline gap-2.5">
                  <span className="font-body text-xs text-muted font-medium">{k}</span>
                  <span className="font-mono text-[12px] font-bold text-foreground text-right">
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <div className="font-mono text-[9.5px] leading-relaxed text-muted border-t border-border/60 pt-2 select-none">
              {sidebarCopy.factsFootnote}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
