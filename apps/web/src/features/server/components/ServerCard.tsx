import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, BadgeCheck, Gamepad2, Globe2, ShieldCheck, Signal, Users } from "lucide-react";
import type { ServerCardCopy } from "@/features/server/lib/server-copy";

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
  mods?: string;
  offline?: string;
  online?: string;
  ping?: string;
  players?: string;
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
  copy: ServerCardCopy;
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

const BADGE_TONE_CLASSES: Record<ServerCardBadgeTone, string> = {
  featured: "border-primary/45 bg-primary/10 text-primary",
  trending: "border-fs-gold/45 bg-fs-gold/10 text-fs-gold",
  verified: "border-fs-gold/45 bg-fs-gold/10 text-fs-gold",
};

const SORT_HIGHLIGHT_CLASSES: Record<ServerCardSortHighlightTone, string> = {
  ping: "border-primary/45 bg-primary/10 text-primary",
  players: "border-success/45 bg-success/10 text-success",
  trending: "border-fs-gold/45 bg-fs-gold/10 text-fs-gold",
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

const formatPing = (copy: ServerCardCopy, value?: number | null) => {
  if (typeof value !== "number") {
    return copy.notAvailable;
  }

  return `${value}ms`;
};

const getGameLabel = (game: string | null | undefined, copy: ServerCardCopy) => {
  if (game === "mc_java") return copy.gameLabels.mcJava;
  if (game === "mc_bedrock") return copy.gameLabels.mcBedrock;
  return game?.toUpperCase() ?? copy.gameLabels.fallback;
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
        "relative shrink-0 overflow-hidden rounded-card border border-border bg-secondary shadow-card",
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
        <div className="flex h-full w-full items-center justify-center font-display text-xl text-fs-gold">
          {initial}
        </div>
      )}
    </div>
  );
}

function ServerBanner({
  bannerUrl,
  name,
  liveDataLabel,
}: {
  bannerUrl?: string | null;
  liveDataLabel: string;
  name: string;
}) {
  return (
    <div className="relative h-28 overflow-hidden border-b border-border bg-[linear-gradient(135deg,color-mix(in_srgb,var(--art)_28%,transparent),color-mix(in_srgb,var(--background)_94%,transparent))] md:h-32">
      {bannerUrl ? (
        <Image
          src={bannerUrl}
          alt=""
          fill
          className="object-cover opacity-85 transition duration-150 group-hover:scale-[1.03] group-hover:opacity-100"
          sizes="(min-width: 1024px) 420px, 100vw"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,color-mix(in_srgb,var(--art)_32%,transparent),transparent_42%),linear-gradient(135deg,color-mix(in_srgb,var(--art-dim)_22%,transparent),transparent)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
        <span className="max-w-[70%] truncate font-ui text-sm uppercase tracking-[0.14em] text-foreground/70">
          {name}
        </span>
        <span className="rounded-badge border border-border bg-bg-panel/85 px-2 py-1 font-ui text-xs uppercase tracking-[0.12em] text-muted">
          {liveDataLabel}
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
        "inline-flex items-center gap-2 rounded-pill border px-2.5 py-1 font-ui text-xs uppercase tracking-[0.12em]",
        isOnline
          ? "border-success/45 bg-success/10 text-success"
          : "border-danger/45 bg-danger/10 text-danger"
      )}
    >
      <span
        className={joinClasses("h-2 w-2 rounded-full", isOnline ? "bg-success" : "bg-danger")}
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
        "inline-flex items-center gap-1 rounded-badge border px-2 py-1 font-ui text-[11px] uppercase tracking-[0.12em]",
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
    <span className="truncate rounded-tag border border-border bg-secondary/40 px-2 py-1 font-ui text-[11px] uppercase tracking-[0.12em] text-muted">
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
        "min-w-0 rounded-control border p-2 shadow-card transition-colors duration-150",
        highlighted ? "border-primary/60 bg-primary/10" : "border-border bg-secondary/40"
      )}
    >
      <div className="mb-1 flex items-center gap-1.5 text-primary">{icon}</div>
      <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-muted">{label}</div>
      <div className="truncate font-mono text-xs font-semibold text-foreground">{value}</div>
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
        "flex h-[4.25rem] min-w-0 flex-col justify-center rounded-control border px-3 py-2 transition-colors duration-150",
        SORT_HIGHLIGHT_CLASSES[tone],
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <div className="font-ui text-[9px] uppercase tracking-[0.12em] opacity-70">
        {highlight.label}
      </div>
      <div className="truncate font-mono text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
        {highlight.value}
      </div>
      {highlight.helper ? (
        <div className="truncate font-ui text-[9px] uppercase tracking-[0.12em] opacity-60">
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
        "flex h-[3.25rem] min-w-0 items-center gap-2 rounded-control border px-3 transition-colors duration-150",
        highlighted
          ? "border-primary/60 bg-primary/10 text-primary"
          : "border-border bg-secondary/40 text-muted"
      )}
    >
      <div className="shrink-0 text-primary">{icon}</div>
      <div className="min-w-0">
        <div className="font-ui text-[9px] uppercase tracking-[0.12em] text-muted">{label}</div>
        <div className="truncate font-mono text-xs uppercase tracking-[0.08em] text-foreground/80">
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
        "space-y-1.5 rounded-control border p-2 transition-colors duration-150",
        highlighted ? "border-primary/45 bg-primary/10" : "border-transparent"
      )}
    >
      <div className="flex items-center justify-between gap-3 font-ui text-xs uppercase tracking-[0.12em]">
        <span className="text-muted">{labels.players}</span>
        <span className="font-mono text-foreground">
          <span className="text-primary">{formatNumber(onlinePlayers)}</span>
          <span className="text-muted"> / {maxPlayers ? formatNumber(maxPlayers) : "?"}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-pill border border-border bg-secondary">
        <div className="h-full bg-primary" style={{ width: `${ratio}%` }} />
      </div>
    </div>
  );
}

function LandingServerCard(props: ServerCardProps & { labels: Required<ServerCardLabels> }) {
  const {
    address,
    badges = [],
    bannerUrl,
    copy,
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
    <article className="relative h-full w-full min-w-0 overflow-hidden rounded-panel border border-border bg-bg-panel shadow-card transition duration-150 group-hover:-translate-y-0.5 group-hover:border-primary group-focus-visible:-translate-y-0.5 group-focus-visible:border-primary">
      <ServerBanner bannerUrl={bannerUrl} liveDataLabel={copy.liveData} name={name} />
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
            <span className="rounded-badge border border-border bg-secondary/40 px-2 py-1 font-ui text-[11px] uppercase tracking-[0.12em] text-muted">
              {getGameLabel(game, copy)}
            </span>
          </div>
          <h3 className="truncate font-display text-lg leading-tight text-foreground transition-colors duration-150 group-hover:text-primary md:text-xl">
            {name}
          </h3>
          {description ? (
            <p
              className="min-h-[2.75rem] font-body text-sm leading-relaxed text-muted"
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
            value={gameVersion || copy.notAvailable}
          />
          <MetricTile
            highlighted={highlightsPing}
            icon={<Signal className="h-4 w-4" aria-hidden="true" />}
            label={labels.ping}
            value={region || formatPing(copy, pingMs)}
          />
          <MetricTile
            icon={<Gamepad2 className="h-4 w-4" aria-hidden="true" />}
            label={labels.mods}
            value={modsRequired ? copy.modsRequired.yes : copy.modsRequired.no}
          />
        </div>

        <div className="flex min-w-0 items-center justify-between gap-3 border-t border-border pt-3">
          <div className="min-w-0">
            <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-muted">
              {labels.address}
            </div>
            <div className="truncate font-mono text-xs text-foreground/75">
              {address || copy.profilePageFallback}
            </div>
          </div>
          <span className="shrink-0 rounded-control border border-primary-hover bg-primary px-3 py-2 font-ui text-[10px] font-bold uppercase tracking-[0.12em] text-on-primary">
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
    copy,
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
    <article className="relative w-full min-w-0 overflow-hidden rounded-card border border-border bg-bg-panel/80 shadow-card transition duration-150 group-hover:-translate-y-0.5 group-hover:border-primary group-hover:bg-bg-panel group-focus-visible:-translate-y-0.5 group-focus-visible:border-primary">
      <div className="flex min-w-0 flex-col sm:flex-row">
        <div className="relative h-28 shrink-0 overflow-hidden border-b border-border bg-[linear-gradient(135deg,color-mix(in_srgb,var(--art)_24%,transparent),color-mix(in_srgb,var(--background)_92%,transparent))] sm:h-auto sm:w-44 sm:border-b-0 sm:border-r">
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt=""
              fill
              className="object-cover opacity-85 transition duration-150 group-hover:scale-[1.03]"
              sizes="176px"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,color-mix(in_srgb,var(--art)_30%,transparent),transparent_42%),linear-gradient(135deg,color-mix(in_srgb,var(--art-dim)_20%,transparent),transparent)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/10 to-background/40" />
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
              <h3 className="truncate font-display text-base leading-tight text-foreground transition-colors duration-150 group-hover:text-primary">
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

          {description ? (
            <p
              className="min-h-[2.75rem] font-body text-sm leading-relaxed text-muted"
              style={clampTwoLines}
            >
              {description}
            </p>
          ) : null}

          <div className="flex h-7 flex-wrap gap-2 overflow-hidden">
            <TagPill tag={getGameLabel(game, copy)} />
            {region ? <TagPill tag={region} /> : null}
            {tags.slice(0, 4).map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>

          <div className="grid gap-2 text-xs md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_7rem_7rem_7rem_auto] xl:items-center">
            <div className="flex h-[3.25rem] min-w-0 flex-col justify-center rounded-control border border-border bg-secondary/40 px-3">
              <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-muted">
                {labels.address}
              </div>
              <div className="truncate font-mono text-foreground/75">
                {address || copy.profilePageFallback}
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
              value={gameVersion || copy.notAvailable}
            />
            <FeatureStat
              highlighted={highlightsPing}
              icon={<Signal className="h-4 w-4" aria-hidden="true" />}
              label={labels.ping}
              value={formatPing(copy, pingMs)}
            />
            <span className="inline-flex h-[3.25rem] items-center justify-center rounded-control border border-primary-hover bg-primary px-3 font-ui text-[10px] font-bold uppercase tracking-[0.12em] text-on-primary">
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
  copy,
  labels,
  variant = "landing",
  ...props
}: ServerCardProps) {
  const resolvedLabels = {
    address: labels?.address ?? copy.address,
    mods: labels?.mods ?? copy.mods,
    offline: labels?.offline ?? copy.offline,
    online: labels?.online ?? copy.online,
    ping: labels?.ping ?? copy.ping,
    players: labels?.players ?? copy.players,
    version: labels?.version ?? copy.version,
    view: labels?.view ?? copy.view,
  };
  const href = `/${props.lang}/server/${props.slug}`;

  return (
    <Link
      href={href}
      aria-label={`${resolvedLabels.view}: ${props.name}`}
      className={joinClasses(
        "group block h-full w-full min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      {variant === "discover" ? (
        <DiscoverServerCard {...props} copy={copy} labels={resolvedLabels} />
      ) : (
        <LandingServerCard {...props} copy={copy} labels={resolvedLabels} />
      )}
    </Link>
  );
}
