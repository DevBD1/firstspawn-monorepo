"use server";

import {
  fetchServers,
  fetchServerStats,
  fetchServerDetail,
  type FetchServersParams,
} from "@/lib/servers-api";

export async function loadMoreServers(params: FetchServersParams) {
  return fetchServers(params, { cache: "no-store" });
}

export async function getServerStats() {
  return fetchServerStats({ cache: "no-store" });
}

export async function getServerDetail(slug: string) {
  return fetchServerDetail(slug, { cache: "no-store" });
}
