import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { getDictionary } from "@/lib/get-dictionary";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import WLListFlowClient from "@/features/listing/components/WLListFlowClient.client";

export default async function ListPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const session = await getAuthState();
  if (!session.isAuthenticated) {
    redirect(`/${lang}/login?next=/${lang}/list`);
  }

  return (
    <main className="w-full min-h-screen relative overflow-hidden bg-background text-foreground">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />
      </div>

      <div className="relative z-10">
        <WLListFlowClient lang={lang} dictionary={dictionary} />
      </div>
    </main>
  );
}
