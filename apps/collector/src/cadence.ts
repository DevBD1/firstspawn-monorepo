export interface CadenceDecision {
  includePayload: boolean;
  nextPayloadAtMs: number;
}

export const shouldIncludePayload = (
  lastPayloadAtMs: number | undefined,
  nowMs: number,
  payloadIntervalSeconds: number
): boolean => {
  if (lastPayloadAtMs === undefined) {
    return true;
  }

  return nowMs - lastPayloadAtMs >= payloadIntervalSeconds * 1000;
};

export const payloadDecision = (
  lastPayloadAtMs: number | undefined,
  nowMs: number,
  payloadIntervalSeconds: number
): CadenceDecision => {
  const includePayload = shouldIncludePayload(lastPayloadAtMs, nowMs, payloadIntervalSeconds);
  return {
    includePayload,
    nextPayloadAtMs: includePayload ? nowMs : lastPayloadAtMs!,
  };
};
