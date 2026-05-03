import { redirect } from "next/navigation";
import RegisterForm from "@/features/auth/components/RegisterForm.client";
import AuthShell from "@/features/auth/components/AuthShell";
import { resolveCloseHref } from "@/features/auth/lib/resolveCloseHref";
import { getAuthRegisterCopy, getAuthShellCopy } from "@/features/auth/lib/auth-copy";
import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import type { AppDictionary } from "@/lib/dictionaries/schema";

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const session = await getAuthState();
  if (session.isAuthenticated) {
    redirect(`/${lang}/console`);
  }

  const query = await searchParams;
  const nextPath = typeof query.next === "string" ? query.next : undefined;
  const closeHref = resolveCloseHref(lang, nextPath);

  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const register = getAuthRegisterCopy(dictionary);
  const shellCopy = getAuthShellCopy(dictionary);

  return (
    <AuthShell
      brand={dictionary.common.brand}
      lang={lang}
      title={register.page.title}
      subtitle={register.page.subtitle}
      backLabel={dictionary.common.actions.backHome}
      closeHref={closeHref}
      copy={shellCopy}
      layoutOrientation="sidebar-right"
      themeColor="success"
      alternateAuthPrompt={register.form.alternatePrompt}
      alternateAuthCta={register.form.alternateCta}
      alternateAuthHref={`/${lang}/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
    >
      <RegisterForm lang={lang} nextPath={nextPath} copy={register.form} />
    </AuthShell>
  );
}
