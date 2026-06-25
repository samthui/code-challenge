import { APP_CONFIG, SERVER_STATE_LIBRARIES } from "../composition/appConfig.js";
import { useTokenPricesPlain } from "./plain/useTokenPricesPlain.js";
import { useTokenPricesSWR } from "./swr/useTokenPricesSWR.js";
import { useTokenPricesQuery } from "./tanstack/useTokenPricesQuery.js";

/**
 * @typedef {(priceRepository: { getPrices: () => Promise<unknown[]> }) => {
 *   error: Error | null,
 *   isLoading: boolean,
 *   refetch: Function,
 *   tokens: Array,
 *   usedFallback: boolean
 * }} TokenPricesResourceHook
 */

const tokenPriceHookFactories = Object.freeze({
  [SERVER_STATE_LIBRARIES.plain]: () => useTokenPricesPlain,
  [SERVER_STATE_LIBRARIES.swr]: () => useTokenPricesSWR,
  [SERVER_STATE_LIBRARIES.tanstack]: () => useTokenPricesQuery
});

export function assertTokenPricesResourceHook(hook) {
  if (typeof hook !== "function") {
    throw new TypeError("TokenPricesResourceHook must be a hook function.");
  }
  return hook;
}

export function createTokenPricesResourceHook(library = APP_CONFIG.serverStateLibrary) {
  const createHook = tokenPriceHookFactories[library];
  if (!createHook) {
    throw new Error(`Unsupported server-state library: ${library}`);
  }
  return assertTokenPricesResourceHook(createHook());
}
