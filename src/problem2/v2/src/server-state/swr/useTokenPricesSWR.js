import useSWR from "swr";
import { loadTokenPrices } from "../../../../shared/application/loadTokenPrices.js";
import { EMPTY_TOKEN_PRICES_RESOURCE } from "../ports/tokenPricesResource.js";

export function useTokenPricesSWR(priceRepository) {
  const query = useSWR(["prices", "switcheo"], () => loadTokenPrices(priceRepository), {
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
