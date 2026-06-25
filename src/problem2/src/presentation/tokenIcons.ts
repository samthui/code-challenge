const DEFAULT_ICON_BASE_URL = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export function getTokenIconUrl(symbol: string, iconBaseUrl = DEFAULT_ICON_BASE_URL): string {
  return `${iconBaseUrl}/${encodeURIComponent(symbol)}.svg`;
}
