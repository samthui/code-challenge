# Currency Swap Form V2

V2 is the Vite + React version of the crypto swap form. It reuses framework-agnostic modules from `src/problem2/shared/` for quote math, validation, price loading, request caching/retry/timeout behavior, and presentation formatting.

## Notes

- Swap output uses the crypto cross-rate formula `(fromAmount * fromPrice) / toPrice`, where both prices are normalized from the same quoted unit.
- The Switcheo interview price feed is treated as USD-denominated price data, so the app computes an indicative USD cross-rate rather than an executable on-chain swap.

## Run The App

```bash
cd src/problem2/v2
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

## Run The Tests

```bash
cd src/problem2/v2
npm run test:shared
npm test
```

`test:shared` verifies the reusable clean-boundary modules. `npm test` runs the React behavior smoke test with Vitest and React Testing Library.

## Adapter Boundaries

HTTP clients are selected in `src/composition/appConfig.js` through `APP_CONFIG.httpClient`.

Supported values:

- `fetch`
- `axios`

Both concrete clients implement the shared `JsonClient` port from `src/problem2/shared/infrastructure/http/jsonClient.ts`. `createJsonClient` is the factory that returns the selected concrete client.

Server-state/query libraries are selected in `src/composition/appConfig.js` through `APP_CONFIG.serverStateLibrary`.

Supported values:

- `plain`
- `tanstack`
- `swr`

Each adapter implements the same `TokenPricesResourceHook` shape. `createTokenPricesResourceHook` is the factory that returns the selected hook implementation.

The dependency flow is:

```text
React components
  -> server-state adapter
  -> shared application use case
  -> Switcheo price repository
  -> HTTP client adapter
```

UI components do not import `fetch`, Axios, TanStack Query, or SWR directly.

## Build

```bash
cd src/problem2/v2
npm run build
```
