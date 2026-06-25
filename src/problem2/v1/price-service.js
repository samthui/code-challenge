(function attachPriceService(root, factory) {
  const constants = typeof require === "function" ? require("./swap-constants.js") : root.SwapConstants;
  const core = typeof require === "function" ? require("./swap-core.js") : root.SwapCore;
  const service = factory(constants, core);
  if (typeof module === "object" && module.exports) module.exports = service;
  root.PriceService = service;
})(typeof globalThis !== "undefined" ? globalThis : window, function createPriceService(constants, core) {
  const { CONFIG, FALLBACK_TOKENS } = constants;

  async function loadTokens(requestClient) {
    try {
      const records = await requestClient.getJson(CONFIG.priceUrl, {
        cacheKey: CONFIG.cacheKey,
        cacheTtlMs: CONFIG.cacheTtlMs,
        retries: CONFIG.requestRetries,
        timeoutMs: CONFIG.requestTimeoutMs
      });
      const tokens = core.normalizePrices(records);
      if (tokens.length < 2) throw new Error("Price feed returned fewer than two usable tokens");
      return { tokens, usedFallback: false };
    } catch (error) {
      return { tokens: [...FALLBACK_TOKENS], usedFallback: true };
    }
  }

  return { loadTokens };
});
