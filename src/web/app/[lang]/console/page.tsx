import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/i18n-config";

interface ConsoleDictionary {
  nav?: {
    console?: string;
  };
}

export default async function ConsolePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) as { lang: Locale };
  const session = await getAuthState();
  if (!session.isAuthenticated) {
    redirect(`/${lang}/login?next=/${lang}/console`);
  }

  const dictionary = (await getDictionary(lang)) as ConsoleDictionary;

  return (
    <section className="min-h-[calc(100vh-84px)] bg-[radial-gradient(circle_at_12%_20%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.18),transparent_40%),linear-gradient(180deg,#06090f_0%,#10172b_45%,#090d16_100%)] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl pixel-border-dark bg-black/70 p-8 md:p-10">
        <div className="mb-6 inline-block border-2 border-black bg-primary px-3 py-2 font-display text-[10px] uppercase tracking-wider text-white">
          COMMAND TERMINAL ONLINE
        </div>
        <h1 className="font-display text-2xl text-white md:text-3xl">{dictionary.nav?.console || "CONSOLE"}</h1>
        <p className="mt-4 max-w-3xl font-ui text-2xl text-zinc-300">
          Welcome back, {session.user?.username || "Operator"}. Personal server analytics,
          verification controls, and account command tools will live in this panel.
        </p>
      </div>
    </section>
  );
}
