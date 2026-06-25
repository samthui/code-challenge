import { APP_CONFIG } from "../composition/appConfig.js";
import { createTokenPricesResourceHook } from "./tokenPricesResourceFactory.js";

export function useTokenPrices(priceRepository, library = APP_CONFIG.serverStateLibrary) {
  const useTokenPricesAdapter = createTokenPricesResourceHook(library);
  return useTokenPricesAdapter(priceRepository);
}
