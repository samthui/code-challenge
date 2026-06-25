import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { APP_CONFIG, SERVER_STATE_LIBRARIES } from "../composition/appConfig.js";
import { createAppQueryClient } from "./tanstack/queryClient.js";

export function ServerStateProvider({ children, library = APP_CONFIG.serverStateLibrary }) {
  const [queryClient] = useState(() => createAppQueryClient());

  if (library === SERVER_STATE_LIBRARIES.tanstack) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return children;
}
