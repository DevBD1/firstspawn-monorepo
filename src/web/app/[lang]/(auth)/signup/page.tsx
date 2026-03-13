import { redirect } from "next/navigation";
import SignupForm from "@/features/auth/components/SignupForm.client";
import AuthShell from "@/features/auth/components/AuthShell";
import { resolveCloseHref } from "@/features/auth/lib/resolveCloseHref";
import type { SignupDictionary } from "@/features/auth/types";
import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";

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

  const dictionary = (await getDictionary(lang)) as SignupDictionary;
  const signup = dictionary.auth?.signup || {};
  const shared = dictionary.auth?.shared || {};

  return (
    <AuthShell
      lang={lang}
      title={signup.title || "START YOUR JOURNEY"}
      subtitle={signup.subtitle || "Join the verified ecosystem for Minecraft and Hytale."}
      backLabel={shared.backToHome || "BACK TO BASE"}
      closeHref={closeHref}
    >
      <SignupForm
        lang={lang}
        nextPath={nextPath}
        copy={{
          discordCta: signup.discordCta || "Continue with Discord",
          dividerLabel: signup.dividerLabel || "Or",
          emailLabel: signup.emailLabel || "EMAIL",
          emailPlaceholder: signup.emailPlaceholder || "steve@craft.com",
          usernameLabel: signup.usernameLabel || "USERNAME",
          usernamePlaceholder: signup.usernamePlaceholder || "blockbuilder",
          passwordLabel: signup.passwordLabel || "PASSWORD",
          passwordPlaceholder: signup.passwordPlaceholder || "At least 8 characters",
          confirmPasswordLabel: signup.confirmPasswordLabel || "CONFIRM PASSWORD",
          confirmPasswordPlaceholder: signup.confirmPasswordPlaceholder || "Repeat your password",
          submitLabel: signup.submit || "Continue with Email",
          submitPendingLabel: signup.submitPending || "Creating account...",
          alternatePrompt: signup.alternatePrompt || "Already have an account?",
          alternateCta: signup.alternateCta || "Log in",
          termsLabelPrefix: signup.termsLabelPrefix || "I agree to the",
          termsLabelCta: signup.termsLabelCta || "Terms of Service",
          privacyLabelPrefix: signup.privacyLabelPrefix || "I agree to the",
          privacyLabelCta: signup.privacyLabelCta || "Privacy Policy",
          marketingConsentLabel:
            signup.marketingConsentLabel ||
            "I want to receive product updates and marketing emails from FirstSpawn.",
          legalDisclaimer:
            signup.legalDisclaimer ||
            "By joining, you agree to our Terms of Service and Privacy Policy. We never post to connected accounts without permission.",
        }}
      />
    </AuthShell>
  );
}
