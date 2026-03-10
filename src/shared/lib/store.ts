import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { StateCreator, StoreApi, UseBoundStore } from "zustand";

// Base store creator with common middleware
// Use any to avoid complex middleware typing issues
export type StoreInitializer<T> = StateCreator<T, any, any, T>;

// Safe name for DevTools and registry in SSR/tests
const getStoreLabel = (name?: string) => name || "store";

// Base store creator with common middleware and selector subscriptions
export const createStore = <T>(
  name: string,
  initializer: StoreInitializer<T>,
): UseBoundStore<StoreApi<T>> => {
  const label = getStoreLabel(name);
  const withImmer = immer(initializer as any);
  const withSubscribe = subscribeWithSelector(withImmer);
  const enhanced = import.meta.env?.DEV ? devtools(withSubscribe, { name: label }) : withSubscribe;
  return create<T>()(enhanced as any);
};

// Store composition helper for combining multiple stores
export const combineStores = <T extends Record<string, any>>(stores: T): T => {
  return stores;
};

// Utility type for store selectors
export type StoreSelector<T> = <U>(selector: (state: T) => U) => U;

// Helper to create memoized selectors (for use in components)
export const createMemoizedSelector = <T, U>(selector: (state: T) => U) => selector;

// Narrow a store to selected fields/actions for better typing in components
export const pickFromStore = <TState, TPicked>(
  useStore: UseBoundStore<StoreApi<TState>>,
  picker: (state: TState) => TPicked,
): (() => TPicked) => {
  return () => useStore(picker);
};
