import posthog from "posthog-js";

export const trackNewsletterFormSubmitted = (email: string, lang: string): void => {
  posthog.capture("newsletter_form_submitted", {
    email_domain: email.split("@")[1] || "unknown",
    language: lang,
  });
};
