import { notFound } from "next/navigation";
import { fetchServerDetail } from "@/lib/servers-api";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { getDictionary } from "@/lib/get-dictionary";
import type {
  AppDictionary,
  RelativeTimeDictionaryUnit,
  ServerDetailDictionary,
} from "@/lib/dictionaries/schema";
import { getServerDetailCopy } from "@/features/server/lib/server-copy";
import { PixelButton } from "@firstspawn/ui";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60;

const formatRelativeTime = (
  unit: RelativeTimeDictionaryUnit,
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
  if (!dateString) return dictionary.labels.notAvailable;
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dictionary.labels.notAvailable;
  }

  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds <= 0) {
    return dictionary.relativeTime.justNow;
  }

  const units = [
    { seconds: 31536000, dictionary: dictionary.relativeTime.year },
    { seconds: 2592000, dictionary: dictionary.relativeTime.month },
    { seconds: 86400, dictionary: dictionary.relativeTime.day },
    { seconds: 3600, dictionary: dictionary.relativeTime.hour },
    { seconds: 60, dictionary: dictionary.relativeTime.minute },
    { seconds: 1, dictionary: dictionary.relativeTime.second },
  ] as const;

  for (const unit of units) {
    const count = Math.floor(seconds / unit.seconds);
    if (count >= 1) {
      return formatRelativeTime(unit.dictionary, locale, count);
    }
  }

  return dictionary.relativeTime.justNow;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const server = await fetchServerDetail(slug);
  if (!server) return {};

  return {
    title: server.name,
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
  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const dict = getServerDetailCopy(dictionary);
  const gameLabels = dictionary.serverCatalog.games;

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
              {dict.labels.back}
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
                {isOnline ? dict.status.online : dict.status.offline}
              </span>
              <span className="inline-flex items-center px-3 py-1 font-ui text-xs border-2 border-fs-gold text-fs-gold bg-fs-gold/10">
                {server.catalog_status === "active" ? dict.catalog.active : dict.catalog.archived}
              </span>
              <span className="inline-flex items-center px-3 py-1 font-ui text-xs border-2 border-foreground/30 text-foreground/50 bg-background uppercase">
                {server.game === "mc_java"
                  ? gameLabels.mcJava
                  : server.game === "mc_bedrock"
                    ? gameLabels.mcBedrock
                    : server.game === "hytale"
                      ? gameLabels.hytale
                      : gameLabels.fallback}
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
                  {dict.labels.onlinePlayers}
                </span>
                <span className="font-display text-2xl text-fs-diamond">
                  {metrics?.online_players ?? dict.labels.notAvailable}
                  <span className="text-sm text-foreground/30 ml-2">
                    / {metrics?.max_players ?? dict.labels.notAvailable}
                  </span>
                </span>
              </div>
              <div className="border-2 border-foreground/20 bg-background/50 p-4 transition-all hover:bg-foreground/5">
                <span className="block font-ui text-sm text-foreground/50 mb-1">
                  {dict.labels.version}
                </span>
                <span className="font-ui text-2xl text-foreground">
                  {metrics?.minecraft_version ?? dict.labels.notAvailable}
                </span>
              </div>
              <div className="border-2 border-foreground/20 bg-background/50 p-4 transition-all hover:bg-foreground/5">
                <span className="block font-ui text-sm text-foreground/50 mb-1">
                  {dict.labels.ping}
                </span>
                <span className="font-ui text-2xl text-foreground">
                  {metrics?.ping_ms != null ? `${metrics.ping_ms}ms` : dict.labels.notAvailable}
                </span>
              </div>
              <div className="border-2 border-foreground/20 bg-background/50 p-4 transition-all hover:bg-foreground/5">
                <span className="block font-ui text-sm text-foreground/50 mb-1">
                  {dict.labels.lastSeen}
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
                <span className="block text-foreground/50 text-xs mb-1">{dict.labels.host}</span>
                <span className="text-foreground tracking-wide bg-background px-2 py-1 border border-foreground/10 select-all block">
                  {server.host}
                </span>
              </div>
              <div>
                <span className="block text-foreground/50 text-xs mb-1">{dict.labels.port}</span>
                <span className="text-foreground tracking-wide bg-background px-2 py-1 border border-foreground/10 select-all block">
                  {server.port}
                </span>
              </div>
              <div>
                <span className="block text-foreground/50 text-xs mb-1">
                  {dict.labels.onlineMode}
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 border text-xs tracking-wider ${server.online_mode ? "border-success/30 text-success bg-success/10" : "border-danger/30 text-danger bg-danger/10"}`}
                >
                  {server.online_mode ? dict.labels.onlineMode : dict.labels.offlineMode}
                </span>
              </div>
              {server.region && (
                <div>
                  <span className="block text-foreground/50 text-xs mb-1">
                    {dict.labels.region}
                  </span>
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
                      {dict.labels.website}
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
                      {dict.labels.discord}
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
