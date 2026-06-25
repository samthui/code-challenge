export function QuoteSummary({ model }) {
  return (
    <aside className="quote-summary" aria-label="Swap details">
      <dl>
        <div>
          <dt>Rate</dt>
          <dd>{model.quoteRate || "Enter an amount"}</dd>
        </div>
        <div>
          <dt>Minimum received</dt>
          <dd>{model.minimumReceived || "-"}</dd>
        </div>
        <div>
          <dt>Network fee</dt>
          <dd>{model.networkFee}</dd>
        </div>
        <div>
          <dt>Slippage</dt>
          <dd>{model.slippage}</dd>
        </div>
      </dl>
    </aside>
  );
}
