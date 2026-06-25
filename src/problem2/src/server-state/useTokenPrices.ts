import { APP_CONFIG } from "../composition/appConfig";
import { createTokenPricesResourceHook } from "./tokenPricesResourceFactory";
import type { ServerStateLibrary } from "../composition/appConfig";
import type { PriceRepository } from "../application/ports/PriceRepository";
import type { TokenPricesResource } from "./ports/tokenPricesResource";

export function useTokenPrices(
  priceRepository: PriceRepository,
  library: ServerStateLibrary | string = APP_CONFIG.serverStateLibrary
): TokenPricesResource {
  const useTokenPricesAdapter = createTokenPricesResourceHook(library);
  return useTokenPricesAdapter(priceRepository);
}
