import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import LandingPage from "@/features/landing/components/LandingPage.client";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dict = await getDictionary(lang);

  return (
    <main className="w-full">
      <LandingPage lang={lang} dictionary={dict} />
    </main>
  );
}
