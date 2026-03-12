import { getDictionary } from "../../lib/get-dictionary";
import LandingPage from "../../components/landing/LandingPage";
import { resolveLocaleParam } from "../../lib/resolve-locale";

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
