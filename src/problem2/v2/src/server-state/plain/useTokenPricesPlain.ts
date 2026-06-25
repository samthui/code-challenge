import { useEffect, useState } from "react";
import { loadTokenPrices } from "../../../../shared/application/loadTokenPrices";
import { EMPTY_TOKEN_PRICES_RESOURCE } from "../ports/tokenPricesResource";
import type { PriceRepository } from "../../../../shared/application/ports/PriceRepository";
import type { LoadTokenPricesResult } from "../../../../shared/application/loadTokenPrices";
import type { TokenPricesResource } from "../ports/tokenPricesResource";

export function useTokenPricesPlain(priceRepository: PriceRepository): TokenPricesResource {
  const [state, setState] = useState<TokenPricesResource>(EMPTY_TOKEN_PRICES_RESOURCE);

  async function refetch(): Promise<LoadTokenPricesResult> {
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
