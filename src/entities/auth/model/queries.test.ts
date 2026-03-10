import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import {
  useAuthLogin,
  useAuthLogout,
  useAuthRegister,
  useAuthForgotPassword,
  useAuthPasswordResetTokenVerify,
  useAuthPasswordReset,
  useAuthRefresh,
  authKeys,
} from "./queries";
import { authApi } from "../api/auth-api";
import type { LoginData, ResetPasswordRequest } from "./types";
import type { UserRegistrationRequest } from "@/entities/user";

// Mock the auth API
vi.mock("../api/auth-api", () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    verifyPasswordResetToken: vi.fn(),
    resetPassword: vi.fn(),
    refreshAccessTokenFn: vi.fn(),
  },
}));

const mockAuthApi = {
  login: vi.mocked(authApi.login),
  logout: vi.mocked(authApi.logout),
  register: vi.mocked(authApi.register),
  forgotPassword: vi.mocked(authApi.forgotPassword),
  verifyPasswordResetToken: vi.mocked(authApi.verifyPasswordResetToken),
  resetPassword: vi.mocked(authApi.resetPassword),
  refreshAccessTokenFn: vi.mocked(authApi.refreshAccessTokenFn),
};

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("auth queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    full_name: "John Doe",
    email: "john@example.com",
    status: "ACTIVE" as const,
    role: "GUEST" as const,
  };

  const mockLoginResponse = {
    access_token: "access_token_123",
    refresh_token: "refresh_token_123",
    token_type: "Bearer",
    expires_at: Date.now() + 3600000,
    session_id: "session_123",
    user: mockUser,
  };

  describe("authKeys", () => {
    it("should generate correct query keys", () => {
      expect(authKeys.all).toEqual(["auth"]);
      expect(authKeys.session()).toEqual(["auth", "session"]);
      expect(authKeys.refresh()).toEqual(["auth", "refresh"]);
    });
  });

  describe("useAuthLogin", () => {
    it("should login with valid credentials", async () => {
      const loginData: LoginData = {
        email: "john@example.com",
        password: "password123",
      };

      mockAuthApi.login.mockResolvedValue(mockLoginResponse);

      const { result } = renderHook(() => useAuthLogin(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(loginData);

      expect(mockAuthApi.login).toHaveBeenCalledWith(loginData);
    });

    it("should handle login errors", async () => {
      const loginData: LoginData = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      const error = new Error("Invalid credentials");
      mockAuthApi.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthLogin(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(loginData)).rejects.toThrow("Invalid credentials");
    });

    it("should handle network errors", async () => {
      const loginData: LoginData = {
        email: "john@example.com",
        password: "password123",
      };

      const error = new Error("Network error");
      mockAuthApi.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthLogin(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(loginData)).rejects.toThrow("Network error");
    });
  });

  describe("useAuthLogout", () => {
    it("should logout successfully", async () => {
      const logoutResponse = {
        success: true,
        message: "Logged out successfully",
      };

      mockAuthApi.logout.mockResolvedValue(logoutResponse);

      const { result } = renderHook(() => useAuthLogout(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync();

      expect(mockAuthApi.logout).toHaveBeenCalled();
    });

    it("should handle logout errors", async () => {
      const error = new Error("Logout failed");
      mockAuthApi.logout.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthLogout(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync()).rejects.toThrow("Logout failed");
    });
  });

  describe("useAuthRegister", () => {
    it("should register a new user", async () => {
      const registerData: UserRegistrationRequest = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "password123",
        password_confirmation: "password123",
        locale: "en",
      };

      const registerResponse = {
        data: mockUser,
        success: true,
        message: "User registered successfully",
      };

      mockAuthApi.register.mockResolvedValue(registerResponse);

      const { result } = renderHook(() => useAuthRegister(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(registerData);

      expect(mockAuthApi.register).toHaveBeenCalledWith(registerData);
    });

    it("should handle registration validation errors", async () => {
      const registerData: UserRegistrationRequest = {
        first_name: "",
        last_name: "",
        email: "invalid-email",
        password: "123",
        password_confirmation: "456",
        locale: "en",
      };

      const error = new Error("Validation failed");
      mockAuthApi.register.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthRegister(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(registerData)).rejects.toThrow("Validation failed");
    });

    it("should handle email already exists error", async () => {
      const registerData: UserRegistrationRequest = {
        first_name: "John",
        last_name: "Doe",
        email: "existing@example.com",
        password: "password123",
        password_confirmation: "password123",
        locale: "en",
      };

      const error = new Error("Email already exists");
      mockAuthApi.register.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthRegister(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(registerData)).rejects.toThrow(
        "Email already exists",
      );
    });
  });

  describe("useAuthForgotPassword", () => {
    it("should send forgot password email", async () => {
      const emailData = { email: "john@example.com" };
      const forgotResponse = {
        success: true,
        message: "Password reset email sent",
      };

      mockAuthApi.forgotPassword.mockResolvedValue(forgotResponse);

      const { result } = renderHook(() => useAuthForgotPassword(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(emailData);

      expect(mockAuthApi.forgotPassword).toHaveBeenCalledWith(emailData);
    });

    it("should handle invalid email", async () => {
      const emailData = { email: "invalid-email" };
      const error = new Error("Invalid email format");
      mockAuthApi.forgotPassword.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthForgotPassword(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(emailData)).rejects.toThrow("Invalid email format");
    });

    it("should handle user not found", async () => {
      const emailData = { email: "nonexistent@example.com" };
      const error = new Error("User not found");
      mockAuthApi.forgotPassword.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthForgotPassword(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(emailData)).rejects.toThrow("User not found");
    });
  });

  describe("useAuthPasswordResetTokenVerify", () => {
    it("should verify valid reset token", async () => {
      const token = "valid_reset_token";
      const verifyResponse = {
        success: true,
        message: "Token is valid",
      };

      mockAuthApi.verifyPasswordResetToken.mockResolvedValue(verifyResponse);

      const { result } = renderHook(() => useAuthPasswordResetTokenVerify(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(token);

      expect(mockAuthApi.verifyPasswordResetToken).toHaveBeenCalledWith(token);
    });

    it("should handle invalid reset token", async () => {
      const token = "invalid_token";
      const error = new Error("Invalid or expired token");
      mockAuthApi.verifyPasswordResetToken.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthPasswordResetTokenVerify(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(token)).rejects.toThrow("Invalid or expired token");
    });

    it("should handle expired token", async () => {
      const token = "expired_token";
      const error = new Error("Token has expired");
      mockAuthApi.verifyPasswordResetToken.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthPasswordResetTokenVerify(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(token)).rejects.toThrow("Token has expired");
    });
  });

  describe("useAuthPasswordReset", () => {
    it("should reset password with valid token", async () => {
      const token = "valid_reset_token";
      const resetData: ResetPasswordRequest = {
        password: "newpassword123",
        password_confirmation: "newpassword123",
      };

      const resetResponse = {
        success: true,
        message: "Password reset successfully",
      };

      mockAuthApi.resetPassword.mockResolvedValue(resetResponse);

      const { result } = renderHook(() => useAuthPasswordReset(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ token, resetData });

      expect(mockAuthApi.resetPassword).toHaveBeenCalledWith(token, resetData);
    });

    it("should handle password mismatch", async () => {
      const token = "valid_reset_token";
      const resetData: ResetPasswordRequest = {
        password: "newpassword123",
        password_confirmation: "differentpassword",
      };

      const error = new Error("Passwords do not match");
      mockAuthApi.resetPassword.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthPasswordReset(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ token, resetData })).rejects.toThrow(
        "Passwords do not match",
      );
    });

    it("should handle expired token during reset", async () => {
      const token = "expired_token";
      const resetData: ResetPasswordRequest = {
        password: "newpassword123",
        password_confirmation: "newpassword123",
      };

      const error = new Error("Token has expired");
      mockAuthApi.resetPassword.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthPasswordReset(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ token, resetData })).rejects.toThrow(
        "Token has expired",
      );
    });
  });

  describe("useAuthRefresh", () => {
    it("should refresh access token", async () => {
      mockAuthApi.refreshAccessTokenFn.mockResolvedValue(mockLoginResponse);

      const { result } = renderHook(() => useAuthRefresh(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync();

      expect(mockAuthApi.refreshAccessTokenFn).toHaveBeenCalled();
    });

    it("should handle refresh token errors", async () => {
      const error = new Error("Refresh token expired");
      mockAuthApi.refreshAccessTokenFn.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthRefresh(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync()).rejects.toThrow("Refresh token expired");
    });

    it("should handle invalid refresh token", async () => {
      const error = new Error("Invalid refresh token");
      mockAuthApi.refreshAccessTokenFn.mockRejectedValue(error);

      const { result } = renderHook(() => useAuthRefresh(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync()).rejects.toThrow("Invalid refresh token");
    });
  });
});
