import { notFound } from "next/navigation";
import { fetchServerDetail, fetchServers } from "@/lib/servers-api";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { getDictionary } from "@/lib/get-dictionary";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import WLServerPageClient from "@/features/server/components/WLServerPageClient.client";
import { Metadata } from "next";

export const revalidate = 60;

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

  const server = await fetchServerDetail(slug);

  if (!server) {
    notFound();
  }

  // Fetch similar servers
  let similarServers: Awaited<ReturnType<typeof fetchServers>>["servers"] = [];
  try {
    const similarRes = await fetchServers({ limit: 4, game: server.game });
    similarServers = similarRes.servers.filter((x) => x.slug !== server.slug).slice(0, 3);
  } catch (err) {
    console.warn(
      "Failed to fetch similar servers for profile page:",
      err instanceof Error ? err.message : err
    );
  }

  const websiteSocial = server.socials.find((social) => social.platform === "website");

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
    url: websiteSocial?.url || `https://${server.slug}.net`,
  };

  return (
    <main className="w-full min-h-screen relative overflow-hidden bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Background decorations matching discover page */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />
      </div>

      <div className="relative z-10">
        <WLServerPageClient
          s={server}
          lang={lang}
          similarServers={similarServers}
          dictionary={dictionary}
        />
      </div>
    </main>
  );
}
