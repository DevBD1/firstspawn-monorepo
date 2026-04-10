export const buildHeartbeatIdempotencyKey = (serverId: string, occurredAtIso: string): string =>
  `mcjava:${serverId}:${occurredAtIso}`;
