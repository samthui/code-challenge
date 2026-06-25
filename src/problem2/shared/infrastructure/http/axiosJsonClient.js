export function createAxiosJsonClient(axiosInstance) {
  return {
    async getJson(url, options = {}) {
      const response = await axiosInstance.get(url, {
        signal: options.signal,
        timeout: options.timeoutMs
      });
      return response.data;
    }
  };
}
