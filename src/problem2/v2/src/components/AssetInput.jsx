import { TokenSelect } from "./TokenSelect.jsx";

export function AssetInput({
  amount,
  error,
  getTokenIconUrl,
  id,
  label,
  onAmountChange,
  onTokenChange,
  readOnly = false,
  tokenSymbol,
  tokens,
  usdValue
}) {
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
          onChange={(event) => onAmountChange?.(event.target.value)}
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
