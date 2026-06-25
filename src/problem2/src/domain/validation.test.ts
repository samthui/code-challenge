import assert from "node:assert/strict";
import { ERROR_MESSAGES, TOKEN_SYMBOLS } from "./tokens";
import { validateSwapInput } from "./validation";
import type { TokenPrice } from "./tokens";

import { it as test } from "vitest";

const eth: TokenPrice = { symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" };
const usdc: TokenPrice = { symbol: TOKEN_SYMBOLS.USDC, price: 1, date: "2023-08-29T07:10:00.000Z" };

test("validateSwapInput accepts valid positive decimal swaps", () => {
  assert.deepEqual(
    validateSwapInput({
      amount: "0.25",
      fromSymbol: TOKEN_SYMBOLS.ETH,
      toSymbol: TOKEN_SYMBOLS.USDC,
      fromToken: eth,
      toToken: usdc
    }),
    []
  );
});

test("validateSwapInput rejects invalid amounts", () => {
  for (const amount of ["", "0", "-1", "abc"]) {
    assert.deepEqual(
      validateSwapInput({
        amount,
        fromSymbol: TOKEN_SYMBOLS.ETH,
        toSymbol: TOKEN_SYMBOLS.USDC,
        fromToken: eth,
        toToken: usdc
      }),
      [ERROR_MESSAGES.invalidAmount]
    );
  }
});

test("validateSwapInput rejects same token pairs", () => {
  assert.deepEqual(
    validateSwapInput({
      amount: "1",
      fromSymbol: TOKEN_SYMBOLS.ETH,
      toSymbol: TOKEN_SYMBOLS.ETH,
      fromToken: eth,
      toToken: eth
    }),
    [ERROR_MESSAGES.sameToken]
  );
});

test("validateSwapInput rejects missing prices", () => {
  assert.deepEqual(
    validateSwapInput({
      amount: "1",
      fromSymbol: TOKEN_SYMBOLS.ETH,
      toSymbol: TOKEN_SYMBOLS.USDC,
      fromToken: eth
    }),
    [ERROR_MESSAGES.missingPrice]
  );
});

test("validateSwapInput returns combined errors when multiple rules fail", () => {
  assert.deepEqual(
    validateSwapInput({
      amount: "0",
      fromSymbol: TOKEN_SYMBOLS.ETH,
      toSymbol: TOKEN_SYMBOLS.ETH
    }),
    [ERROR_MESSAGES.invalidAmount, ERROR_MESSAGES.sameToken, ERROR_MESSAGES.missingPrice]
  );
});
