import { FALLBACK_TOKENS } from "../../../../shared/domain/tokens.js";

export const EMPTY_TOKEN_PRICES_RESOURCE = Object.freeze({
  error: null,
  isLoading: true,
  refetch: async () => undefined,
  tokens: FALLBACK_TOKENS,
  usedFallback: true
});
