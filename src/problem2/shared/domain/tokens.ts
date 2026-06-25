export const TOKEN_SYMBOLS = {
  USD: "USD",
  USDC: "USDC",
  ETH: "ETH",
  WBTC: "WBTC",
  ATOM: "ATOM",
  OSMO: "OSMO",
  SWTH: "SWTH"
} as const;

export type TokenSymbol = (typeof TOKEN_SYMBOLS)[keyof typeof TOKEN_SYMBOLS];

export const ERROR_MESSAGES = {
  invalidAmount: "Enter an amount greater than 0.",
  sameToken: "Choose two different tokens.",
  missingPrice: "Price data is unavailable for this pair."
} as const;

export const QUOTE_SETTINGS = {
  simulatedFeeUsd: 1.25,
  slippageRate: 0.005
} as const;

export interface TokenPrice {
  symbol: string;
  price: number;
  date: string;
}

export interface RawPriceRecord {
  currency?: string;
  symbol?: string;
  price?: number | string;
  date?: string;
}

export const TOKEN_PRIORITY: string[] = Object.values(TOKEN_SYMBOLS);

export const FALLBACK_TOKENS: TokenPrice[] = [
  { symbol: TOKEN_SYMBOLS.USD, price: 1, date: "2023-08-29T07:10:30.000Z" },
  { symbol: TOKEN_SYMBOLS.USDC, price: 1, date: "2023-08-29T07:10:30.000Z" },
  { symbol: TOKEN_SYMBOLS.ETH, price: 1645.9337373737374, date: "2023-08-29T07:10:52.000Z" },
  { symbol: TOKEN_SYMBOLS.WBTC, price: 26002.82202020202, date: "2023-08-29T07:10:52.000Z" },
  { symbol: TOKEN_SYMBOLS.ATOM, price: 7.186657333333334, date: "2023-08-29T07:10:50.000Z" },
  { symbol: TOKEN_SYMBOLS.OSMO, price: 0.3772974333333333, date: "2023-08-29T07:10:50.000Z" },
  { symbol: TOKEN_SYMBOLS.SWTH, price: 0.004039850455012084, date: "2023-08-29T07:10:45.000Z" }
];
