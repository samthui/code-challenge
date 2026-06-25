export const PRICE_CONFIG = Object.freeze({
  priceUrl: "https://interview.switcheo.com/prices.json",
  cacheKey: "problem2:v2:prices",
  cacheTtlMs: 5 * 60 * 1000,
  requestRetries: 2,
  requestTimeoutMs: 5000
});

export function createSwitcheoPriceRepository(requestClient, config = PRICE_CONFIG) {
  return {
    async getPrices() {
      return requestClient.getJson(config.priceUrl, {
        cacheKey: config.cacheKey,
        cacheTtlMs: config.cacheTtlMs,
        retries: config.requestRetries,
        timeoutMs: config.requestTimeoutMs
      });
    }
  };
}
