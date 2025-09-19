import { StateCreator } from "zustand";

export interface PersistOptions<T> {
  name: string;
  storage?: Storage;
  partialize?: (state: T) => Partial<T>;
  onRehydrateStorage?: (state: T) => void;
  version?: number;
  migrate?: (persistedState: any, version: number) => T;
  skipHydration?: boolean;
}

interface PersistedData<T> {
  state: Partial<T>;
  version: number;
}

// Simple persistence middleware for Zustand stores
const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

export const persist = <T>(
  config: StateCreator<T>,
  options: PersistOptions<T>
) => {
  const {
    name,
    storage = isBrowser ? localStorage : undefined,
    partialize = (state) => state,
    onRehydrateStorage,
    version = 0,
    migrate,
    skipHydration = false,
  } = options;

  return (set: any, get: any, api: any) => {
    const persistedState = config(
      (...args) => {
        set(...args);
        if (!storage) return; // SSR/tests without storage
        // Save to storage after state update
        const state = get();
        const stateToStore = partialize(state);
        try {
          storage.setItem(
            name,
            JSON.stringify({
              state: stateToStore,
              version,
            })
          );
        } catch (error) {
          console.warn(`Failed to persist state for ${name}:`, error);
        }
      },
      get,
      api
    );

    // Hydrate from storage on initialization
    if (!skipHydration && storage) {
      try {
        const storedValue = storage.getItem(name);
        if (storedValue) {
          const parsed = JSON.parse(storedValue) as PersistedData<T>;

          // Validate the parsed structure
          if (parsed && typeof parsed === "object" && "state" in parsed) {
            const { state: persistedData, version: persistedVersion = 0 } =
              parsed;

            let stateToRestore = persistedData;

            // Handle migration if version mismatch
            if (migrate && persistedVersion !== version) {
              stateToRestore = migrate(persistedData, persistedVersion);
            }

            // Merge persisted state with initial state
            if (stateToRestore && typeof stateToRestore === "object") {
              // Safely merge partial state into the full state object
              // Using type assertion since we're merging partial restored state
              Object.assign(
                persistedState as Record<string, any>,
                stateToRestore
              );
            }

            // Call rehydration callback
            onRehydrateStorage?.(persistedState);
          }
        }
      } catch (error) {
        console.warn(`Failed to hydrate state for ${name}:`, error);
      }
    }

    return persistedState;
  };
};

// Utility to clear persisted state
export const clearPersistedState = (
  name: string,
  storage: Storage = isBrowser ? localStorage : memoryStorage
) => {
  try {
    storage.removeItem(name);
  } catch (error) {
    console.warn(`Failed to clear persisted state for ${name}:`, error);
  }
};

// Utility to check if state exists in storage
export const hasPersistedState = (
  name: string,
  storage: Storage = isBrowser ? localStorage : memoryStorage
): boolean => {
  try {
    return storage.getItem(name) !== null;
  } catch (error) {
    console.warn(`Failed to check persisted state for ${name}:`, error);
    return false;
  }
};

// Session storage variant
export const sessionPersist = <T>(
  config: StateCreator<T>,
  options: Omit<PersistOptions<T>, "storage">
) => {
  return persist(config, {
    ...options,
    storage: isBrowser ? sessionStorage : memoryStorage,
  });
};

// Memory storage for testing or when persistence is not desired
class MemoryStorage implements Storage {
  private data: { [key: string]: string } = {};

  get length() {
    return Object.keys(this.data).length;
  }

  clear(): void {
    this.data = {};
  }

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  setItem(key: string, value: string): void {
    this.data[key] = value;
  }
}

export const memoryStorage = new MemoryStorage();

// Memory storage variant
export const memoryPersist = <T>(
  config: StateCreator<T>,
  options: Omit<PersistOptions<T>, "storage">
) => {
  return persist(config, {
    ...options,
    storage: memoryStorage,
  });
};
