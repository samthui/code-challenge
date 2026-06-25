import { useEffect, useState } from "react";
import { loadTokenPrices } from "../../../../shared/application/loadTokenPrices.js";
import { EMPTY_TOKEN_PRICES_RESOURCE } from "../ports/tokenPricesResource.js";

export function useTokenPricesPlain(priceRepository) {
  const [state, setState] = useState(EMPTY_TOKEN_PRICES_RESOURCE);

  async function refetch() {
    setState((current) => ({ ...current, isLoading: true }));
    const result = await loadTokenPrices(priceRepository);
    setState({
      error: result.error,
      isLoading: false,
      refetch,
      tokens: result.tokens,
      usedFallback: result.usedFallback
    });
    return result;
  }

  useEffect(() => {
    let isActive = true;

    setState((current) => ({ ...current, isLoading: true }));
    loadTokenPrices(priceRepository).then((result) => {
      if (!isActive) return;
      setState({
        error: result.error,
        isLoading: false,
        refetch,
        tokens: result.tokens,
        usedFallback: result.usedFallback
      });
    });

    return () => {
      isActive = false;
    };
  }, [priceRepository]);

  return state;
}
