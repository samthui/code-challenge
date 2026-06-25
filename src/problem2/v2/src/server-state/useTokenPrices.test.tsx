import { renderHook } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { SERVER_STATE_LIBRARIES } from "../composition/appConfig";
import { createAppQueryClient } from "./tanstack/queryClient";
import { createTokenPricesResourceHook } from "./tokenPricesResourceFactory";
import { useTokenPrices } from "./useTokenPrices";

function createRepository() {
  return {
    getPrices: vi.fn(async () => [
      { currency: "ETH", price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
      { currency: "USDC", price: 1, date: "2023-08-29T07:10:00.000Z" }
    ])
  };
}

describe("useTokenPrices server-state adapters", () => {
  it("creates concrete TokenPricesResourceHook implementations by library", () => {
    expect(typeof createTokenPricesResourceHook(SERVER_STATE_LIBRARIES.plain)).toBe("function");
    expect(typeof createTokenPricesResourceHook(SERVER_STATE_LIBRARIES.tanstack)).toBe("function");
    expect(typeof createTokenPricesResourceHook(SERVER_STATE_LIBRARIES.swr)).toBe("function");
    expect(() => createTokenPricesResourceHook("custom-query")).toThrow(/Unsupported server-state library/);
  });

  it("exposes a stable resource contract for the plain adapter", () => {
    const repository = createRepository();
    const { result } = renderHook(() => useTokenPrices(repository, SERVER_STATE_LIBRARIES.plain));

    expect(result.current.tokens).toBeTruthy();
    expect(result.current.usedFallback).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(typeof result.current.refetch).toBe("function");
  });

  it("exposes a stable resource contract for the TanStack adapter", () => {
    const repository = createRepository();
    const queryClient = createAppQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () => useTokenPrices(repository, SERVER_STATE_LIBRARIES.tanstack),
      { wrapper }
    );

    expect(result.current.tokens).toBeTruthy();
    expect(result.current.usedFallback).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(typeof result.current.refetch).toBe("function");
  });

  it("exposes a stable resource contract for the SWR adapter", () => {
    const repository = createRepository();
    const { result } = renderHook(() => useTokenPrices(repository, SERVER_STATE_LIBRARIES.swr));

    expect(result.current.tokens).toBeTruthy();
    expect(result.current.usedFallback).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(typeof result.current.refetch).toBe("function");
  });
});
