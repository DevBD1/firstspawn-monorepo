import type { Locale } from "@/lib/i18n-config";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };

  return (
    <section className="min-h-[calc(100vh-84px)] bg-[radial-gradient(circle_at_84%_18%,rgba(34,211,238,0.16),transparent_35%),linear-gradient(180deg,#090b14_0%,#10172a_55%,#090c13_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl pixel-border-dark bg-black/75 p-8 md:p-10">
        <h1 className="font-display text-2xl text-white md:text-3xl">PRIVACY POLICY</h1>
        <p className="mt-6 font-ui text-2xl text-zinc-300">
          This Privacy Policy page is being finalized. By creating an account, you acknowledge data
          processing for account security, product operations, and communications preferences.
        </p>
        <p className="mt-4 font-ui text-2xl text-zinc-400">
          Locale: <span className="text-fs-diamond">{lang.toUpperCase()}</span>
        </p>
      </div>
    </section>
  );
}
