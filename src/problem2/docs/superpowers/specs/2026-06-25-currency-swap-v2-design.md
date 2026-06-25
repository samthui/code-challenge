# Currency Swap Form V2 Design

## Status

Approved design direction: Vite + React implementation in `src/problem2/v2/`, with stable logic extracted into `src/problem2/shared/`.

Implementation status: not started.

## Scope

Build the second version of the problem 2 currency swap form using Vite and React. V2 should demonstrate component architecture, React state design, reusable domain boundaries, and a more scalable frontend structure while keeping the same challenge behavior as v1.

V1 remains self-contained and untouched. V2 may migrate stable logic concepts from v1 into shared modules, but it must not make v1 depend on the new shared folder.

## Goals

- Create a polished React/Vite currency swap experience.
- Introduce a light clean-architecture boundary under `src/problem2/shared/`.
- Keep crypto quote logic framework-agnostic and testable.
- Keep data fetching behind repository/client boundaries so future network libraries can be swapped without changing components.
- Use React components and hooks with clear state ownership.
- Preserve the correct domain framing: the quote is an estimated USD cross-rate quote, not an on-chain execution quote.

## Non-Goals

- No wallet connection.
- No real transaction signing.
- No AMM, order-book, pool liquidity, route discovery, gas, or chain-specific token decimal modeling.
- No changes to v1 unless explicitly requested.

## Proposed File Structure

```text
src/problem2/
  shared/
    domain/
      quote.js
      tokens.js
      validation.js
    application/
      createSwapViewModel.js
      loadTokenPrices.js
    infrastructure/
      requestClient.js
      switcheoPriceRepository.js
    presentation/
      formatters.js
      uiText.js

  v2/
    package.json
    index.html
    vite.config.js
    README.md
    src/
      main.jsx
      App.jsx
      styles.css
      components/
        SwapForm.jsx
        AssetInput.jsx
        TokenSelect.jsx
        QuoteSummary.jsx
      hooks/
        useTokenPrices.js
        useSwapForm.js
```

## Architecture

The dependency direction is:

```text
v2 React UI -> shared/application -> shared/domain
v2 hooks -> shared/application -> shared/infrastructure through injected clients
shared/presentation -> formats domain/application output for display
```

`shared/domain/` must not depend on React, DOM, fetch, localStorage, or Vite. It owns token normalization, validation, quote calculation, and domain constants.

`shared/application/` coordinates use cases such as loading token prices and creating the swap view model.

`shared/infrastructure/` owns external data access, including Switcheo price loading and a request client with cache/retry/timeout behavior.

`shared/presentation/` owns display formatting and UI copy that is not React-specific.

## Data Source And Quote Model

Use:

- Price feed: `https://interview.switcheo.com/prices.json`
- Token icons: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{SYMBOL}.svg`

Treat price values as USD-denominated. Evidence remains the same as v1: `USD` is priced at `1`, stablecoins are near `1`, and major assets such as ETH and WBTC have USD-like prices.

Quote formula:

```js
toAmount = (fromAmount * fromUsdPrice) / toUsdPrice
```

This is an indicative USD cross-rate quote. The UI should label the output as estimated and should not represent it as a real execution quote.

## React State Design

Server/cache data:

- Token price list loaded from Switcheo or fallback data.
- Owned by `useTokenPrices`.
- Should not be duplicated in local component state beyond what the data hook owns.

Local form state:

- `fromSymbol`
- `toSymbol`
- `amount`
- submit/loading receipt state

Derived data:

- output amount
- exchange rate
- fee display
- minimum received
- validation errors
- confirm disabled state

Derived data should be calculated through `createSwapViewModel` during render or memoized with truthful dependencies. Do not store derived quote output in React state.

## React Components

`App.jsx`

- Owns page shell and high-level layout.
- Renders `SwapForm`.

`SwapForm.jsx`

- Owns swap form composition.
- Uses `useTokenPrices` and `useSwapForm`.
- Handles submit simulation.
- Passes narrow props to child components.

`AssetInput.jsx`

- Renders amount input, token selector, token icon, and USD value.
- Supports editable send amount and read-only receive amount.

`TokenSelect.jsx`

- Renders token select options with stable symbol keys.
- Does not know about price fetching.

`QuoteSummary.jsx`

- Renders estimated quote, network fee, and minimum received.
- Uses `aria-live` where appropriate for changing quote information.

## Hooks

`useTokenPrices.js`

- Loads token prices through the shared application/infrastructure boundary.
- Tracks loading, error/fallback state, and retry if implemented.
- Can use a simple request client for v2. A future TanStack Query implementation should fit behind this hook or a compatible repository adapter.

`useSwapForm.js`

- Owns local form state transitions.
- Uses functional updates when next state depends on previous state.
- Does not fetch data.
- Does not store derived quote output.

## Network Library Migration Contract

V2 should preserve the v1 network boundary concept:

```js
requestClient.getJson(url, {
  cacheKey,
  cacheTtlMs,
  retries,
  timeoutMs
});
```

React components must not call `fetch`, Axios, TanStack Query, SWR, or any other network library directly. Components call hooks. Hooks call application services or repositories. The network implementation can change later without rewriting the form UI.

If TanStack Query is added during v2, it should be introduced inside `useTokenPrices` or a dedicated adapter, not spread across presentation components.

## UX And Visual Direction

V2 should retain v1’s compact swap-form-first experience, but make the implementation feel more production-grade:

- No landing page or marketing hero.
- The swap form is the first screen.
- Dark neutral fintech layout with token icons as the visual color accents.
- Stable form dimensions and no layout shift during loading, validation, or submit.
- Clear loading, fallback, validation, and success receipt states.
- Responsive layout around 360px mobile width and desktop width.
- Visible keyboard focus states.
- No gradient orbs, bokeh decoration, viewport-scaled font sizing, or negative letter spacing.

## Validation And Edge States

Validation rules:

- Amount must be present, numeric, finite, and greater than zero.
- From and To tokens must differ.
- Both selected tokens must have valid prices.
- Confirm is disabled while invalid or submitting.

Edge states:

- Loading prices.
- Price fetch failure with fallback prices.
- No usable price data.
- Same-token validation.
- Invalid amount validation.
- Submit loading state.
- Success receipt message.

## Accessibility

- Use labels for all inputs and selects.
- Use `aria-live` for validation and success messages where dynamic updates occur.
- Ensure the token switch button has an accessible label.
- Keep focus states visible.
- Do not rely on color alone for validation or success.
- Avoid custom controls unless keyboard behavior is fully handled.

## Testing Strategy

Follow TDD:

- Shared domain tests first: token normalization, validation, quote formula, formatting.
- Shared infrastructure tests: cache, retry, timeout, fallback behavior.
- Application/view-model tests: loading result mapping and quote view-model output.
- React tests: user-visible form behavior if test dependencies are available.
- Syntax/build verification through Vite.

If dependency installation is blocked, keep shared Node tests and document any React/browser verification gap.

Manual verification:

- Run Vite dev server.
- Confirm price loading and fallback behavior.
- Enter amount and verify receive amount updates.
- Switch token pair.
- Validate same-token and invalid-amount states.
- Submit and confirm loading/success behavior.
- Check mobile and desktop layouts.

## V1 Compatibility

V1 remains unchanged and self-contained under `src/problem2/v1/`. V2 can copy or migrate stable ideas from v1 into `shared/`, but v1 should not import from `shared/` during this task. This keeps the zero-build submission stable while v2 demonstrates the more scalable architecture.

## Decisions And Deferred Items

- V2 will start with a simple custom request client behind the repository boundary. TanStack Query is deferred unless dependency setup is smooth and the extra package clearly improves the submission.
- React tests should use Vitest + React Testing Library if dependencies can be installed. If installation is blocked, shared Node tests plus Vite/browser smoke verification are acceptable and the verification gap must be documented.
