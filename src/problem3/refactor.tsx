import React, { memo, useMemo } from 'react';

export const KNOWN_BLOCKCHAINS = ['Osmosis', 'Ethereum', 'Arbitrum', 'Zilliqa', 'Neo'] as const;

export type KnownBlockchain = (typeof KNOWN_BLOCKCHAINS)[number];
export type Blockchain = KnownBlockchain | (string & {});
export type Prices = Readonly<Partial<Record<string, number>>>;

export interface WalletBalance {
  id: string;
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

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

type WalletPageProps = Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> & {
  emptyState?: React.ReactNode;
};

declare function useWalletBalances(): readonly WalletBalance[];
declare function usePrices(): Prices;
declare const WalletRow: React.ComponentType<WalletRowProps>;
declare const classes: Readonly<{ row: string }>;

const UNSUPPORTED_BLOCKCHAIN_PRIORITY = -99;

const BLOCKCHAIN_PRIORITY = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} satisfies Record<KnownBlockchain, number>;

const TOKEN_AMOUNT_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
});

const MemoizedWalletRow = memo(WalletRow);

const isKnownBlockchain = (blockchain: Blockchain): blockchain is KnownBlockchain => {
  return Object.prototype.hasOwnProperty.call(BLOCKCHAIN_PRIORITY, blockchain);
};

export const getPriority = (blockchain: Blockchain): number => {
  if (isKnownBlockchain(blockchain)) {
    return BLOCKCHAIN_PRIORITY[blockchain];
  }

  return UNSUPPORTED_BLOCKCHAIN_PRIORITY;
};

export const isDisplayableBalance = (balance: WalletBalance): boolean => {
  return getPriority(balance.blockchain) > UNSUPPORTED_BLOCKCHAIN_PRIORITY && balance.amount > 0;
};

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

export const getSortedDisplayableBalances = (
  balances: readonly WalletBalance[],
): WalletBalance[] => {
  return [...balances].filter(isDisplayableBalance).sort(compareBalancesByPriority);
};

export const formatTokenAmount = (amount: number): string => {
  return TOKEN_AMOUNT_FORMATTER.format(amount);
};

export const getUsdValue = (balance: WalletBalance, prices: Prices): number | null => {
  const price = prices[balance.currency];

  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return null;
  }

  return price * balance.amount;
};

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

export const WalletPage = ({ emptyState = null, ...rest }: WalletPageProps): React.ReactElement => {
  const balances = useWalletBalanceViewModels();

  const rows = useMemo(() => {
    return balances.map((balance) => (
      <MemoizedWalletRow
        className={classes.row}
        key={balance.id}
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formattedAmount}
      />
    ));
  }, [balances]);

  return <div {...rest}>{rows.length > 0 ? rows : emptyState}</div>;
};
