// Shared WorldLight styling for the auth forms so login + register stay in sync.

const AUTH_INPUT_BASE =
  "w-full rounded-control border border-border bg-input-bg py-3 font-ui text-xl leading-none text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary";

/** Input class for auth fields. Pass per-field horizontal padding (e.g. icon/toggle spacing). */
export const authInputClass = (padding: string) => `${AUTH_INPUT_BASE} ${padding}`;

export const AUTH_LABEL_CLASS =
  "block font-ui text-lg font-bold uppercase tracking-wide text-foreground";

export const AUTH_ICON_CLASS = "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted";

export const AUTH_FIELD_ERROR_CLASS = "font-ui text-base text-danger";

export const AUTH_PASSWORD_TOGGLE_CLASS =
  "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-control border border-border bg-secondary text-foreground transition-colors hover:bg-secondary-hover";

export const AUTH_ALTERNATE_LINK_CLASS =
  "font-ui text-base font-bold uppercase tracking-wide text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary-hover";

export const AUTH_DISCORD_BUTTON_CLASS = "auth-discord-btn";
