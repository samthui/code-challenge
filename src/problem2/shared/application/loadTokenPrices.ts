import { FALLBACK_TOKENS } from "../domain/tokens";
import { normalizePrices } from "../domain/quote";
import type { PriceRepository } from "./ports/PriceRepository";
import type { TokenPrice } from "../domain/tokens";

export interface LoadTokenPricesResult {
  tokens: TokenPrice[];
  usedFallback: boolean;
  error: Error | null;
}

export async function loadTokenPrices(repository: PriceRepository): Promise<LoadTokenPricesResult> {
  try {
    const records = await repository.getPrices();
    const tokens = normalizePrices(records);
    if (tokens.length < 2) throw new Error("Price feed returned fewer than two usable tokens");
    return { tokens, usedFallback: false, error: null };
  } catch (error) {
    return { tokens: [...FALLBACK_TOKENS], usedFallback: true, error: error instanceof Error ? error : new Error("Price loading failed") };
  }
}
