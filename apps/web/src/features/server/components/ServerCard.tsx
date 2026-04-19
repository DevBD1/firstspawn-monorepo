import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, BadgeCheck, Gamepad2, Globe2, ShieldCheck, Signal, Users } from "lucide-react";

export type ServerCardVariant = "landing" | "discover";
export type ServerCardBadgeTone = "verified" | "featured" | "trending";
export type ServerCardSortHighlightTone = "players" | "ping" | "trending";

export interface ServerCardBadge {
  label: string;
  tone?: ServerCardBadgeTone;
}

export interface ServerCardSortHighlight {
  helper?: string;
  label: string;
  tone?: ServerCardSortHighlightTone;
  value: string;
}

export interface ServerCardLabels {
  address?: string;
  maxPlayers?: string;
  mods?: string;
  offline?: string;
  online?: string;
  ping?: string;
  players?: string;
  region?: string;
  version?: string;
  view?: string;
}

export interface ServerCardProps {
  slug: string;
  name: string;
  lang: string;
  address?: string | null;
  bannerUrl?: string | null;
  badges?: ServerCardBadge[];
  className?: string;
  description?: string | null;
  game?: string | null;
  gameVersion?: string | null;
  isOnline?: boolean;
  labels?: ServerCardLabels;
  logoUrl?: string | null;
  maxPlayers?: number | null;
  modsRequired?: boolean | null;
  onlinePlayers?: number | null;
  pingMs?: number | null;
  region?: string | null;
  sortHighlight?: ServerCardSortHighlight | null;
  tags?: string[];
  variant?: ServerCardVariant;
}

const DEFAULT_LABELS: Required<ServerCardLabels> = {
  address: "ADDRESS",
  maxPlayers: "MAX",
  mods: "MODS",
  offline: "OFFLINE",
  online: "ONLINE",
  ping: "PING",
  players: "PLAYERS",
  region: "REGION",
  version: "VERSION",
  view: "VIEW WORLD",
};

const BADGE_TONE_CLASSES: Record<ServerCardBadgeTone, string> = {
  featured: "border-amber-300/50 bg-amber-300/15 text-amber-200",
  trending: "border-fs-diamond/50 bg-fs-diamond/15 text-fs-diamond",
  verified: "border-emerald-300/50 bg-emerald-300/15 text-emerald-200",
};

const SORT_HIGHLIGHT_CLASSES: Record<ServerCardSortHighlightTone, string> = {
  ping: "border-cyan-300/45 bg-cyan-300/10 text-cyan-200",
  players: "border-emerald-300/45 bg-emerald-300/10 text-emerald-200",
  trending: "border-fs-diamond/50 bg-fs-diamond/12 text-fs-diamond",
};

const joinClasses = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const clampTwoLines = {
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
} as const;

const formatNumber = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString() : "0";

const formatPing = (value?: number | null) => {
  if (typeof value !== "number") {
    return "N/A";
  }

  return `${value}ms`;
};

const getGameLabel = (game?: string | null) => {
  if (game === "mc_java") return "MC JAVA";
  if (game === "mc_bedrock") return "MC BEDROCK";
  if (game === "hytale") return "HYTALE";
  return game?.toUpperCase() ?? "SERVER";
};

const getPlayerRatio = (onlinePlayers?: number | null, maxPlayers?: number | null) => {
  if (!onlinePlayers || !maxPlayers || maxPlayers <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((onlinePlayers / maxPlayers) * 100));
};

function ServerLogo({
  logoUrl,
  name,
  compact = false,
}: {
  compact?: boolean;
  logoUrl?: string | null;
  name: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const sizeClass = compact ? "h-12 w-12" : "h-14 w-14 md:h-16 md:w-16";

  return (
    <div
      className={joinClasses(
        "relative shrink-0 overflow-hidden border-2 border-black bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(15,23,42,0.9))] shadow-[3px_3px_0_0_rgba(0,0,0,1)]",
        sizeClass
      )}
      aria-hidden="true"
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
          fill
          className="object-cover"
          sizes={compact ? "48px" : "64px"}
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-xl text-fs-diamond">
          {initial}
        </div>
      )}
    </div>
  );
}

function ServerBanner({ bannerUrl, name }: { bannerUrl?: string | null; name: string }) {
  return (
    <div className="relative h-28 overflow-hidden border-b-2 border-black bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.24),transparent_38%),linear-gradient(135deg,rgba(12,31,45,0.98),rgba(3,7,18,0.98))] md:h-32">
      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt=""
          fill
          className="object-cover opacity-85 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
          sizes="(min-width: 1024px) 420px, 100vw"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:18px_18px]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
        <span className="max-w-[70%] truncate font-ui text-sm uppercase tracking-[0.2em] text-white/70">
          {name}
        </span>
        <span className="border border-fs-diamond/50 bg-black/55 px-2 py-1 font-ui text-xs uppercase tracking-widest text-fs-diamond">
          LIVE DATA
        </span>
      </div>
    </div>
  );
}

function StatusPill({
  isOnline,
  labels,
}: {
  isOnline?: boolean;
  labels: Required<ServerCardLabels>;
}) {
  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-2 border px-2.5 py-1 font-ui text-xs uppercase tracking-widest",
        isOnline
          ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
          : "border-red-300/40 bg-red-300/10 text-red-200"
      )}
    >
      <span
        className={joinClasses(
          "h-2 w-2 border border-black",
          isOnline ? "animate-pulse bg-emerald-400" : "bg-red-400"
        )}
      />
      {isOnline ? labels.online : labels.offline}
    </span>
  );
}

function BadgePill({ badge }: { badge: ServerCardBadge }) {
  const tone = badge.tone ?? "verified";

  return (
    <span
      className={joinClasses(
        "inline-flex items-center gap-1 border px-2 py-1 font-ui text-[11px] uppercase tracking-widest",
        BADGE_TONE_CLASSES[tone]
      )}
    >
      {tone === "verified" ? <BadgeCheck className="h-3 w-3" aria-hidden="true" /> : null}
      {tone === "featured" ? <ShieldCheck className="h-3 w-3" aria-hidden="true" /> : null}
      {tone === "trending" ? <Activity className="h-3 w-3" aria-hidden="true" /> : null}
      {badge.label}
    </span>
  );
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="truncate border border-foreground/15 bg-foreground/[0.04] px-2 py-1 font-ui text-[11px] uppercase tracking-wider text-foreground/70">
      {tag}
    </span>
  );
}

function MetricTile({
  highlighted = false,
  icon,
  label,
  value,
}: {
  highlighted?: boolean;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className={joinClasses(
        "min-w-0 border p-2 shadow-[2px_2px_0_0_rgba(0,0,0,0.85)] transition-colors",
        highlighted ? "border-fs-diamond/70 bg-fs-diamond/10" : "border-black/70 bg-background/75"
      )}
    >
      <div className="mb-1 flex items-center gap-1.5 text-fs-diamond">{icon}</div>
      <div className="font-ui text-[10px] uppercase tracking-widest text-foreground/45">
        {label}
      </div>
      <div className="truncate font-body text-xs font-semibold text-foreground">{value}</div>
    </div>
  );
}

function SortHighlightBlock({
  align = "left",
  highlight,
}: {
  align?: "left" | "right";
  highlight: ServerCardSortHighlight;
}) {
  const tone = highlight.tone ?? "trending";

  return (
    <div
      className={joinClasses(
        "flex h-[4.25rem] min-w-0 flex-col justify-center border px-3 py-2 transition-colors",
        SORT_HIGHLIGHT_CLASSES[tone],
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <div className="font-ui text-[9px] uppercase tracking-[0.24em] opacity-70">
        {highlight.label}
      </div>
      <div className="truncate font-display text-xs uppercase tracking-wider text-foreground">
        {highlight.value}
      </div>
      {highlight.helper ? (
        <div className="truncate font-ui text-[9px] uppercase tracking-widest opacity-60">
          {highlight.helper}
        </div>
      ) : null}
    </div>
  );
}

function FeatureStat({
  highlighted = false,
  icon,
  label,
  value,
}: {
  highlighted?: boolean;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className={joinClasses(
        "flex h-[3.25rem] min-w-0 items-center gap-2 border px-3 transition-colors",
        highlighted
          ? "border-fs-diamond/60 bg-fs-diamond/10 text-fs-diamond"
          : "border-foreground/10 bg-background/45 text-foreground/65"
      )}
    >
      <div className="shrink-0 text-fs-diamond">{icon}</div>
      <div className="min-w-0">
        <div className="font-ui text-[9px] uppercase tracking-widest text-foreground/40">
          {label}
        </div>
        <div className="truncate font-body text-xs uppercase tracking-wider text-foreground/80">
          {value}
        </div>
      </div>
    </div>
  );
}

function PlayerBar({
  highlighted = false,
  labels,
  maxPlayers,
  onlinePlayers,
}: {
  highlighted?: boolean;
  labels: Required<ServerCardLabels>;
  maxPlayers?: number | null;
  onlinePlayers?: number | null;
}) {
  const ratio = getPlayerRatio(onlinePlayers, maxPlayers);

  return (
    <div
      className={joinClasses(
        "space-y-1.5 border p-2 transition-colors",
        highlighted ? "border-fs-diamond/45 bg-fs-diamond/10" : "border-transparent"
      )}
    >
      <div className="flex items-center justify-between gap-3 font-ui text-xs uppercase tracking-widest">
        <span className="text-foreground/50">{labels.players}</span>
        <span className="text-foreground">
          <span className="text-fs-diamond">{formatNumber(onlinePlayers)}</span>
          <span className="text-foreground/40">
            {" "}
            / {maxPlayers ? formatNumber(maxPlayers) : "?"}
          </span>
        </span>
      </div>
      <div className="h-2 overflow-hidden border border-black bg-black/60">
        <div
          className="h-full bg-[linear-gradient(90deg,#22d3ee,#7dd3fc)]"
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}

function LandingServerCard(props: ServerCardProps & { labels: Required<ServerCardLabels> }) {
  const {
    address,
    badges = [],
    bannerUrl,
    description,
    game,
    gameVersion,
    isOnline = false,
    labels,
    logoUrl,
    maxPlayers,
    modsRequired,
    name,
    onlinePlayers,
    pingMs,
    region,
    sortHighlight,
    tags = [],
  } = props;
  const highlightsPing = sortHighlight?.tone === "ping";
  const highlightsPlayers = sortHighlight?.tone === "players";

  return (
    <article className="relative h-full w-full min-w-0 overflow-hidden border-4 border-black bg-bg-panel shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[12px_12px_0_0_rgba(0,0,0,1)] group-focus-visible:-translate-y-1 group-focus-visible:shadow-[12px_12px_0_0_rgba(0,0,0,1)]">
      <ServerBanner bannerUrl={bannerUrl} name={name} />
      <div className="space-y-4 p-4 md:p-5">
        <div className="-mt-10 flex items-end justify-between gap-3">
          <ServerLogo logoUrl={logoUrl} name={name} />
          <StatusPill isOnline={isOnline} labels={labels} />
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 2).map((badge) => (
              <BadgePill key={`${badge.label}-${badge.tone}`} badge={badge} />
            ))}
            <span className="border border-fs-diamond/30 bg-fs-diamond/10 px-2 py-1 font-ui text-[11px] uppercase tracking-widest text-fs-diamond">
              {getGameLabel(game)}
            </span>
          </div>
          <h3 className="truncate font-display text-lg leading-tight tracking-[0.08em] text-foreground transition-colors group-hover:text-fs-diamond md:text-xl">
            {name}
          </h3>
          {description ? (
            <p
              className="min-h-[2.75rem] font-body text-sm leading-relaxed text-foreground/62"
              style={clampTwoLines}
            >
              {description}
            </p>
          ) : null}
        </div>

        {sortHighlight ? <SortHighlightBlock highlight={sortHighlight} /> : null}

        <PlayerBar
          highlighted={highlightsPlayers}
          labels={labels}
          maxPlayers={maxPlayers}
          onlinePlayers={onlinePlayers}
        />

        <div className="grid grid-cols-3 gap-2">
          <MetricTile
            icon={<Globe2 className="h-4 w-4" aria-hidden="true" />}
            label={labels.version}
            value={gameVersion || "—"}
          />
          <MetricTile
            highlighted={highlightsPing}
            icon={<Signal className="h-4 w-4" aria-hidden="true" />}
            label={labels.ping}
            value={region || formatPing(pingMs)}
          />
          <MetricTile
            icon={<Gamepad2 className="h-4 w-4" aria-hidden="true" />}
            label={labels.mods}
            value={modsRequired ? "YES" : "NO"}
          />
        </div>

        <div className="flex min-w-0 items-center justify-between gap-3 border-t border-foreground/10 pt-3">
          <div className="min-w-0">
            <div className="font-ui text-[10px] uppercase tracking-widest text-foreground/40">
              {labels.address}
            </div>
            <div className="truncate font-body text-xs text-foreground/75">
              {address || "Profile page"}
            </div>
          </div>
          <span className="shrink-0 border-2 border-black bg-fs-diamond px-3 py-2 font-display text-[10px] uppercase tracking-wider text-background shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            {labels.view}
          </span>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function DiscoverServerCard(props: ServerCardProps & { labels: Required<ServerCardLabels> }) {
  const {
    address,
    badges = [],
    bannerUrl,
    description,
    game,
    gameVersion,
    isOnline = false,
    labels,
    logoUrl,
    maxPlayers,
    name,
    onlinePlayers,
    pingMs,
    region,
    sortHighlight,
    tags = [],
  } = props;
  const highlightsPing = sortHighlight?.tone === "ping";
  const highlightsPlayers = sortHighlight?.tone === "players";

  return (
    <article className="relative w-full min-w-0 overflow-hidden border-2 border-foreground/10 bg-bg-panel/80 transition duration-200 group-hover:border-fs-diamond/50 group-hover:bg-bg-panel group-hover:shadow-[0_0_26px_rgba(34,211,238,0.12)] group-focus-visible:border-fs-diamond/70">
      <div className="flex min-w-0 flex-col sm:flex-row">
        <div className="relative h-28 shrink-0 overflow-hidden border-b border-foreground/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(2,6,23,0.9))] sm:h-auto sm:w-44 sm:border-b-0 sm:border-r">
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt=""
              fill
              className="object-cover opacity-85 transition duration-300 group-hover:scale-[1.03]"
              sizes="176px"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.14)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:16px_16px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-black/50" />
          <div className="absolute bottom-3 left-3">
            <ServerLogo compact logoUrl={logoUrl} name={name} />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3 p-4">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill isOnline={isOnline} labels={labels} />
                {badges.slice(0, 1).map((badge) => (
                  <BadgePill key={`${badge.label}-${badge.tone}`} badge={badge} />
                ))}
              </div>
              <h3 className="truncate font-display text-base leading-tight tracking-[0.08em] text-foreground transition-colors group-hover:text-fs-diamond">
                {name}
              </h3>
            </div>

            <div className="hidden w-[10rem] shrink-0 sm:block">
              {sortHighlight ? (
                <SortHighlightBlock align="right" highlight={sortHighlight} />
              ) : (
                <FeatureStat
                  highlighted
                  icon={<Users className="h-4 w-4" aria-hidden="true" />}
                  label={labels.players}
                  value={`${formatNumber(onlinePlayers)} / ${
                    maxPlayers ? formatNumber(maxPlayers) : "?"
                  }`}
                />
              )}
            </div>
          </div>

          {sortHighlight ? (
            <div className="sm:hidden">
              <SortHighlightBlock highlight={sortHighlight} />
            </div>
          ) : null}

          <p
            className="min-h-[2.75rem] font-body text-sm leading-relaxed text-foreground/62"
            style={clampTwoLines}
          >
            {description || ""}
          </p>

          <div className="flex h-7 flex-wrap gap-2 overflow-hidden">
            <TagPill tag={getGameLabel(game)} />
            {region ? <TagPill tag={region} /> : null}
            {tags.slice(0, 4).map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>

          <div className="grid gap-2 text-xs md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_7rem_7rem_7rem_auto] xl:items-center">
            <div className="flex h-[3.25rem] min-w-0 flex-col justify-center border border-foreground/10 bg-background/45 px-3">
              <div className="font-ui text-[10px] uppercase tracking-widest text-foreground/40">
                {labels.address}
              </div>
              <div className="truncate font-body text-foreground/75">
                {address || "Profile page"}
              </div>
            </div>
            <FeatureStat
              highlighted={highlightsPlayers}
              icon={<Users className="h-4 w-4" aria-hidden="true" />}
              label={labels.players}
              value={`${formatNumber(onlinePlayers)} / ${maxPlayers ? formatNumber(maxPlayers) : "?"}`}
            />
            <FeatureStat
              icon={<Globe2 className="h-4 w-4" aria-hidden="true" />}
              label={labels.version}
              value={gameVersion || "—"}
            />
            <FeatureStat
              highlighted={highlightsPing}
              icon={<Signal className="h-4 w-4" aria-hidden="true" />}
              label={labels.ping}
              value={formatPing(pingMs)}
            />
            <span className="inline-flex h-[3.25rem] items-center justify-center border-2 border-black bg-fs-diamond px-3 font-display text-[10px] uppercase tracking-wider text-background shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              {labels.view}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ServerCard({
  className,
  labels,
  variant = "landing",
  ...props
}: ServerCardProps) {
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const href = `/${props.lang}/server/${props.slug}`;

  return (
    <Link
      href={href}
      aria-label={`${resolvedLabels.view}: ${props.name}`}
      className={joinClasses(
        "group block h-full w-full min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-fs-diamond focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      {variant === "discover" ? (
        <DiscoverServerCard {...props} labels={resolvedLabels} />
      ) : (
        <LandingServerCard {...props} labels={resolvedLabels} />
      )}
    </Link>
  );
}
