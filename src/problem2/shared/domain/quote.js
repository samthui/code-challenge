import { TOKEN_PRIORITY } from "./tokens.js";
import { validateSwapInput } from "./validation.js";

function isPositivePrice(value) {
  return Number.isFinite(value) && value > 0;
}

function compareTokenPriority(left, right) {
  const leftIndex = TOKEN_PRIORITY.indexOf(left.symbol);
  const rightIndex = TOKEN_PRIORITY.indexOf(right.symbol);
  const safeLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
  const safeRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
  return safeLeft - safeRight || left.symbol.localeCompare(right.symbol);
}

export function normalizePrices(records) {
  const newestBySymbol = new Map();

  for (const record of records || []) {
    const symbol = String(record.currency || record.symbol || "").trim().toUpperCase();
    const price = Number(record.price);
    const timestamp = Date.parse(record.date);
    if (!symbol || !isPositivePrice(price) || !Number.isFinite(timestamp)) continue;

    const token = { symbol, price, date: record.date };
    const current = newestBySymbol.get(symbol);
    if (!current || timestamp >= Date.parse(current.date)) {
      newestBySymbol.set(symbol, token);
    }
  }

  return [...newestBySymbol.values()].sort(compareTokenPriority);
}

export function calculateQuote({
  amount,
  fromSymbol,
  toSymbol,
  tokens,
  simulatedFeeUsd = 0,
  slippageRate = 0
}) {
  const tokenList = Array.isArray(tokens) ? tokens : [];
  const fromToken = tokenList.find((token) => token.symbol === fromSymbol);
  const toToken = tokenList.find((token) => token.symbol === toSymbol);
  const numericAmount = Number(amount);
  const errors = validateSwapInput({ amount, fromSymbol, toSymbol, fromToken, toToken });

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      fromUsd: 0,
      toAmount: 0,
      toUsd: 0,
      rate: 0,
      minimumReceived: 0
    };
  }

  const fromUsd = numericAmount * fromToken.price;
  const toAmount = fromUsd / toToken.price;
  const rate = fromToken.price / toToken.price;
  const minimumReceived = Math.max(0, toAmount * (1 - slippageRate) - simulatedFeeUsd / toToken.price);

  return { isValid: true, errors, fromUsd, toAmount, toUsd: toAmount * toToken.price, rate, minimumReceived };
}
