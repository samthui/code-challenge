import { createSwitcheoPriceRepository } from "../../../shared/infrastructure/switcheoPriceRepository";
import { createBrowserJsonClient } from "./httpClient";
import type { JsonClientType } from "../../../shared/infrastructure/http/jsonClient";
import type { PriceRepository } from "../../../shared/application/ports/PriceRepository";

interface CreatePriceRepositoryOptions {
  httpClientType?: JsonClientType;
}

export function createPriceRepository({ httpClientType }: CreatePriceRepositoryOptions = {}): PriceRepository {
  return createSwitcheoPriceRepository(createBrowserJsonClient(httpClientType));
}
