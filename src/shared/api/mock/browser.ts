import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

/**
 * Create MSW worker instance for browser environment
 */
export const worker = setupWorker(...handlers);

/**
 * Initialize the MSW worker
 */
export const initializeMockWorker = async () => {
  // Enable debug mode in development
  if (import.meta.env.DEV) {
    console.log("[Mock API] Initializing mock service worker...");
  }

  // Start the worker with custom service worker
  await worker.start({
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
    onUnhandledRequest: "bypass", // Don't warn about unhandled requests
  });

  return worker;
};
