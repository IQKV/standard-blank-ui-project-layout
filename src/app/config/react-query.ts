import type { QueryClientConfig, QueryClient } from "@tanstack/react-query";
import { ApiErrorKind, isNormalizedApiError } from "@/shared/api";

const isRetryableStatus = (status?: number) => {
  if (!status) return true;
  // Do not retry on client or auth errors
  if ([400, 401, 403, 404, 409, 422].includes(status)) return false;
  // Retry on rate limiting and server errors
  if (status === 408 || status === 429) return true;
  return status >= 500;
};

export const standardRetry = (
  failureCount: number,
  error: unknown
): boolean => {
  const anyErr: any = error as any;
  const status: number | undefined = anyErr?.response?.status ?? anyErr?.status;
  if (!isRetryableStatus(status)) return false;
  return failureCount < 3;
};

export const standardRetryDelay = (attemptIndex: number): number => {
  const base = 500;
  const max = 4000;
  const delay = Math.min(base * Math.pow(2, attemptIndex), max);
  return delay;
};

// App-level auth redirect handling for Unauthorized/Forbidden
const LOGIN_PATH = "/auth/login";
const PREVIOUS_URL_KEY = "previous_url";
const ALLOWED_UNAUTHENTICATED_PATHS = ["auth/login", "auth"];

export const handleAuthRedirect = (error: unknown): void => {
  if (!isNormalizedApiError(error)) return;
  const { kind } = error;
  if (kind !== ApiErrorKind.Unauthorized && kind !== ApiErrorKind.Forbidden)
    return;

  const currentPath = window?.location?.pathname || "";
  const isAllowed = ALLOWED_UNAUTHENTICATED_PATHS.some((p) =>
    currentPath.includes(p)
  );
  if (isAllowed) return;

  try {
    window?.localStorage?.setItem(
      PREVIOUS_URL_KEY,
      window?.location?.href || ""
    );
  } catch {}
  try {
    window?.location?.replace(LOGIN_PATH);
  } catch {}
};

export const setupReactQueryAuthRedirects = (client: QueryClient): void => {
  // Listen for query errors
  client.getQueryCache().subscribe((event: unknown) => {
    const e = event as {
      type?: string;
      query?: { state?: { error?: unknown } };
    };
    if (e?.type === "updated") {
      const err = e?.query?.state?.error;
      if (err) handleAuthRedirect(err);
    }
  });

  // Listen for mutation errors
  client.getMutationCache().subscribe((event: unknown) => {
    const e = event as {
      type?: string;
      mutation?: { state?: { error?: unknown } };
    };
    if (e?.type === "updated") {
      const err = e?.mutation?.state?.error;
      if (err) handleAuthRedirect(err);
    }
  });
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
