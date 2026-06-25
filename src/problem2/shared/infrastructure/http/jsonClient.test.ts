import assert from "node:assert/strict";
import { assertJsonClient, createJsonClient, JSON_CLIENT_TYPES } from "./jsonClient";
import type { JsonClient } from "./jsonClient";

import { it as test } from "vitest";

test("createJsonClient returns the selected concrete JsonClient", () => {
  const fetchClient: JsonClient = { getJson: async <T = unknown>() => ({ ok: true }) as T };
  const axiosClient: JsonClient = { getJson: async <T = unknown>() => ({ ok: true }) as T };

  assert.equal(
    createJsonClient(JSON_CLIENT_TYPES.fetch, {
      [JSON_CLIENT_TYPES.fetch]: () => fetchClient,
      [JSON_CLIENT_TYPES.axios]: () => axiosClient
    }),
    fetchClient
  );
});

test("createJsonClient rejects unsupported concrete types", () => {
  assert.throws(() => createJsonClient("graphql", {}), /Unsupported JSON client type/);
});

test("assertJsonClient rejects objects that do not implement the interface", () => {
  assert.throws(() => assertJsonClient({}), /must implement getJson/);
});
