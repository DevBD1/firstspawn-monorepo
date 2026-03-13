import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";

interface LootDictionary {
  nav?: {
    myLoot?: string;
  };
}

export default async function LootPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const session = await getAuthState();
  if (!session.isAuthenticated) {
    redirect(`/${lang}/login?next=/${lang}/loot`);
  }

  const dictionary = (await getDictionary(lang)) as LootDictionary;

  return (
    <section className="min-h-[calc(100vh-84px)] bg-[radial-gradient(circle_at_20%_15%,rgba(74,222,128,0.15),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.15),transparent_40%),linear-gradient(180deg,#090b14_0%,#111a22_45%,#0a0e16_100%)] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl pixel-border-dark bg-black/70 p-8 md:p-10">
        <div className="mb-6 inline-block border-2 border-black bg-success px-3 py-2 font-display text-[10px] uppercase tracking-wider text-black">
          PLAYER INVENTORY LINKED
        </div>
        <h1 className="font-display text-2xl text-white md:text-3xl">
          {dictionary.nav?.myLoot || "MY LOOT"}
        </h1>
        <p className="mt-4 max-w-3xl font-ui text-2xl text-zinc-300">
          {session.user?.username || "Operator"}, your progression inventory hub is now unlocked.
          Reward drops, puzzle keys, and badge claims will appear here.
        </p>
      </div>
    </section>
  );
}
