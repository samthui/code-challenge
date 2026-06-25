import type { PriceRepository } from "../application/ports/PriceRepository";
import type { JsonClient } from "./http/jsonClient";

export const PRICE_CONFIG = Object.freeze({
  priceUrl: "https://interview.switcheo.com/prices.json",
  cacheKey: "problem2:v2:prices",
  cacheTtlMs: 5 * 60 * 1000,
  requestRetries: 2,
  requestTimeoutMs: 5000
});

type PriceConfig = typeof PRICE_CONFIG;

export function createSwitcheoPriceRepository(requestClient: JsonClient, config: PriceConfig = PRICE_CONFIG): PriceRepository {
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
