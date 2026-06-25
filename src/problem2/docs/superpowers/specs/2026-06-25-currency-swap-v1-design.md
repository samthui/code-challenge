# Currency Swap Form V1 Design

## Status

Approved design direction: zero-build static implementation in `src/problem2/v1/`.

Implementation status: not started.

## Scope

Build the first version of the problem 2 currency swap form as a static browser submission using only `index.html`, `style.css`, and `script.js`.

This version should look polished and behave like a crypto swap quote form, but it will not execute real trades. It will estimate output amounts from the Switcheo challenge price feed and simulate submission with a short loading state.

## Goals

- Create an intuitive, visually attractive cryptocurrency swap form.
- Keep v1 zero-build and easy to open directly in a browser.
- Structure the JavaScript into reusable units that can later move into a Vite version.
- Use the provided Switcheo price feed and token icon repository when available.
- Make the crypto-domain limitation clear in the code: this is an indicative quote, not a routed on-chain execution quote.

## Non-Goals

- No wallet connection.
- No real transaction signing or backend service.
- No AMM, order-book, pool liquidity, route discovery, gas, or chain-specific token decimal modeling.
- No dependency installation for v1.

## Proposed File Structure

```text
src/problem2/v1/
  index.html
  style.css
  script.js
```

The original `src/problem2/` files can remain untouched while v1 lives in its own folder. A later v2 can add Vite files without disturbing this baseline.

## User Experience

The screen should open directly into the swap form. The user sees:

- A compact swap panel with a clear title.
- A `From` amount field and token selector.
- A central swap-direction icon button.
- A `To` amount field and token selector.
- A rate preview, estimated fee, and minimum received line.
- Inline validation messages.
- A confirm button that shows loading, then a success receipt message.

The form should feel like a lightweight exchange quote surface rather than a generic calculator. It should stay scannable on mobile and desktop.

## Visual Direction

- Modern fintech styling with a restrained dark neutral page and high-contrast form panel.
- Token icons and currency symbols should provide the color and recognition.
- Controls should have clear focus states, stable dimensions, and no layout shift during validation or loading.
- Avoid marketing-page layout. The form is the first screen and primary experience.

## Data Source

Use:

- Price feed: `https://interview.switcheo.com/prices.json`
- Token icons: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{SYMBOL}.svg`

The Switcheo price feed contains records shaped like:

```json
{ "currency": "ETH", "date": "2023-08-29T07:10:52.000Z", "price": 1645.9337373737374 }
```

The `price` value should be treated as the token's USD price. Evidence: `USD` is priced at `1`, stablecoins are near `1`, and major assets such as ETH and WBTC have USD-like market prices.

## Quote Formula

For this challenge data, the output amount should be calculated as:

```js
toAmount = (fromAmount * fromUsdPrice) / toUsdPrice
```

This is an indicative USD cross-rate quote. It is appropriate because the endpoint provides token prices, not liquidity, order book, routing, or pool reserve data.

Do not represent this as a real execution quote. The UI can label it as estimated, and the code should keep fee and minimum-received values as simulated display values.

## Data Handling

The price feed includes duplicate currencies. Normalize it by:

- Ignoring entries without a valid currency or positive numeric price.
- Grouping entries by uppercased display symbol.
- Keeping the newest dated entry per symbol.
- Sorting common/high-recognition currencies toward the top, then alphabetically.

If the live fetch fails, use a small fallback set such as `USD`, `USDC`, `ETH`, `WBTC`, `ATOM`, `OSMO`, and `SWTH` so the demo remains usable.

## Component-Like JavaScript Structure

Keep `script.js` as one file for zero-build simplicity, but organize it into small units:

- `state`: selected tokens, amount, loading state, result message, token list.
- `fetchPrices()`: load and normalize price data.
- `normalizePrices(records)`: clean, deduplicate, and sort tokens.
- `formatAmount(value)` and `formatUsd(value)`: display helpers.
- `getTokenIconUrl(symbol)`: token icon URL builder.
- `calculateQuote(state)`: quote, rate, simulated fee, and minimum received.
- `renderTokenOptions(select, tokens)`: selector rendering.
- `renderQuote()`: update output, rate, fee, errors, and button state.
- `handleSubmit(event)`: validate, simulate loading, and show success.
- `init()`: wire events and initial render.

This gives v2 a natural migration path to React/Vite components later without making v1 more complex than needed.

## Validation And Error Handling

Validation rules:

- Amount must be present, numeric, greater than zero, and finite.
- `From` and `To` tokens must be different.
- Both selected tokens must have valid prices.
- Confirm is disabled while loading or while any blocking validation exists.

Error states:

- Invalid amount: show an inline message under the amount field.
- Same-token selection: show a concise form-level message.
- Price feed failure: show a non-blocking banner if fallback prices are loaded; blocking banner if no prices are available.

## Accessibility

- Use semantic labels for amount and token controls.
- Use `aria-live` for validation and success messages.
- Ensure the swap-direction button has an accessible label.
- Maintain visible keyboard focus styles.
- Do not rely on color alone for error or success feedback.

## Testing And Verification

Manual verification should cover:

- Opening `src/problem2/v1/index.html` directly in a browser.
- Price feed success path.
- Fallback price path by temporarily changing the feed URL.
- Amount typing updates output in real time.
- Token selector changes update rate and output.
- Swap-direction button flips currencies.
- Same-token validation.
- Invalid amount validation.
- Submit loading and success message.
- Mobile-width layout around 360px.

## Decisions And Deferred Items

- V1 will include compact `Estimated quote` copy in the rate section so the crypto-domain limitation is visible without turning the form into a tutorial.
- The Vite implementation is deferred to v2. React/Vite is the preferred direction if the goal is to show component skills; vanilla Vite remains acceptable if we want the smallest migration from v1.
