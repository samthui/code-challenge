import { calculateQuote } from "../domain/quote";
import { ERROR_MESSAGES, QUOTE_SETTINGS } from "../domain/tokens";
import { formatAmount, formatUsd } from "./formatters";
import { UI_TEXT } from "./uiText";
import type { QuoteResult } from "../domain/quote";
import type { TokenPrice } from "../domain/tokens";

export interface SwapViewModelInput {
  amount: string;
  fromSymbol: string;
  toSymbol: string;
  tokens?: TokenPrice[];
  isSubmitting: boolean;
  successMessage: string;
  usedFallback: boolean;
}

export interface SwapViewModel {
  quote: QuoteResult;
  toAmount: string;
  amountError: string;
  formMessage: string;
  quoteRate: string;
  fromUsd: string;
  toUsd: string;
  minimumReceived: string;
  networkFee: string;
  slippage: string;
  fromToken?: TokenPrice;
  toToken?: TokenPrice;
  marketStatus: string;
  confirmDisabled: boolean;
}

export function createSwapViewModel(state: SwapViewModelInput): SwapViewModel {
  const tokens = Array.isArray(state.tokens) ? state.tokens : [];
  const quote = calculateQuote({
    amount: state.amount,
    fromSymbol: state.fromSymbol,
    toSymbol: state.toSymbol,
    tokens,
    simulatedFeeUsd: QUOTE_SETTINGS.simulatedFeeUsd,
    slippageRate: QUOTE_SETTINGS.slippageRate
  });

  const fromToken = tokens.find((token) => token.symbol === state.fromSymbol);
  const toToken = tokens.find((token) => token.symbol === state.toSymbol);
  const amountError = quote.errors.find((error) => error === ERROR_MESSAGES.invalidAmount) || "";
  const pairError = quote.errors.find((error) => error !== ERROR_MESSAGES.invalidAmount) || "";

  return {
    quote,
    toAmount: quote.isValid ? formatAmount(quote.toAmount, 8) : "",
    amountError,
    formMessage: state.successMessage || pairError,
    quoteRate: quote.isValid ? `1 ${state.fromSymbol} = ${formatAmount(quote.rate, 8)} ${state.toSymbol}` : "",
    fromUsd: quote.isValid ? formatUsd(quote.fromUsd) : "",
    toUsd: quote.isValid ? formatUsd(quote.toUsd) : "",
    minimumReceived: quote.isValid ? `${formatAmount(quote.minimumReceived, 8)} ${state.toSymbol}` : "",
    networkFee: formatUsd(QUOTE_SETTINGS.simulatedFeeUsd),
    slippage: `${(QUOTE_SETTINGS.slippageRate * 100).toFixed(1)}%`,
    fromToken,
    toToken,
    marketStatus: state.usedFallback ? UI_TEXT.fallbackPrices : UI_TEXT.livePrices,
    confirmDisabled: !quote.isValid || state.isSubmitting
  };
}
