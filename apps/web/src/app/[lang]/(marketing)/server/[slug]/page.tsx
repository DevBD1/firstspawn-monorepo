import { notFound } from "next/navigation";
import { fetchServerDetail } from "@/lib/servers-api";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { getDictionary } from "@/lib/get-dictionary";
import PixelButton from "@/components/ui/PixelButton";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60;

interface RelativeTimeUnitDictionary {
  one: string;
  other: string;
  few?: string;
  many?: string;
}

interface ServerDetailDictionary {
  back: string;
  online_players: string;
  max_players: string;
  version: string;
  ping: string;
  last_seen: string;
  host: string;
  port: string;
  region: string;
  website: string;
  discord: string;
  online_mode: string;
  offline_mode: string;
  not_available: string;
  status_online: string;
  status_offline: string;
  catalog_active: string;
  catalog_archived: string;
  relative_time: {
    just_now: string;
    year: RelativeTimeUnitDictionary;
    month: RelativeTimeUnitDictionary;
    day: RelativeTimeUnitDictionary;
    hour: RelativeTimeUnitDictionary;
    minute: RelativeTimeUnitDictionary;
    second: RelativeTimeUnitDictionary;
  };
}

const defaultServerDetailDictionary: ServerDetailDictionary = {
  back: "BACK TO DISCOVER",
  online_players: "ONLINE PLAYERS",
  max_players: "MAX PLAYERS",
  version: "VERSION",
  ping: "PING",
  last_seen: "LAST SEEN",
  host: "HOST",
  port: "PORT",
  region: "REGION",
  website: "WEBSITE",
  discord: "DISCORD",
  online_mode: "ONLINE MODE",
  offline_mode: "OFFLINE MODE",
  not_available: "N/A",
  status_online: "ONLINE",
  status_offline: "OFFLINE",
  catalog_active: "ACTIVE",
  catalog_archived: "ARCHIVED",
  relative_time: {
    just_now: "just now",
    year: { one: "{count} year ago", other: "{count} years ago" },
    month: { one: "{count} month ago", other: "{count} months ago" },
    day: { one: "{count} day ago", other: "{count} days ago" },
    hour: { one: "{count} hour ago", other: "{count} hours ago" },
    minute: { one: "{count} minute ago", other: "{count} minutes ago" },
    second: { one: "{count} second ago", other: "{count} seconds ago" },
  },
};

const formatRelativeTime = (
  unit: RelativeTimeUnitDictionary,
  locale: string,
  count: number
): string => {
  const category = new Intl.PluralRules(locale).select(count);
  const template =
    (category === "one" ? unit.one : undefined) ??
    (category === "few" ? unit.few : undefined) ??
    (category === "many" ? unit.many : undefined) ??
    unit.other;

  return template.replace("{count}", count.toString());
};

function timeSince(
  dateString: string | null,
  locale: string,
  dictionary: ServerDetailDictionary
): string {
  if (!dateString) return dictionary.not_available;
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dictionary.not_available;
  }

  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds <= 0) {
    return dictionary.relative_time.just_now;
  }

  const units = [
    { seconds: 31536000, dictionary: dictionary.relative_time.year },
    { seconds: 2592000, dictionary: dictionary.relative_time.month },
    { seconds: 86400, dictionary: dictionary.relative_time.day },
    { seconds: 3600, dictionary: dictionary.relative_time.hour },
    { seconds: 60, dictionary: dictionary.relative_time.minute },
    { seconds: 1, dictionary: dictionary.relative_time.second },
  ] as const;

  for (const unit of units) {
    const count = Math.floor(seconds / unit.seconds);
    if (count >= 1) {
      return formatRelativeTime(unit.dictionary, locale, count);
    }
  }

  return dictionary.relative_time.just_now;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const server = await fetchServerDetail(slug);
  if (!server) return { title: "Server Not Found" };

  return {
    title: `${server.name} - IP Address, Live Player Count, and Mods`,
    description: server.description.slice(0, 155),
  };
}

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: langParam, slug } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = await getDictionary(lang);
  const dict =
    ((dictionary.discover as Record<string, unknown>)?.server_detail as
      | ServerDetailDictionary
      | undefined) ?? defaultServerDetailDictionary;

  const server = await fetchServerDetail(slug);

  if (!server) {
    notFound();
  }

  const isOnline = server.freshness_status === "online";
  const metrics = server.latest_metrics;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: server.name,
    operatingSystem: "Java",
    applicationCategory: "GameServer",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: server.description.slice(0, 155),
    url: server.website_url || undefined,
  };

  return (
    <main className="w-full min-h-screen bg-background px-4 py-8 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background decorations matching discover page */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="mx-auto max-w-4xl relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Link href={`/${lang}/discover`}>
            <PixelButton variant="outline" size="sm">
              <span className="mr-2">←</span>
              {dict.back}
            </PixelButton>
          </Link>
        </div>

        {/* Server Header */}
        <div className="border-4 border-foreground/80 bg-panel p-6 shadow-[8px_8px_0_rgba(0,0,0,0.5)] mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl text-fs-diamond tracking-wider mb-2">
              {server.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 font-ui text-xs tracking-wider border-2 ${isOnline ? "border-success text-success bg-success/10" : "border-danger text-danger bg-danger/10"}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${isOnline ? "bg-success animate-pulse" : "bg-danger"}`}
                ></span>
                {isOnline ? dict.status_online : dict.status_offline}
              </span>
              <span className="inline-flex items-center px-3 py-1 font-ui text-xs border-2 border-fs-gold text-fs-gold bg-fs-gold/10">
                {server.catalog_status === "active" ? dict.catalog_active : dict.catalog_archived}
              </span>
              <span className="inline-flex items-center px-3 py-1 font-ui text-xs border-2 border-foreground/30 text-foreground/50 bg-background uppercase">
                {server.game === "mc_java" ? "MINECRAFT" : server.game}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="border-2 border-foreground/20 bg-background/50 p-6 shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
              <p className="font-body text-foreground/80 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                {server.description}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-fs-diamond/30 bg-fs-diamond/5 p-4 transition-all hover:bg-fs-diamond/10">
                <span className="block font-ui text-sm text-foreground/50 mb-1">
                  {dict.online_players}
                </span>
                <span className="font-display text-2xl text-fs-diamond">
                  {metrics?.online_players ?? dict.not_available}
                  <span className="text-sm text-foreground/30 ml-2">
                    / {metrics?.max_players ?? dict.not_available}
                  </span>
                </span>
              </div>
              <div className="border-2 border-foreground/20 bg-background/50 p-4 transition-all hover:bg-foreground/5">
                <span className="block font-ui text-sm text-foreground/50 mb-1">
                  {dict.version}
                </span>
                <span className="font-ui text-2xl text-foreground">
                  {metrics?.minecraft_version ?? dict.not_available}
                </span>
              </div>
              <div className="border-2 border-foreground/20 bg-background/50 p-4 transition-all hover:bg-foreground/5">
                <span className="block font-ui text-sm text-foreground/50 mb-1">{dict.ping}</span>
                <span className="font-ui text-2xl text-foreground">
                  {metrics?.ping_ms != null ? `${metrics.ping_ms}ms` : dict.not_available}
                </span>
              </div>
              <div className="border-2 border-foreground/20 bg-background/50 p-4 transition-all hover:bg-foreground/5">
                <span className="block font-ui text-sm text-foreground/50 mb-1">
                  {dict.last_seen}
                </span>
                <span className="font-ui text-lg text-foreground truncate block">
                  {timeSince(server.last_ping_at, lang, dict)}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border-2 border-foreground/20 bg-background/50 p-6 shadow-[4px_4px_0_rgba(0,0,0,0.3)] space-y-4 font-ui">
              <div>
                <span className="block text-foreground/50 text-xs mb-1">{dict.host}</span>
                <span className="text-foreground tracking-wide bg-background px-2 py-1 border border-foreground/10 select-all block">
                  {server.host}
                </span>
              </div>
              <div>
                <span className="block text-foreground/50 text-xs mb-1">{dict.port}</span>
                <span className="text-foreground tracking-wide bg-background px-2 py-1 border border-foreground/10 select-all block">
                  {server.port}
                </span>
              </div>
              <div>
                <span className="block text-foreground/50 text-xs mb-1">{dict.online_mode}</span>
                <span
                  className={`inline-flex px-2 py-0.5 border text-xs tracking-wider ${server.online_mode ? "border-success/30 text-success bg-success/10" : "border-danger/30 text-danger bg-danger/10"}`}
                >
                  {server.online_mode ? dict.online_mode : dict.offline_mode}
                </span>
              </div>
              {server.region && (
                <div>
                  <span className="block text-foreground/50 text-xs mb-1">{dict.region}</span>
                  <span className="text-foreground tracking-wide uppercase">{server.region}</span>
                </div>
              )}
            </div>

            {/* Links */}
            {(server.website_url || server.discord_url) && (
              <div className="border-2 border-foreground/20 bg-background/50 p-6 shadow-[4px_4px_0_rgba(0,0,0,0.3)] space-y-4 flex flex-col items-stretch">
                {server.website_url && (
                  <a
                    href={server.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <PixelButton variant="primary" size="sm" className="w-full justify-center">
                      {dict.website}
                    </PixelButton>
                  </a>
                )}
                {server.discord_url && (
                  <a
                    href={server.discord_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <PixelButton
                      variant="outline"
                      size="sm"
                      className="w-full justify-center border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white"
                    >
                      {dict.discord}
                    </PixelButton>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
