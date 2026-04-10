export const COOKIE_CONSENT_STORAGE_KEY = "firstspawn_cookie_consent";
const LEGACY_COOKIE_CONSENT_STORAGE_KEY = "cookie_consent";
export const COOKIE_CONSENT_EVENT = "firstspawn:cookie-consent-changed";

export type CookieConsentMode = "all" | "essential";

export const readStoredCookieConsent = (): CookieConsentMode | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue =
    window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ??
    window.localStorage.getItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY);

  if (storedValue === "all" || storedValue === "accepted" || storedValue === "true") {
    return "all";
  }

  if (storedValue === "essential" || storedValue === "declined" || storedValue === "false") {
    return "essential";
  }

  return null;
};

export const writeStoredCookieConsent = (mode: CookieConsentMode): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, mode);
  window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent<CookieConsentMode>(COOKIE_CONSENT_EVENT, { detail: mode }));
};
