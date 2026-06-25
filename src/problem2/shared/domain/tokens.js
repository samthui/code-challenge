export const TOKEN_SYMBOLS = Object.freeze({
  USD: "USD",
  USDC: "USDC",
  ETH: "ETH",
  WBTC: "WBTC",
  ATOM: "ATOM",
  OSMO: "OSMO",
  SWTH: "SWTH"
});

export const ERROR_MESSAGES = Object.freeze({
  invalidAmount: "Enter an amount greater than 0.",
  sameToken: "Choose two different tokens.",
  missingPrice: "Price data is unavailable for this pair."
});

export const QUOTE_SETTINGS = Object.freeze({
  simulatedFeeUsd: 1.25,
  slippageRate: 0.005
});

export const TOKEN_PRIORITY = Object.freeze(Object.values(TOKEN_SYMBOLS));

export const FALLBACK_TOKENS = Object.freeze([
  { symbol: TOKEN_SYMBOLS.USD, price: 1, date: "2023-08-29T07:10:30.000Z" },
  { symbol: TOKEN_SYMBOLS.USDC, price: 1, date: "2023-08-29T07:10:30.000Z" },
  { symbol: TOKEN_SYMBOLS.ETH, price: 1645.9337373737374, date: "2023-08-29T07:10:52.000Z" },
  { symbol: TOKEN_SYMBOLS.WBTC, price: 26002.82202020202, date: "2023-08-29T07:10:52.000Z" },
  { symbol: TOKEN_SYMBOLS.ATOM, price: 7.186657333333334, date: "2023-08-29T07:10:50.000Z" },
  { symbol: TOKEN_SYMBOLS.OSMO, price: 0.3772974333333333, date: "2023-08-29T07:10:50.000Z" },
  { symbol: TOKEN_SYMBOLS.SWTH, price: 0.004039850455012084, date: "2023-08-29T07:10:45.000Z" }
]);
