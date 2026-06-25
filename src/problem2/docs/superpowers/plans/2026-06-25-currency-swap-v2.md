# Currency Swap Form V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the Vite + React currency swap form in `src/problem2/v2/` while extracting stable reusable logic into `src/problem2/shared/`.

**Architecture:** V2 uses a light clean-architecture boundary. Shared domain/application/infrastructure/presentation modules stay framework-agnostic and are tested first. React components and hooks in `v2/src/` consume shared modules through narrow interfaces, keeping server/cache data in `useTokenPrices`, local form state in `useSwapForm`, and quote output derived through `createSwapViewModel`.

**Tech Stack:** Vite, React, vanilla CSS, Node tests for shared modules, Vitest + React Testing Library when dependencies install successfully, Switcheo price JSON, token SVG URLs.

---

## Execution Notes

- Do not modify `src/problem2/v1/`.
- Do not commit; the user will manually commit when finished.
- If package installation fails because of network restrictions, rerun the install command with approval.
- If browser automation is unavailable, document the visual verification gap and run Vite build plus available tests.
- Keep the request library swappable through the repository/request-client boundary. Components must not call `fetch` directly.

## File Structure

Create:

```text
src/problem2/shared/
  package.json
  domain/
    quote.js
    quote.test.js
    tokens.js
    validation.js
  application/
    loadTokenPrices.js
  infrastructure/
    requestClient.js
    requestClient.test.js
    switcheoPriceRepository.js
  presentation/
    createSwapViewModel.js
    createSwapViewModel.test.js
    formatters.js
    tokenIcons.js
    uiText.js

src/problem2/v2/
  README.md
  index.html
  package.json
  package-lock.json
  vite.config.js
  src/
    App.jsx
    App.test.jsx
    main.jsx
    styles.css
    components/
      AssetInput.jsx
      QuoteSummary.jsx
      SwapForm.jsx
      TokenSelect.jsx
    hooks/
      useSwapForm.js
      useTokenPrices.js
```

React behavior tests live in `src/problem2/v2/src/App.test.jsx` after Vite dependencies are installed.

---

## Task 1: TDD Shared Domain And Presentation Modules

**Files:**
- Create: `src/problem2/shared/package.json`
- Create: `src/problem2/shared/domain/tokens.js`
- Create: `src/problem2/shared/domain/validation.js`
- Create: `src/problem2/shared/domain/quote.js`
- Create: `src/problem2/shared/domain/quote.test.js`
- Create: `src/problem2/shared/presentation/formatters.js`
- Create: `src/problem2/shared/presentation/uiText.js`

- [x] **Step 1: Create the shared ESM package marker**

Create `src/problem2/shared/package.json`:

```json
{
  "type": "module"
}
```

- [x] **Step 2: Write failing domain tests**

Create `src/problem2/shared/domain/quote.test.js`:

```js
import assert from "node:assert/strict";
import { ERROR_MESSAGES, TOKEN_SYMBOLS } from "./tokens.js";
import { calculateQuote, normalizePrices } from "./quote.js";
import { formatAmount, formatUsd } from "../presentation/formatters.js";

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("normalizePrices keeps the newest valid positive price per token", () => {
  const result = normalizePrices([
    { currency: "eth", price: 1400, date: "2023-08-29T07:00:00.000Z" },
    { currency: "ETH", price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
    { currency: "BAD", price: 0, date: "2023-08-29T07:10:00.000Z" },
    { currency: "", price: 1, date: "2023-08-29T07:10:00.000Z" }
  ]);

  assert.deepEqual(result, [
    { symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" }
  ]);
});

test("calculateQuote returns an indicative USD cross-rate quote", () => {
  const quote = calculateQuote({
    amount: "2",
    fromSymbol: TOKEN_SYMBOLS.ETH,
    toSymbol: TOKEN_SYMBOLS.USDC,
    tokens: [
      { symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
      { symbol: TOKEN_SYMBOLS.USDC, price: 1, date: "2023-08-29T07:10:00.000Z" }
    ],
    simulatedFeeUsd: 1.25,
    slippageRate: 0.005
  });

  assert.equal(quote.isValid, true);
  assert.equal(quote.fromUsd, 3291.86);
  assert.equal(quote.toAmount, 3291.86);
  assert.equal(quote.rate, 1645.93);
  assert.equal(Number(quote.minimumReceived.toFixed(6)), 3274.1507);
});

test("calculateQuote reports validation errors instead of NaN output", () => {
  const tokens = [
    { symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
    { symbol: TOKEN_SYMBOLS.USDC, price: 1, date: "2023-08-29T07:10:00.000Z" }
  ];

  assert.deepEqual(
    calculateQuote({ amount: "0", fromSymbol: TOKEN_SYMBOLS.ETH, toSymbol: TOKEN_SYMBOLS.USDC, tokens }).errors,
    [ERROR_MESSAGES.invalidAmount]
  );
  assert.deepEqual(
    calculateQuote({ amount: "1", fromSymbol: TOKEN_SYMBOLS.ETH, toSymbol: TOKEN_SYMBOLS.ETH, tokens }).errors,
    [ERROR_MESSAGES.sameToken]
  );
  assert.deepEqual(
    calculateQuote({
      amount: "1",
      fromSymbol: TOKEN_SYMBOLS.ETH,
      toSymbol: TOKEN_SYMBOLS.USDC,
      tokens: [{ symbol: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" }]
    }).errors,
    [ERROR_MESSAGES.missingPrice]
  );
});

test("formatters preserve crypto precision and USD readability", () => {
  assert.equal(formatAmount(0.004039850455012084, 8), "0.00403985");
  assert.equal(formatAmount(1645.9337373737374, 8), "1,645.93373737");
  assert.equal(formatUsd(1645.9337373737374), "$1,645.93");
  assert.equal(formatUsd(0.004039850455012084), "$0.00404");
});
```

- [x] **Step 3: Verify RED**

Run:

```bash
node src/problem2/shared/domain/quote.test.js
```

Expected: FAIL because shared modules do not exist yet.

- [x] **Step 4: Implement constants, validation, quote, and formatting modules**

Create `src/problem2/shared/domain/tokens.js`:

```js
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
```

Create `src/problem2/shared/domain/validation.js`:

```js
import { ERROR_MESSAGES } from "./tokens.js";

export function getToken(tokens, symbol) {
  return tokens.find((token) => token.symbol === symbol);
}

export function validateQuoteInput({ amount, fromSymbol, toSymbol, tokens }) {
  const numericAmount = Number(amount);
  const fromToken = getToken(tokens, fromSymbol);
  const toToken = getToken(tokens, toSymbol);
  const errors = [];

  if (String(amount || "").trim() === "" || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    errors.push(ERROR_MESSAGES.invalidAmount);
  }
  if (fromSymbol === toSymbol) errors.push(ERROR_MESSAGES.sameToken);
  if (!fromToken || !toToken) errors.push(ERROR_MESSAGES.missingPrice);

  return { errors, fromToken, numericAmount, toToken };
}
```

Create `src/problem2/shared/domain/quote.js`:

```js
import { QUOTE_SETTINGS, TOKEN_PRIORITY } from "./tokens.js";
import { validateQuoteInput } from "./validation.js";

export function normalizePrices(records) {
  const bySymbol = new Map();

  records.forEach((record) => {
    const rawSymbol = String(record.currency || "").trim();
    const price = Number(record.price);
    const date = new Date(record.date || 0);
    if (!rawSymbol || !Number.isFinite(price) || price <= 0 || Number.isNaN(date.getTime())) return;

    const symbol = rawSymbol.toUpperCase();
    const current = bySymbol.get(symbol);
    if (!current || date > new Date(current.date)) {
      bySymbol.set(symbol, { symbol, price, date: date.toISOString() });
    }
  });

  return [...bySymbol.values()].sort((a, b) => {
    const aIndex = TOKEN_PRIORITY.indexOf(a.symbol);
    const bIndex = TOKEN_PRIORITY.indexOf(b.symbol);
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }
    return a.symbol.localeCompare(b.symbol);
  });
}

export function calculateQuote(options) {
  const tokens = Array.isArray(options.tokens) ? options.tokens : [];
  const { errors, fromToken, numericAmount, toToken } = validateQuoteInput({ ...options, tokens });
  const simulatedFeeUsd = Number.isFinite(options.simulatedFeeUsd)
    ? options.simulatedFeeUsd
    : QUOTE_SETTINGS.simulatedFeeUsd;
  const slippageRate = Number.isFinite(options.slippageRate)
    ? options.slippageRate
    : QUOTE_SETTINGS.slippageRate;

  if (errors.length > 0) {
    return { isValid: false, errors, fromUsd: 0, toAmount: 0, toUsd: 0, rate: 0, minimumReceived: 0 };
  }

  const fromUsd = numericAmount * fromToken.price;
  const toAmount = fromUsd / toToken.price;
  const rate = fromToken.price / toToken.price;
  const feeInToToken = simulatedFeeUsd / toToken.price;
  const minimumReceived = Math.max(toAmount * (1 - slippageRate) - feeInToToken, 0);

  return { isValid: true, errors, fromUsd, toAmount, toUsd: toAmount * toToken.price, rate, minimumReceived };
}
```

Create `src/problem2/shared/presentation/formatters.js`:

```js
import { TOKEN_SYMBOLS } from "../domain/tokens.js";

export function formatAmount(value, maximumFractionDigits = 6) {
  if (!Number.isFinite(value)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
    maximumFractionDigits
  }).format(value);
}

export function formatUsd(value) {
  if (!Number.isFinite(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: TOKEN_SYMBOLS.USD,
    minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
    maximumFractionDigits: value > 0 && value < 0.01 ? 5 : 2
  }).format(value);
}
```

Create `src/problem2/shared/presentation/uiText.js`:

```js
export const UI_TEXT = Object.freeze({
  loadingPrices: "Loading prices",
  livePrices: "Live prices",
  fallbackPrices: "Fallback prices",
  enterAmount: "Enter an amount",
  confirmSwap: "Confirm swap",
  confirming: "Confirming...",
  successPrefix: "Swap preview ready"
});
```

- [x] **Step 5: Verify GREEN**

Run:

```bash
node src/problem2/shared/domain/quote.test.js
```

Expected: all tests print `PASS`.

---

## Task 2: TDD Infrastructure And Price Loading

**Files:**
- Create: `src/problem2/shared/infrastructure/requestClient.js`
- Create: `src/problem2/shared/infrastructure/requestClient.test.js`
- Create: `src/problem2/shared/infrastructure/switcheoPriceRepository.js`
- Create: `src/problem2/shared/application/loadTokenPrices.js`

- [x] **Step 1: Write failing infrastructure tests**

Create `src/problem2/shared/infrastructure/requestClient.test.js`:

```js
import assert from "node:assert/strict";
import { createJsonRequestClient } from "./requestClient.js";

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value)
  };
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("getJson caches a successful response", async () => {
  let calls = 0;
  const client = createJsonRequestClient({
    fetchImpl: async () => {
      calls += 1;
      return { ok: true, json: async () => [{ currency: "ETH", price: 1 }] };
    },
    storage: createStorage(),
    now: () => 1000
  });

  await client.getJson("https://example.test/prices", { cacheKey: "prices", cacheTtlMs: 10000 });
  await client.getJson("https://example.test/prices", { cacheKey: "prices", cacheTtlMs: 10000 });

  assert.equal(calls, 1);
});

test("getJson retries failed responses", async () => {
  let calls = 0;
  const client = createJsonRequestClient({
    fetchImpl: async () => {
      calls += 1;
      return { ok: calls === 2, status: calls === 2 ? 200 : 500, json: async () => ({ ok: true }) };
    },
    storage: createStorage(),
    now: () => 1000
  });

  const result = await client.getJson("https://example.test/prices", { retries: 1, timeoutMs: 1000 });
  assert.deepEqual(result, { ok: true });
  assert.equal(calls, 2);
});

test("getJson aborts timed out requests", async () => {
  let capturedSignal;
  const client = createJsonRequestClient({
    fetchImpl: async (url, options = {}) => {
      capturedSignal = options.signal;
      assert.ok(capturedSignal instanceof AbortSignal);

      return new Promise((resolve, reject) => {
        capturedSignal.addEventListener(
          "abort",
          () => reject(capturedSignal.reason || new Error("Request aborted")),
          { once: true }
        );
      });
    },
    storage: createStorage(),
    now: () => 1000
  });

  await assert.rejects(
    client.getJson("https://example.test/prices", { timeoutMs: 1 }),
    /abort|timeout/i
  );
  assert.equal(capturedSignal.aborted, true);
});
```

- [x] **Step 2: Verify RED**

Run:

```bash
node src/problem2/shared/infrastructure/requestClient.test.js
```

Expected: FAIL because `requestClient.js` does not exist.

- [x] **Step 3: Implement request client and repository**

Create `src/problem2/shared/infrastructure/requestClient.js`:

```js
function readCache(storage, cacheKey, now, cacheTtlMs) {
  if (!storage || !cacheKey || !cacheTtlMs) return null;
  const cached = storage.getItem(cacheKey);
  if (!cached) return null;
  const parsed = JSON.parse(cached);
  if (now() - parsed.savedAt > cacheTtlMs) return null;
  return parsed.value;
}

function writeCache(storage, cacheKey, now, value) {
  if (!storage || !cacheKey) return;
  storage.setItem(cacheKey, JSON.stringify({ savedAt: now(), value }));
}

function createFetchOptions(timeoutMs) {
  if (!Number.isFinite(timeoutMs)) return { options: undefined, clear: () => {} };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    const error = new Error(`Request timed out after ${timeoutMs}ms`);
    error.name = "TimeoutError";
    controller.abort(error);
  }, timeoutMs);

  return {
    options: { signal: controller.signal },
    clear: () => clearTimeout(timeoutId)
  };
}

export function createJsonRequestClient({ fetchImpl, storage, now = Date.now }) {
  async function getJson(url, options = {}) {
    const cached = readCache(storage, options.cacheKey, now, options.cacheTtlMs);
    if (cached) return cached;

    const retries = Number.isFinite(options.retries) ? options.retries : 0;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const request = createFetchOptions(options.timeoutMs);
      try {
        const response = await fetchImpl(url, request.options);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const value = await response.json();
        writeCache(storage, options.cacheKey, now, value);
        return value;
      } catch (error) {
        lastError = error;
      } finally {
        request.clear();
      }
    }
    throw lastError;
  }

  return { getJson };
}
```

Create `src/problem2/shared/infrastructure/switcheoPriceRepository.js`:

```js
export const PRICE_CONFIG = Object.freeze({
  priceUrl: "https://interview.switcheo.com/prices.json",
  iconBaseUrl: "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens",
  cacheKey: "problem2:v2:prices",
  cacheTtlMs: 5 * 60 * 1000,
  requestRetries: 2,
  requestTimeoutMs: 5000
});

export function createSwitcheoPriceRepository(requestClient, config = PRICE_CONFIG) {
  return {
    async getPriceRecords() {
      return requestClient.getJson(config.priceUrl, {
        cacheKey: config.cacheKey,
        cacheTtlMs: config.cacheTtlMs,
        retries: config.requestRetries,
        timeoutMs: config.requestTimeoutMs
      });
    },
    getTokenIconUrl(symbol) {
      return `${config.iconBaseUrl}/${encodeURIComponent(symbol)}.svg`;
    }
  };
}
```

Create `src/problem2/shared/application/loadTokenPrices.js`:

```js
import { FALLBACK_TOKENS } from "../domain/tokens.js";
import { normalizePrices } from "../domain/quote.js";

export async function loadTokenPrices(priceRepository) {
  try {
    const records = await priceRepository.getPriceRecords();
    const tokens = normalizePrices(records);
    if (tokens.length < 2) throw new Error("Price feed returned fewer than two usable tokens");
    return { tokens, usedFallback: false, error: null };
  } catch (error) {
    return { tokens: [...FALLBACK_TOKENS], usedFallback: true, error };
  }
}
```

- [x] **Step 4: Verify GREEN**

Run:

```bash
node src/problem2/shared/infrastructure/requestClient.test.js
```

Expected: tests print `PASS`.

---

## Task 3: TDD Presentation View Model

**Files:**
- Create: `src/problem2/shared/presentation/createSwapViewModel.js`
- Create: `src/problem2/shared/presentation/createSwapViewModel.test.js`

- [x] **Step 1: Write failing application tests**

Create `src/problem2/shared/presentation/createSwapViewModel.test.js`:

```js
import assert from "node:assert/strict";
import { createSwapViewModel } from "./createSwapViewModel.js";
import { FALLBACK_TOKENS, TOKEN_SYMBOLS } from "../domain/tokens.js";
import { UI_TEXT } from "../presentation/uiText.js";

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("createSwapViewModel maps valid quote state for display", () => {
  const model = createSwapViewModel({
    amount: "1",
    fromSymbol: TOKEN_SYMBOLS.ETH,
    toSymbol: TOKEN_SYMBOLS.USDC,
    tokens: FALLBACK_TOKENS,
    isSubmitting: false,
    successMessage: "",
    usedFallback: false
  });

  assert.equal(model.confirmDisabled, false);
  assert.equal(model.marketStatus, UI_TEXT.livePrices);
  assert.match(model.toAmount, /1,645/);
  assert.match(model.quoteRate, /1 ETH =/);
});

test("createSwapViewModel maps validation and fallback state", () => {
  const model = createSwapViewModel({
    amount: "0",
    fromSymbol: TOKEN_SYMBOLS.ETH,
    toSymbol: TOKEN_SYMBOLS.USDC,
    tokens: FALLBACK_TOKENS,
    isSubmitting: false,
    successMessage: "",
    usedFallback: true
  });

  assert.equal(model.confirmDisabled, true);
  assert.equal(model.marketStatus, UI_TEXT.fallbackPrices);
  assert.equal(model.amountError, "Enter an amount greater than 0.");
});
```

- [x] **Step 2: Verify RED**

Run:

```bash
node src/problem2/shared/presentation/createSwapViewModel.test.js
```

Expected: FAIL because `createSwapViewModel.js` does not exist.

- [x] **Step 3: Implement view model**

Create `src/problem2/shared/presentation/createSwapViewModel.js`:

```js
import { calculateQuote } from "../domain/quote.js";
import { ERROR_MESSAGES, QUOTE_SETTINGS } from "../domain/tokens.js";
import { formatAmount, formatUsd } from "../presentation/formatters.js";
import { UI_TEXT } from "../presentation/uiText.js";

export function createSwapViewModel(state) {
  const quote = calculateQuote({
    amount: state.amount,
    fromSymbol: state.fromSymbol,
    toSymbol: state.toSymbol,
    tokens: state.tokens,
    simulatedFeeUsd: QUOTE_SETTINGS.simulatedFeeUsd,
    slippageRate: QUOTE_SETTINGS.slippageRate
  });

  const fromToken = state.tokens.find((token) => token.symbol === state.fromSymbol);
  const toToken = state.tokens.find((token) => token.symbol === state.toSymbol);
  const amountError = quote.errors.find((error) => error === ERROR_MESSAGES.invalidAmount) || "";
  const pairError = quote.errors.find((error) => error !== ERROR_MESSAGES.invalidAmount) || "";

  return {
    quote,
    toAmount: quote.isValid ? formatAmount(quote.toAmount, 8) : "",
    amountError,
    formMessage: state.successMessage || pairError,
    isSuccess: Boolean(state.successMessage),
    confirmDisabled: !quote.isValid || state.isSubmitting,
    confirmText: state.isSubmitting ? UI_TEXT.confirming : UI_TEXT.confirmSwap,
    marketStatus: state.usedFallback ? UI_TEXT.fallbackPrices : UI_TEXT.livePrices,
    quoteRate: quote.isValid && fromToken && toToken
      ? `1 ${fromToken.symbol} = ${formatAmount(quote.rate, 8)} ${toToken.symbol}`
      : UI_TEXT.enterAmount,
    quoteFee: formatUsd(QUOTE_SETTINGS.simulatedFeeUsd),
    quoteMinimum: quote.isValid && toToken ? `${formatAmount(quote.minimumReceived, 8)} ${toToken.symbol}` : "0.00",
    fromUsdValue: quote.isValid ? formatUsd(quote.fromUsd) : "$0.00",
    toUsdValue: quote.isValid ? formatUsd(quote.toUsd) : "$0.00"
  };
}
```

- [x] **Step 4: Verify GREEN**

Run:

```bash
node src/problem2/shared/presentation/createSwapViewModel.test.js
```

Expected: tests print `PASS`.

---

## Task 4: Scaffold Vite React App

**Files:**
- Create: `src/problem2/v2/package.json`
- Create: `src/problem2/v2/index.html`
- Create: `src/problem2/v2/vite.config.js`
- Create: `src/problem2/v2/src/main.jsx`
- Create: `src/problem2/v2/src/App.jsx`
- Create: `src/problem2/v2/src/styles.css`

- [x] **Step 1: Create package and Vite config**

Create `src/problem2/v2/package.json`:

```json
{
  "name": "currency-swap-v2",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "test": "vitest run",
    "test:shared": "node ../shared/domain/quote.test.js && node ../shared/infrastructure/requestClient.test.js && node ../shared/presentation/createSwapViewModel.test.js"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

Create `src/problem2/v2/vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true
  }
});
```

- [x] **Step 2: Create React entry files**

Create `src/problem2/v2/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Currency Swap V2</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Create `src/problem2/v2/src/main.jsx`:

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/problem2/v2/src/App.jsx`:

```jsx
import { SwapForm } from "./components/SwapForm.jsx";

export default function App() {
  return (
    <main className="app-shell">
      <SwapForm />
    </main>
  );
}
```

Create `src/problem2/v2/src/styles.css` with initial base styles:

```css
:root {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #0d1117;
  color: #eef4ff;
}

* {
  box-sizing: border-box;
}

body {
  min-width: 360px;
  min-height: 100vh;
  margin: 0;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
}
```

- [x] **Step 3: Install dependencies**

Run:

```bash
cd src/problem2/v2
npm install
```

Expected: dependencies install and create `package-lock.json`. If this fails due to network restrictions, rerun with approval.

---

## Task 5: Implement React Hooks And Components With Behavior Tests

**Files:**
- Create: `src/problem2/v2/src/hooks/useTokenPrices.js`
- Create: `src/problem2/v2/src/hooks/useSwapForm.js`
- Create: `src/problem2/v2/src/components/TokenSelect.jsx`
- Create: `src/problem2/v2/src/components/AssetInput.jsx`
- Create: `src/problem2/v2/src/components/QuoteSummary.jsx`
- Create: `src/problem2/v2/src/components/SwapForm.jsx`
- Create: `src/problem2/v2/src/App.test.jsx`

- [x] **Step 1: Write failing React behavior test**

Create `src/problem2/v2/src/App.test.jsx`:

```jsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App.jsx";

describe("Currency Swap V2", () => {
  it("quotes, validates, swaps, and submits", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => [
        { currency: "ETH", price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
        { currency: "USDC", price: 1, date: "2023-08-29T07:10:00.000Z" },
        { currency: "USD", price: 1, date: "2023-08-29T07:10:00.000Z" }
      ]
    })));

    render(<App />);

    const user = userEvent.setup();
    const amount = await screen.findByLabelText(/amount to send/i);
    await user.type(amount, "1");

    expect(await screen.findByDisplayValue(/1,645.93/)).toBeTruthy();

    await user.selectOptions(screen.getByLabelText(/token to receive/i), "ETH");
    expect(screen.getByText("Choose two different tokens.")).toBeTruthy();

    await user.selectOptions(screen.getByLabelText(/token to receive/i), "USDC");
    await user.click(screen.getByRole("button", { name: /confirm swap/i }));

    await waitFor(() => {
      expect(screen.getByText(/Swap preview ready/i)).toBeTruthy();
    });
  });
});
```

- [x] **Step 2: Verify RED**

Run:

```bash
cd src/problem2/v2
npm test
```

Expected: FAIL because hooks/components do not exist or behavior is not implemented.

- [x] **Step 3: Implement hooks**

Create `src/problem2/v2/src/hooks/useTokenPrices.js`:

```jsx
import { useEffect, useMemo, useState } from "react";
import { loadTokenPrices } from "../../../shared/application/loadTokenPrices.js";
import { createJsonRequestClient } from "../../../shared/infrastructure/requestClient.js";
import { createSwitcheoPriceRepository } from "../../../shared/infrastructure/switcheoPriceRepository.js";

export function useTokenPrices() {
  const [state, setState] = useState({ tokens: [], isLoading: true, usedFallback: false, error: null });

  const repository = useMemo(() => {
    const requestClient = createJsonRequestClient({
      fetchImpl: window.fetch.bind(window),
      storage: window.localStorage,
      now: Date.now
    });
    return createSwitcheoPriceRepository(requestClient);
  }, []);

  useEffect(() => {
    let isActive = true;
    setState((current) => ({ ...current, isLoading: true }));

    loadTokenPrices(repository).then((result) => {
      if (!isActive) return;
      setState({ tokens: result.tokens, isLoading: false, usedFallback: result.usedFallback, error: result.error });
    });

    return () => {
      isActive = false;
    };
  }, [repository]);

  return state;
}
```

Create `src/problem2/v2/src/hooks/useSwapForm.js`:

```jsx
import { useState } from "react";
import { TOKEN_SYMBOLS } from "../../../shared/domain/tokens.js";

export function useSwapForm() {
  const [pairState, setPairState] = useState({
    amount: "",
    fromSymbol: TOKEN_SYMBOLS.ETH,
    toSymbol: TOKEN_SYMBOLS.USDC
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function setAmount(amount) {
    setPairState((current) => ({ ...current, amount }));
  }

  function setFromSymbol(fromSymbol) {
    setPairState((current) => ({ ...current, fromSymbol }));
  }

  function setToSymbol(toSymbol) {
    setPairState((current) => ({ ...current, toSymbol }));
  }

  function switchTokens() {
    setPairState((current) => ({
      ...current,
      fromSymbol: current.toSymbol,
      toSymbol: current.fromSymbol
    }));
    setSuccessMessage("");
  }

  return {
    amount: pairState.amount,
    fromSymbol: pairState.fromSymbol,
    isSubmitting,
    setAmount,
    setFromSymbol,
    setIsSubmitting,
    setSuccessMessage,
    setToSymbol,
    successMessage,
    switchTokens,
    toSymbol: pairState.toSymbol
  };
}
```

- [x] **Step 4: Implement components**

Create `src/problem2/v2/src/components/TokenSelect.jsx`:

```jsx
export function TokenSelect({ id, label, onChange, tokens, value }) {
  return (
    <select id={id} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {tokens.map((token) => (
        <option key={token.symbol} value={token.symbol}>
          {token.symbol}
        </option>
      ))}
    </select>
  );
}
```

Create `src/problem2/v2/src/components/AssetInput.jsx`:

```jsx
import { TokenSelect } from "./TokenSelect.jsx";
import { createSwitcheoPriceRepository } from "../../../shared/infrastructure/switcheoPriceRepository.js";

const iconRepository = createSwitcheoPriceRepository({ getJson: async () => [] });

export function AssetInput({
  amount,
  error,
  isReadOnly = false,
  label,
  onAmountChange,
  onTokenChange,
  tokenLabel,
  tokens,
  tokenValue,
  usdValue
}) {
  return (
    <section className="asset-panel">
      <div className="field-heading">
        <label htmlFor={isReadOnly ? "to-amount" : "from-amount"}>{label}</label>
        <span>{usdValue}</span>
      </div>
      <div className="asset-row">
        <input
          id={isReadOnly ? "to-amount" : "from-amount"}
          aria-label={isReadOnly ? "Amount to receive" : "Amount to send"}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          readOnly={isReadOnly}
          tabIndex={isReadOnly ? -1 : undefined}
          value={amount}
          onChange={(event) => onAmountChange?.(event.target.value)}
        />
        <div className="token-select-wrap">
          <img className="token-icon" src={iconRepository.getTokenIconUrl(tokenValue)} alt="" />
          <TokenSelect id={`${label.toLowerCase()}-token`} label={tokenLabel} tokens={tokens} value={tokenValue} onChange={onTokenChange} />
        </div>
      </div>
      {!isReadOnly && <p className="field-error" aria-live="polite">{error}</p>}
    </section>
  );
}
```

Create `src/problem2/v2/src/components/QuoteSummary.jsx`:

```jsx
export function QuoteSummary({ fee, minimum, rate }) {
  return (
    <section className="quote-panel" aria-live="polite">
      <div><span>Estimated quote</span><strong>{rate}</strong></div>
      <div><span>Network fee</span><strong>{fee}</strong></div>
      <div><span>Minimum received</span><strong>{minimum}</strong></div>
    </section>
  );
}
```

Create `src/problem2/v2/src/components/SwapForm.jsx`:

```jsx
import { createSwapViewModel } from "../../../shared/presentation/createSwapViewModel.js";
import { UI_TEXT } from "../../../shared/presentation/uiText.js";
import { AssetInput } from "./AssetInput.jsx";
import { QuoteSummary } from "./QuoteSummary.jsx";
import { useSwapForm } from "../hooks/useSwapForm.js";
import { useTokenPrices } from "../hooks/useTokenPrices.js";

export function SwapForm() {
  const prices = useTokenPrices();
  const form = useSwapForm();
  const viewModel = createSwapViewModel({ ...form, tokens: prices.tokens, usedFallback: prices.usedFallback });

  async function handleSubmit(event) {
    event.preventDefault();
    if (viewModel.confirmDisabled) return;
    form.setIsSubmitting(true);
    form.setSuccessMessage("");
    await new Promise((resolve) => setTimeout(resolve, 900));
    form.setIsSubmitting(false);
    form.setSuccessMessage(`${UI_TEXT.successPrefix}: ${form.amount} ${form.fromSymbol} to ${viewModel.toAmount} ${form.toSymbol}.`);
  }

  return (
    <section className="swap-card" aria-labelledby="swap-title">
      <header className="swap-header">
        <div>
          <p className="eyebrow">Vite React V2</p>
          <h1 id="swap-title">Swap tokens</h1>
        </div>
        <div className="status-pill" aria-live="polite">{prices.isLoading ? UI_TEXT.loadingPrices : viewModel.marketStatus}</div>
      </header>

      <form className="swap-form" onSubmit={handleSubmit} noValidate>
        <AssetInput
          amount={form.amount}
          error={viewModel.amountError}
          label="From"
          onAmountChange={(value) => { form.setAmount(value); form.setSuccessMessage(""); }}
          onTokenChange={(value) => { form.setFromSymbol(value); form.setSuccessMessage(""); }}
          tokenLabel="Token to send"
          tokens={prices.tokens}
          tokenValue={form.fromSymbol}
          usdValue={viewModel.fromUsdValue}
        />
        <button className="swap-direction" type="button" aria-label="Switch from and to tokens" onClick={form.switchTokens}>
          <span aria-hidden="true">↓↑</span>
        </button>
        <AssetInput
          amount={viewModel.toAmount}
          isReadOnly
          label="To"
          onTokenChange={(value) => { form.setToSymbol(value); form.setSuccessMessage(""); }}
          tokenLabel="Token to receive"
          tokens={prices.tokens}
          tokenValue={form.toSymbol}
          usdValue={viewModel.toUsdValue}
        />
        <QuoteSummary fee={viewModel.quoteFee} minimum={viewModel.quoteMinimum} rate={viewModel.quoteRate} />
        <p className={`form-message ${viewModel.isSuccess ? "is-success" : ""}`} aria-live="polite">{viewModel.formMessage}</p>
        <button className="confirm-button" type="submit" disabled={prices.isLoading || viewModel.confirmDisabled}>
          {viewModel.confirmText}
        </button>
      </form>
    </section>
  );
}
```

- [x] **Step 5: Verify GREEN**

Run:

```bash
cd src/problem2/v2
npm test
```

Expected: React behavior test passes.

---

## Task 6: Finish Styling And Documentation

**Files:**
- Modify: `src/problem2/v2/src/styles.css`
- Create: `src/problem2/v2/README.md`

- [x] **Step 1: Replace base styles with production styles**

Use v1’s visual direction, but keep V2 polished and React-specific classes stable. Requirements:

- No viewport-scaled font sizes.
- No negative letter spacing.
- No gradient-orb or bokeh decoration.
- Card radius stays at `8px` or less except circular icon controls.
- Controls have stable dimensions.
- Mobile around `360px` must not overlap.
- Visible focus states for input, select, swap button, and submit button.

Run:

```bash
rg -n "clamp\\(|radial-gradient|letter-spacing: -" src/problem2/v2/src/styles.css
```

Expected: no matches.

- [x] **Step 2: Add V2 README**

Create `src/problem2/v2/README.md`:

```md
# Currency Swap Form V2

Vite + React version of the currency swap form.

## Run the app

```bash
cd src/problem2/v2
npm install
npm run dev
```

Open the URL printed by Vite.

## Run tests

```bash
cd src/problem2/v2
npm test
npm run test:shared
npm run build
```

## Notes

- Quote formula: `toAmount = (fromAmount * fromUsdPrice) / toUsdPrice`.
- This is an indicative USD cross-rate quote, not real on-chain swap execution.
- Price values from the Switcheo challenge feed are treated as USD-denominated.
- Shared domain/application/infrastructure/presentation logic lives under `src/problem2/shared/`.
```

---

## Task 7: Final Verification

**Files:**
- All v2 and shared files.

- [x] **Step 1: Run shared tests**

Run:

```bash
node src/problem2/shared/domain/quote.test.js
node src/problem2/shared/infrastructure/requestClient.test.js
node src/problem2/shared/presentation/createSwapViewModel.test.js
```

Expected: all pass.

- [x] **Step 2: Run V2 tests and build**

Run:

```bash
cd src/problem2/v2
npm test
npm run build
```

Expected: tests and Vite build pass.

- [x] **Step 3: Run V2 manual smoke**

Run:

```bash
cd src/problem2/v2
npm run dev
```

Manual checks:

- Price loading renders tokens.
- `1 ETH` to `USDC` shows an output around `1,645.93` with fallback data or current live value.
- Same-token pair shows validation and disables submit.
- Invalid amount shows validation and disables submit.
- Swap direction flips token selections.
- Submit shows loading, then success receipt.
- Mobile and desktop layouts have no overlaps.

## Self-Review

- Spec coverage: The plan creates Vite/React v2, shared clean-architecture modules, network boundary, React hooks/components, tests, docs, and build verification.
- TDD coverage: Shared domain, infrastructure, application, and React behavior tests are written before implementation.
- React lifecycle coverage: Server/cache data lives in `useTokenPrices`; local form state lives in `useSwapForm`; quote display is derived through shared application logic; components do not fetch directly.
- Frontend concerns coverage: Missing prices are guarded, no `NaN` display should occur, loading/fallback/error/validation/success states are covered, and visual constraints are explicit.
- Placeholder scan: No placeholders remain.
