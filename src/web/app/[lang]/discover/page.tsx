import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

interface DiscoverDictionary {
  nav?: {
    discover?: string;
  };
}

export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };
  const dictionary = (await getDictionary(lang)) as DiscoverDictionary;

  return (
    <section className="min-h-[calc(100vh-84px)] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_30%),linear-gradient(180deg,#07080f_0%,#11152a_55%,#090b12_100%)] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl pixel-border-dark bg-black/70 p-8 md:p-10">
        <div className="mb-6 inline-block border-2 border-black bg-fs-diamond px-3 py-2 font-display text-[10px] uppercase tracking-wider text-black">
          MATCHMAKING CORE
        </div>
        <h1 className="font-display text-2xl text-white md:text-3xl">
          {dictionary.nav?.discover || "DISCOVER"}
        </h1>
        <p className="mt-4 max-w-3xl font-ui text-2xl text-zinc-300">
          Server discovery index is under active build. Ranking, filters, and trust signals will
          land here first.
        </p>
      </div>
    </section>
  );
}
