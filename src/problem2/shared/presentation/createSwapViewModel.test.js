import assert from "node:assert/strict";
import { FALLBACK_TOKENS, TOKEN_SYMBOLS } from "../domain/tokens.js";
import { UI_TEXT } from "./uiText.js";
import { createSwapViewModel } from "./createSwapViewModel.js";

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("createSwapViewModel maps valid quote state for display", () => {
  const model = createSwapViewModel({
    amount: "1",
    fromSymbol: TOKEN_SYMBOLS.ETH,
    toSymbol: TOKEN_SYMBOLS.USDC,
    tokens: FALLBACK_TOKENS,
    isSubmitting: false,
    successMessage: "",
    usedFallback: false
  });

  assert.equal(model.confirmDisabled, false);
  assert.equal(model.marketStatus, UI_TEXT.livePrices);
  assert.match(model.toAmount, /1,645/);
  assert.match(model.quoteRate, /1 ETH =/);
});

test("createSwapViewModel maps validation and fallback state", () => {
  const model = createSwapViewModel({
    amount: "0",
    fromSymbol: TOKEN_SYMBOLS.ETH,
    toSymbol: TOKEN_SYMBOLS.USDC,
    tokens: FALLBACK_TOKENS,
    isSubmitting: false,
    successMessage: "",
    usedFallback: true
  });

  assert.equal(model.confirmDisabled, true);
  assert.equal(model.marketStatus, UI_TEXT.fallbackPrices);
  assert.equal(model.amountError, "Enter an amount greater than 0.");
});
