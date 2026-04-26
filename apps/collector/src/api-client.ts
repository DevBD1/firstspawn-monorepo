import type {
  CollectorTarget,
  CollectorTargetsPage,
  HeartbeatPayload,
  IngestResult,
  ProbeFailurePayload,
} from "./types.js";

interface ApiClientOptions {
  baseUrl: string;
  collectorKey: string;
  pageSize: number;
  fetchImpl?: typeof fetch;
}

interface WaitUntilReadyOptions {
  retryDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
  logger?: Pick<Console, "info">;
}

interface Envelope<T> {
  data: T;
  meta: {
    request_id: string | null;
  };
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  } | null;
}

const toUrl = (baseUrl: string, path: string): URL => {
  const normalized = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return new URL(`${normalized}${path}`);
};

const readErrorBody = async (response: Response): Promise<string> => {
  const body = await response.text();
  return body.length > 0 ? `: ${body.slice(0, 500)}` : "";
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly collectorKey: string;
  private readonly pageSize: number;
  private readonly fetchImpl: typeof fetch;

  public constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl;
    this.collectorKey = options.collectorKey;
    this.pageSize = options.pageSize;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  public async fetchTargetsPage(cursor: string | null = null): Promise<CollectorTargetsPage> {
    const url = toUrl(this.baseUrl, "/collector/targets");
    url.searchParams.set("limit", String(this.pageSize));
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const response = await this.fetchImpl(url, {
      method: "GET",
      headers: {
        "x-collector-key": this.collectorKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Target fetch failed with status ${response.status}${await readErrorBody(response)}`
      );
    }

    const payload = (await response.json()) as Envelope<{
      targets: CollectorTarget[];
      next_cursor: string | null;
    }>;

    if (payload.error) {
      throw new Error(`Target fetch failed: ${payload.error.code}`);
    }

    return {
      items: payload.data.targets,
      nextCursor: payload.data.next_cursor,
    };
  }

  public async fetchAllTargets(): Promise<CollectorTarget[]> {
    const allTargets: CollectorTarget[] = [];
    let cursor: string | null = null;

    while (true) {
      const page = await this.fetchTargetsPage(cursor);
      allTargets.push(...page.items);
      cursor = page.nextCursor;
      if (!cursor) {
        break;
      }
    }

    return allTargets;
  }

  public async waitUntilReady(options: WaitUntilReadyOptions = {}): Promise<void> {
    const retryDelayMs = options.retryDelayMs ?? 2000;
    const sleep =
      options.sleep ??
      (async (ms: number): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(resolve, ms);
        }));
    const logger = options.logger ?? console;

    while (true) {
      try {
        await this.fetchTargetsPage(null);
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.info(`[collector] waiting for api readiness: ${message}`);
        await sleep(retryDelayMs);
      }
    }
  }

  public async ingestHeartbeat(payloadBody: HeartbeatPayload): Promise<IngestResult> {
    const url = toUrl(this.baseUrl, "/collector/heartbeats");

    const response = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-collector-key": this.collectorKey,
      },
      body: JSON.stringify(payloadBody),
    });

    if (!response.ok) {
      throw new Error(
        `Heartbeat ingest failed with status ${response.status}${await readErrorBody(response)}`
      );
    }

    const payload = (await response.json()) as Envelope<{
      accepted: boolean;
      duplicate: boolean;
    }>;

    if (payload.error) {
      throw new Error(`Heartbeat ingest failed: ${payload.error.code}`);
    }

    return payload.data;
  }

  public async recordProbeFailure(payloadBody: ProbeFailurePayload): Promise<void> {
    const url = toUrl(this.baseUrl, "/collector/probe-attempts");

    const response = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-collector-key": this.collectorKey,
      },
      body: JSON.stringify(payloadBody),
    });

    if (!response.ok) {
      throw new Error(
        `Probe attempt ingest failed with status ${response.status}${await readErrorBody(response)}`
      );
    }

    const payload = (await response.json()) as Envelope<{
      accepted: boolean;
    }>;

    if (payload.error) {
      throw new Error(`Probe attempt ingest failed: ${payload.error.code}`);
    }
  }
}
