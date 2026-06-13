import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { getDictionary } from "@/lib/get-dictionary";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import { fetchServers } from "@/lib/servers-api";
import WLOwnerConsoleClient from "@/features/console/components/WLOwnerConsoleClient.client";

export default async function ConsolePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = (await getDictionary(lang)) as AppDictionary;

  // Enforce session authentication check
  const session = await getAuthState();
  if (!session.isAuthenticated) {
    redirect(`/${lang}/login?next=/${lang}/console`);
  }

  // Load catalog servers as candidate choices in console switcher
  let initialServers: Awaited<ReturnType<typeof fetchServers>>["servers"] = [];
  try {
    const serversRes = await fetchServers({ limit: 12, sort: "players" });
    initialServers = serversRes.servers;
  } catch (err) {
    console.error("Failed to load catalog servers for console:", err);
  }

  return (
    <main className="w-full min-h-screen relative overflow-hidden bg-background text-foreground animate-in fade-in duration-300">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />
      </div>

      <div className="relative z-10">
        <WLOwnerConsoleClient initialServers={initialServers} lang={lang} dictionary={dictionary} />
      </div>
    </main>
  );
}
