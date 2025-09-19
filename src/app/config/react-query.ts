import type { QueryClientConfig } from "@tanstack/react-query";

const isRetryableStatus = (status?: number) => {
  if (!status) return true;
  // Do not retry on client or auth errors
  if ([400, 401, 403, 404, 409, 422].includes(status)) return false;
  // Retry on rate limiting and server errors
  if (status === 408 || status === 429) return true;
  return status >= 500;
};

export const standardRetry = (failureCount: number, error: any): boolean => {
  const status: number | undefined = error?.response?.status ?? error?.status;
  if (!isRetryableStatus(status)) return false;
  return failureCount < 3;
};

export const standardRetryDelay = (attemptIndex: number): number => {
  const base = 500;
  const max = 4000;
  const delay = Math.min(base * Math.pow(2, attemptIndex), max);
  return delay;
};

export const reactQueryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      networkMode: "always",
      retry: standardRetry,
      retryDelay: standardRetryDelay,
    },
    mutations: {
      networkMode: "always",
      retry: standardRetry,
      retryDelay: standardRetryDelay,
    },
  },
};
