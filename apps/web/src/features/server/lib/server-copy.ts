import type {
  AppDictionary,
  ServerCatalogDictionary,
  ServerDetailDictionary,
} from "@/lib/dictionaries/schema";

export const getServerCatalogCopy = (dictionary: AppDictionary): ServerCatalogDictionary =>
  dictionary.serverCatalog;

export const getServerDetailCopy = (dictionary: AppDictionary): ServerDetailDictionary =>
  dictionary.serverDetail;

/** Localized display names for a game enum token, with a fallback for unknown values. */
export interface GameNameCopy {
  mcJava: string;
  mcBedrock: string;
  hytale: string;
  fallback: string;
}

/** Maps a raw game enum token (e.g. "mc_java") to its localized display name. */
export const getGameName = (game: string, copy: GameNameCopy): string => {
  switch (game) {
    case "mc_java":
      return copy.mcJava;
    case "mc_bedrock":
      return copy.mcBedrock;
    case "hytale":
      return copy.hytale;
    default:
      return copy.fallback;
  }
};

export interface ServerCardCopy {
  active: string;
  address: string;
  archived: string;
  badges: ServerCatalogDictionary["badges"];
  gameLabels: ServerCatalogDictionary["games"];
  liveData: string;
  maxPlayers: string;
  mods: string;
  modsRequired: ServerCatalogDictionary["modsRequired"];
  notAvailable: string;
  offline: string;
  online: string;
  ping: string;
  players: string;
  profilePageFallback: string;
  version: string;
  view: string;
}

export const getServerCardCopy = (dictionary: AppDictionary): ServerCardCopy => ({
  active: dictionary.common.status.active,
  address: dictionary.serverCatalog.card.address,
  archived: dictionary.common.status.archived,
  badges: dictionary.serverCatalog.badges,
  gameLabels: dictionary.serverCatalog.games,
  liveData: dictionary.serverCatalog.card.liveData,
  maxPlayers: dictionary.serverCatalog.card.maxPlayers,
  mods: dictionary.serverCatalog.card.mods,
  modsRequired: dictionary.serverCatalog.modsRequired,
  notAvailable: dictionary.serverDetail.labels.notAvailable,
  offline: dictionary.common.status.offline,
  online: dictionary.common.status.online,
  ping: dictionary.serverDetail.labels.ping,
  players: dictionary.serverDetail.labels.onlinePlayers,
  profilePageFallback: dictionary.serverCatalog.card.profilePageFallback,
  version: dictionary.serverDetail.labels.version,
  view: dictionary.serverCatalog.card.viewWorld,
});
