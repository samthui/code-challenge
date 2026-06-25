import assert from "node:assert/strict";
import { createJsonRequestClient } from "./requestClient";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => values.set(key, value)
  };
}

import { it as test } from "vitest";

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
  let capturedSignal: AbortSignal | undefined;
  const client = createJsonRequestClient({
    fetchImpl: async (_url, options = {}) => {
      capturedSignal = options.signal || undefined;
      assert.ok(capturedSignal instanceof AbortSignal);
      const signal = capturedSignal;

      return new Promise((resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => reject(signal.reason || new Error("Request aborted")),
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
  assert.equal(capturedSignal?.aborted, true);
});
