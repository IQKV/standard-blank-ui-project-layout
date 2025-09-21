import { StrictMode, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";

import { queryClient, setAppConfig, initializeQueryClient } from "@/shared/lib";
import { router } from "./router";
import * as AppConfig from "./config";

export function App() {
  // Initialize config for shared layer
  useEffect(() => {
    setAppConfig({
      apiConfig: AppConfig.apiConfig,
      reactQueryConfig: AppConfig.reactQueryConfig,
    });
    initializeQueryClient();
  }, []);

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  );
}
