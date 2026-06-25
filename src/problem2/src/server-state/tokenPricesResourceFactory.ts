import { APP_CONFIG, SERVER_STATE_LIBRARIES } from "../composition/appConfig";
import type { ServerStateLibrary } from "../composition/appConfig";
import { useTokenPricesPlain } from "./plain/useTokenPricesPlain";
import { useTokenPricesSWR } from "./swr/useTokenPricesSWR";
import { useTokenPricesQuery } from "./tanstack/useTokenPricesQuery";
import type { TokenPricesResourceHook } from "./ports/tokenPricesResource";

type TokenPricesResourceHookFactory = () => TokenPricesResourceHook;

const tokenPriceHookFactories: Record<ServerStateLibrary, TokenPricesResourceHookFactory> = Object.freeze({
  [SERVER_STATE_LIBRARIES.plain]: () => useTokenPricesPlain,
  [SERVER_STATE_LIBRARIES.swr]: () => useTokenPricesSWR,
  [SERVER_STATE_LIBRARIES.tanstack]: () => useTokenPricesQuery
});

export function assertTokenPricesResourceHook(hook: unknown): TokenPricesResourceHook {
  if (typeof hook !== "function") {
    throw new TypeError("TokenPricesResourceHook must be a hook function.");
  }
  return hook as TokenPricesResourceHook;
}

export function createTokenPricesResourceHook(library: string = APP_CONFIG.serverStateLibrary): TokenPricesResourceHook {
  const createHook = tokenPriceHookFactories[library as ServerStateLibrary];
  if (!createHook) {
    throw new Error(`Unsupported server-state library: ${library}`);
  }
  return assertTokenPricesResourceHook(createHook());
}
