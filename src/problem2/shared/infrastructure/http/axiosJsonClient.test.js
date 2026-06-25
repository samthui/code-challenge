import assert from "node:assert/strict";
import { createAxiosJsonClient } from "./axiosJsonClient.js";

async function test(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("axiosJsonClient maps the common JSON client contract to axios", async () => {
  const calls = [];
  const client = createAxiosJsonClient({
    async get(url, options) {
      calls.push({ url, options });
      return { data: [{ currency: "ETH", price: 1645.93 }] };
    }
  });

  const result = await client.getJson("https://example.test/prices", {
    signal: "abort-signal",
    timeoutMs: 5000
  });

  assert.deepEqual(result, [{ currency: "ETH", price: 1645.93 }]);
  assert.deepEqual(calls, [
    {
      url: "https://example.test/prices",
      options: { signal: "abort-signal", timeout: 5000 }
    }
  ]);
});
