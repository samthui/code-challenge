import { useState } from "react";
import { TOKEN_SYMBOLS } from "../../../shared/domain/tokens.js";

export function useSwapForm() {
  const [pairState, setPairState] = useState({
    amount: "",
    fromSymbol: TOKEN_SYMBOLS.ETH,
    toSymbol: TOKEN_SYMBOLS.USDC
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function setAmount(amount) {
    setPairState((current) => ({ ...current, amount }));
  }

  function setFromSymbol(fromSymbol) {
    setPairState((current) => ({ ...current, fromSymbol }));
    setSuccessMessage("");
  }

  function setToSymbol(toSymbol) {
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
    isSubmitting,
    setAmount,
    setFromSymbol,
    setIsSubmitting,
    setSuccessMessage,
    setToSymbol,
    successMessage,
    switchTokens,
    toSymbol: pairState.toSymbol
  };
}
