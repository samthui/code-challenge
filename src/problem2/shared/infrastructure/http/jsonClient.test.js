import assert from "node:assert/strict";
import { assertJsonClient, createJsonClient, JSON_CLIENT_TYPES } from "./jsonClient.js";

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("createJsonClient returns the selected concrete JsonClient", () => {
  const fetchClient = { getJson: async () => ({ ok: true }) };
  const axiosClient = { getJson: async () => ({ ok: true }) };

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
