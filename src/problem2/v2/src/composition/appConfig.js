import { JSON_CLIENT_TYPES } from "../../../shared/infrastructure/http/jsonClient.js";

export const HTTP_CLIENTS = Object.freeze({
  ...JSON_CLIENT_TYPES
});

export const SERVER_STATE_LIBRARIES = Object.freeze({
  plain: "plain",
  swr: "swr",
  tanstack: "tanstack"
});

export const APP_CONFIG = Object.freeze({
  httpClient: HTTP_CLIENTS.fetch,
  serverStateLibrary: SERVER_STATE_LIBRARIES.plain
});
