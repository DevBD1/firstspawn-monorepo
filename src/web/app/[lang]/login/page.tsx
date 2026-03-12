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
      identifierLabel?: string;
      identifierPlaceholder?: string;
      passwordLabel?: string;
      passwordPlaceholder?: string;
      submit?: string;
      alternatePrompt?: string;
      alternateCta?: string;
    };
    shared?: {
      backToHome?: string;
    };
  };
}

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

  const dictionary = (await getDictionary(lang)) as LoginDictionary;
  const login = dictionary.auth?.login || {};
  const shared = dictionary.auth?.shared || {};

  return (
    <AuthShell
      lang={lang}
      title={login.title || "LOG IN TO FIRSTSPAWN"}
      subtitle={login.subtitle || "Enter your account details to continue."}
      backLabel={shared.backToHome || "BACK TO BASE"}
    >
      <LoginForm
        lang={lang}
        nextPath={nextPath}
        copy={{
          identifierLabel: login.identifierLabel || "EMAIL OR USERNAME",
          identifierPlaceholder: login.identifierPlaceholder || "pilot@firstspawn.gg",
          passwordLabel: login.passwordLabel || "PASSWORD",
          passwordPlaceholder: login.passwordPlaceholder || "Enter your password",
          submitLabel: login.submit || "ENTER CONSOLE",
          alternatePrompt: login.alternatePrompt || "No account yet?",
          alternateCta: login.alternateCta || "SIGN UP",
        }}
      />
    </AuthShell>
  );
}
