export function getBrowserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
