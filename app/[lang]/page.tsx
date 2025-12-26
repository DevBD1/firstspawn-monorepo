import { getDictionary } from "../../lib/get-dictionary";
import type { Locale } from "../../lib/i18n-config";

export default async function Home({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = (await params) as { lang: Locale };
    const dict = await getDictionary(lang);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24 font-retro">
            <main className="text-center">
                <h1 className="text-4xl font-bold pixel-font">{dict.common.brand}</h1>
                <p className="mt-4 text-zinc-400 text-xl font-medium">{dict.home.welcome}</p>
            </main>
        </div>
    );
}
