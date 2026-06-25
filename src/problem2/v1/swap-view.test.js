const assert = require("node:assert/strict");
const constants = require("./swap-constants.js");
const core = require("./swap-core.js");

const { createInitialState, createViewModel, renderViewModel } = require("./swap-view.js");

function createElement() {
  return {
    textContent: "",
    value: "",
    disabled: false,
    classList: { values: new Set(), toggle(name, enabled) { enabled ? this.values.add(name) : this.values.delete(name); } }
  };
}

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("createInitialState avoids scattered default symbol literals", () => {
  const state = createInitialState(constants);
  assert.equal(state.fromSymbol, constants.TOKEN_SYMBOLS.ETH);
  assert.equal(state.toSymbol, constants.TOKEN_SYMBOLS.USDC);
});

test("createViewModel exposes validation text and disabled confirm state", () => {
  const state = createInitialState(constants);
  state.tokens = constants.FALLBACK_TOKENS;
  state.amount = "0";

  const viewModel = createViewModel(state, constants, core);

  assert.equal(viewModel.amountError, constants.ERROR_MESSAGES.invalidAmount);
  assert.equal(viewModel.confirmDisabled, true);
  assert.equal(viewModel.marketStatus, constants.UI_TEXT.livePrices);
});

test("renderViewModel writes expected UI fields", () => {
  const elements = {
    toAmount: createElement(),
    amountError: createElement(),
    formMessage: createElement(),
    confirmButton: createElement(),
    marketStatus: createElement(),
    quoteRate: createElement(),
    quoteFee: createElement(),
    quoteMinimum: createElement(),
    fromUsdValue: createElement(),
    toUsdValue: createElement()
  };

  renderViewModel(elements, {
    toAmount: "1,645.93",
    amountError: "",
    formMessage: "ok",
    isSuccess: true,
    confirmDisabled: false,
    confirmText: constants.UI_TEXT.confirmSwap,
    marketStatus: constants.UI_TEXT.livePrices,
    quoteRate: "1 ETH = 1,645.93 USDC",
    quoteFee: "$1.25",
    quoteMinimum: "1,636.45 USDC",
    fromUsdValue: "$1,645.93",
    toUsdValue: "$1,645.93"
  });

  assert.equal(elements.toAmount.value, "1,645.93");
  assert.equal(elements.confirmButton.disabled, false);
  assert.equal(elements.confirmButton.textContent, constants.UI_TEXT.confirmSwap);
  assert.equal(elements.formMessage.classList.values.has("is-success"), true);
});
