import { subscribeWithSelector } from "zustand/middleware";

/**
 * Development utilities for Zustand stores
 */

// Store registry for debugging
const storeRegistry = new Map<string, any>();

export const registerStore = (name: string, store: any) => {
  if (import.meta.env.DEV) {
    storeRegistry.set(name, store);

    // Make stores available on window for debugging
    if (typeof window !== "undefined") {
      (window as any).__ZUSTAND_STORES__ = Object.fromEntries(storeRegistry);
    }
  }
};

// Enhanced store creator with debugging capabilities
export const createDebugStore = <T>(
  name: string,
  initializer: (set: any, get: any) => T
) => {
  const store = subscribeWithSelector(initializer);

  if (import.meta.env.DEV) {
    registerStore(name, store);

    // Log state changes in development
    /**
    store.subscribe(
      (state: any) => state,
      (state: any, prevState: any) => {
        console.group(`🏪 Store Update: ${name}`);
        console.log("Previous State:", prevState);
        console.log("New State:", state);
        console.groupEnd();
      }
    );*/
  }

  return store;
};

// Store performance monitoring
export const monitorStorePerformance = (storeName: string, store: any) => {
  if (import.meta.env.DEV) {
    const originalSubscribe = store.subscribe;

    store.subscribe = (...args: any[]) => {
      const start = performance.now();
      const result = originalSubscribe.apply(store, args);
      const end = performance.now();

      if (end - start > 16) {
        // More than one frame (16ms)
        console.warn(
          `⚠️ Slow store subscription in ${storeName}: ${end - start}ms`
        );
      }

      return result;
    };
  }
};

// Store state validator
export const validateStoreState = <T>(
  storeName: string,
  state: T,
  schema?: (state: T) => boolean
) => {
  if (import.meta.env.DEV && schema) {
    try {
      const isValid = schema(state);
      if (!isValid) {
        console.error(`❌ Invalid state in store ${storeName}:`, state);
      }
    } catch (error) {
      console.error(`❌ State validation error in store ${storeName}:`, error);
    }
  }
};

// Store action logger
export const logStoreAction = (
  storeName: string,
  actionName: string,
  payload?: any
) => {
  if (import.meta.env.DEV) {
    console.log(
      `🎬 Action: ${storeName}.${actionName}`,
      payload ? { payload } : ""
    );
  }
};

// Store reset utility for testing
export const resetAllStores = () => {
  if (import.meta.env.DEV) {
    storeRegistry.forEach((store, name) => {
      if (
        typeof store.getState === "function" &&
        typeof store.setState === "function"
      ) {
        console.log(`🔄 Resetting store: ${name}`);
        // This would need to be implemented per store based on their initial state
      }
    });
  }
};
