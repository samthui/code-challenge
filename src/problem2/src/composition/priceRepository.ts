import { createSwitcheoPriceRepository } from "../infrastructure/switcheoPriceRepository";
import { createBrowserJsonClient } from "./httpClient";
import type { JsonClientType } from "../infrastructure/http/jsonClient";
import type { PriceRepository } from "../application/ports/PriceRepository";

interface CreatePriceRepositoryOptions {
  httpClientType?: JsonClientType;
}

export function createPriceRepository({ httpClientType }: CreatePriceRepositoryOptions = {}): PriceRepository {
  return createSwitcheoPriceRepository(createBrowserJsonClient(httpClientType));
}
