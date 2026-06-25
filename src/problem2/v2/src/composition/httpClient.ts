import axios from "axios";
import { createAxiosJsonClient } from "../../../shared/infrastructure/http/axiosJsonClient";
import { createFetchJsonClient } from "../../../shared/infrastructure/http/fetchJsonClient";
import { createJsonClient } from "../../../shared/infrastructure/http/jsonClient";
import { APP_CONFIG, HTTP_CLIENTS } from "./appConfig";
import { getBrowserStorage } from "./browserStorage";
import type { JsonClient, JsonClientType } from "../../../shared/infrastructure/http/jsonClient";

export function createBrowserJsonClient(httpClientType: JsonClientType = APP_CONFIG.httpClient): JsonClient {
  return createJsonClient(httpClientType, {
    [HTTP_CLIENTS.axios]: () => createAxiosJsonClient(axios),
    [HTTP_CLIENTS.fetch]: () => createFetchJsonClient({
      fetchImpl: (...args) => globalThis.fetch(...args),
      storage: getBrowserStorage()
    })
  });
}
