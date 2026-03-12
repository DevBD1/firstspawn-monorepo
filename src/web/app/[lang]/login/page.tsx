import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";

interface LoginDictionary {
  auth?: {
    login?: {
      title?: string;
      subtitle?: string;
      discordCta?: string;
      passkeyCta?: string;
      dividerLabel?: string;
      identifierLabel?: string;
      identifierPlaceholder?: string;
      passwordLabel?: string;
      passwordPlaceholder?: string;
      submit?: string;
      submitPending?: string;
      alternatePrompt?: string;
      alternateCta?: string;
    };
    shared?: {
      backToHome?: string;
    };
  };
}

const resolveCloseHref = (lang: string, nextPath: string | undefined): string => {
  if (!nextPath || !nextPath.startsWith("/")) {
    return `/${lang}`;
  }

  if (nextPath.startsWith(`/${lang}`)) {
    return nextPath;
  }

  return `/${lang}`;
};

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
  const closeHref = resolveCloseHref(lang, nextPath);

  const dictionary = (await getDictionary(lang)) as LoginDictionary;
  const login = dictionary.auth?.login || {};
  const shared = dictionary.auth?.shared || {};

  return (
    <AuthShell
      lang={lang}
      title={login.title || "WELCOME TO FIRSTSPAWN"}
      subtitle={
        login.subtitle || "Log in to access your favorite servers and communities."
      }
      backLabel={shared.backToHome || "BACK TO BASE"}
      closeHref={closeHref}
    >
      <LoginForm
        lang={lang}
        nextPath={nextPath}
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
