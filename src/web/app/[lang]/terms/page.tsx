import { resolveLocaleParam } from "@/lib/resolve-locale";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);

  return (
    <section className="min-h-[calc(100vh-84px)] bg-[radial-gradient(circle_at_16%_20%,rgba(34,211,238,0.16),transparent_35%),linear-gradient(180deg,#090b14_0%,#10172a_55%,#090c13_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl pixel-border-dark bg-black/75 p-8 md:p-10">
        <h1 className="font-display text-2xl text-white md:text-3xl">TERMS OF SERVICE</h1>
        <p className="mt-6 font-ui text-2xl text-zinc-300">
          This Terms of Service page is being finalized. By creating an account, you agree to
          FirstSpawn platform usage rules, account responsibility, and acceptable conduct policies.
        </p>
        <p className="mt-4 font-ui text-2xl text-zinc-400">
          Locale: <span className="text-fs-diamond">{lang.toUpperCase()}</span>
        </p>
      </div>
    </section>
  );
}
