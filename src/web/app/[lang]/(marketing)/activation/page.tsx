import Link from "next/link";
import { Mail, AlertTriangle } from "lucide-react";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import PixelCard from "@/components/ui/PixelCard";
import PixelButton from "@/components/ui/PixelButton";

interface ActivationPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function ActivationPage({
  params,
  searchParams,
}: ActivationPageProps) {
  const { lang: langParam } = await params;
  const { email } = await searchParams;
  const lang = resolveLocaleParam(langParam);
  const dict = await getDictionary(lang);
  const copy = dict.auth?.activation || {
    title: "CHECK YOUR INBOX",
    message: "You will soon receive an email on the following address:",
    instruction: "Please activate your account by clicking on the link provided in it.",
    spam_warning: "Please remember to check your spam and trash box!!!",
    provider_warning: "Services like Hotmail, Yahoo, AOL often mistakenly identify the activation email as spam!"
  };
  const backToHome = dict.auth?.shared?.backToHome || "BACK TO HOME";

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <PixelCard title={copy.title}>
          <div className="flex flex-col items-center space-y-8 py-6 text-center">
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-emerald-500/20 blur-xl" />
              <Mail className="relative h-16 w-16 text-emerald-500" />
            </div>

            <div className="space-y-4">
              <p className="font-ui text-xl text-zinc-300">
                {copy.message}{" "}
                <span className="font-bold text-white underline decoration-emerald-500/50 underline-offset-4">
                  {email || "your email address"}
                </span>
              </p>
              <p className="font-body text-base text-zinc-400">
                {copy.instruction}
              </p>
            </div>

            <div className="w-full space-y-4 border-t-2 border-zinc-800/50 pt-8">
              <div className="flex items-start gap-4 rounded-lg border-2 border-amber-900/30 bg-amber-950/10 p-4 text-left">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-500" />
                <div className="space-y-2">
                  <p className="font-ui text-lg font-bold uppercase tracking-tight text-amber-500">
                    {copy.spam_warning}
                  </p>
                  <p className="font-body text-sm text-zinc-400 leading-relaxed">
                    {copy.provider_warning}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link href={`/${lang}/login`}>
                <PixelButton variant="secondary" className="px-8">
                  {backToHome}
                </PixelButton>
              </Link>
            </div>
          </div>
        </PixelCard>
      </div>
    </main>
  );
}
