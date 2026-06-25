(function attachRequestClient(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RequestClient = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function createRequestClientModule() {
  function readCache(storage, cacheKey, now, cacheTtlMs) {
    if (!storage || !cacheKey || !cacheTtlMs) return null;
    const cached = storage.getItem(cacheKey);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (now() - parsed.savedAt > cacheTtlMs) return null;
    return parsed.value;
  }

  function writeCache(storage, cacheKey, now, value) {
    if (!storage || !cacheKey) return;
    storage.setItem(cacheKey, JSON.stringify({ savedAt: now(), value }));
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

  function createJsonRequestClient(dependencies) {
    const fetchImpl = dependencies.fetchImpl;
    const storage = dependencies.storage;
    const now = dependencies.now || Date.now;

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

  return { createJsonRequestClient };
});
