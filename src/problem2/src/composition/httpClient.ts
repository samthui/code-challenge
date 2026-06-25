import axios from "axios";
import { createAxiosJsonClient } from "../infrastructure/http/axiosJsonClient";
import { createFetchJsonClient } from "../infrastructure/http/fetchJsonClient";
import { createJsonClient } from "../infrastructure/http/jsonClient";
import { APP_CONFIG, HTTP_CLIENTS } from "./appConfig";
import { getBrowserStorage } from "./browserStorage";
import type { JsonClient, JsonClientType } from "../infrastructure/http/jsonClient";

export function createBrowserJsonClient(httpClientType: JsonClientType = APP_CONFIG.httpClient): JsonClient {
  return createJsonClient(httpClientType, {
    [HTTP_CLIENTS.axios]: () => createAxiosJsonClient(axios),
    [HTTP_CLIENTS.fetch]: () => createFetchJsonClient({
      fetchImpl: (...args) => globalThis.fetch(...args),
      storage: getBrowserStorage()
    })
  });
}
