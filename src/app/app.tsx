import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";

import { apiConfig } from "./config/api";
import { reactQueryConfig } from "@/app/config";
import { queryClient, initializeQueryClient } from "@/shared/lib";
import { setAppConfig } from "@/shared/lib/config-types";
import { router } from "./router";

// Set the application config for shared layer
setAppConfig({
  apiConfig,
  reactQueryConfig,
});

// Initialize React Query client with app config
initializeQueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
