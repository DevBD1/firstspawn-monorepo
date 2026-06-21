import type {
  CollectorTarget,
  CollectorTargetsPage,
  ProbeCycleIngestResult,
  ProbeCyclePayload,
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
  meta: { request_id: string | null };
  error: { code: string; message: string } | null;
}

const toUrl = (baseUrl: string, path: string): URL =>
  new URL(`${baseUrl.replace(/\/$/, "")}${path}`);
const readErrorBody = async (response: Response): Promise<string> => {
  const body = await response.text();
  return body ? `: ${body.slice(0, 500)}` : "";
};

/** Minimal authenticated client for target snapshots and atomic probe cycles. */
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
    if (cursor) url.searchParams.set("cursor", cursor);
    const response = await this.fetchImpl(url, {
      headers: { "x-collector-key": this.collectorKey },
    });
    if (!response.ok)
      throw new Error(
        `Target fetch failed with status ${response.status}${await readErrorBody(response)}`
      );
    const payload = (await response.json()) as Envelope<{
      targets: CollectorTarget[];
      next_cursor: string | null;
    }>;
    if (payload.error) throw new Error(`Target fetch failed: ${payload.error.code}`);
    return { items: payload.data.targets, nextCursor: payload.data.next_cursor };
  }

  public async fetchAllTargets(): Promise<CollectorTarget[]> {
    const targets: CollectorTarget[] = [];
    let cursor: string | null = null;
    do {
      const page = await this.fetchTargetsPage(cursor);
      targets.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);
    return targets;
  }

  public async waitUntilReady(options: WaitUntilReadyOptions = {}): Promise<void> {
    const sleep =
      options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
    while (true) {
      try {
        await this.fetchTargetsPage();
        return;
      } catch (error) {
        options.logger?.info(
          `[collector] waiting for api readiness: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        await sleep(options.retryDelayMs ?? 2_000);
      }
    }
  }

  public async ingestProbeCycle(body: ProbeCyclePayload): Promise<ProbeCycleIngestResult> {
    const response = await this.fetchImpl(toUrl(this.baseUrl, "/collector/probe-cycles"), {
      method: "POST",
      headers: { "content-type": "application/json", "x-collector-key": this.collectorKey },
      body: JSON.stringify(body),
    });
    if (!response.ok)
      throw new Error(
        `Probe cycle ingest failed with status ${response.status}${await readErrorBody(response)}`
      );
    const payload = (await response.json()) as Envelope<ProbeCycleIngestResult>;
    if (payload.error) throw new Error(`Probe cycle ingest failed: ${payload.error.code}`);
    return payload.data;
  }
}
