import { createSwapViewModel } from "../../../shared/presentation/createSwapViewModel.js";
import { getTokenIconUrl } from "../../../shared/presentation/tokenIcons.js";
import { UI_TEXT } from "../../../shared/presentation/uiText.js";
import { AssetInput } from "./AssetInput.jsx";
import { QuoteSummary } from "./QuoteSummary.jsx";
import { APP_CONFIG } from "../composition/appConfig.js";
import { createPriceRepository } from "../composition/priceRepository.js";
import { useSwapForm } from "../hooks/useSwapForm.js";
import { useMemo } from "react";
import { useTokenPrices } from "../server-state/useTokenPrices.js";

export function SwapForm() {
  const priceRepository = useMemo(
    () => createPriceRepository({ httpClientType: APP_CONFIG.httpClient }),
    []
  );
  const priceState = useTokenPrices(priceRepository, APP_CONFIG.serverStateLibrary);
  const form = useSwapForm();
  const model = createSwapViewModel({
    amount: form.amount,
    fromSymbol: form.fromSymbol,
    isSubmitting: form.isSubmitting,
    successMessage: form.successMessage,
    tokens: priceState.tokens,
    toSymbol: form.toSymbol,
    usedFallback: priceState.usedFallback
  });

  function handleSubmit(event) {
    event.preventDefault();
    if (model.confirmDisabled) return;

    form.setIsSubmitting(true);
    form.setSuccessMessage("");
    window.setTimeout(() => {
      form.setIsSubmitting(false);
      form.setSuccessMessage(
        `${UI_TEXT.successPrefix}: ${form.amount} ${form.fromSymbol} to ${model.toAmount} ${form.toSymbol}`
      );
    }, 650);
  }

  return (
    <form className="swap-form" onSubmit={handleSubmit}>
      <header className="swap-header">
        <div>
          <p>Currency Swap</p>
          <h1>Swap crypto assets</h1>
        </div>
        <span className={`market-pill${priceState.usedFallback ? " is-fallback" : ""}`}>
          {priceState.isLoading ? UI_TEXT.loadingPrices : model.marketStatus}
        </span>
      </header>

      <AssetInput
        amount={form.amount}
        error={model.amountError}
        getTokenIconUrl={getTokenIconUrl}
        id="from-amount"
        label="Amount to send"
        onAmountChange={form.setAmount}
        onTokenChange={form.setFromSymbol}
        tokenSymbol={form.fromSymbol}
        tokens={priceState.tokens}
        usdValue={model.fromUsd}
      />

      <button className="swap-direction" type="button" aria-label="Switch from and to tokens" onClick={form.switchTokens}>
        ⇅
      </button>

      <AssetInput
        amount={model.toAmount}
        getTokenIconUrl={getTokenIconUrl}
        id="to-amount"
        label="Amount to receive"
        onTokenChange={form.setToSymbol}
        readOnly
        tokenSymbol={form.toSymbol}
        tokens={priceState.tokens}
        usdValue={model.toUsd}
      />

      <QuoteSummary model={model} />

      {model.formMessage ? (
        <p className={`form-message${model.quote.isValid ? " is-success" : " is-error"}`} role="status">
          {model.formMessage}
        </p>
      ) : null}

      <button className="confirm-button" disabled={model.confirmDisabled} type="submit">
        {form.isSubmitting ? UI_TEXT.confirming : UI_TEXT.confirmSwap}
      </button>
    </form>
  );
}
