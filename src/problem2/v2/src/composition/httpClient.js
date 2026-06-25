import axios from "axios";
import { createAxiosJsonClient } from "../../../shared/infrastructure/http/axiosJsonClient.js";
import { createFetchJsonClient } from "../../../shared/infrastructure/http/fetchJsonClient.js";
import { createJsonClient } from "../../../shared/infrastructure/http/jsonClient.js";
import { APP_CONFIG, HTTP_CLIENTS } from "./appConfig.js";
import { getBrowserStorage } from "./browserStorage.js";

export function createBrowserJsonClient(httpClientType = APP_CONFIG.httpClient) {
  return createJsonClient(httpClientType, {
    [HTTP_CLIENTS.axios]: () => createAxiosJsonClient(axios),
    [HTTP_CLIENTS.fetch]: () => createFetchJsonClient({
      fetchImpl: (...args) => globalThis.fetch(...args),
      storage: getBrowserStorage()
    })
  });
}
