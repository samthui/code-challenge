import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function createMemoryStorage(): Pick<Storage, "getItem" | "setItem"> {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  };
}

describe("Currency Swap V2", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createMemoryStorage()
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("quotes, validates, swaps, and submits", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => [
        { currency: "ETH", price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
        { currency: "USDC", price: 1, date: "2023-08-29T07:10:00.000Z" },
        { currency: "USD", price: 1, date: "2023-08-29T07:10:00.000Z" }
      ]
    })));

    render(<App />);

    const user = userEvent.setup();
    const amount = await screen.findByLabelText(/amount to send/i);
    await user.type(amount, "1");

    expect(await screen.findByDisplayValue(/1,645.93/)).toBeTruthy();

    await user.selectOptions(screen.getByLabelText(/token to receive/i), "ETH");
    expect(screen.getByText("Choose two different tokens.")).toBeTruthy();

    await user.selectOptions(screen.getByLabelText(/token to receive/i), "USDC");
    await user.click(screen.getByRole("button", { name: /confirm swap/i }));

    await waitFor(() => {
      expect(screen.getByText(/Swap preview ready/i)).toBeTruthy();
    });
  });

  it("shows fallback prices when live prices cannot load", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));

    render(<App />);

    expect(await screen.findByText("Fallback prices")).toBeTruthy();

    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/amount to send/i), "1");

    expect(await screen.findByDisplayValue(/1,645.93373737/)).toBeTruthy();
  });

  it("switches the send and receive tokens without changing the amount", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => [
        { currency: "ETH", price: 1645.93, date: "2023-08-29T07:10:00.000Z" },
        { currency: "USDC", price: 1, date: "2023-08-29T07:10:00.000Z" }
      ]
    })));

    render(<App />);

    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/amount to send/i), "1");
    expect(await screen.findByDisplayValue(/1,645.93/)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /switch from and to tokens/i }));

    expect((screen.getByLabelText(/token to send/i) as HTMLSelectElement).value).toBe("USDC");
    expect((screen.getByLabelText(/token to receive/i) as HTMLSelectElement).value).toBe("ETH");
    expect((screen.getByLabelText(/amount to send/i) as HTMLInputElement).value).toBe("1");
  });
});
