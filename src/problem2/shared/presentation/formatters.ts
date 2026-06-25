import { TOKEN_SYMBOLS } from "../domain/tokens";

export function formatAmount(value: number, maximumFractionDigits = 6): string {
  if (!Number.isFinite(value)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
    maximumFractionDigits
  }).format(value);
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: TOKEN_SYMBOLS.USD,
    minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
    maximumFractionDigits: value > 0 && value < 0.01 ? 5 : 2
  }).format(value);
}
