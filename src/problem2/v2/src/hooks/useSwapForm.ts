import { useState } from "react";
import { TOKEN_SYMBOLS } from "../../../shared/domain/tokens";
import { normalizeEditableAmountInput } from "../../../shared/presentation/formatters";

interface SwapPairState {
  amount: string;
  fromSymbol: string;
  toSymbol: string;
}

export function useSwapForm() {
  const [pairState, setPairState] = useState<SwapPairState>({
    amount: "",
    fromSymbol: TOKEN_SYMBOLS.ETH,
    toSymbol: TOKEN_SYMBOLS.USDC
  });
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function setAmount(amount: string) {
    setPairState((current) => ({ ...current, amount: normalizeEditableAmountInput(amount) }));
  }

  function setFromSymbol(fromSymbol: string) {
    setPairState((current) => ({ ...current, fromSymbol }));
    setSuccessMessage("");
  }

  function setToSymbol(toSymbol: string) {
    setPairState((current) => ({ ...current, toSymbol }));
    setSuccessMessage("");
  }

  function switchTokens() {
    setPairState((current) => ({
      ...current,
      fromSymbol: current.toSymbol,
      toSymbol: current.fromSymbol
    }));
    setSuccessMessage("");
  }

  return {
    amount: pairState.amount,
    fromSymbol: pairState.fromSymbol,
    isAmountFocused,
    isSubmitting,
    setAmount,
    setIsAmountFocused,
    setFromSymbol,
    setIsSubmitting,
    setSuccessMessage,
    setToSymbol,
    successMessage,
    switchTokens,
    toSymbol: pairState.toSymbol
  };
}
