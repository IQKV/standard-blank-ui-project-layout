import { useCallback, useState } from "react";
import { PREVIOUS_URL_KEY } from "./constants";

export const getPreviousUrl = (): string | null => {
  try {
    const prev = window?.localStorage?.getItem(PREVIOUS_URL_KEY);
    return prev && typeof prev === "string" ? prev : null;
  } catch {
    return null;
  }
};

export const clearPreviousUrl = (): void => {
  try {
    window?.localStorage?.removeItem(PREVIOUS_URL_KEY);
  } catch {}
};

export const usePreviousUrl = () => {
  const [previousUrl, setPreviousUrl] = useState<string | null>(() => getPreviousUrl());

  const refresh = useCallback(() => {
    setPreviousUrl(getPreviousUrl());
  }, []);

  const clear = useCallback(() => {
    clearPreviousUrl();
    setPreviousUrl(null);
  }, []);

  return { previousUrl, refresh, clear } as const;
};