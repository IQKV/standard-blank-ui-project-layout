import axios, { AxiosError } from "axios";

export enum ApiErrorKind {
  Network = "Network",
  Timeout = "Timeout",
  Unauthorized = "Unauthorized",
  Forbidden = "Forbidden",
  NotFound = "NotFound",
  Conflict = "Conflict",
  TooManyRequests = "TooManyRequests",
  ClientError = "ClientError",
  ServerError = "ServerError",
  Canceled = "Canceled",
  Validation = "Validation",
  Unknown = "Unknown",
}

export interface NormalizedApiError {
  kind: ApiErrorKind;
  status?: number;
  code?: string | number;
  message: string;
  data?: unknown;
  details?: unknown;
  url?: string;
  method?: string;
  requestId?: string;
  // Keep the original error for debugging purposes
  original: unknown;
}

const isCanceled = (err: any): boolean => {
  // Axios v1 sets code to 'ERR_CANCELED' and name to 'CanceledError'
  return err?.code === "ERR_CANCELED" || err?.name === "CanceledError";
};

const isTimeout = (err: any): boolean => {
  return (
    err?.code === "ECONNABORTED" ||
    (typeof err?.message === "string" && err.message.toLowerCase().includes("timeout"))
  );
};

const hasValidationDetails = (data: any): boolean => {
  if (!data) return false;
  const errors = (data as any).errors;
  return !!errors && (Array.isArray(errors) || typeof errors === "object");
};

export const normalizeAxiosError = (error: unknown): NormalizedApiError => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>;
    const status = err.response?.status;
    const code = err.code;
    const url = err.config?.url;
    const method = err.config?.method?.toUpperCase();
    const requestId = (err.response?.headers?.["x-request-id"] as string) || undefined;

    let kind: ApiErrorKind = ApiErrorKind.Unknown;

    if (isCanceled(err)) {
      kind = ApiErrorKind.Canceled;
    } else if (!err.response) {
      kind = isTimeout(err) ? ApiErrorKind.Timeout : ApiErrorKind.Network;
    } else if (status === 401) {
      kind = ApiErrorKind.Unauthorized;
    } else if (status === 403) {
      kind = ApiErrorKind.Forbidden;
    } else if (status === 404) {
      kind = ApiErrorKind.NotFound;
    } else if (status === 409) {
      kind = ApiErrorKind.Conflict;
    } else if (status === 429) {
      kind = ApiErrorKind.TooManyRequests;
    } else if (status && status >= 500) {
      kind = ApiErrorKind.ServerError;
    } else if (status && status >= 400) {
      kind = hasValidationDetails(err.response?.data)
        ? ApiErrorKind.Validation
        : ApiErrorKind.ClientError;
    }

    // Prefer server-provided message, fall back to Axios message
    const serverMessage =
      (typeof err.response?.data?.message === "string" && err.response?.data?.message) ||
      (typeof (err.response?.data as any)?.error === "string" &&
        (err.response?.data as any)?.error);

    const message = serverMessage || err.message || "Request failed";

    return {
      kind,
      status,
      code,
      message,
      data: err.response?.data,
      details: (err.response?.data as any)?.errors,
      url,
      method,
      requestId,
      original: error,
    };
  }

  // Non-Axios errors
  const genericMessage =
    (error as any)?.message || (typeof error === "string" ? (error as string) : "Unknown error");
  return {
    kind: ApiErrorKind.Unknown,
    message: genericMessage,
    original: error,
  };
};

export const isNormalizedApiError = (value: unknown): value is NormalizedApiError => {
  return (
    !!value &&
    typeof value === "object" &&
    "kind" in (value as object) &&
    "message" in (value as object)
  );
};

export const getUserMessage = (
  err: NormalizedApiError,
  opts?: {
    map?: Partial<Record<ApiErrorKind, string>>;
    includeRequestId?: boolean;
  },
): string => {
  const defaultMap: Record<ApiErrorKind, string> = {
    [ApiErrorKind.Timeout]: "Request timed out. Please try again.",
    [ApiErrorKind.Network]: "Network error. Check your connection and try again.",
    [ApiErrorKind.Canceled]: "Request was canceled.",
    [ApiErrorKind.Unauthorized]: "You need to sign in to continue.",
    [ApiErrorKind.Forbidden]: "You don’t have permission to perform this action.",
    [ApiErrorKind.NotFound]: "The requested resource was not found.",
    [ApiErrorKind.Conflict]: "The request could not be completed due to a conflict.",
    [ApiErrorKind.TooManyRequests]: "Too many requests. Please slow down and try again later.",
    [ApiErrorKind.Validation]: "Some inputs are invalid. Please review the form.",
    [ApiErrorKind.ClientError]: "There was an issue with your request.",
    [ApiErrorKind.ServerError]: "A server error occurred. Please try again later.",
    [ApiErrorKind.Unknown]: "Something went wrong. Please try again.",
  };

  const map = { ...defaultMap, ...(opts?.map || {}) };
  const base = map[err.kind] || err.message || defaultMap[ApiErrorKind.Unknown];

  // Optionally include a request ID to help trace production issues
  if (opts?.includeRequestId && err.requestId) {
    return `${base} (request id: ${err.requestId})`;
  }

  return base;
};
