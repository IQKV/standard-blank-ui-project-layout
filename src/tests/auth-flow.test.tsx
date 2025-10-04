import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { server, http, HttpResponse } from "./setup.js";
import {
  useLogin,
  useRegister,
  useLogout,
} from "@/features/auth/model/queries";
import { useUserMe } from "@/entities/user/model/queries";
import type {
  LoginInput,
  RegisterInput,
} from "@/features/auth/model/validation";

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
};

describe("Auth Flow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Login Flow", () => {
    it("should complete successful login flow", async () => {
      const loginData: LoginInput = {
        email: "john@example.com",
        password: "Password123!",
      };

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      const loginResult = await result.current.mutateAsync(loginData);

      expect(loginResult.access_token).toBeDefined();
      expect(loginResult.user.email).toBe("john@example.com");

      // Wait for the mutation to complete
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it("should handle login validation errors", async () => {
      const invalidLoginData = {
        email: "invalid-email",
        password: "short",
      } as LoginInput;

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync(invalidLoginData)
      ).rejects.toThrow();
    });

    it("should handle login API errors", async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      // Override the default login handler to return an error
      server.use(
        http.post("/api/auth/login", () => {
          return HttpResponse.json(
            {
              message: "Invalid credentials",
              error: "INVALID_CREDENTIALS",
            },
            { status: 401 }
          );
        })
      );

      const loginData: LoginInput = {
        email: "wrong@example.com",
        password: "WrongPassword123!",
      };

      await expect(result.current.mutateAsync(loginData)).rejects.toThrow();
    });
  });

  describe("Registration Flow", () => {
    it("should complete successful registration flow", async () => {
      const registerData: RegisterInput = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
        locale: "en",
      };

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      const registerResult = await result.current.mutateAsync(registerData);

      expect(registerResult.data.email).toBe("john@example.com");

      // Wait for the mutation to complete
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it("should handle registration validation errors", async () => {
      const invalidRegisterData = {
        first_name: "",
        last_name: "",
        email: "invalid-email",
        password: "weak",
        password_confirmation: "different",
        locale: "en",
      } as RegisterInput;

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync(invalidRegisterData)
      ).rejects.toThrow();
    });

    it("should handle registration API errors", async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Override the default register handler to return an error
      server.use(
        http.post("/api/auth/register", () => {
          return HttpResponse.json(
            {
              message: "Email already exists",
              error: "EMAIL_EXISTS",
            },
            { status: 409 }
          );
        })
      );

      const registerData: RegisterInput = {
        first_name: "John",
        last_name: "Doe",
        email: "existing@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
        locale: "en",
      };

      await expect(result.current.mutateAsync(registerData)).rejects.toThrow();
    });
  });

  describe("Logout Flow", () => {
    it("should complete successful logout flow", async () => {
      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      const logoutResult = await result.current.mutateAsync();

      expect(logoutResult.success).toBe(true);

      // Wait for the mutation to complete
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it("should handle logout errors gracefully", async () => {
      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      // Override the default logout handler to return an error
      server.use(
        http.post("/api/auth/logout", () => {
          return HttpResponse.json(
            {
              message: "Logout failed",
              error: "LOGOUT_ERROR",
            },
            { status: 500 }
          );
        })
      );

      await expect(result.current.mutateAsync()).rejects.toThrow();
    });
  });

  describe("User Profile Flow", () => {
    it("should fetch user profile after authentication", async () => {
      const { result } = renderHook(() => useUserMe(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.data.email).toBe("john@example.com");
      expect(result.current.data?.data.full_name).toBe("John Doe");
    });

    it("should handle unauthorized user profile requests", async () => {
      // Override the default me handler to return an error
      server.use(
        http.get("/api/users/me", () => {
          return HttpResponse.json(
            {
              message: "Unauthorized",
              error: "UNAUTHORIZED",
            },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useUserMe(), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );

      expect(result.current.error).toBeDefined();
    });
  });

  describe("Complete Auth Flow", () => {
    it("should handle complete login -> profile -> logout flow", async () => {
      const wrapper = createWrapper();

      // Step 1: Login
      const { result: loginResult } = renderHook(() => useLogin(), { wrapper });

      const loginData: LoginInput = {
        email: "john@example.com",
        password: "Password123!",
      };

      await loginResult.current.mutateAsync(loginData);

      await waitFor(() => {
        expect(loginResult.current.isSuccess).toBe(true);
      });

      // Step 2: Fetch user profile
      const { result: profileResult } = renderHook(() => useUserMe(), {
        wrapper,
      });

      await waitFor(() => {
        expect(profileResult.current.isSuccess).toBe(true);
      });

      expect(profileResult.current.data?.data.email).toBe("john@example.com");

      // Step 3: Logout
      const { result: logoutResult } = renderHook(() => useLogout(), {
        wrapper,
      });

      await logoutResult.current.mutateAsync();

      await waitFor(() => {
        expect(logoutResult.current.isSuccess).toBe(true);
      });
    });

    it("should handle registration -> login flow", async () => {
      const wrapper = createWrapper();

      // Step 1: Register
      const { result: registerResult } = renderHook(() => useRegister(), {
        wrapper,
      });

      const registerData: RegisterInput = {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
        locale: "en",
      };

      await registerResult.current.mutateAsync(registerData);

      await waitFor(() => {
        expect(registerResult.current.isSuccess).toBe(true);
      });

      // Step 2: Login with registered credentials
      const { result: loginResult } = renderHook(() => useLogin(), { wrapper });

      const loginData: LoginInput = {
        email: "jane@example.com",
        password: "Password123!",
      };

      await loginResult.current.mutateAsync(loginData);

      await waitFor(() => {
        expect(loginResult.current.isSuccess).toBe(true);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      // Simulate network error
      server.use(
        http.post("/api/auth/login", () => {
          return HttpResponse.error();
        })
      );

      const loginData: LoginInput = {
        email: "john@example.com",
        password: "Password123!",
      };

      await expect(result.current.mutateAsync(loginData)).rejects.toThrow();
    });

    it("should handle validation errors with proper error messages", async () => {
      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      // Override handler to return validation errors
      server.use(
        http.post("/api/auth/register", () => {
          return HttpResponse.json(
            {
              message: "Validation failed",
              errors: {
                email: ["Email is required"],
                password: ["Password must be at least 8 characters"],
              },
            },
            { status: 422 }
          );
        })
      );

      const registerData: RegisterInput = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
        locale: "en",
      };

      await expect(result.current.mutateAsync(registerData)).rejects.toThrow();
    });
  });
});
