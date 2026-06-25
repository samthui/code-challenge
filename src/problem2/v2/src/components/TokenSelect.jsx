export function TokenSelect({ id, label, value, tokens, onChange }) {
  return (
    <label className="token-select" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {tokens.map((token) => (
          <option key={token.symbol} value={token.symbol}>
            {token.symbol}
          </option>
        ))}
      </select>
    </label>
  );
}
