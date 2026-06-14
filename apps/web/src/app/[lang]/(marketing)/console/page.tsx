import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { getDictionary } from "@/lib/get-dictionary";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import { fetchMyListingsAction, type MyListing } from "@/app/actions/listing";
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

  // The console shows the servers this user actually owns.
  let initialServers: MyListing[] = [];
  const result = await fetchMyListingsAction();
  if (result.ok) {
    initialServers = result.data;
  } else {
    console.error("Failed to load owned servers for console:", result.code, result.message);
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
