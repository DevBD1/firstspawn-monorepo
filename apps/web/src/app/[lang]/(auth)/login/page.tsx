import { redirect } from "next/navigation";
import AuthShell from "@/features/auth/components/AuthShell";
import LoginForm from "@/features/auth/components/LoginForm.client";
import { resolveCloseHref } from "@/features/auth/lib/resolveCloseHref";
import { getAuthLoginCopy, getAuthShellCopy } from "@/features/auth/lib/auth-copy";
import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import type { AppDictionary } from "@/lib/dictionaries/schema";

export default async function LoginPage({
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
  const showRegisteredBanner = query.registered === "true";
  const closeHref = resolveCloseHref(lang, nextPath);

  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const login = getAuthLoginCopy(dictionary);
  const shellCopy = getAuthShellCopy(dictionary);

  return (
    <AuthShell
      brand={dictionary.common.brand}
      lang={lang}
      title={login.page.title}
      subtitle={login.page.subtitle}
      backLabel={dictionary.common.actions.backHome}
      closeHref={closeHref}
      copy={shellCopy}
      layoutOrientation="sidebar-left"
      themeColor="primary"
    >
      <LoginForm
        lang={lang}
        nextPath={nextPath}
        showRegisteredBanner={showRegisteredBanner}
        registeredMessage={login.page.registeredSuccess}
        copy={login.form}
      />
    </AuthShell>
  );
}
