import "server-only";

import type { LandingRealtimeStats } from "@/features/landing/types";

export const ZERO_LANDING_REALTIME_STATS: LandingRealtimeStats = {
  registeredExplorers: 0,
  registeredServers: 0,
  totalOnlinePlayers: 0,
};

export async function getLandingRealtimeStats(): Promise<LandingRealtimeStats> {
  return { ...ZERO_LANDING_REALTIME_STATS };
}
