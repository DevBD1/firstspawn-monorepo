export interface LoginFormCopy {
  discordCta: string;
  passkeyCta: string;
  dividerLabel: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submitLabel: string;
  submitPendingLabel: string;
  alternatePrompt: string;
  alternateCta: string;
}

export interface RegisterFormCopy {
  discordCta: string;
  dividerLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  submitLabel: string;
  submitPendingLabel: string;
  alternatePrompt: string;
  alternateCta: string;
  termsLabelPrefix: string;
  termsLabelCta: string;
  privacyLabelPrefix: string;
  privacyLabelCta: string;
  marketingConsentLabel: string;
  legalDisclaimer: string;
}

export interface LoginDictionary {
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
      registeredSuccess?: string;
    };
    shared?: {
      backToHome?: string;
    };
  };
}

export interface RegisterDictionary {
  auth?: {
    register?: {
      title?: string;
      subtitle?: string;
      discordCta?: string;
      dividerLabel?: string;
      emailLabel?: string;
      emailPlaceholder?: string;
      usernameLabel?: string;
      usernamePlaceholder?: string;
      passwordLabel?: string;
      passwordPlaceholder?: string;
      confirmPasswordLabel?: string;
      confirmPasswordPlaceholder?: string;
      submit?: string;
      submitPending?: string;
      alternatePrompt?: string;
      alternateCta?: string;
      termsLabelPrefix?: string;
      termsLabelCta?: string;
      privacyLabelPrefix?: string;
      privacyLabelCta?: string;
      marketingConsentLabel?: string;
      legalDisclaimer?: string;
    };
    shared?: {
      backToHome?: string;
    };
  };
}
