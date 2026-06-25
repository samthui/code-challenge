import assert from "node:assert/strict";
import { ERROR_MESSAGES, TOKEN_SYMBOLS } from "./tokens.js";
import { calculateQuote, normalizePrices } from "./quote.js";
import { formatAmount, formatUsd } from "../presentation/formatters.js";

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("normalizePrices keeps the newest valid positive price per token", () => {
  const result = normalizePrices([
    { currency: "eth", price: 1400, date: "2023-08-29T07:00:00.000Z" },
    { currency: "ETH", price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
    { currency: "BAD", price: 0, date: "2023-08-29T07:10:00.000Z" },
    { currency: "", price: 1, date: "2023-08-29T07:10:00.000Z" }
  ]);

  assert.deepEqual(result, [
    { symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" }
  ]);
});

test("normalizePrices ignores malformed dates instead of pinning stale prices", () => {
  const result = normalizePrices([
    { currency: "ETH", price: 9999, date: "not-a-date" },
    { currency: "ETH", price: 1645.93, date: "2023-08-29T07:10:00.000Z" }
  ]);

  assert.deepEqual(result, [
    { symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" }
  ]);
});

test("calculateQuote returns an indicative USD cross-rate quote", () => {
  const quote = calculateQuote({
    amount: "2",
    fromSymbol: TOKEN_SYMBOLS.ETH,
    toSymbol: TOKEN_SYMBOLS.USDC,
    tokens: [
      { symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
      { symbol: TOKEN_SYMBOLS.USDC, price: 1, date: "2023-08-29T07:10:00.000Z" }
    ],
    simulatedFeeUsd: 1.25,
    slippageRate: 0.005
  });

  assert.equal(quote.isValid, true);
  assert.equal(quote.fromUsd, 3291.86);
  assert.equal(quote.toAmount, 3291.86);
  assert.equal(quote.rate, 1645.93);
  assert.equal(Number(quote.minimumReceived.toFixed(6)), 3274.1507);
});

test("calculateQuote reports validation errors instead of NaN output", () => {
  const tokens = [
    { symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
    { symbol: TOKEN_SYMBOLS.USDC, price: 1, date: "2023-08-29T07:10:00.000Z" }
  ];

  assert.deepEqual(
    calculateQuote({ amount: "0", fromSymbol: TOKEN_SYMBOLS.ETH, toSymbol: TOKEN_SYMBOLS.USDC, tokens }).errors,
    [ERROR_MESSAGES.invalidAmount]
  );
  assert.deepEqual(
    calculateQuote({ amount: "1", fromSymbol: TOKEN_SYMBOLS.ETH, toSymbol: TOKEN_SYMBOLS.ETH, tokens }).errors,
    [ERROR_MESSAGES.sameToken]
  );
  assert.deepEqual(
    calculateQuote({
      amount: "1",
      fromSymbol: TOKEN_SYMBOLS.ETH,
      toSymbol: TOKEN_SYMBOLS.USDC,
      tokens: [{ symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" }]
    }).errors,
    [ERROR_MESSAGES.missingPrice]
  );
  assert.deepEqual(
    calculateQuote({
      amount: "1",
      fromSymbol: TOKEN_SYMBOLS.ETH,
      toSymbol: TOKEN_SYMBOLS.USDC,
      tokens: undefined
    }).errors,
    [ERROR_MESSAGES.missingPrice]
  );
});

test("formatters preserve crypto precision and USD readability", () => {
  assert.equal(formatAmount(0.004039850455012084, 8), "0.00403985");
  assert.equal(formatAmount(1645.9337373737374, 8), "1,645.93373737");
  assert.equal(formatUsd(1645.9337373737374), "$1,645.93");
  assert.equal(formatUsd(0.004039850455012084), "$0.00404");
});
