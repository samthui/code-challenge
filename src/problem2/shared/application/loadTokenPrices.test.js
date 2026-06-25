import assert from "node:assert/strict";
import { FALLBACK_TOKENS, TOKEN_SYMBOLS } from "../domain/tokens.js";
import { loadTokenPrices } from "./loadTokenPrices.js";

async function test(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("loadTokenPrices returns normalized live tokens when the repository succeeds", async () => {
  const result = await loadTokenPrices({
    getPrices: async () => [
      { currency: "ETH", price: 1600, date: "2023-08-29T07:00:00.000Z" },
      { currency: "ETH", price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
      { currency: "USDC", price: 1, date: "2023-08-29T07:10:00.000Z" }
    ]
  });

  assert.equal(result.usedFallback, false);
  assert.equal(result.error, null);
  assert.deepEqual(result.tokens, [
    { symbol: TOKEN_SYMBOLS.USDC, price: 1, date: "2023-08-29T07:10:00.000Z" },
    { symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" }
  ]);
});

test("loadTokenPrices falls back when the repository fails", async () => {
  const result = await loadTokenPrices({
    getPrices: async () => {
      throw new Error("network down");
    }
  });

  assert.equal(result.usedFallback, true);
  assert.equal(result.tokens.length, FALLBACK_TOKENS.length);
  assert.match(result.error.message, /network down/);
});

test("loadTokenPrices falls back when the feed has fewer than two usable tokens", async () => {
  const result = await loadTokenPrices({
    getPrices: async () => [
      { currency: "ETH", price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
      { currency: "BAD", price: 0, date: "2023-08-29T07:10:00.000Z" }
    ]
  });

  assert.equal(result.usedFallback, true);
  assert.equal(result.tokens.length, FALLBACK_TOKENS.length);
  assert.match(result.error.message, /fewer than two usable tokens/);
});
