export interface ApiSuccessEnvelope<T> {
  data: T;
  meta: {
    request_id: string | null;
  };
  error: null;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details: Record<string, unknown>;
}

export const successEnvelope = <T>(data: T, requestId: string | null): ApiSuccessEnvelope<T> => ({
  data,
  meta: {
    request_id: requestId,
  },
  error: null,
});

export const errorEnvelope = (
  code: string,
  message: string,
  requestId: string | null,
  details: Record<string, unknown> = {}
): {
  data: null;
  meta: {
    request_id: string | null;
  };
  error: ApiErrorPayload;
} => ({
  data: null,
  meta: {
    request_id: requestId,
  },
  error: {
    code,
    message,
    details,
  },
});
