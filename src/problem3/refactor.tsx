import React, { memo, useMemo } from 'react';

// Problem 2.2: Blockchain names are hardcoded string literals
// Solution: define supported blockchain names once as an enum-like constant
export const KNOWN_BLOCKCHAINS = ['Osmosis', 'Ethereum', 'Arbitrum', 'Zilliqa', 'Neo'] as const;

// Problem 2.1: getPriority uses any for blockchain
// Solution: model blockchain and price data with explicit TypeScript types
export type KnownBlockchain = (typeof KNOWN_BLOCKCHAINS)[number];
export type Blockchain = KnownBlockchain | (string & {});
export type Prices = Readonly<Partial<Record<string, number>>>;

// Problem 1.1: WalletBalance is missing fields used by the component
// Solution: include blockchain and a stable id in the wallet balance domain model
export interface WalletBalance {
  id: string;
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

// Problem 2.3: FormattedWalletBalance duplicates an incomplete WalletBalance shape
// Solution: create a display view model that extends the full wallet balance model
export interface WalletBalanceViewModel extends WalletBalance {
  priority: number;
  formattedAmount: string;
  usdValue: number | null;
}

interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number | null;
  formattedAmount: string;
}

// Problem 8.1: The original Props extends BoxProps while rendering a native div
// Solution: type the component with native div props instead of design-system Box props
// Problem 8.2: children is accepted but never rendered
// Solution: omit children from the public component props
type WalletPageProps = Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
  emptyState?: React.ReactNode;
};

declare function useWalletBalances(): readonly WalletBalance[];
declare function usePrices(): Prices;
declare const WalletRow: React.ComponentType<WalletRowProps>;
declare const classes: Readonly<{ row: string }>;

const UNSUPPORTED_BLOCKCHAIN_PRIORITY = -99;

// Problem 5.2: Blockchain priority is domain logic embedded in the UI component
// Solution: move priority rules outside React rendering code
// Problem 6.1: Priority switch is harder to scan, update, and test
// Solution: use a typed priority map
const BLOCKCHAIN_PRIORITY = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} satisfies Record<KnownBlockchain, number>;

// Problem 7.2: toFixed() defaults to zero decimal places
// Solution: use an explicit number formatter for token amounts
const TOKEN_AMOUNT_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
});

// Problem 3.6: Rendering many WalletRow components can become expensive
// Solution: memoize the row component so stable primitive props can skip rerenders
const MemoizedWalletRow = memo(WalletRow);

const isKnownBlockchain = (blockchain: Blockchain): blockchain is KnownBlockchain => {
  return Object.prototype.hasOwnProperty.call(BLOCKCHAIN_PRIORITY, blockchain);
};

// Problem 3.3: getPriority is recreated inside the component on every render
// Solution: hoist getPriority so its reference is stable and reusable
export const getPriority = (blockchain: Blockchain): number => {
  if (isKnownBlockchain(blockchain)) {
    return BLOCKCHAIN_PRIORITY[blockchain];
  }

  return UNSUPPORTED_BLOCKCHAIN_PRIORITY;
};

// Problem 1.2: filter checks an undefined lhsPriority variable
// Solution: calculate and use the current balance priority directly
// Problem 1.3: filter keeps non-positive balances
// Solution: keep only supported blockchains with positive balances
export const isDisplayableBalance = (balance: WalletBalance): boolean => {
  return getPriority(balance.blockchain) > UNSUPPORTED_BLOCKCHAIN_PRIORITY && balance.amount > 0;
};

// Problem 1.6: sort comparator does not return a value for equal priorities
// Solution: return a deterministic ordering with tie breakers
export const compareBalancesByPriority = (left: WalletBalance, right: WalletBalance): number => {
  const priorityDifference = getPriority(right.blockchain) - getPriority(left.blockchain);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  const blockchainDifference = left.blockchain.localeCompare(right.blockchain);

  if (blockchainDifference !== 0) {
    return blockchainDifference;
  }

  return left.currency.localeCompare(right.currency);
};

// Problem 3.1: filtering and sorting are repeated derived computations
// Solution: isolate the O(n log n) derivation so it can be memoized by the caller
export const getSortedDisplayableBalances = (
  balances: readonly WalletBalance[],
): WalletBalance[] => {
  return [...balances].filter(isDisplayableBalance).sort(compareBalancesByPriority);
};

export const formatTokenAmount = (amount: number): string => {
  return TOKEN_AMOUNT_FORMATTER.format(amount);
};

// Problem 1.7: Missing price data can produce NaN
// Solution: return null when the price is unavailable or invalid
export const getUsdValue = (balance: WalletBalance, prices: Prices): number | null => {
  const price = prices[balance.currency];

  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return null;
  }

  return price * balance.amount;
};

// Problem 1.4: formattedBalances is computed but never used
// Solution: create one view model that is actually consumed by rendering
// Problem 1.5: rows read formatted from unformatted sortedBalances items
// Solution: put formattedAmount on the view model before rendering rows
// Problem 5.3: no view-model boundary exists between raw data and UI
// Solution: map raw balances into a WalletBalanceViewModel
export const toWalletBalanceViewModel = (
  balance: WalletBalance,
  prices: Prices,
): WalletBalanceViewModel => {
  return {
    ...balance,
    priority: getPriority(balance.blockchain),
    formattedAmount: formatTokenAmount(balance.amount),
    usdValue: getUsdValue(balance, prices),
  };
};

// Problem 3.2: sortedBalances depends on prices even though sorting does not use prices
// Solution: memoize sorting only against balances
// Problem 3.4: unused formatting causes wasted O(n) work
// Solution: combine formatting with the consumed view-model mapping
// Problem 3.7: useMemo only helps with stable dependencies
// Solution: keep memo dependencies minimal and aligned with the data each step uses
// Problem 6.2: transformation logic is trapped inside the component
// Solution: move transformation orchestration into a focused custom hook
const useWalletBalanceViewModels = (): WalletBalanceViewModel[] => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return getSortedDisplayableBalances(balances);
  }, [balances]);

  return useMemo(() => {
    return sortedBalances.map((balance) => toWalletBalanceViewModel(balance, prices));
  }, [prices, sortedBalances]);
};

// Problem 5.1: WalletPage mixes data access, business rules, formatting, calculation, and rendering
// Solution: keep the component focused on rendering prepared view models
export const WalletPage = ({ emptyState = null, ...rest }: WalletPageProps): React.ReactElement => {
  const balances = useWalletBalanceViewModels();

  // Problem 3.5: row creation is another O(n) pass
  // Solution: memoize row element creation based on prepared balances
  const rows = useMemo(() => {
    return balances.map((balance) => {
      // Problem 4.1: index is an unstable key for filtered and sorted lists
      // Solution: use a stable id from the wallet balance model
      const rowKey = balance.id;

      return (
        <MemoizedWalletRow
          className={classes.row}
          key={rowKey}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formattedAmount}
        />
      );
    });
  }, [balances]);

  // Problem 7.1: original component only handles the happy path
  // Solution: render a caller-provided empty state when no balances are displayable
  return <div {...rest}>{rows.length > 0 ? rows : emptyState}</div>;
};
