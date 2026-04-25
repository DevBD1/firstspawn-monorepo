"use server";

import { fetchServers, fetchServerStats, type FetchServersParams } from "@/lib/servers-api";

export async function loadMoreServers(params: FetchServersParams) {
  return fetchServers(params, { cache: "no-store" });
}

export async function getServerStats() {
  return fetchServerStats({ cache: "no-store" });
}
