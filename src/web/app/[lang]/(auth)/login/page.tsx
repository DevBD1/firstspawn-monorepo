import { redirect } from "next/navigation";
import AuthShell from "@/features/auth/components/AuthShell";
import LoginForm from "@/features/auth/components/LoginForm.client";
import { resolveCloseHref } from "@/features/auth/lib/resolveCloseHref";
import type { LoginDictionary } from "@/features/auth/types";
import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";

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

  const dictionary = (await getDictionary(lang)) as LoginDictionary;
  const login = dictionary.auth?.login || {};
  const shared = dictionary.auth?.shared || {};

  return (
    <AuthShell
      lang={lang}
      title={login.title || "WELCOME TO FIRSTSPAWN"}
      subtitle={login.subtitle || "Log in to access your favorite servers and communities."}
      backLabel={shared.backToHome || "BACK TO BASE"}
      closeHref={closeHref}
    >
      <LoginForm
        lang={lang}
        nextPath={nextPath}
        showRegisteredBanner={showRegisteredBanner}
        registeredMessage={
          login.registeredSuccess || "Account created! Log in to get started."
        }
        copy={{
          discordCta: login.discordCta || "Sign in with Discord",
          passkeyCta: login.passkeyCta || "Sign in with Passkey",
          dividerLabel: login.dividerLabel || "Or",
          identifierLabel: login.identifierLabel || "EMAIL OR USERNAME",
          identifierPlaceholder: login.identifierPlaceholder || "steve@craft.com",
          passwordLabel: login.passwordLabel || "PASSWORD",
          passwordPlaceholder: login.passwordPlaceholder || "Enter your password",
          submitLabel: login.submit || "Continue with Email",
          submitPendingLabel: login.submitPending || "Authenticating...",
          alternatePrompt: login.alternatePrompt || "New to FirstSpawn?",
          alternateCta: login.alternateCta || "Create an account",
        }}
      />
    </AuthShell>
  );
}
