(function attachSwapCore(root, factory) {
  const constants = typeof require === "function" ? require("./swap-constants.js") : root.SwapConstants;
  const core = factory(constants);
  if (typeof module === "object" && module.exports) module.exports = core;
  root.SwapCore = core;
})(typeof globalThis !== "undefined" ? globalThis : window, function createSwapCore(constants) {
  const { CONFIG, ERROR_MESSAGES, TOKEN_SYMBOLS } = constants;

  function formatAmount(value, maximumFractionDigits = 6) {
    if (!Number.isFinite(value)) return "0.00";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
      maximumFractionDigits
    }).format(value);
  }

  function formatUsd(value) {
    if (!Number.isFinite(value)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: TOKEN_SYMBOLS.USD,
      minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
      maximumFractionDigits: value > 0 && value < 0.01 ? 5 : 2
    }).format(value);
  }

  function normalizePrices(records) {
    const bySymbol = new Map();
    records.forEach((record) => {
      const rawSymbol = String(record.currency || "").trim();
      const price = Number(record.price);
      const date = new Date(record.date || 0);
      if (!rawSymbol || !Number.isFinite(price) || price <= 0 || Number.isNaN(date.getTime())) return;
      const symbol = rawSymbol.toUpperCase();
      const current = bySymbol.get(symbol);
      if (!current || date > new Date(current.date)) {
        bySymbol.set(symbol, { symbol, price, date: date.toISOString() });
      }
    });

    const priority = Object.values(TOKEN_SYMBOLS);
    return [...bySymbol.values()].sort((a, b) => {
      const aIndex = priority.indexOf(a.symbol);
      const bIndex = priority.indexOf(b.symbol);
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }
      return a.symbol.localeCompare(b.symbol);
    });
  }

  function getToken(tokens, symbol) {
    return tokens.find((token) => token.symbol === symbol);
  }

  function calculateQuote(options) {
    const tokens = Array.isArray(options.tokens) ? options.tokens : [];
    const amount = Number(options.amount);
    const fromToken = getToken(tokens, options.fromSymbol);
    const toToken = getToken(tokens, options.toSymbol);
    const simulatedFeeUsd = Number.isFinite(options.simulatedFeeUsd) ? options.simulatedFeeUsd : CONFIG.simulatedFeeUsd;
    const slippageRate = Number.isFinite(options.slippageRate) ? options.slippageRate : CONFIG.slippageRate;
    const errors = [];

    if (String(options.amount || "").trim() === "" || !Number.isFinite(amount) || amount <= 0) {
      errors.push(ERROR_MESSAGES.invalidAmount);
    }
    if (options.fromSymbol === options.toSymbol) errors.push(ERROR_MESSAGES.sameToken);
    if (!fromToken || !toToken) errors.push(ERROR_MESSAGES.missingPrice);

    if (errors.length > 0) {
      return { isValid: false, errors, fromUsd: 0, toAmount: 0, toUsd: 0, rate: 0, minimumReceived: 0 };
    }

    const fromUsd = amount * fromToken.price;
    const toAmount = fromUsd / toToken.price;
    const rate = fromToken.price / toToken.price;
    const feeInToToken = simulatedFeeUsd / toToken.price;
    const minimumReceived = Math.max(toAmount * (1 - slippageRate) - feeInToToken, 0);

    return { isValid: true, errors, fromUsd, toAmount, toUsd: toAmount * toToken.price, rate, minimumReceived };
  }

  return { calculateQuote, formatAmount, formatUsd, normalizePrices };
});
