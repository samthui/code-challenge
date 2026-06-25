import { ERROR_MESSAGES } from "./tokens";
import type { TokenPrice } from "./tokens";

interface ValidateSwapInput {
  amount: string | number;
  fromSymbol: string;
  toSymbol: string;
  fromToken?: TokenPrice;
  toToken?: TokenPrice;
}

export function validateSwapInput({ amount, fromSymbol, toSymbol, fromToken, toToken }: ValidateSwapInput): string[] {
  const errors: string[] = [];
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
