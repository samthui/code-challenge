import { JSON_CLIENT_TYPES } from "../../../shared/infrastructure/http/jsonClient";
import type { JsonClientType } from "../../../shared/infrastructure/http/jsonClient";

export const HTTP_CLIENTS = Object.freeze({
  ...JSON_CLIENT_TYPES
});

export const SERVER_STATE_LIBRARIES = {
  plain: "plain",
  swr: "swr",
  tanstack: "tanstack"
} as const;

export type ServerStateLibrary = (typeof SERVER_STATE_LIBRARIES)[keyof typeof SERVER_STATE_LIBRARIES];

export interface AppConfig {
  httpClient: JsonClientType;
  serverStateLibrary: ServerStateLibrary;
}

export const APP_CONFIG: AppConfig = Object.freeze({
  httpClient: HTTP_CLIENTS.fetch,
  serverStateLibrary: SERVER_STATE_LIBRARIES.plain
});
