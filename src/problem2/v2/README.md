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

## Build

```bash
cd src/problem2/v2
npm run build
```
