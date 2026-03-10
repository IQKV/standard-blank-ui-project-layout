export { App } from "./app";
export * as AppConfig from "./config";
export * from "./ui";
import { initializeMockWorker } from "@/shared/api/mock/browser";
import { getAppConfig } from "@/shared/lib/config-types";

/**
 * Initialize the application
 */
export const initializeApp = async () => {
  // Initialize mock API if enabled
  try {
    const config = getAppConfig();
    if (config.apiConfig.mockApi) {
      console.log("[App] Mock API is enabled, initializing mock service worker");
      await initializeMockWorker();
    }
  } catch (error) {
    console.error("[App] Failed to initialize mock API:", error);
  }

  // Add more initialization logic here as needed
};
