import type {
  AuthActivationCopy,
  AuthLoginCopy,
  AuthRegisterCopy,
  AuthShellCopy,
} from "@/lib/dictionaries/schema";
import type { AppDictionary } from "@/lib/dictionaries/schema";

export const getAuthShellCopy = (dictionary: AppDictionary): AuthShellCopy => dictionary.auth.shell;

export const getAuthLoginCopy = (dictionary: AppDictionary): AuthLoginCopy => dictionary.auth.login;

export const getAuthRegisterCopy = (dictionary: AppDictionary): AuthRegisterCopy =>
  dictionary.auth.register;

export const getAuthActivationCopy = (dictionary: AppDictionary): AuthActivationCopy =>
  dictionary.auth.activation;
