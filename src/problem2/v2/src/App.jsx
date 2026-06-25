import { SwapForm } from "./components/SwapForm.jsx";
import { APP_CONFIG } from "./composition/appConfig.js";
import { ServerStateProvider } from "./server-state/ServerStateProvider.jsx";

export default function App() {
  return (
    <ServerStateProvider library={APP_CONFIG.serverStateLibrary}>
      <main className="app-shell">
        <SwapForm />
      </main>
    </ServerStateProvider>
  );
}
