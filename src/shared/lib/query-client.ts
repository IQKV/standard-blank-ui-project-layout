import { QueryClient } from "@tanstack/react-query";
import { getAppConfig } from "./config-types";

// Create query client with lazy config loading
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Function to initialize query client with app config
export const initializeQueryClient = () => {
  try {
    const config = getAppConfig();
    // Update query client with app-specific config if needed
    queryClient.setDefaultOptions(config.reactQueryConfig.defaultOptions || {});
  } catch (_error) {
    // Config not yet available, use defaults
    console.warn("Query client initialized with default config");
  }
};
