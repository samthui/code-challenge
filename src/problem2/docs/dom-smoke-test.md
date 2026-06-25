# DOM Smoke Test Guide

Use this when you want to verify the zero-build v1 swap form logic without installing a browser automation runtime.

Run from the repository root:

```bash
node <<'NODE'
const fs = require("node:fs");
const vm = require("node:vm");

const base = "src/problem2/v1";

function makeClassList() {
  return {
    values: new Set(),
    toggle(name, enabled) {
      enabled ? this.values.add(name) : this.values.delete(name);
    },
    contains(name) {
      return this.values.has(name);
    }
  };
}

function makeElement(id) {
  return {
    id,
    textContent: "",
    value: "",
    disabled: false,
    src: "",
    alt: "",
    options: [],
    classList: makeClassList(),
    listeners: {},
    addEventListener(type, fn) {
      this.listeners[type] = fn;
    },
    removeAttribute(name) {
      delete this[name];
    },
    set innerHTML(html) {
      this._innerHTML = html;
      this.options = [...html.matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)]
        .map((match) => ({ value: match[1], text: match[2] }));
    },
    get innerHTML() {
      return this._innerHTML || "";
    }
  };
}

const ids = [
  "market-status", "swap-form", "from-amount", "to-amount", "from-token", "to-token",
  "from-token-icon", "to-token-icon", "from-usd-value", "to-usd-value",
  "amount-error", "quote-rate", "quote-fee", "quote-minimum",
  "form-message", "confirm-button", "swap-direction"
];

const byId = Object.fromEntries(ids.map((id) => [id, makeElement(id)]));
const document = {
  querySelector(selector) {
    return selector.startsWith("#") ? byId[selector.slice(1)] || null : null;
  }
};

const storage = new Map();
const window = {
  document,
  localStorage: {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  },
  fetch: async () => ({
    ok: true,
    status: 200,
    json: async () => [
      { currency: "ETH", price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
      { currency: "USDC", price: 1, date: "2023-08-29T07:10:00.000Z" },
      { currency: "USD", price: 1, date: "2023-08-29T07:10:00.000Z" }
    ]
  })
};

const context = vm.createContext({
  window,
  document,
  console,
  setTimeout,
  clearTimeout,
  AbortController,
  Intl,
  encodeURIComponent,
  globalThis: window
});

for (const file of [
  "swap-constants.js",
  "swap-core.js",
  "request-client.js",
  "price-service.js",
  "swap-view.js",
  "script.js"
]) {
  vm.runInContext(fs.readFileSync(`${base}/${file}`, "utf8"), context, { filename: file });
}

setTimeout(async () => {
  byId["from-amount"].value = "1";
  byId["from-amount"].listeners.input({ target: byId["from-amount"] });

  console.log({
    status: byId["market-status"].textContent,
    toAmount: byId["to-amount"].value,
    rate: byId["quote-rate"].textContent,
    confirmDisabled: byId["confirm-button"].disabled
  });

  byId["to-token"].value = "ETH";
  byId["to-token"].listeners.change({ target: byId["to-token"] });

  console.log({
    sameTokenDisabled: byId["confirm-button"].disabled,
    sameTokenMessage: byId["form-message"].textContent
  });
}, 30);
NODE
```

Expected output:

```text
{
  status: 'Live prices',
  toAmount: '1,645.93',
  rate: '1 ETH = 1,645.93 USDC',
  confirmDisabled: false
}
{
  sameTokenDisabled: true,
  sameTokenMessage: 'Choose two different tokens.'
}
```

This smoke test does not replace a real browser visual check. It verifies script loading order, globals, mocked price loading, quote rendering, and validation behavior.
