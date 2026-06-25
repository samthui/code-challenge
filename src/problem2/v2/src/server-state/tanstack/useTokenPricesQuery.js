import { useQuery } from "@tanstack/react-query";
import { loadTokenPrices } from "../../../../shared/application/loadTokenPrices.js";
import { EMPTY_TOKEN_PRICES_RESOURCE } from "../ports/tokenPricesResource.js";

export function useTokenPricesQuery(priceRepository) {
  const query = useQuery({
    queryKey: ["prices", "switcheo"],
    queryFn: () => loadTokenPrices(priceRepository)
  });
  const result = query.data || EMPTY_TOKEN_PRICES_RESOURCE;

  return {
    error: result.error || query.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
    tokens: result.tokens,
    usedFallback: result.usedFallback
  };
}
