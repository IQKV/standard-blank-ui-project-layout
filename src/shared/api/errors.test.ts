import { describe, it, expect } from "vitest";
import { AxiosError } from "axios";
import {
  ApiErrorKind,
  normalizeAxiosError,
  isNormalizedApiError,
  getUserMessage,
  type NormalizedApiError,
} from "./errors";

describe("API error handling", () => {
  describe("normalizeAxiosError", () => {
    it("should handle network errors", () => {
      const axiosError = new AxiosError("Network Error");
      axiosError.code = "ENOTFOUND";
      axiosError.response = undefined;

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.Network);
      expect(normalized.message).toBe("Network Error");
      expect(normalized.original).toBe(axiosError);
    });

    it("should handle timeout errors", () => {
      const axiosError = new AxiosError("timeout of 5000ms exceeded");
      axiosError.code = "ECONNABORTED";
      axiosError.response = undefined;

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.Timeout);
      expect(normalized.message).toBe("timeout of 5000ms exceeded");
    });

    it("should handle canceled requests", () => {
      const axiosError = new AxiosError("Request canceled");
      axiosError.code = "ERR_CANCELED";
      axiosError.name = "CanceledError";

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.Canceled);
      expect(normalized.message).toBe("Request canceled");
    });

    it("should handle 401 Unauthorized errors", () => {
      const axiosError = new AxiosError("Unauthorized");
      axiosError.response = {
        status: 401,
        data: { message: "Invalid credentials" },
        headers: {},
        statusText: "Unauthorized",
        config: {} as any,
      };

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.Unauthorized);
      expect(normalized.status).toBe(401);
      expect(normalized.message).toBe("Invalid credentials");
      expect(normalized.data).toEqual({ message: "Invalid credentials" });
    });

    it("should handle 403 Forbidden errors", () => {
      const axiosError = new AxiosError("Forbidden");
      axiosError.response = {
        status: 403,
        data: { message: "Access denied" },
        headers: {},
        statusText: "Forbidden",
        config: {} as any,
      };

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.Forbidden);
      expect(normalized.status).toBe(403);
      expect(normalized.message).toBe("Access denied");
    });

    it("should handle 404 Not Found errors", () => {
      const axiosError = new AxiosError("Not Found");
      axiosError.response = {
        status: 404,
        data: { message: "Resource not found" },
        headers: {},
        statusText: "Not Found",
        config: {} as any,
      };

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.NotFound);
      expect(normalized.status).toBe(404);
      expect(normalized.message).toBe("Resource not found");
    });

    it("should handle 409 Conflict errors", () => {
      const axiosError = new AxiosError("Conflict");
      axiosError.response = {
        status: 409,
        data: { message: "Email already exists" },
        headers: {},
        statusText: "Conflict",
        config: {} as any,
      };

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.Conflict);
      expect(normalized.status).toBe(409);
      expect(normalized.message).toBe("Email already exists");
    });

    it("should handle 429 Too Many Requests errors", () => {
      const axiosError = new AxiosError("Too Many Requests");
      axiosError.response = {
        status: 429,
        data: { message: "Rate limit exceeded" },
        headers: {},
        statusText: "Too Many Requests",
        config: {} as any,
      };

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.TooManyRequests);
      expect(normalized.status).toBe(429);
      expect(normalized.message).toBe("Rate limit exceeded");
    });

    it("should handle validation errors (422)", () => {
      const axiosError = new AxiosError("Validation Error");
      axiosError.response = {
        status: 422,
        data: {
          message: "Validation failed",
          errors: {
            email: ["Email is required"],
            password: ["Password must be at least 8 characters"],
          },
        },
        headers: {},
        statusText: "Unprocessable Entity",
        config: {} as any,
      };

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.Validation);
      expect(normalized.status).toBe(422);
      expect(normalized.message).toBe("Validation failed");
      expect(normalized.details).toEqual({
        email: ["Email is required"],
        password: ["Password must be at least 8 characters"],
      });
    });

    it("should handle client errors (400)", () => {
      const axiosError = new AxiosError("Bad Request");
      axiosError.response = {
        status: 400,
        data: { message: "Invalid request format" },
        headers: {},
        statusText: "Bad Request",
        config: {} as any,
      };

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.ClientError);
      expect(normalized.status).toBe(400);
      expect(normalized.message).toBe("Invalid request format");
    });

    it("should handle server errors (500)", () => {
      const axiosError = new AxiosError("Internal Server Error");
      axiosError.response = {
        status: 500,
        data: { message: "Database connection failed" },
        headers: {},
        statusText: "Internal Server Error",
        config: {} as any,
      };

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.kind).toBe(ApiErrorKind.ServerError);
      expect(normalized.status).toBe(500);
      expect(normalized.message).toBe("Database connection failed");
    });

    it("should include request metadata", () => {
      const axiosError = new AxiosError("Error");
      axiosError.response = {
        status: 400,
        data: { message: "Bad request" },
        headers: { "x-request-id": "req-123" },
        statusText: "Bad Request",
        config: {} as any,
      };
      axiosError.config = {
        url: "/api/users",
        method: "post",
      } as any;

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.url).toBe("/api/users");
      expect(normalized.method).toBe("POST");
      expect(normalized.requestId).toBe("req-123");
    });

    it("should handle non-Axios errors", () => {
      const genericError = new Error("Generic error");
      const normalized = normalizeAxiosError(genericError);

      expect(normalized.kind).toBe(ApiErrorKind.Unknown);
      expect(normalized.message).toBe("Generic error");
      expect(normalized.original).toBe(genericError);
    });

    it("should handle string errors", () => {
      const stringError = "Something went wrong";
      const normalized = normalizeAxiosError(stringError);

      expect(normalized.kind).toBe(ApiErrorKind.Unknown);
      expect(normalized.message).toBe("Something went wrong");
      expect(normalized.original).toBe(stringError);
    });

    it("should handle unknown error types", () => {
      const unknownError = { weird: "object" };
      const normalized = normalizeAxiosError(unknownError);

      expect(normalized.kind).toBe(ApiErrorKind.Unknown);
      expect(normalized.message).toBe("Unknown error");
      expect(normalized.original).toBe(unknownError);
    });

    it("should prefer server error message over axios message", () => {
      const axiosError = new AxiosError("Axios message");
      axiosError.response = {
        status: 400,
        data: { message: "Server message" },
        headers: {},
        statusText: "Bad Request",
        config: {} as any,
      };

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.message).toBe("Server message");
    });

    it("should handle alternative server error format", () => {
      const axiosError = new AxiosError("Axios message");
      axiosError.response = {
        status: 400,
        data: { error: "Alternative error format" },
        headers: {},
        statusText: "Bad Request",
        config: {} as any,
      };

      const normalized = normalizeAxiosError(axiosError);

      expect(normalized.message).toBe("Alternative error format");
    });
  });

  describe("isNormalizedApiError", () => {
    it("should return true for valid normalized errors", () => {
      const error: NormalizedApiError = {
        kind: ApiErrorKind.Network,
        message: "Network error",
        original: new Error(),
      };

      expect(isNormalizedApiError(error)).toBe(true);
    });

    it("should return false for invalid objects", () => {
      expect(isNormalizedApiError(null)).toBe(false);
      expect(isNormalizedApiError(undefined)).toBe(false);
      expect(isNormalizedApiError("string")).toBe(false);
      expect(isNormalizedApiError({})).toBe(false);
      expect(isNormalizedApiError({ kind: "test" })).toBe(false);
      expect(isNormalizedApiError({ message: "test" })).toBe(false);
    });
  });

  describe("getUserMessage", () => {
    it("should return default messages for each error kind", () => {
      const testCases = [
        { kind: ApiErrorKind.Network, contains: "Network error" },
        { kind: ApiErrorKind.Timeout, contains: "timed out" },
        { kind: ApiErrorKind.Unauthorized, contains: "sign in" },
        { kind: ApiErrorKind.Forbidden, contains: "permission" },
        { kind: ApiErrorKind.NotFound, contains: "not found" },
        { kind: ApiErrorKind.Conflict, contains: "conflict" },
        { kind: ApiErrorKind.TooManyRequests, contains: "Too many requests" },
        { kind: ApiErrorKind.Validation, contains: "invalid" },
        { kind: ApiErrorKind.ClientError, contains: "request" },
        { kind: ApiErrorKind.ServerError, contains: "server error" },
        { kind: ApiErrorKind.Unknown, contains: "went wrong" },
        { kind: ApiErrorKind.Canceled, contains: "canceled" },
      ];

      testCases.forEach(({ kind, contains }) => {
        const error: NormalizedApiError = {
          kind,
          message: "Original message",
          original: new Error(),
        };

        const message = getUserMessage(error);
        expect(message.toLowerCase()).toContain(contains.toLowerCase());
      });
    });

    it("should use custom message map", () => {
      const error: NormalizedApiError = {
        kind: ApiErrorKind.Network,
        message: "Original message",
        original: new Error(),
      };

      const customMessage = getUserMessage(error, {
        map: {
          [ApiErrorKind.Network]: "Custom network error message",
        },
      });

      expect(customMessage).toBe("Custom network error message");
    });

    it("should include request ID when requested", () => {
      const error: NormalizedApiError = {
        kind: ApiErrorKind.ServerError,
        message: "Server error",
        requestId: "req-123",
        original: new Error(),
      };

      const messageWithId = getUserMessage(error, {
        includeRequestId: true,
      });

      expect(messageWithId).toBe(
        "A server error occurred. Please try again later. (request id: req-123)"
      );
    });

    it("should not include request ID when not available", () => {
      const error: NormalizedApiError = {
        kind: ApiErrorKind.ServerError,
        message: "Server error",
        original: new Error(),
      };

      const messageWithId = getUserMessage(error, {
        includeRequestId: true,
      });

      expect(messageWithId).toBe(
        "A server error occurred. Please try again later."
      );
    });

    it("should fallback to original message when no mapping exists", () => {
      const error: NormalizedApiError = {
        kind: "CustomErrorKind" as ApiErrorKind,
        message: "Custom error message",
        original: new Error(),
      };

      const message = getUserMessage(error);

      expect(message).toBe("Custom error message");
    });
  });
});
