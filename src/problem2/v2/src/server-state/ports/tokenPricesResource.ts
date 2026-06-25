import { FALLBACK_TOKENS } from "../../../../shared/domain/tokens";
import type { LoadTokenPricesResult } from "../../../../shared/application/loadTokenPrices";
import type { PriceRepository } from "../../../../shared/application/ports/PriceRepository";
import type { TokenPrice } from "../../../../shared/domain/tokens";

export interface TokenPricesResource {
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  tokens: TokenPrice[];
  usedFallback: boolean;
}

export type TokenPricesResourceHook = (priceRepository: PriceRepository) => TokenPricesResource;

export type TokenPricesRefetch = () => Promise<LoadTokenPricesResult | unknown>;

export const EMPTY_TOKEN_PRICES_RESOURCE: TokenPricesResource = Object.freeze({
  error: null,
  isLoading: true,
  refetch: async () => undefined,
  tokens: FALLBACK_TOKENS,
  usedFallback: true
});
