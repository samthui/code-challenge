import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { APP_CONFIG, SERVER_STATE_LIBRARIES } from "../composition/appConfig";
import { createAppQueryClient } from "./tanstack/queryClient";
import type { ReactNode } from "react";
import type { ServerStateLibrary } from "../composition/appConfig";

interface ServerStateProviderProps {
  children: ReactNode;
  library?: ServerStateLibrary;
}

export function ServerStateProvider({ children, library = APP_CONFIG.serverStateLibrary }: ServerStateProviderProps) {
  const [queryClient] = useState(() => createAppQueryClient());

  if (library === SERVER_STATE_LIBRARIES.tanstack) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return children;
}
