import { ERROR_MESSAGES } from "./tokens.js";

export function validateSwapInput({ amount, fromSymbol, toSymbol, fromToken, toToken }) {
  const errors = [];
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    errors.push(ERROR_MESSAGES.invalidAmount);
  }

  if (fromSymbol === toSymbol) {
    errors.push(ERROR_MESSAGES.sameToken);
  }

  if (!fromToken || !toToken) {
    errors.push(ERROR_MESSAGES.missingPrice);
  }

  return errors;
}
