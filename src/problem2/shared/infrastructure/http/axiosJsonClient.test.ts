import assert from "node:assert/strict";
import { createAxiosJsonClient } from "./axiosJsonClient";
import type { JsonRequestOptions } from "./jsonClient";

import { it as test } from "vitest";

test("axiosJsonClient maps the common JSON client contract to axios", async () => {
  const signal = new AbortController().signal;
  const calls: Array<{ url: string; options?: { signal?: AbortSignal; timeout?: number } }> = [];
  const client = createAxiosJsonClient({
    async get<T = unknown>(url: string, options?: { signal?: AbortSignal; timeout?: number }) {
      calls.push({ url, options });
      return { data: [{ currency: "ETH", price: 1645.93 }] as T };
    }
  });

  const result = await client.getJson("https://example.test/prices", {
    signal,
    timeoutMs: 5000
  } satisfies JsonRequestOptions);

  assert.deepEqual(result, [{ currency: "ETH", price: 1645.93 }]);
  assert.deepEqual(calls, [
    {
      url: "https://example.test/prices",
      options: { signal, timeout: 5000 }
    }
  ]);
});
