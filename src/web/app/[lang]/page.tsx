import { getDictionary } from "../../lib/get-dictionary";
import type { Locale } from "../../lib/i18n-config";
import LandingPage from "../../components/landing/LandingPage";

export default async function Home({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = (await params) as { lang: Locale };
    const dict = await getDictionary(lang);

    return (
        <main className="w-full">
            <LandingPage lang={lang} dictionary={dict} />
        </main>
    );
}
