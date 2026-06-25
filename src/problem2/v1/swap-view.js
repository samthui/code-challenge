(function attachSwapView(root, factory) {
  const view = factory();
  if (typeof module === "object" && module.exports) module.exports = view;
  root.SwapView = view;
})(typeof globalThis !== "undefined" ? globalThis : window, function createSwapViewModule() {
  function createInitialState(constants) {
    return {
      tokens: [],
      fromSymbol: constants.TOKEN_SYMBOLS.ETH,
      toSymbol: constants.TOKEN_SYMBOLS.USDC,
      amount: "",
      isSubmitting: false,
      usedFallback: false,
      successMessage: ""
    };
  }

  function createViewModel(state, constants, core) {
    const quote = core.calculateQuote({
      amount: state.amount,
      fromSymbol: state.fromSymbol,
      toSymbol: state.toSymbol,
      tokens: state.tokens,
      simulatedFeeUsd: constants.CONFIG.simulatedFeeUsd,
      slippageRate: constants.CONFIG.slippageRate
    });
    const fromToken = state.tokens.find((token) => token.symbol === state.fromSymbol);
    const toToken = state.tokens.find((token) => token.symbol === state.toSymbol);
    const amountError = quote.errors.find((error) => error === constants.ERROR_MESSAGES.invalidAmount) || "";
    const pairError = quote.errors.find((error) => error !== constants.ERROR_MESSAGES.invalidAmount) || "";

    return {
      quote,
      toAmount: quote.isValid ? core.formatAmount(quote.toAmount, 8) : "",
      amountError,
      formMessage: state.successMessage || pairError,
      isSuccess: Boolean(state.successMessage),
      confirmDisabled: !quote.isValid || state.isSubmitting,
      confirmText: state.isSubmitting ? constants.UI_TEXT.confirming : constants.UI_TEXT.confirmSwap,
      marketStatus: state.usedFallback ? constants.UI_TEXT.fallbackPrices : constants.UI_TEXT.livePrices,
      quoteRate: quote.isValid && fromToken && toToken
        ? `1 ${fromToken.symbol} = ${core.formatAmount(quote.rate, 8)} ${toToken.symbol}`
        : constants.UI_TEXT.enterAmount,
      quoteFee: core.formatUsd(constants.CONFIG.simulatedFeeUsd),
      quoteMinimum: quote.isValid && toToken ? `${core.formatAmount(quote.minimumReceived, 8)} ${toToken.symbol}` : "0.00",
      fromUsdValue: quote.isValid ? core.formatUsd(quote.fromUsd) : "$0.00",
      toUsdValue: quote.isValid ? core.formatUsd(quote.toUsd) : "$0.00"
    };
  }

  function renderViewModel(elements, viewModel) {
    elements.toAmount.value = viewModel.toAmount;
    elements.amountError.textContent = viewModel.amountError;
    elements.formMessage.textContent = viewModel.formMessage;
    elements.formMessage.classList.toggle("is-success", viewModel.isSuccess);
    elements.confirmButton.disabled = viewModel.confirmDisabled;
    elements.confirmButton.textContent = viewModel.confirmText;
    elements.marketStatus.textContent = viewModel.marketStatus;
    elements.quoteRate.textContent = viewModel.quoteRate;
    elements.quoteFee.textContent = viewModel.quoteFee;
    elements.quoteMinimum.textContent = viewModel.quoteMinimum;
    elements.fromUsdValue.textContent = viewModel.fromUsdValue;
    elements.toUsdValue.textContent = viewModel.toUsdValue;
  }

  return { createInitialState, createViewModel, renderViewModel };
});
