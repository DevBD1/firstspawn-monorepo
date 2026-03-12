import { redirect } from "next/navigation";
import SignupForm from "@/components/auth/SignupForm";
import AuthShell from "@/components/auth/AuthShell";
import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";

interface SignupDictionary {
  auth?: {
    signup?: {
      title?: string;
      subtitle?: string;
      emailLabel?: string;
      emailPlaceholder?: string;
      usernameLabel?: string;
      usernamePlaceholder?: string;
      passwordLabel?: string;
      passwordPlaceholder?: string;
      confirmPasswordLabel?: string;
      confirmPasswordPlaceholder?: string;
      submit?: string;
      alternatePrompt?: string;
      alternateCta?: string;
      termsLabelPrefix?: string;
      termsLabelCta?: string;
      privacyLabelPrefix?: string;
      privacyLabelCta?: string;
      marketingConsentLabel?: string;
    };
    shared?: {
      backToHome?: string;
    };
  };
}

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

  const dictionary = (await getDictionary(lang)) as SignupDictionary;
  const signup = dictionary.auth?.signup || {};
  const shared = dictionary.auth?.shared || {};

  return (
    <AuthShell
      lang={lang}
      title={signup.title || "CREATE YOUR ACCOUNT"}
      subtitle={
        signup.subtitle ||
        "Sign up to manage your profile, loot, and server activity in one place."
      }
      backLabel={shared.backToHome || "BACK TO BASE"}
    >
      <SignupForm
        lang={lang}
        nextPath={nextPath}
        copy={{
          emailLabel: signup.emailLabel || "EMAIL",
          emailPlaceholder: signup.emailPlaceholder || "pilot@firstspawn.gg",
          usernameLabel: signup.usernameLabel || "USERNAME",
          usernamePlaceholder: signup.usernamePlaceholder || "spawn_operator",
          passwordLabel: signup.passwordLabel || "PASSWORD",
          passwordPlaceholder: signup.passwordPlaceholder || "At least 8 characters",
          confirmPasswordLabel: signup.confirmPasswordLabel || "CONFIRM PASSWORD",
          confirmPasswordPlaceholder:
            signup.confirmPasswordPlaceholder || "Repeat your password",
          submitLabel: signup.submit || "CREATE ACCOUNT",
          alternatePrompt: signup.alternatePrompt || "Already linked?",
          alternateCta: signup.alternateCta || "LOG IN",
          termsLabelPrefix: signup.termsLabelPrefix || "I agree to the",
          termsLabelCta: signup.termsLabelCta || "Terms of Service",
          privacyLabelPrefix: signup.privacyLabelPrefix || "I agree to the",
          privacyLabelCta: signup.privacyLabelCta || "Privacy Policy",
          marketingConsentLabel:
            signup.marketingConsentLabel ||
            "I want to receive product updates and marketing emails from FirstSpawn.",
        }}
      />
    </AuthShell>
  );
}
