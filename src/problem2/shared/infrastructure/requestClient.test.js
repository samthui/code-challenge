import assert from "node:assert/strict";
import { createJsonRequestClient } from "./requestClient.js";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value)
  };
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("getJson caches a successful response", async () => {
  let calls = 0;
  const client = createJsonRequestClient({
    fetchImpl: async () => {
      calls += 1;
      return { ok: true, json: async () => [{ currency: "ETH", price: 1 }] };
    },
    storage: createStorage(),
    now: () => 1000
  });

  await client.getJson("https://example.test/prices", { cacheKey: "prices", cacheTtlMs: 10000 });
  await client.getJson("https://example.test/prices", { cacheKey: "prices", cacheTtlMs: 10000 });

  assert.equal(calls, 1);
});

test("getJson treats storage failures as best-effort cache misses", async () => {
  let calls = 0;
  const client = createJsonRequestClient({
    fetchImpl: async () => {
      calls += 1;
      return { ok: true, json: async () => ({ ok: true }) };
    },
    storage: {
      getItem: () => {
        throw new Error("storage blocked");
      },
      setItem: () => {
        throw new Error("quota exceeded");
      }
    },
    now: () => 1000
  });

  assert.deepEqual(
    await client.getJson("https://example.test/prices", { cacheKey: "prices", cacheTtlMs: 10000 }),
    { ok: true }
  );
  assert.equal(calls, 1);
});

test("getJson retries failed responses", async () => {
  let calls = 0;
  const client = createJsonRequestClient({
    fetchImpl: async () => {
      calls += 1;
      return { ok: calls === 2, status: calls === 2 ? 200 : 500, json: async () => ({ ok: true }) };
    },
    storage: createStorage(),
    now: () => 1000
  });

  const result = await client.getJson("https://example.test/prices", { retries: 1, timeoutMs: 1000 });
  assert.deepEqual(result, { ok: true });
  assert.equal(calls, 2);
});

test("getJson aborts timed out requests", async () => {
  let capturedSignal;
  const client = createJsonRequestClient({
    fetchImpl: async (url, options = {}) => {
      capturedSignal = options.signal;
      assert.ok(capturedSignal instanceof AbortSignal);

      return new Promise((resolve, reject) => {
        capturedSignal.addEventListener(
          "abort",
          () => reject(capturedSignal.reason || new Error("Request aborted")),
          { once: true }
        );
      });
    },
    storage: createStorage(),
    now: () => 1000
  });

  await assert.rejects(
    client.getJson("https://example.test/prices", { timeoutMs: 1 }),
    /abort|timeout/i
  );
  assert.equal(capturedSignal.aborted, true);
});
