import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  standardRetry,
  standardRetryDelay,
  setupReactQueryAuthRedirects,
  reactQueryConfig,
} from "./react-query";
import { ApiErrorKind, type NormalizedApiError } from "@/shared/api";

describe("React Query configuration", () => {
  describe("standardRetry", () => {
    it("should retry on retryable status codes", () => {
      // Server errors (5xx)
      expect(standardRetry(1, { response: { status: 500 } })).toBe(true);
      expect(standardRetry(1, { response: { status: 502 } })).toBe(true);
      expect(standardRetry(1, { response: { status: 503 } })).toBe(true);

      // Rate limiting and timeout
      expect(standardRetry(1, { response: { status: 408 } })).toBe(true);
      expect(standardRetry(1, { response: { status: 429 } })).toBe(true);

      // No status (network errors)
      expect(standardRetry(1, { response: undefined })).toBe(true);
      expect(standardRetry(1, {})).toBe(true);
    });

    it("should not retry on non-retryable status codes", () => {
      // Client errors that shouldn't be retried
      expect(standardRetry(1, { response: { status: 400 } })).toBe(false);
      expect(standardRetry(1, { response: { status: 401 } })).toBe(false);
      expect(standardRetry(1, { response: { status: 403 } })).toBe(false);
      expect(standardRetry(1, { response: { status: 404 } })).toBe(false);
      expect(standardRetry(1, { response: { status: 409 } })).toBe(false);
      expect(standardRetry(1, { response: { status: 422 } })).toBe(false);
    });

    it("should not retry after max attempts", () => {
      expect(standardRetry(3, { response: { status: 500 } })).toBe(false);
      expect(standardRetry(4, { response: { status: 500 } })).toBe(false);
    });

    it("should handle errors with status property", () => {
      expect(standardRetry(1, { status: 500 })).toBe(true);
      expect(standardRetry(1, { status: 401 })).toBe(false);
    });
  });

  describe("standardRetryDelay", () => {
    it("should calculate exponential backoff delay", () => {
      expect(standardRetryDelay(0)).toBe(500); // base delay
      expect(standardRetryDelay(1)).toBe(1000); // 500 * 2^1
      expect(standardRetryDelay(2)).toBe(2000); // 500 * 2^2
      expect(standardRetryDelay(3)).toBe(4000); // 500 * 2^3, capped at max
    });

    it("should cap delay at maximum value", () => {
      expect(standardRetryDelay(10)).toBe(4000); // Should be capped at 4000ms
      expect(standardRetryDelay(100)).toBe(4000); // Should be capped at 4000ms
    });
  });

  describe("setupReactQueryAuthRedirects", () => {
    let mockQueryClient: QueryClient;
    let mockQueryCache: any;
    let mockMutationCache: any;
    let originalLocation: Location;
    let originalLocalStorage: Storage;

    beforeEach(() => {
      // Mock query and mutation caches
      mockQueryCache = {
        subscribe: vi.fn(),
      };
      mockMutationCache = {
        subscribe: vi.fn(),
      };

      mockQueryClient = {
        getQueryCache: vi.fn(() => mockQueryCache),
        getMutationCache: vi.fn(() => mockMutationCache),
      } as any;

      // Mock window.location
      originalLocation = window.location;
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        pathname: "/protected",
        href: "https://example.com/protected",
        replace: vi.fn(),
      } as any;

      // Mock localStorage
      originalLocalStorage = window.localStorage;
      Object.defineProperty(window, "localStorage", {
        value: {
          setItem: vi.fn(),
          getItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
      Object.defineProperty(window, "localStorage", {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it("should set up query cache subscription", () => {
      setupReactQueryAuthRedirects(mockQueryClient);

      expect(mockQueryCache.subscribe).toHaveBeenCalled();
      expect(mockMutationCache.subscribe).toHaveBeenCalled();
    });

    it("should handle query errors with auth redirect", () => {
      setupReactQueryAuthRedirects(mockQueryClient);

      // Get the subscription callback
      const querySubscriptionCallback = mockQueryCache.subscribe.mock.calls[0][0];

      // Simulate a query error event
      const unauthorizedError: NormalizedApiError = {
        kind: ApiErrorKind.Unauthorized,
        message: "Unauthorized",
        original: new Error(),
      };

      const event = {
        type: "updated",
        query: {
          state: {
            error: unauthorizedError,
          },
        },
      };

      querySubscriptionCallback(event);

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "previous_url",
        "https://example.com/protected",
      );
      expect(window.location.replace).toHaveBeenCalledWith("/auth/login");
    });

    it("should handle mutation errors with auth redirect", () => {
      setupReactQueryAuthRedirects(mockQueryClient);

      // Get the subscription callback
      const mutationSubscriptionCallback = mockMutationCache.subscribe.mock.calls[0][0];

      // Simulate a mutation error event
      const forbiddenError: NormalizedApiError = {
        kind: ApiErrorKind.Forbidden,
        message: "Forbidden",
        original: new Error(),
      };

      const event = {
        type: "updated",
        mutation: {
          state: {
            error: forbiddenError,
          },
        },
      };

      mutationSubscriptionCallback(event);

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "previous_url",
        "https://example.com/protected",
      );
      expect(window.location.replace).toHaveBeenCalledWith("/auth/login");
    });

    it("should not redirect on allowed unauthenticated paths", () => {
      window.location.pathname = "/auth/login";

      setupReactQueryAuthRedirects(mockQueryClient);

      const querySubscriptionCallback = mockQueryCache.subscribe.mock.calls[0][0];

      const unauthorizedError: NormalizedApiError = {
        kind: ApiErrorKind.Unauthorized,
        message: "Unauthorized",
        original: new Error(),
      };

      const event = {
        type: "updated",
        query: {
          state: {
            error: unauthorizedError,
          },
        },
      };

      querySubscriptionCallback(event);

      expect(window.location.replace).not.toHaveBeenCalled();
    });

    it("should not redirect on non-auth errors", () => {
      setupReactQueryAuthRedirects(mockQueryClient);

      const querySubscriptionCallback = mockQueryCache.subscribe.mock.calls[0][0];

      const networkError: NormalizedApiError = {
        kind: ApiErrorKind.Network,
        message: "Network error",
        original: new Error(),
      };

      const event = {
        type: "updated",
        query: {
          state: {
            error: networkError,
          },
        },
      };

      querySubscriptionCallback(event);

      expect(window.location.replace).not.toHaveBeenCalled();
    });

    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage to throw an error
      window.localStorage.setItem = vi.fn(() => {
        throw new Error("localStorage not available");
      });

      setupReactQueryAuthRedirects(mockQueryClient);

      const querySubscriptionCallback = mockQueryCache.subscribe.mock.calls[0][0];

      const unauthorizedError: NormalizedApiError = {
        kind: ApiErrorKind.Unauthorized,
        message: "Unauthorized",
        original: new Error(),
      };

      const event = {
        type: "updated",
        query: {
          state: {
            error: unauthorizedError,
          },
        },
      };

      // Should not throw an error
      expect(() => querySubscriptionCallback(event)).not.toThrow();
      expect(window.location.replace).toHaveBeenCalledWith("/auth/login");
    });

    it("should handle location.replace errors gracefully", () => {
      // Mock location.replace to throw an error
      window.location.replace = vi.fn(() => {
        throw new Error("Navigation not available");
      });

      setupReactQueryAuthRedirects(mockQueryClient);

      const querySubscriptionCallback = mockQueryCache.subscribe.mock.calls[0][0];

      const unauthorizedError: NormalizedApiError = {
        kind: ApiErrorKind.Unauthorized,
        message: "Unauthorized",
        original: new Error(),
      };

      const event = {
        type: "updated",
        query: {
          state: {
            error: unauthorizedError,
          },
        },
      };

      // Should not throw an error
      expect(() => querySubscriptionCallback(event)).not.toThrow();
    });
  });

  describe("reactQueryConfig", () => {
    it("should have correct default configuration", () => {
      expect(reactQueryConfig.defaultOptions?.queries?.staleTime).toBe(60000); // 1 minute
      expect(reactQueryConfig.defaultOptions?.queries?.refetchOnWindowFocus).toBe(false);
      expect(reactQueryConfig.defaultOptions?.queries?.networkMode).toBe("always");
      expect(reactQueryConfig.defaultOptions?.queries?.retry).toBe(standardRetry);
      expect(reactQueryConfig.defaultOptions?.queries?.retryDelay).toBe(standardRetryDelay);
    });

    it("should have correct mutation configuration", () => {
      expect(reactQueryConfig.defaultOptions?.mutations?.networkMode).toBe("always");
      expect(reactQueryConfig.defaultOptions?.mutations?.retry).toBe(standardRetry);
      expect(reactQueryConfig.defaultOptions?.mutations?.retryDelay).toBe(standardRetryDelay);
    });
  });
});
