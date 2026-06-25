import { TOKEN_SYMBOLS } from "../domain/tokens";

export function formatAmount(value: number, maximumFractionDigits = 6): string {
  if (!Number.isFinite(value)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
    maximumFractionDigits
  }).format(value);
}

export function normalizeEditableAmountInput(value: string): string {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  const [integerPart = "", ...decimalParts] = cleaned.split(".");
  const decimalPart = decimalParts.join("");
  return decimalParts.length > 0 ? `${integerPart}.${decimalPart}` : integerPart;
}

export function formatEditableAmount(value: string): string {
  const normalized = normalizeEditableAmountInput(value);
  if (!normalized) return "";

  const hasTrailingDecimal = normalized.endsWith(".");
  const [integerPart = "", decimalPart] = normalized.split(".");
  const groupedInteger = integerPart
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(integerPart))
    : "0";

  if (hasTrailingDecimal) return `${groupedInteger}.`;
  if (decimalPart !== undefined) return `${groupedInteger}.${decimalPart}`;
  return groupedInteger;
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
