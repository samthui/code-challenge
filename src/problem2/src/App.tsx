import { SwapForm } from "./components/SwapForm";
import { APP_CONFIG } from "./composition/appConfig";
import { ServerStateProvider } from "./server-state/ServerStateProvider";

export default function App() {
  return (
    <ServerStateProvider library={APP_CONFIG.serverStateLibrary}>
      <main className="app-shell">
        <SwapForm />
      </main>
    </ServerStateProvider>
  );
}
