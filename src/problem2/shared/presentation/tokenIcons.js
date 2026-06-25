const DEFAULT_ICON_BASE_URL = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export function getTokenIconUrl(symbol, iconBaseUrl = DEFAULT_ICON_BASE_URL) {
  return `${iconBaseUrl}/${encodeURIComponent(symbol)}.svg`;
}
