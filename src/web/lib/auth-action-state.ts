export interface AuthFieldErrors {
  email?: string;
  username?: string;
  identifier?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
  privacyAccepted?: string;
}

export interface AuthActionState {
  message: string | null;
  fieldErrors: AuthFieldErrors;
}

export const AUTH_ACTION_INITIAL_STATE: AuthActionState = {
  message: null,
  fieldErrors: {},
};
