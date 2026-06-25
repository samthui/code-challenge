import { useEffect, useMemo, useState } from "react";
import { FALLBACK_TOKENS } from "../../../shared/domain/tokens.js";
import { loadTokenPrices } from "../../../shared/application/loadTokenPrices.js";
import { createJsonRequestClient } from "../../../shared/infrastructure/requestClient.js";
import { createSwitcheoPriceRepository } from "../../../shared/infrastructure/switcheoPriceRepository.js";

function getBrowserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useTokenPrices() {
  const repository = useMemo(() => {
    const requestClient = createJsonRequestClient({
      fetchImpl: (...args) => globalThis.fetch(...args),
      storage: getBrowserStorage()
    });
    return createSwitcheoPriceRepository(requestClient);
  }, []);

  const [state, setState] = useState({
    error: null,
    isLoading: true,
    tokens: FALLBACK_TOKENS,
    usedFallback: true
  });

  useEffect(() => {
    let isActive = true;

    setState((current) => ({ ...current, isLoading: true }));
    loadTokenPrices(repository).then((result) => {
      if (!isActive) return;
      setState({
        error: result.error,
        isLoading: false,
        tokens: result.tokens,
        usedFallback: result.usedFallback
      });
    });

    return () => {
      isActive = false;
    };
  }, [repository]);

  return { ...state, repository };
}
