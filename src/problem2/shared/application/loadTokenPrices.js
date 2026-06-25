import { FALLBACK_TOKENS } from "../domain/tokens.js";
import { normalizePrices } from "../domain/quote.js";

export async function loadTokenPrices(repository) {
  try {
    const records = await repository.getPrices();
    const tokens = normalizePrices(records);
    if (tokens.length < 2) throw new Error("Price feed returned fewer than two usable tokens");
    return { tokens, usedFallback: false, error: null };
  } catch (error) {
    return { tokens: [...FALLBACK_TOKENS], usedFallback: true, error };
  }
}
