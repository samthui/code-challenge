function readCache(storage, cacheKey, now, cacheTtlMs) {
  if (!storage || !cacheKey || !cacheTtlMs) return null;
  try {
    const cached = storage.getItem(cacheKey);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (now() - parsed.savedAt > cacheTtlMs) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

function writeCache(storage, cacheKey, now, value) {
  if (!storage || !cacheKey) return;
  try {
    storage.setItem(cacheKey, JSON.stringify({ savedAt: now(), value }));
  } catch {
    // Cache writes should never turn a successful network response into a failure.
  }
}

function createFetchOptions(timeoutMs) {
  if (!Number.isFinite(timeoutMs)) return { options: undefined, clear: () => {} };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    const error = new Error(`Request timed out after ${timeoutMs}ms`);
    error.name = "TimeoutError";
    controller.abort(error);
  }, timeoutMs);

  return {
    options: { signal: controller.signal },
    clear: () => clearTimeout(timeoutId)
  };
}

export function createJsonRequestClient({ fetchImpl, storage, now = Date.now }) {
  async function getJson(url, options = {}) {
    const cached = readCache(storage, options.cacheKey, now, options.cacheTtlMs);
    if (cached) return cached;

    const retries = Number.isFinite(options.retries) ? options.retries : 0;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const request = createFetchOptions(options.timeoutMs);
      try {
        const response = await fetchImpl(url, request.options);
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const value = await response.json();
        writeCache(storage, options.cacheKey, now, value);
        return value;
      } catch (error) {
        lastError = error;
      } finally {
        request.clear();
      }
    }
    throw lastError;
  }

  return { getJson };
}
