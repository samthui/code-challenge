# Original Code Review Notes

## 1. Correctness / Data Flow

1.1. `WalletBalance` is missing the `blockchain` field even though the code reads `balance.blockchain`, `lhs.blockchain`, and `rhs.blockchain`.

1.2. `filter` calculates `balancePriority`, but checks `lhsPriority`, which is not defined in that scope.

1.3. The filtering condition appears inverted or at least suspicious: it keeps balances when `balance.amount <= 0`. For a wallet balance list, the likely intent is usually to keep positive balances with a supported priority.

1.4. `formattedBalances` is computed but never used, so it performs wasted `O(n)` work.

1.5. `rows` maps over `sortedBalances` while typing each item as `FormattedWalletBalance`. `sortedBalances` does not contain `formatted`, so `balance.formatted` can be `undefined`.

1.6. The `sort` comparator does not return `0` when two priorities are equal, which makes the comparator incomplete.

1.7. `prices[balance.currency] * balance.amount` can produce `NaN` if `prices[balance.currency]` is missing.

## 2. Type Safety / Domain Modeling

2.1. `getPriority(blockchain: any)` weakens type safety. `blockchain` should be represented with a union type, enum-like constant, or typed priority map.

2.2. Blockchain names are hardcoded string literals, which makes typo-related bugs easier to introduce.

2.3. `FormattedWalletBalance` duplicates part of `WalletBalance` instead of extending the domain type, and it omits fields that the rest of the code expects, such as `blockchain`.

## 3. Performance

3.1. `sortedBalances` performs `filter` plus `sort`. Sorting is the main computational cost here because it is `O(n log n)`.

3.2. `prices` is included in the `sortedBalances` dependency array even though it is not used inside the memoized calculation. Price changes can unnecessarily recompute filtering and sorting.

3.3. `getPriority` is declared inside the component even though it does not depend on props or state. The direct function recreation cost is small, but it can complicate hook dependencies and invalidate `useMemo` if added as a dependency.

3.4. `formattedBalances` adds another `O(n)` pass and is currently wasted because the value is unused.

3.5. `rows = sortedBalances.map(...)` is another `O(n)` pass that creates React elements. Memoizing row generation can be considered if the list can be large or the parent re-renders frequently.

3.6. Rendering many `WalletRow` components can be expensive. For very large lists, pagination or virtualization is more effective than only memoizing arrays.

3.7. `useMemo` only helps if dependencies such as `balances` are referentially stable. If `useWalletBalances()` returns a new array every render, the memoized calculation still reruns.

## 4. React Reconciliation

4.1. Using `index` as a React key is risky for a filtered and sorted list. A stable key such as a balance id, or a unique composite key like `blockchain-currency`, gives React a safer reconciliation identity.

## 5. Architecture / Separation of Concerns

5.1. `WalletPage` mixes data access, business rules, filtering, sorting, formatting, fiat calculation, and rendering.

5.2. `getPriority` is domain/business logic embedded in the React UI layer.

5.3. The component lacks a clear selector, custom hook, or view-model boundary that prepares wallet balances for display before rendering.

## 6. Maintainability / Testability

6.1. The priority `switch` is harder to scan, update, and test than a typed priority map.

6.2. Filtering, sorting, formatting, and USD calculation are trapped inside the component instead of being extractable pure functions.

6.3. The transformation pipeline is disconnected: `formattedBalances` is created, but `rows` ignores it.

## 7. UI Resilience / Edge States

7.1. The component only handles the happy path. There is no visible loading, empty, or error state for wallet balances or prices.

7.2. `toFixed()` defaults to zero decimal places, which may be inappropriate for token balances that need precision.

## 8. Design-System / Component API Consistency

8.1. `Props extends BoxProps`, but the component renders a native `<div>`. If `BoxProps` comes from a design system, props such as `sx` may not be valid DOM props.

8.2. `children` is destructured but never rendered, so the component accepts a prop contract it does not honor.

# Annotated Original Code

```tsx
// Problem 1.1: WalletBalance is missing blockchain even though the component reads balance.blockchain.
interface WalletBalance {
  currency: string;
  amount: number;
}

// Problem 2.3: FormattedWalletBalance duplicates WalletBalance shape instead of extending it.
// Problem 2.3: It also omits blockchain, which the surrounding logic depends on.
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

// Problem 8.1: Props extends BoxProps, but the component later renders a native div.
interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
  // Problem 8.2: children is destructured but never rendered.
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Problem 3.3: Static helper is declared inside the component, which complicates memo dependencies.
  // Problem 5.2: Blockchain priority is domain logic embedded in the UI component.
  // Problem 6.1: A typed priority map would be easier to maintain and test than a switch.
	const getPriority = (blockchain: any): number => {
    // Problem 2.1: blockchain is typed as any.
    // Problem 2.2: Blockchain names are hardcoded string literals.
	  switch (blockchain) {
	    case 'Osmosis':
	      return 100
	    case 'Ethereum':
	      return 50
	    case 'Arbitrum':
	      return 30
	    case 'Zilliqa':
	      return 20
	    case 'Neo':
	      return 20
	    default:
	      return -99
	  }
	}

  // Problem 3.1: filter plus sort is the main derived-computation cost; sort is O(n log n).
  // Problem 3.2: prices is listed as a dependency even though this memo does not use prices.
  // Problem 3.7: This memo only helps if balances is referentially stable.
  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      // Problem 1.1: WalletBalance does not define blockchain.
		  const balancePriority = getPriority(balance.blockchain);
      // Problem 1.2: lhsPriority is undefined in this scope.
		  if (lhsPriority > -99) {
        // Problem 1.3: This keeps non-positive balances, which is likely the opposite of the intended filter.
		     if (balance.amount <= 0) {
		       return true;
		     }
		  }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      // Problem 1.1: WalletBalance does not define blockchain for lhs or rhs.
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
      // Problem 1.6: Comparator should return 0 when priorities are equal.
    });
  }, [balances, prices]);

  // Problem 1.4: formattedBalances is computed but never used.
  // Problem 3.4: This creates a wasted O(n) pass on every render where sortedBalances changes.
  // Problem 6.3: The data pipeline is disconnected because rows ignores this value.
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      // Problem 7.2: toFixed() defaults to zero decimal places, which may be wrong for token balances.
      formatted: balance.amount.toFixed()
    }
  })

  // Problem 1.5: rows maps sortedBalances but treats each item as FormattedWalletBalance.
  // Problem 3.5: Row creation is another O(n) pass and may be memoized when render pressure is plausible.
  // Problem 3.6: Large row counts may need pagination or virtualization.
  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    // Problem 1.7: Missing price data can produce NaN.
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        // Problem 4.1: index is an unstable key for filtered and sorted lists.
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        // Problem 1.5: formatted may be undefined because sortedBalances items were not formatted.
        formattedAmount={balance.formatted}
      />
    )
  })

  // Problem 5.1: WalletPage mixes data access, business rules, formatting, calculation, and rendering.
  // Problem 5.3: A selector, custom hook, or view-model boundary would keep the page component thinner.
  // Problem 6.2: The transformation logic is harder to unit test while trapped inside the component.
  // Problem 7.1: No loading, empty, or error state is rendered.
  return (
    // Problem 8.1: BoxProps may leak invalid props onto a native div.
    <div {...rest}>
      {rows}
    </div>
  )
}
```
