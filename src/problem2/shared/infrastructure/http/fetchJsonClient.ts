import type { JsonClient, JsonRequestOptions } from "./jsonClient";

interface CacheStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface FetchJsonClientOptions {
  fetchImpl: (url: string, options?: RequestInit) => Promise<{ ok: boolean; status?: number; json: () => Promise<unknown> }>;
  storage?: CacheStorage | null;
  now?: () => number;
}

interface FetchOptionsResult {
  options?: RequestInit;
  clear: () => void;
}

function createFetchOptions(timeoutMs?: number): FetchOptionsResult {
  if (!Number.isFinite(timeoutMs)) return { options: undefined, clear: () => {} };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    const error = new Error(`Request timed out after ${timeoutMs}ms`);
    error.name = "TimeoutError";
    controller.abort(error);
  }, timeoutMs);

  return {
    options: { signal: controller.signal },
    clear: () => clearTimeout(timeoutId)
  };
}

export class FetchJsonClient implements JsonClient {
  readonly #fetchImpl: FetchJsonClientOptions["fetchImpl"];
  readonly #storage?: CacheStorage | null;
  readonly #now: () => number;

  constructor({ fetchImpl, storage, now = Date.now }: FetchJsonClientOptions) {
    this.#fetchImpl = fetchImpl;
    this.#storage = storage;
    this.#now = now;
  }

  async getJson<T = unknown>(url: string, options: JsonRequestOptions = {}): Promise<T> {
    const cached = readCache(this.#storage, options.cacheKey, this.#now, options.cacheTtlMs);
    if (cached) return cached as T;

    const retries = Number.isFinite(options.retries) ? options.retries ?? 0 : 0;
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const request = createFetchOptions(options.timeoutMs);
      try {
        const response = await this.#fetchImpl(url, request.options);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const value = await response.json();
        writeCache(this.#storage, options.cacheKey, this.#now, value);
        return value as T;
      } catch (error) {
        lastError = error;
      } finally {
        request.clear();
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Request failed");
  }
}

function readCache(storage?: CacheStorage | null, cacheKey?: string, now: () => number = Date.now, cacheTtlMs?: number): unknown | null {
  if (!storage || !cacheKey || !cacheTtlMs) return null;
  try {
    const cached = storage.getItem(cacheKey);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as { savedAt: number; value: unknown };
    if (now() - parsed.savedAt > cacheTtlMs) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

function writeCache(storage: CacheStorage | null | undefined, cacheKey: string | undefined, now: () => number, value: unknown): void {
  if (!storage || !cacheKey) return;
  try {
    storage.setItem(cacheKey, JSON.stringify({ savedAt: now(), value }));
  } catch {
    // Cache writes should never turn a successful network response into a failure.
  }
}

export function createFetchJsonClient(options: FetchJsonClientOptions): JsonClient {
  return new FetchJsonClient(options);
}

export const createJsonRequestClient = createFetchJsonClient;
