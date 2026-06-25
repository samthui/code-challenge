/**
 * @typedef {Object} JsonClient
 * @property {(url: string, options?: Object) => Promise<unknown>} getJson
 */

export const JSON_CLIENT_TYPES = Object.freeze({
  axios: "axios",
  fetch: "fetch"
});

export function assertJsonClient(client) {
  if (!client || typeof client.getJson !== "function") {
    throw new TypeError("JsonClient must implement getJson(url, options).");
  }
  return client;
}

export function createJsonClient(type, factories) {
  const createClient = factories[type];
  if (!createClient) {
    throw new Error(`Unsupported JSON client type: ${type}`);
  }
  return assertJsonClient(createClient());
}
