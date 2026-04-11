"use server";

import { fetchServers, type FetchServersParams } from "@/lib/servers-api";

export async function loadMoreServers(params: FetchServersParams) {
  return fetchServers(params, { cache: "no-store" });
}
