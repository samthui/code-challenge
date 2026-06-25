# Currency Swap Form V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the zero-build static cryptocurrency swap quote form in `src/problem2/v1/`.

**Architecture:** V1 is a static browser app with tested pure modules and a thin DOM bootstrap. `swap-constants.js` centralizes text, symbols, selectors, URLs, and settings; `swap-core.js` owns quote math and validation; `request-client.js` owns cached/retried JSON requests; `swap-view.js` owns testable UI state/view-model/render helpers; `script.js` only wires DOM events.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node-based tests for core/request/UI helpers, Fetch API, localStorage cache, Switcheo challenge price JSON, Switcheo token SVG URLs. V2 can replace `request-client.js` with a Vite-friendly library such as TanStack Query while keeping the same price-service boundary.

---

## File Structure

- Create: `src/problem2/v1/index.html` - semantic app shell and form regions.
- Create: `src/problem2/v1/style.css` - responsive fintech styling and UI states.
- Create: `src/problem2/v1/swap-constants.js` - one source for text, symbols, selectors, URLs, fallback tokens, and quote settings.
- Create: `src/problem2/v1/swap-core.js` - pure normalization, validation, quote, and formatting logic.
- Create: `src/problem2/v1/request-client.js` - cached/retried JSON request helper with timeout.
- Create: `src/problem2/v1/price-service.js` - price loading service that uses `request-client.js` and falls back safely.
- Create: `src/problem2/v1/swap-view.js` - pure UI state reducers, view model creation, and DOM render helpers.
- Create: `src/problem2/v1/script.js` - browser bootstrap and event binding.
- Create: `src/problem2/v1/swap-core.test.js` - TDD tests for core behavior.
- Create: `src/problem2/v1/request-client.test.js` - TDD tests for cache/retry behavior using fake fetch/storage.
- Create: `src/problem2/v1/swap-view.test.js` - TDD tests for UI state and render behavior using small fake elements.
- Modify: `src/problem2/v1/README.md` only if implementation changes the documented formula or USD-unit assumptions.

## Senior Review Guardrails From Problem 3

- Correctness/data flow: missing prices must produce validation errors, never `NaN` UI.
- Domain modeling: use one token shape: `{ symbol, price, date }`.
- Avoid simple hard-coded string literals: repeated messages, symbols, URLs, selectors, and labels must come from `swap-constants.js`.
- Separation of concerns: quote math, request behavior, UI view state, and DOM bootstrap stay in separate files.
- Maintainability/testability: follow red-green for core logic, network behavior, and UI state/render behavior.
- UI resilience: render loading, fallback-price, validation, and success states.
- Precision: use explicit format helpers instead of default `toFixed()`.
- Performance: normalize/sort once after fetch; render select options only after token data loads; cache price JSON with a TTL.
- API consistency: every accepted control or message region must be rendered and updated.

---

## Task 0: Establish Shared Constants

**Files:**
- Create: `src/problem2/v1/swap-constants.js`

- [ ] **Step 1: Create constants before behavior tests**

Create `src/problem2/v1/swap-constants.js`:

```js
(function attachSwapConstants(root, factory) {
  const constants = factory();
  if (typeof module === "object" && module.exports) module.exports = constants;
  root.SwapConstants = constants;
})(typeof globalThis !== "undefined" ? globalThis : window, function createSwapConstants() {
  const TOKEN_SYMBOLS = Object.freeze({
    USD: "USD",
    USDC: "USDC",
    ETH: "ETH",
    WBTC: "WBTC",
    ATOM: "ATOM",
    OSMO: "OSMO",
    SWTH: "SWTH"
  });

  const UI_TEXT = Object.freeze({
    loadingPrices: "Loading prices",
    livePrices: "Live prices",
    fallbackPrices: "Fallback prices",
    enterAmount: "Enter an amount",
    confirmSwap: "Confirm swap",
    confirming: "Confirming...",
    successPrefix: "Swap preview ready"
  });

  const ERROR_MESSAGES = Object.freeze({
    invalidAmount: "Enter an amount greater than 0.",
    sameToken: "Choose two different tokens.",
    missingPrice: "Price data is unavailable for this pair."
  });

  const SELECTORS = Object.freeze({
    marketStatus: "#market-status",
    form: "#swap-form",
    fromAmount: "#from-amount",
    toAmount: "#to-amount",
    fromToken: "#from-token",
    toToken: "#to-token",
    fromIcon: "#from-token-icon",
    toIcon: "#to-token-icon",
    fromUsdValue: "#from-usd-value",
    toUsdValue: "#to-usd-value",
    amountError: "#amount-error",
    quoteRate: "#quote-rate",
    quoteFee: "#quote-fee",
    quoteMinimum: "#quote-minimum",
    formMessage: "#form-message",
    confirmButton: "#confirm-button",
    swapDirection: "#swap-direction"
  });

  const CONFIG = Object.freeze({
    priceUrl: "https://interview.switcheo.com/prices.json",
    iconBaseUrl: "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens",
    cacheKey: "problem2:v1:prices",
    cacheTtlMs: 5 * 60 * 1000,
    requestTimeoutMs: 5000,
    requestRetries: 2,
    simulatedFeeUsd: 1.25,
    slippageRate: 0.005
  });

  const FALLBACK_TOKENS = Object.freeze([
    { symbol: TOKEN_SYMBOLS.USD, price: 1, date: "2023-08-29T07:10:30.000Z" },
    { symbol: TOKEN_SYMBOLS.USDC, price: 1, date: "2023-08-29T07:10:30.000Z" },
    { symbol: TOKEN_SYMBOLS.ETH, price: 1645.9337373737374, date: "2023-08-29T07:10:52.000Z" },
    { symbol: TOKEN_SYMBOLS.WBTC, price: 26002.82202020202, date: "2023-08-29T07:10:52.000Z" },
    { symbol: TOKEN_SYMBOLS.ATOM, price: 7.186657333333334, date: "2023-08-29T07:10:50.000Z" },
    { symbol: TOKEN_SYMBOLS.OSMO, price: 0.3772974333333333, date: "2023-08-29T07:10:50.000Z" },
    { symbol: TOKEN_SYMBOLS.SWTH, price: 0.004039850455012084, date: "2023-08-29T07:10:45.000Z" }
  ]);

  return { CONFIG, ERROR_MESSAGES, FALLBACK_TOKENS, SELECTORS, TOKEN_SYMBOLS, UI_TEXT };
});
```

---

## Task 1: TDD The Pure Swap Core

**Files:**
- Create: `src/problem2/v1/swap-core.test.js`
- Create: `src/problem2/v1/swap-core.js`

- [ ] **Step 1: Write failing core tests**

Create `src/problem2/v1/swap-core.test.js`:

```js
const assert = require("node:assert/strict");
const { ERROR_MESSAGES, TOKEN_SYMBOLS, CONFIG } = require("./swap-constants.js");

const {
  normalizePrices,
  calculateQuote,
  formatAmount,
  formatUsd
} = require("./swap-core.js");

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("normalizePrices keeps the newest positive USD price per symbol", () => {
  const tokens = normalizePrices([
    { currency: TOKEN_SYMBOLS.ETH.toLowerCase(), price: 1500, date: "2023-08-29T07:00:00.000Z" },
    { currency: TOKEN_SYMBOLS.ETH, price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
    { currency: "BAD", price: 0, date: "2023-08-29T07:10:00.000Z" },
    { currency: "", price: 1, date: "2023-08-29T07:10:00.000Z" }
  ]);

  assert.deepEqual(tokens, [
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
    simulatedFeeUsd: CONFIG.simulatedFeeUsd,
    slippageRate: CONFIG.slippageRate
  });

  assert.equal(quote.isValid, true);
  assert.equal(quote.fromUsd, 3291.86);
  assert.equal(quote.toAmount, 3291.86);
  assert.equal(quote.rate, 1645.93);
  assert.equal(Number(quote.minimumReceived.toFixed(6)), 3274.1507);
});

test("calculateQuote blocks invalid amounts, same-token pairs, and missing prices", () => {
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

- [ ] **Step 2: Verify RED**

Run:

```bash
node src/problem2/v1/swap-core.test.js
```

Expected: FAIL with `Cannot find module './swap-core.js'`.

- [ ] **Step 3: Implement the core**

Create `src/problem2/v1/swap-core.js`:

```js
(function attachSwapCore(root, factory) {
  const constants = typeof require === "function" ? require("./swap-constants.js") : root.SwapConstants;
  const core = factory(constants);
  if (typeof module === "object" && module.exports) module.exports = core;
  root.SwapCore = core;
})(typeof globalThis !== "undefined" ? globalThis : window, function createSwapCore(constants) {
  const { CONFIG, ERROR_MESSAGES, TOKEN_SYMBOLS } = constants;

  function formatAmount(value, maximumFractionDigits = 6) {
    if (!Number.isFinite(value)) return "0.00";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
      maximumFractionDigits
    }).format(value);
  }

  function formatUsd(value) {
    if (!Number.isFinite(value)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: TOKEN_SYMBOLS.USD,
      minimumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
      maximumFractionDigits: value > 0 && value < 0.01 ? 5 : 2
    }).format(value);
  }

  function normalizePrices(records) {
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

    const priority = Object.values(TOKEN_SYMBOLS);
    return [...bySymbol.values()].sort((a, b) => {
      const aIndex = priority.indexOf(a.symbol);
      const bIndex = priority.indexOf(b.symbol);
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }
      return a.symbol.localeCompare(b.symbol);
    });
  }

  function getToken(tokens, symbol) {
    return tokens.find((token) => token.symbol === symbol);
  }

  function calculateQuote(options) {
    const tokens = Array.isArray(options.tokens) ? options.tokens : [];
    const amount = Number(options.amount);
    const fromToken = getToken(tokens, options.fromSymbol);
    const toToken = getToken(tokens, options.toSymbol);
    const simulatedFeeUsd = Number.isFinite(options.simulatedFeeUsd) ? options.simulatedFeeUsd : CONFIG.simulatedFeeUsd;
    const slippageRate = Number.isFinite(options.slippageRate) ? options.slippageRate : CONFIG.slippageRate;
    const errors = [];

    if (String(options.amount || "").trim() === "" || !Number.isFinite(amount) || amount <= 0) {
      errors.push(ERROR_MESSAGES.invalidAmount);
    }
    if (options.fromSymbol === options.toSymbol) errors.push(ERROR_MESSAGES.sameToken);
    if (!fromToken || !toToken) errors.push(ERROR_MESSAGES.missingPrice);

    if (errors.length > 0) {
      return { isValid: false, errors, fromUsd: 0, toAmount: 0, toUsd: 0, rate: 0, minimumReceived: 0 };
    }

    const fromUsd = amount * fromToken.price;
    const toAmount = fromUsd / toToken.price;
    const rate = fromToken.price / toToken.price;
    const feeInToToken = simulatedFeeUsd / toToken.price;
    const minimumReceived = Math.max(toAmount * (1 - slippageRate) - feeInToToken, 0);

    return { isValid: true, errors, fromUsd, toAmount, toUsd: toAmount * toToken.price, rate, minimumReceived };
  }

  return { calculateQuote, formatAmount, formatUsd, normalizePrices };
});
```

- [ ] **Step 4: Verify GREEN**

Run:

```bash
node src/problem2/v1/swap-core.test.js
```

Expected: all tests print `PASS`.

---

## Task 2: TDD The Request Client And Price Service

**Files:**
- Create: `src/problem2/v1/request-client.test.js`
- Create: `src/problem2/v1/request-client.js`
- Create: `src/problem2/v1/price-service.js`

- [ ] **Step 1: Write failing request-client tests**

Create `src/problem2/v1/request-client.test.js`:

```js
const assert = require("node:assert/strict");
const { createJsonRequestClient } = require("./request-client.js");

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

test("getJson retries before failing", async () => {
  let calls = 0;
  const client = createJsonRequestClient({
    fetchImpl: async () => {
      calls += 1;
      return { ok: calls === 2, status: calls === 2 ? 200 : 500, json: async () => ({ ok: true }) };
    },
    storage: createStorage(),
    now: () => 1000
  });

  const result = await client.getJson("https://example.test/prices", { retries: 1 });

  assert.deepEqual(result, { ok: true });
  assert.equal(calls, 2);
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
node src/problem2/v1/request-client.test.js
```

Expected: FAIL with `Cannot find module './request-client.js'`.

- [ ] **Step 3: Implement cached/retried request client**

Create `src/problem2/v1/request-client.js`:

```js
(function attachRequestClient(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RequestClient = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createRequestClientModule() {
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

  function createJsonRequestClient(dependencies) {
    const fetchImpl = dependencies.fetchImpl;
    const storage = dependencies.storage;
    const now = dependencies.now || Date.now;

    async function getJson(url, options = {}) {
      const cached = readCache(storage, options.cacheKey, now, options.cacheTtlMs);
      if (cached) return cached;

      const retries = Number.isFinite(options.retries) ? options.retries : 0;
      let lastError;
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const response = await fetchImpl(url);
          if (!response.ok) throw new Error(`Request failed with ${response.status}`);
          const value = await response.json();
          writeCache(storage, options.cacheKey, now, value);
          return value;
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError;
    }

    return { getJson };
  }

  return { createJsonRequestClient };
});
```

- [ ] **Step 4: Verify GREEN**

Run:

```bash
node src/problem2/v1/request-client.test.js
```

Expected: both request-client tests print `PASS`.

- [ ] **Step 5: Add the price service boundary**

Create `src/problem2/v1/price-service.js`:

```js
(function attachPriceService(root, factory) {
  const constants = typeof require === "function" ? require("./swap-constants.js") : root.SwapConstants;
  const core = typeof require === "function" ? require("./swap-core.js") : root.SwapCore;
  const service = factory(constants, core);
  if (typeof module === "object" && module.exports) module.exports = service;
  root.PriceService = service;
})(typeof globalThis !== "undefined" ? globalThis : window, function createPriceService(constants, core) {
  const { CONFIG, FALLBACK_TOKENS } = constants;

  async function loadTokens(requestClient) {
    try {
      const records = await requestClient.getJson(CONFIG.priceUrl, {
        cacheKey: CONFIG.cacheKey,
        cacheTtlMs: CONFIG.cacheTtlMs,
        retries: CONFIG.requestRetries,
        timeoutMs: CONFIG.requestTimeoutMs
      });
      const tokens = core.normalizePrices(records);
      if (tokens.length < 2) throw new Error("Price feed returned fewer than two usable tokens");
      return { tokens, usedFallback: false };
    } catch (error) {
      return { tokens: [...FALLBACK_TOKENS], usedFallback: true };
    }
  }

  return { loadTokens };
});
```

---

## Task 3: TDD The UI View Layer

**Files:**
- Create: `src/problem2/v1/swap-view.test.js`
- Create: `src/problem2/v1/swap-view.js`

- [ ] **Step 1: Write failing UI state/render tests**

Create `src/problem2/v1/swap-view.test.js`:

```js
const assert = require("node:assert/strict");
const constants = require("./swap-constants.js");
const core = require("./swap-core.js");

const { createInitialState, createViewModel, renderViewModel } = require("./swap-view.js");

function createElement() {
  return {
    textContent: "",
    value: "",
    disabled: false,
    classList: { values: new Set(), toggle(name, enabled) { enabled ? this.values.add(name) : this.values.delete(name); } }
  };
}

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test("createInitialState avoids scattered default symbol literals", () => {
  const state = createInitialState(constants);
  assert.equal(state.fromSymbol, constants.TOKEN_SYMBOLS.ETH);
  assert.equal(state.toSymbol, constants.TOKEN_SYMBOLS.USDC);
});

test("createViewModel exposes validation text and disabled confirm state", () => {
  const state = createInitialState(constants);
  state.tokens = constants.FALLBACK_TOKENS;
  state.amount = "0";

  const viewModel = createViewModel(state, constants, core);

  assert.equal(viewModel.amountError, constants.ERROR_MESSAGES.invalidAmount);
  assert.equal(viewModel.confirmDisabled, true);
  assert.equal(viewModel.marketStatus, constants.UI_TEXT.livePrices);
});

test("renderViewModel writes expected UI fields", () => {
  const elements = {
    toAmount: createElement(),
    amountError: createElement(),
    formMessage: createElement(),
    confirmButton: createElement(),
    marketStatus: createElement(),
    quoteRate: createElement(),
    quoteFee: createElement(),
    quoteMinimum: createElement(),
    fromUsdValue: createElement(),
    toUsdValue: createElement()
  };

  renderViewModel(elements, {
    toAmount: "1,645.93",
    amountError: "",
    formMessage: "ok",
    isSuccess: true,
    confirmDisabled: false,
    confirmText: constants.UI_TEXT.confirmSwap,
    marketStatus: constants.UI_TEXT.livePrices,
    quoteRate: "1 ETH = 1,645.93 USDC",
    quoteFee: "$1.25",
    quoteMinimum: "1,636.45 USDC",
    fromUsdValue: "$1,645.93",
    toUsdValue: "$1,645.93"
  });

  assert.equal(elements.toAmount.value, "1,645.93");
  assert.equal(elements.confirmButton.disabled, false);
  assert.equal(elements.confirmButton.textContent, constants.UI_TEXT.confirmSwap);
  assert.equal(elements.formMessage.classList.values.has("is-success"), true);
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
node src/problem2/v1/swap-view.test.js
```

Expected: FAIL with `Cannot find module './swap-view.js'`.

- [ ] **Step 3: Implement the UI view layer**

Create `src/problem2/v1/swap-view.js`:

```js
(function attachSwapView(root, factory) {
  const view = factory();
  if (typeof module === "object" && module.exports) module.exports = view;
  root.SwapView = view;
})(typeof globalThis !== "undefined" ? globalThis : window, function createSwapViewModule() {
  function createInitialState(constants) {
    return {
      tokens: [],
      fromSymbol: constants.TOKEN_SYMBOLS.ETH,
      toSymbol: constants.TOKEN_SYMBOLS.USDC,
      amount: "",
      isSubmitting: false,
      usedFallback: false,
      successMessage: ""
    };
  }

  function createViewModel(state, constants, core) {
    const quote = core.calculateQuote({
      amount: state.amount,
      fromSymbol: state.fromSymbol,
      toSymbol: state.toSymbol,
      tokens: state.tokens,
      simulatedFeeUsd: constants.CONFIG.simulatedFeeUsd,
      slippageRate: constants.CONFIG.slippageRate
    });
    const fromToken = state.tokens.find((token) => token.symbol === state.fromSymbol);
    const toToken = state.tokens.find((token) => token.symbol === state.toSymbol);
    const amountError = quote.errors.find((error) => error === constants.ERROR_MESSAGES.invalidAmount) || "";
    const pairError = quote.errors.find((error) => error !== constants.ERROR_MESSAGES.invalidAmount) || "";

    return {
      quote,
      toAmount: quote.isValid ? core.formatAmount(quote.toAmount, 8) : "",
      amountError,
      formMessage: state.successMessage || pairError,
      isSuccess: Boolean(state.successMessage),
      confirmDisabled: !quote.isValid || state.isSubmitting,
      confirmText: state.isSubmitting ? constants.UI_TEXT.confirming : constants.UI_TEXT.confirmSwap,
      marketStatus: state.usedFallback ? constants.UI_TEXT.fallbackPrices : constants.UI_TEXT.livePrices,
      quoteRate: quote.isValid && fromToken && toToken
        ? `1 ${fromToken.symbol} = ${core.formatAmount(quote.rate, 8)} ${toToken.symbol}`
        : constants.UI_TEXT.enterAmount,
      quoteFee: core.formatUsd(constants.CONFIG.simulatedFeeUsd),
      quoteMinimum: quote.isValid && toToken ? `${core.formatAmount(quote.minimumReceived, 8)} ${toToken.symbol}` : "0.00",
      fromUsdValue: quote.isValid ? core.formatUsd(quote.fromUsd) : "$0.00",
      toUsdValue: quote.isValid ? core.formatUsd(quote.toUsd) : "$0.00"
    };
  }

  function renderViewModel(elements, viewModel) {
    elements.toAmount.value = viewModel.toAmount;
    elements.amountError.textContent = viewModel.amountError;
    elements.formMessage.textContent = viewModel.formMessage;
    elements.formMessage.classList.toggle("is-success", viewModel.isSuccess);
    elements.confirmButton.disabled = viewModel.confirmDisabled;
    elements.confirmButton.textContent = viewModel.confirmText;
    elements.marketStatus.textContent = viewModel.marketStatus;
    elements.quoteRate.textContent = viewModel.quoteRate;
    elements.quoteFee.textContent = viewModel.quoteFee;
    elements.quoteMinimum.textContent = viewModel.quoteMinimum;
    elements.fromUsdValue.textContent = viewModel.fromUsdValue;
    elements.toUsdValue.textContent = viewModel.toUsdValue;
  }

  return { createInitialState, createViewModel, renderViewModel };
});
```

- [ ] **Step 4: Verify GREEN**

Run:

```bash
node src/problem2/v1/swap-view.test.js
```

Expected: all UI tests print `PASS`.

---

## Task 4: Build The Static HTML And Browser Bootstrap

**Files:**
- Create: `src/problem2/v1/index.html`
- Create: `src/problem2/v1/script.js`

- [ ] **Step 1: Create HTML that loads modules in dependency order**

Create `src/problem2/v1/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Currency Swap</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="app-shell">
      <section class="swap-card" aria-labelledby="swap-title">
        <header class="swap-header">
          <div>
            <p class="eyebrow">Static V1</p>
            <h1 id="swap-title">Swap tokens</h1>
          </div>
          <div class="status-pill" id="market-status" aria-live="polite">Loading prices</div>
        </header>

        <form class="swap-form" id="swap-form" novalidate>
          <div class="asset-panel">
            <div class="field-heading"><label for="from-amount">From</label><span id="from-usd-value">$0.00</span></div>
            <div class="asset-row">
              <input id="from-amount" name="fromAmount" inputmode="decimal" autocomplete="off" placeholder="0.00" aria-describedby="amount-error" />
              <div class="token-select-wrap"><img id="from-token-icon" class="token-icon" alt="" /><select id="from-token" name="fromToken" aria-label="Token to send"></select></div>
            </div>
            <p class="field-error" id="amount-error" aria-live="polite"></p>
          </div>

          <button class="swap-direction" type="button" id="swap-direction" aria-label="Switch from and to tokens"><span aria-hidden="true">↓↑</span></button>

          <div class="asset-panel">
            <div class="field-heading"><label for="to-amount">To</label><span id="to-usd-value">$0.00</span></div>
            <div class="asset-row">
              <input id="to-amount" name="toAmount" placeholder="0.00" readonly tabindex="-1" />
              <div class="token-select-wrap"><img id="to-token-icon" class="token-icon" alt="" /><select id="to-token" name="toToken" aria-label="Token to receive"></select></div>
            </div>
          </div>

          <div class="quote-panel" aria-live="polite">
            <div><span>Estimated quote</span><strong id="quote-rate">Enter an amount</strong></div>
            <div><span>Network fee</span><strong id="quote-fee">$0.00</strong></div>
            <div><span>Minimum received</span><strong id="quote-minimum">0.00</strong></div>
          </div>

          <p class="form-message" id="form-message" aria-live="polite"></p>
          <button class="confirm-button" id="confirm-button" type="submit" disabled>Confirm swap</button>
        </form>
      </section>
    </main>

    <script src="swap-constants.js"></script>
    <script src="swap-core.js"></script>
    <script src="request-client.js"></script>
    <script src="price-service.js"></script>
    <script src="swap-view.js"></script>
    <script src="script.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create the thin browser bootstrap**

Create `src/problem2/v1/script.js`:

```js
const constants = window.SwapConstants;
const core = window.SwapCore;
const state = window.SwapView.createInitialState(constants);

const elements = Object.fromEntries(
  Object.entries(constants.SELECTORS).map(([key, selector]) => [key, document.querySelector(selector)])
);

const requestClient = window.RequestClient.createJsonRequestClient({
  fetchImpl: window.fetch.bind(window),
  storage: window.localStorage,
  now: Date.now
});

function getTokenIconUrl(symbol) {
  return `${constants.CONFIG.iconBaseUrl}/${encodeURIComponent(symbol)}.svg`;
}

function updateTokenIcon(imageElement, symbol) {
  imageElement.src = getTokenIconUrl(symbol);
  imageElement.alt = "";
  imageElement.onerror = () => imageElement.removeAttribute("src");
}

function renderTokenOptions(selectElement) {
  selectElement.innerHTML = state.tokens.map((token) => `<option value="${token.symbol}">${token.symbol}</option>`).join("");
}

function render() {
  elements.fromToken.value = state.fromSymbol;
  elements.toToken.value = state.toSymbol;
  updateTokenIcon(elements.fromIcon, state.fromSymbol);
  updateTokenIcon(elements.toIcon, state.toSymbol);
  window.SwapView.renderViewModel(elements, window.SwapView.createViewModel(state, constants, core));
}

async function handleSubmit(event) {
  event.preventDefault();
  const viewModel = window.SwapView.createViewModel(state, constants, core);
  if (viewModel.confirmDisabled) {
    render();
    return;
  }

  state.isSubmitting = true;
  state.successMessage = "";
  render();
  await new Promise((resolve) => setTimeout(resolve, 900));
  state.isSubmitting = false;
  state.successMessage = `${constants.UI_TEXT.successPrefix}: ${core.formatAmount(Number(state.amount), 8)} ${state.fromSymbol} → ${viewModel.toAmount} ${state.toSymbol}.`;
  render();
}

function bindEvents() {
  elements.fromAmount.addEventListener("input", (event) => {
    state.amount = event.target.value;
    state.successMessage = "";
    render();
  });
  elements.fromToken.addEventListener("change", (event) => {
    state.fromSymbol = event.target.value;
    state.successMessage = "";
    render();
  });
  elements.toToken.addEventListener("change", (event) => {
    state.toSymbol = event.target.value;
    state.successMessage = "";
    render();
  });
  elements.swapDirection.addEventListener("click", () => {
    const nextFrom = state.toSymbol;
    state.toSymbol = state.fromSymbol;
    state.fromSymbol = nextFrom;
    state.successMessage = "";
    render();
  });
  elements.form.addEventListener("submit", handleSubmit);
}

async function init() {
  elements.marketStatus.textContent = constants.UI_TEXT.loadingPrices;
  const result = await window.PriceService.loadTokens(requestClient);
  state.tokens = result.tokens;
  state.usedFallback = result.usedFallback;
  renderTokenOptions(elements.fromToken);
  renderTokenOptions(elements.toToken);
  if (!state.tokens.some((token) => token.symbol === state.fromSymbol)) state.fromSymbol = state.tokens[0].symbol;
  if (!state.tokens.some((token) => token.symbol === state.toSymbol)) state.toSymbol = state.tokens[1].symbol;
  bindEvents();
  render();
}

init();
```

- [ ] **Step 3: Syntax-check the browser bootstrap**

Run:

```bash
node --check src/problem2/v1/script.js
```

Expected: exits `0` with no syntax errors.

---

## Task 5: Add Production-Quality Styling

**Files:**
- Create: `src/problem2/v1/style.css`

- [ ] **Step 1: Create responsive styling**

Create `src/problem2/v1/style.css`:

```css
:root {
  color-scheme: dark;
  --bg: #0d1117;
  --panel-strong: #1c2430;
  --border: #2d3747;
  --text: #eef4ff;
  --muted: #93a4ba;
  --accent: #2dd4bf;
  --accent-strong: #14b8a6;
  --danger: #fb7185;
  --success: #6ee7b7;
  --shadow: 0 24px 70px rgba(0, 0, 0, 0.42);
}

* { box-sizing: border-box; }

body {
  min-width: 360px;
  min-height: 100vh;
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(45, 212, 191, 0.18), transparent 28rem),
    linear-gradient(135deg, #0d1117 0%, #111827 48%, #10151d 100%);
  color: var(--text);
}

button, input, select { font: inherit; }

.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
}

.swap-card {
  width: min(100%, 460px);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(21, 27, 35, 0.94);
  box-shadow: var(--shadow);
}

.swap-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(1.7rem, 4vw, 2.15rem);
  line-height: 1.05;
  letter-spacing: 0;
}

.status-pill {
  min-width: 106px;
  padding: 8px 10px;
  border: 1px solid rgba(45, 212, 191, 0.3);
  border-radius: 999px;
  color: #bffaf2;
  background: rgba(20, 184, 166, 0.12);
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
}

.swap-form { display: grid; gap: 12px; }

.asset-panel, .quote-panel {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel-strong);
}

.asset-panel { padding: 16px; }

.field-heading, .quote-panel > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.field-heading {
  margin-bottom: 10px;
  color: var(--muted);
  font-size: 0.86rem;
}

.field-heading label { color: var(--text); font-weight: 700; }

.asset-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 138px;
  gap: 10px;
  align-items: center;
}

input, select {
  width: 100%;
  border: 0;
  outline: 0;
  color: var(--text);
  background: transparent;
}

input { min-height: 48px; font-size: 1.45rem; font-weight: 750; }
input::placeholder { color: #526174; }
input[readonly] { color: #c9d7e8; }

.token-select-wrap {
  min-height: 48px;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #101720;
}

.token-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #263242;
}

select { min-height: 30px; cursor: pointer; font-weight: 800; }

input:focus-visible, select:focus-visible, button:focus-visible {
  outline: 3px solid rgba(45, 212, 191, 0.45);
  outline-offset: 3px;
}

.field-error, .form-message {
  min-height: 20px;
  margin: 8px 0 0;
  color: var(--danger);
  font-size: 0.86rem;
}

.swap-direction {
  width: 44px;
  height: 44px;
  justify-self: center;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text);
  background: #101720;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 900;
  transition: transform 160ms ease, border-color 160ms ease;
}

.swap-direction:hover { transform: rotate(180deg); border-color: var(--accent); }

.quote-panel { display: grid; gap: 10px; padding: 14px 16px; }
.quote-panel span { color: var(--muted); font-size: 0.84rem; }
.quote-panel strong { color: var(--text); font-size: 0.9rem; text-align: right; }
.form-message { margin-top: 0; }
.form-message.is-success { color: var(--success); }

.confirm-button {
  min-height: 52px;
  border: 0;
  border-radius: 8px;
  color: #041312;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  cursor: pointer;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0;
  transition: transform 160ms ease, filter 160ms ease, opacity 160ms ease;
}

.confirm-button:not(:disabled):hover { transform: translateY(-1px); filter: brightness(1.05); }
.confirm-button:disabled { cursor: not-allowed; opacity: 0.48; }

@media (max-width: 430px) {
  .app-shell { padding: 16px 10px; }
  .swap-card { padding: 18px; }
  .asset-row { grid-template-columns: 1fr; }
  .token-select-wrap { grid-template-columns: 28px 1fr; }
  .swap-header { align-items: stretch; flex-direction: column; }
  .status-pill { width: fit-content; }
}
```

---

## Task 6: Final Verification

**Files:**
- Existing: `src/problem2/v1/README.md`

- [ ] **Step 1: Run automated checks**

Run:

```bash
node src/problem2/v1/swap-core.test.js
node src/problem2/v1/request-client.test.js
node src/problem2/v1/swap-view.test.js
node --check src/problem2/v1/script.js
```

Expected: tests pass and syntax check exits `0`.

- [ ] **Step 2: Run manual browser checks**

Open:

```bash
open src/problem2/v1/index.html
```

Check:
- Entering `1` in `From` updates `To`.
- Changing either token updates quote, USD values, fee, and minimum received.
- Swap-direction flips the selected pair.
- Same-token pair disables confirm and shows `Choose two different tokens.`
- Invalid amount disables confirm and shows `Enter an amount greater than 0.`
- Confirm shows `Confirming...`, then a success message.
- If the price fetch fails, fallback prices still render and the status says `Fallback prices`.

---

## V2 Network Library Note

V1 keeps a zero-build `request-client.js` adapter so the static file still opens directly in a browser. V2 should replace the internals of this boundary with a Vite-friendly request/cache library, preferably TanStack Query for query caching, retries, stale times, loading/error state, and devtools support. The UI should continue depending on a price service API rather than calling the network library directly.

## Network Library Migration Contract

The app should not couple UI code to `fetch`, TanStack Query, Axios, SWR, or any future network library. The stable boundary is:

```js
requestClient.getJson(url, {
  cacheKey,
  cacheTtlMs,
  retries,
  timeoutMs
});
```

`price-service.js` is the only module that knows how price data is requested. `script.js` calls `PriceService.loadTokens(requestClient)` and receives `{ tokens, usedFallback }`. In v1, `request-client.js` can use the browser `fetch` API plus `localStorage` caching and retry logic. In v2, TanStack Query can implement the same loading behavior behind a hook or adapter without changing quote math, view state, or DOM/component rendering logic. If a later version uses another library, only this request/client-service layer should change.

## Self-Review

- Spec coverage: The plan creates a static v1 app, uses Switcheo price data and icons, implements USD cross-rate quote math, includes fallback prices, validates key error states, simulates submit, and keeps v1 zero-build.
- TDD coverage: The plan starts with failing tests for core behavior, request/cache behavior, and UI state/render behavior before corresponding production files exist.
- Problem 3 review coverage: The plan separates domain logic from UI, guards missing data, avoids default `toFixed()`, handles edge states, keeps a consistent token model, avoids repeated magic strings, and adds network caching/retry.
- Placeholder scan: No placeholder tasks remain.
- Type consistency: Function names used by tests and browser code match the planned files.
