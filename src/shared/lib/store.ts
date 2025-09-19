import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { StateCreator } from "zustand";

// Base store creator with common middleware
export const createStore = <T>(
  name: string,
  initializer: StateCreator<
    T,
    [["zustand/immer", never]],
    [["zustand/devtools", never]],
    T
  >
) => {
  return create<T>()(devtools(immer(initializer), { name }));
};

// Store composition helper for combining multiple stores
export const combineStores = <T extends Record<string, any>>(stores: T): T => {
  return stores;
};

// Utility type for store selectors
export type StoreSelector<T> = <U>(selector: (state: T) => U) => U;

// Helper to create memoized selectors (for use in components)
export const createMemoizedSelector = <T, U>(selector: (state: T) => U) =>
  selector;
