import type { RawPriceRecord } from "../../domain/tokens";

export interface PriceRepository {
  getPrices(): Promise<RawPriceRecord[]>;
}
