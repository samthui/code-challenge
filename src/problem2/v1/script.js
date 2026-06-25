const constants = window.SwapConstants;
const core = window.SwapCore;
const state = window.SwapView.createInitialState(constants);

const elements = Object.fromEntries(
  Object.entries(constants.SELECTORS).map(([key, selector]) => [key, document.querySelector(selector)])
);

const requestClient = window.RequestClient.createJsonRequestClient({
  fetchImpl: window.fetch.bind(window),
  storage: window.localStorage,
  now: Date.now
});

function getTokenIconUrl(symbol) {
  return `${constants.CONFIG.iconBaseUrl}/${encodeURIComponent(symbol)}.svg`;
}

function updateTokenIcon(imageElement, symbol) {
  imageElement.src = getTokenIconUrl(symbol);
  imageElement.alt = "";
  imageElement.onerror = () => imageElement.removeAttribute("src");
}

function renderTokenOptions(selectElement) {
  selectElement.innerHTML = state.tokens.map((token) => `<option value="${token.symbol}">${token.symbol}</option>`).join("");
}

function render() {
  elements.fromToken.value = state.fromSymbol;
  elements.toToken.value = state.toSymbol;
  updateTokenIcon(elements.fromIcon, state.fromSymbol);
  updateTokenIcon(elements.toIcon, state.toSymbol);
  window.SwapView.renderViewModel(elements, window.SwapView.createViewModel(state, constants, core));
}

async function handleSubmit(event) {
  event.preventDefault();
  const viewModel = window.SwapView.createViewModel(state, constants, core);
  if (viewModel.confirmDisabled) {
    render();
    return;
  }

  state.isSubmitting = true;
  state.successMessage = "";
  render();
  await new Promise((resolve) => setTimeout(resolve, 900));
  state.isSubmitting = false;
  state.successMessage = `${constants.UI_TEXT.successPrefix}: ${core.formatAmount(Number(state.amount), 8)} ${state.fromSymbol} → ${viewModel.toAmount} ${state.toSymbol}.`;
  render();
}

function bindEvents() {
  elements.fromAmount.addEventListener("input", (event) => {
    state.amount = event.target.value;
    state.successMessage = "";
    render();
  });
  elements.fromToken.addEventListener("change", (event) => {
    state.fromSymbol = event.target.value;
    state.successMessage = "";
    render();
  });
  elements.toToken.addEventListener("change", (event) => {
    state.toSymbol = event.target.value;
    state.successMessage = "";
    render();
  });
  elements.swapDirection.addEventListener("click", () => {
    const nextFrom = state.toSymbol;
    state.toSymbol = state.fromSymbol;
    state.fromSymbol = nextFrom;
    state.successMessage = "";
    render();
  });
  elements.form.addEventListener("submit", handleSubmit);
}

async function init() {
  elements.marketStatus.textContent = constants.UI_TEXT.loadingPrices;
  const result = await window.PriceService.loadTokens(requestClient);
  state.tokens = result.tokens;
  state.usedFallback = result.usedFallback;
  renderTokenOptions(elements.fromToken);
  renderTokenOptions(elements.toToken);
  if (!state.tokens.some((token) => token.symbol === state.fromSymbol)) state.fromSymbol = state.tokens[0].symbol;
  if (!state.tokens.some((token) => token.symbol === state.toSymbol)) state.toSymbol = state.tokens[1].symbol;
  bindEvents();
  render();
}

init();
