import { Mail, AlertTriangle } from "lucide-react";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { getAuthActivationCopy } from "@/features/auth/lib/auth-copy";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import { WLButton, WLCard } from "@firstspawn/ui";

interface ActivationPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function ActivationPage({ params, searchParams }: ActivationPageProps) {
  const { lang: langParam } = await params;
  const { email } = await searchParams;
  const lang = resolveLocaleParam(langParam);
  const dict = (await getDictionary(lang)) as AppDictionary;
  const copy = getAuthActivationCopy(dict);

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <WLCard>
          <div className="mb-6 w-full border-b border-border pb-3 text-center">
            <h2 className="font-display text-2xl tracking-normal text-foreground font-semibold">
              {copy.title}
            </h2>
          </div>
          <div className="flex flex-col items-center space-y-8 py-6 text-center">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/20 blur-xl" />
              <Mail className="relative h-16 w-16 text-primary" />
            </div>

            <div className="space-y-4">
              <p className="font-ui text-xl text-foreground">
                {copy.message}{" "}
                <span className="font-bold text-foreground underline decoration-primary/50 underline-offset-4">
                  {email || copy.fallbackEmail}
                </span>
              </p>
              <p className="font-body text-base text-muted">{copy.instruction}</p>
            </div>

            <div className="w-full space-y-4 border-t border-border pt-8">
              <div className="flex items-start gap-4 rounded-card border border-amber-900/30 bg-amber-950/10 p-4 text-left">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-500" />
                <div className="space-y-2">
                  <p className="font-ui text-lg font-bold uppercase tracking-tight text-amber-500">
                    {copy.spamWarning}
                  </p>
                  <p className="font-body text-sm text-muted leading-relaxed">
                    {copy.providerWarning}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <WLButton variant="secondary" href={`/${lang}/login`}>
                {copy.backLabel}
              </WLButton>
            </div>
          </div>
        </WLCard>
      </div>
    </main>
  );
}
