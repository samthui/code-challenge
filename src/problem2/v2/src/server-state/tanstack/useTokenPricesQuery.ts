import { useQuery } from "@tanstack/react-query";
import { loadTokenPrices } from "../../../../shared/application/loadTokenPrices";
import { EMPTY_TOKEN_PRICES_RESOURCE } from "../ports/tokenPricesResource";
import type { PriceRepository } from "../../../../shared/application/ports/PriceRepository";
import type { LoadTokenPricesResult } from "../../../../shared/application/loadTokenPrices";
import type { TokenPricesResource } from "../ports/tokenPricesResource";

export function useTokenPricesQuery(priceRepository: PriceRepository): TokenPricesResource {
  const query = useQuery<LoadTokenPricesResult>({
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
