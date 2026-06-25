import { TokenSelect } from "./TokenSelect";
import type { TokenPrice } from "../domain/tokens";

interface AssetInputProps {
  amount: string;
  error?: string;
  getTokenIconUrl: (symbol: string) => string;
  id: string;
  label: string;
  onAmountChange?: (amount: string) => void;
  onAmountBlur?: () => void;
  onAmountFocus?: () => void;
  onTokenChange: (symbol: string) => void;
  readOnly?: boolean;
  tokenSymbol: string;
  tokens: TokenPrice[];
  usdValue: string;
}

export function AssetInput({
  amount,
  error,
  getTokenIconUrl,
  id,
  label,
  onAmountChange,
  onAmountBlur,
  onAmountFocus,
  onTokenChange,
  readOnly = false,
  tokenSymbol,
  tokens,
  usdValue
}: AssetInputProps) {
  return (
    <section className={`asset-panel${error ? " has-error" : ""}`}>
      <div className="asset-panel__top">
        <label htmlFor={id}>{label}</label>
        <span>{usdValue}</span>
      </div>
      <div className="asset-panel__main">
        <input
          aria-describedby={error ? `${id}-error` : undefined}
          id={id}
          inputMode="decimal"
          onBlur={onAmountBlur}
          onChange={(event) => onAmountChange?.(event.target.value)}
          onFocus={onAmountFocus}
          placeholder="0.00"
          readOnly={readOnly}
          type="text"
          value={amount}
        />
        <div className="asset-panel__token">
          <img alt="" src={getTokenIconUrl(tokenSymbol)} />
          <TokenSelect
            id={`${id}-token`}
            label={readOnly ? "Token to receive" : "Token to send"}
            onChange={onTokenChange}
            tokens={tokens}
            value={tokenSymbol}
          />
        </div>
      </div>
      {error ? (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
