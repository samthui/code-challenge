import useSWR from "swr";
import { loadTokenPrices } from "../../application/loadTokenPrices";
import { EMPTY_TOKEN_PRICES_RESOURCE } from "../ports/tokenPricesResource";
import type { PriceRepository } from "../../application/ports/PriceRepository";
import type { LoadTokenPricesResult } from "../../application/loadTokenPrices";
import type { TokenPricesResource } from "../ports/tokenPricesResource";

export function useTokenPricesSWR(priceRepository: PriceRepository): TokenPricesResource {
  const query = useSWR<LoadTokenPricesResult>(["prices", "switcheo"], () => loadTokenPrices(priceRepository), {
    errorRetryCount: 2,
    revalidateOnFocus: false
  });
  const result = query.data || EMPTY_TOKEN_PRICES_RESOURCE;

  return {
    error: result.error || query.error,
    isLoading: query.isLoading,
    refetch: query.mutate,
    tokens: result.tokens,
    usedFallback: result.usedFallback
  };
}
