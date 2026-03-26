import { redirect } from "next/navigation";
import RegisterForm from "@/features/auth/components/RegisterForm.client";
import AuthShell from "@/features/auth/components/AuthShell";
import { resolveCloseHref } from "@/features/auth/lib/resolveCloseHref";
import type { RegisterDictionary } from "@/features/auth/types";
import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";

export default async function RegisterPage({
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

  const dictionary = (await getDictionary(lang)) as RegisterDictionary;
  const register = dictionary.auth?.register || {};
  const shared = dictionary.auth?.shared || {};

  return (
    <AuthShell
      lang={lang}
      title={register.title || "START YOUR JOURNEY"}
      subtitle={register.subtitle || "Join the verified ecosystem for Minecraft and Hytale."}
      backLabel={shared.backToHome || "BACK TO BASE"}
      closeHref={closeHref}
    >
      <RegisterForm
        lang={lang}
        nextPath={nextPath}
        copy={{
          discordCta: register.discordCta || "Continue with Discord",
          dividerLabel: register.dividerLabel || "Or",
          emailLabel: register.emailLabel || "EMAIL",
          emailPlaceholder: register.emailPlaceholder || "steve@craft.com",
          usernameLabel: register.usernameLabel || "USERNAME",
          usernamePlaceholder: register.usernamePlaceholder || "blockbuilder",
          passwordLabel: register.passwordLabel || "PASSWORD",
          passwordPlaceholder: register.passwordPlaceholder || "At least 8 characters",
          confirmPasswordLabel: register.confirmPasswordLabel || "CONFIRM PASSWORD",
          confirmPasswordPlaceholder: register.confirmPasswordPlaceholder || "Repeat your password",
          submitLabel: register.submit || "Continue with Email",
          submitPendingLabel: register.submitPending || "Creating account...",
          alternatePrompt: register.alternatePrompt || "Already have an account?",
          alternateCta: register.alternateCta || "Log in",
          termsLabelPrefix: register.termsLabelPrefix || "I agree to the",
          termsLabelCta: register.termsLabelCta || "Terms of Service",
          privacyLabelPrefix: register.privacyLabelPrefix || "I agree to the",
          privacyLabelCta: register.privacyLabelCta || "Privacy Policy",
          marketingConsentLabel:
            register.marketingConsentLabel ||
            "I want to receive product updates and marketing emails from FirstSpawn.",
          legalDisclaimer:
            register.legalDisclaimer ||
            "By joining, you agree to our Terms of Service and Privacy Policy. We never post to connected accounts without permission.",
        }}
      />
    </AuthShell>
  );
}
