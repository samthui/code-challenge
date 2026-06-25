# Currency Swap Form V1

Zero-build static version of the currency swap form.

## Run the app

From the repository root:

```bash
python3 -m http.server 5178 --directory src/problem2/v1
```

Then open:

```text
http://localhost:5178
```

You can also open the file directly:

```bash
open src/problem2/v1/index.html
```

The local server is preferred because browser APIs such as fetch and cache behavior are closer to a normal web page.

## Run the tests

From the repository root:

```bash
node src/problem2/v1/swap-core.test.js
node src/problem2/v1/request-client.test.js
node src/problem2/v1/swap-view.test.js
```

You can also run the browser bootstrap syntax check:

```bash
node --check src/problem2/v1/script.js
```

The test coverage is split by responsibility:

- `swap-core.test.js` checks normalization, validation, quote math, and formatting.
- `request-client.test.js` checks cache, retry, and timeout behavior.
- `swap-view.test.js` checks UI state/view-model rendering helpers.

For a lightweight runtime smoke test of the browser scripts without installing Playwright, see `src/problem2/docs/dom-smoke-test.md`.

## Notes

- Swap quote formula: the estimated receive amount uses `toAmount = (fromAmount * fromUsdPrice) / toUsdPrice`. This is an indicative cross-rate quote based on token prices, not a real on-chain swap execution formula with liquidity, routing, slippage, gas, or pool math.
- Price unit: the Switcheo price feed is treated as USD-denominated. `USD` is priced at `1`, stablecoins are near `1`, and assets such as `ETH` and `WBTC` have USD-like market prices.
