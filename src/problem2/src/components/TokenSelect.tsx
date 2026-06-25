import type { TokenPrice } from "../domain/tokens";

interface TokenSelectProps {
  id: string;
  label: string;
  value: string;
  tokens: TokenPrice[];
  onChange: (symbol: string) => void;
}

export function TokenSelect({ id, label, value, tokens, onChange }: TokenSelectProps) {
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
