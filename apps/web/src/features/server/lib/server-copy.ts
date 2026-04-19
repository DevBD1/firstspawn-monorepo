import type {
  AppDictionary,
  ServerCatalogDictionary,
  ServerDetailDictionary,
} from "@/lib/dictionaries/schema";

export const getServerCatalogCopy = (dictionary: AppDictionary): ServerCatalogDictionary =>
  dictionary.serverCatalog;

export const getServerDetailCopy = (dictionary: AppDictionary): ServerDetailDictionary =>
  dictionary.serverDetail;

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
