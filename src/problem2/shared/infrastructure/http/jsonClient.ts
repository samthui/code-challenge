export interface JsonRequestOptions {
  cacheKey?: string;
  cacheTtlMs?: number;
  retries?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface JsonClient {
  getJson<T = unknown>(url: string, options?: JsonRequestOptions): Promise<T>;
}

export const JSON_CLIENT_TYPES = {
  axios: "axios",
  fetch: "fetch"
} as const;

export type JsonClientType = (typeof JSON_CLIENT_TYPES)[keyof typeof JSON_CLIENT_TYPES];

export type JsonClientFactory = () => JsonClient;
export type JsonClientFactories = Record<string, JsonClientFactory>;

export function assertJsonClient(client: unknown): JsonClient {
  if (!client || typeof client !== "object" || typeof (client as { getJson?: unknown }).getJson !== "function") {
    throw new TypeError("JsonClient must implement getJson(url, options).");
  }
  return client as JsonClient;
}

export function createJsonClient(type: string, factories: JsonClientFactories): JsonClient {
  const createClient = factories[type];
  if (!createClient) {
    throw new Error(`Unsupported JSON client type: ${type}`);
  }
  return assertJsonClient(createClient());
}
