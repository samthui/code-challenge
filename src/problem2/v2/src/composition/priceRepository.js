import { createSwitcheoPriceRepository } from "../../../shared/infrastructure/switcheoPriceRepository.js";
import { createBrowserJsonClient } from "./httpClient.js";

export function createPriceRepository({ httpClientType } = {}) {
  return createSwitcheoPriceRepository(createBrowserJsonClient(httpClientType));
}
