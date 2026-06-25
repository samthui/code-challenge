import type { JsonClient, JsonRequestOptions } from "./jsonClient";

interface AxiosLike {
  get<T = unknown>(url: string, options?: { signal?: AbortSignal; timeout?: number }): Promise<{ data: T }>;
}

export class AxiosJsonClient implements JsonClient {
  readonly #axiosInstance: AxiosLike;

  constructor(axiosInstance: AxiosLike) {
    this.#axiosInstance = axiosInstance;
  }

  async getJson<T = unknown>(url: string, options: JsonRequestOptions = {}): Promise<T> {
    const response = await this.#axiosInstance.get<T>(url, {
      signal: options.signal,
      timeout: options.timeoutMs
    });
    return response.data;
  }
}

export function createAxiosJsonClient(axiosInstance: AxiosLike): JsonClient {
  return new AxiosJsonClient(axiosInstance);
}
