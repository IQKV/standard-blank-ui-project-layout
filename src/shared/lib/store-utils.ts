import { shallow } from "zustand/shallow";
import type { StoreApi, UseBoundStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";

// Shallow equality for objects/arrays to minimize re-renders
export const shallowEqual = <T>(a: T, b: T): boolean => shallow(a as any, b as any);

// Memoize a single-arg function (selector/combiner) with last-arg cache
export const memoizeOne = <A, R>(fn: (arg: A) => R) => {
  let lastArg: A | undefined;
  let lastResult: R | undefined;
  let hasValue = false;
  return (arg: A): R => {
    if (hasValue && Object.is(arg, lastArg)) {
      return lastResult as R;
    }
    lastArg = arg;
    lastResult = fn(arg);
    hasValue = true;
    return lastResult;
  };
};

// Create a memoized selector with optional custom equality for the output value
export const createMemoSelector = <S, R>(
  selector: (state: S) => R,
  isEqual: (a: R, b: R) => boolean = Object.is,
) => {
  let hasValue = false;
  let lastState: S | undefined;
  let lastValue: R | undefined;
  return (state: S): R => {
    if (hasValue && state === lastState) return lastValue as R;
    const next = selector(state);
    if (hasValue && isEqual(next, lastValue as R)) {
      lastState = state;
      return lastValue as R;
    }
    lastState = state;
    lastValue = next;
    hasValue = true;
    return next;
  };
};

// Compose multiple input selectors into a memoized result
export const createSelector = <S, A extends any[], R>(
  inputs: { [K in keyof A]: (state: S) => A[K] },
  combiner: (...args: A) => R,
  isEqual: (a: R, b: R) => boolean = Object.is,
) => {
  let hasValue = false;
  let lastArgs: A | undefined;
  let lastResult: R | undefined;
  return (state: S): R => {
    const args = inputs.map((s) => s(state)) as A;
    if (
      hasValue &&
      lastArgs &&
      args.length === lastArgs.length &&
      args.every((v, i) => Object.is(v, (lastArgs as A)[i]))
    ) {
      return lastResult as R;
    }
    const next = combiner(...args);
    if (hasValue && isEqual(next, lastResult as R)) {
      lastArgs = args;
      return lastResult as R;
    }
    lastArgs = args;
    lastResult = next;
    hasValue = true;
    return next;
  };
};

// Keyed selector cache (per id) to avoid large caches and recomputations
export const createKeyedSelector = <K extends string | number, S, R>(
  compute: (state: S, key: K) => R,
  isEqual: (a: R, b: R) => boolean = Object.is,
) => {
  const cache = new Map<K, (state: S) => R>();
  return (key: K) => {
    let entry = cache.get(key);
    if (!entry) {
      let hasValue = false;
      let lastState: S | undefined;
      let lastValue: R | undefined;
      entry = (state: S) => {
        if (hasValue && state === lastState) return lastValue as R;
        const next = compute(state, key);
        if (hasValue && isEqual(next, lastValue as R)) {
          lastState = state;
          return lastValue as R;
        }
        lastState = state;
        lastValue = next;
        hasValue = true;
        return next;
      };
      cache.set(key, entry);
    }
    return entry;
  };
};

// Hook helper: apply shallow equality to a selector for a given store
export const useShallow = <S, R>(
  useStore: UseBoundStore<StoreApi<S>>,
  selector: (state: S) => R,
): R => useStoreWithEqualityFn(useStore, selector, shallow);

// Stable object pick from a store using shallow equality
export const selectKeys =
  <S extends object, K extends keyof S>(keys: readonly K[]) =>
  (state: S): Pick<S, K> => {
    const picked: Partial<S> = {};
    for (const key of keys) picked[key] = state[key];
    return picked as Pick<S, K>;
  };

export const usePick = <S extends object, K extends keyof S>(
  useStore: UseBoundStore<StoreApi<S>>,
  keys: readonly K[],
) => useStoreWithEqualityFn(useStore, selectKeys<S, K>(keys), shallow);

// Stable callback creator to avoid re-renders when passing actions into props
export const stableCallback = <T extends (...args: any[]) => any>(fn: T): T => {
  const latest = fn;
  return ((...args: any[]) => latest(...args)) as T;
};
