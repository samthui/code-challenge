(function attachSwapConstants(root, factory) {
  const constants = factory();
  if (typeof module === "object" && module.exports) module.exports = constants;
  root.SwapConstants = constants;
})(typeof globalThis !== "undefined" ? globalThis : window, function createSwapConstants() {
  const TOKEN_SYMBOLS = Object.freeze({
    USD: "USD",
    USDC: "USDC",
    ETH: "ETH",
    WBTC: "WBTC",
    ATOM: "ATOM",
    OSMO: "OSMO",
    SWTH: "SWTH"
  });

  const UI_TEXT = Object.freeze({
    loadingPrices: "Loading prices",
    livePrices: "Live prices",
    fallbackPrices: "Fallback prices",
    enterAmount: "Enter an amount",
    confirmSwap: "Confirm swap",
    confirming: "Confirming...",
    successPrefix: "Swap preview ready"
  });

  const ERROR_MESSAGES = Object.freeze({
    invalidAmount: "Enter an amount greater than 0.",
    sameToken: "Choose two different tokens.",
    missingPrice: "Price data is unavailable for this pair."
  });

  const SELECTORS = Object.freeze({
    marketStatus: "#market-status",
    form: "#swap-form",
    fromAmount: "#from-amount",
    toAmount: "#to-amount",
    fromToken: "#from-token",
    toToken: "#to-token",
    fromIcon: "#from-token-icon",
    toIcon: "#to-token-icon",
    fromUsdValue: "#from-usd-value",
    toUsdValue: "#to-usd-value",
    amountError: "#amount-error",
    quoteRate: "#quote-rate",
    quoteFee: "#quote-fee",
    quoteMinimum: "#quote-minimum",
    formMessage: "#form-message",
    confirmButton: "#confirm-button",
    swapDirection: "#swap-direction"
  });

  const CONFIG = Object.freeze({
    priceUrl: "https://interview.switcheo.com/prices.json",
    iconBaseUrl: "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens",
    cacheKey: "problem2:v1:prices",
    cacheTtlMs: 5 * 60 * 1000,
    requestTimeoutMs: 5000,
    requestRetries: 2,
    simulatedFeeUsd: 1.25,
    slippageRate: 0.005
  });

  const FALLBACK_TOKENS = Object.freeze([
    { symbol: TOKEN_SYMBOLS.USD, price: 1, date: "2023-08-29T07:10:30.000Z" },
    { symbol: TOKEN_SYMBOLS.USDC, price: 1, date: "2023-08-29T07:10:30.000Z" },
    { symbol: TOKEN_SYMBOLS.ETH, price: 1645.9337373737374, date: "2023-08-29T07:10:52.000Z" },
    { symbol: TOKEN_SYMBOLS.WBTC, price: 26002.82202020202, date: "2023-08-29T07:10:52.000Z" },
    { symbol: TOKEN_SYMBOLS.ATOM, price: 7.186657333333334, date: "2023-08-29T07:10:50.000Z" },
    { symbol: TOKEN_SYMBOLS.OSMO, price: 0.3772974333333333, date: "2023-08-29T07:10:50.000Z" },
    { symbol: TOKEN_SYMBOLS.SWTH, price: 0.004039850455012084, date: "2023-08-29T07:10:45.000Z" }
  ]);

  return { CONFIG, ERROR_MESSAGES, FALLBACK_TOKENS, SELECTORS, TOKEN_SYMBOLS, UI_TEXT };
});
