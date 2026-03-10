import { describe, it, expect, beforeEach, vi } from "vitest";
import { authApi } from "./auth-api";
import { api } from "@/shared/api";
import type { LoginData, LoginResponse, ResetPasswordRequest } from "../model/types";
import type { UserRegistrationRequest } from "@/entities/user";

// Mock the API module
vi.mock("@/shared/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockApi = {
  get: vi.mocked(api.get),
  post: vi.mocked(api.post),
};

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLoginResponse: LoginResponse = {
    access_token: "access_token_123",
    refresh_token: "refresh_token_123",
    token_type: "Bearer",
    expires_at: Date.now() + 3600000,
    session_id: "session_123",
    user: {
      id: "1",
      first_name: "John",
      last_name: "Doe",
      full_name: "John Doe",
      email: "john@example.com",
      status: "ACTIVE",
      role: "GUEST",
    },
  };

  describe("refreshAccessTokenFn", () => {
    it("should refresh access token", async () => {
      mockApi.get.mockResolvedValue({ data: mockLoginResponse });

      const result = await authApi.refreshAccessTokenFn();

      expect(mockApi.get).toHaveBeenCalledWith("auth/refresh");
      expect(result).toEqual(mockLoginResponse);
    });

    it("should handle refresh token errors", async () => {
      const error = new Error("Refresh token expired");
      mockApi.get.mockRejectedValue(error);

      await expect(authApi.refreshAccessTokenFn()).rejects.toThrow("Refresh token expired");
    });
  });

  describe("register", () => {
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
        data: {
          data: mockLoginResponse.user,
          success: true,
          message: "User registered successfully",
        },
      };

      mockApi.post.mockResolvedValue(registerResponse);

      const result = await authApi.register(registerData);

      expect(mockApi.post).toHaveBeenCalledWith("auth/register", registerData);
      expect(result).toEqual(registerResponse.data);
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
      mockApi.post.mockRejectedValue(error);

      await expect(authApi.register(registerData)).rejects.toThrow("Validation failed");
    });
  });

  describe("login", () => {
    it("should login user with valid credentials", async () => {
      const loginData: LoginData = {
        email: "john@example.com",
        password: "password123",
      };

      mockApi.post.mockResolvedValue({ data: mockLoginResponse });

      const result = await authApi.login(loginData);

      expect(mockApi.post).toHaveBeenCalledWith("auth/login", loginData);
      expect(result).toEqual(mockLoginResponse);
    });

    it("should handle invalid credentials", async () => {
      const loginData: LoginData = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      const error = new Error("Invalid credentials");
      mockApi.post.mockRejectedValue(error);

      await expect(authApi.login(loginData)).rejects.toThrow("Invalid credentials");
    });
  });

  describe("logout", () => {
    it("should logout user", async () => {
      const logoutResponse = {
        data: {
          success: true,
          message: "Logged out successfully",
        },
      };

      mockApi.post.mockResolvedValue(logoutResponse);

      const result = await authApi.logout();

      expect(mockApi.post).toHaveBeenCalledWith("auth/logout");
      expect(result).toEqual(logoutResponse.data);
    });

    it("should handle logout errors gracefully", async () => {
      const error = new Error("Logout failed");
      mockApi.post.mockRejectedValue(error);

      await expect(authApi.logout()).rejects.toThrow("Logout failed");
    });
  });

  describe("forgotPassword", () => {
    it("should send forgot password email", async () => {
      const emailData = { email: "john@example.com" };
      const forgotResponse = {
        data: {
          success: true,
          message: "Password reset email sent",
        },
      };

      mockApi.post.mockResolvedValue(forgotResponse);

      const result = await authApi.forgotPassword(emailData);

      expect(mockApi.post).toHaveBeenCalledWith("auth/forgot-password", emailData);
      expect(result).toEqual(forgotResponse.data);
    });

    it("should handle invalid email", async () => {
      const emailData = { email: "invalid-email" };
      const error = new Error("Invalid email format");
      mockApi.post.mockRejectedValue(error);

      await expect(authApi.forgotPassword(emailData)).rejects.toThrow("Invalid email format");
    });
  });

  describe("verifyPasswordResetToken", () => {
    it("should verify valid reset token", async () => {
      const token = "valid_reset_token";
      const verifyResponse = {
        data: {
          success: true,
          message: "Token is valid",
        },
      };

      mockApi.get.mockResolvedValue(verifyResponse);

      const result = await authApi.verifyPasswordResetToken(token);

      expect(mockApi.get).toHaveBeenCalledWith(`auth/reset-password/${token}`);
      expect(result).toEqual(verifyResponse.data);
    });

    it("should handle invalid reset token", async () => {
      const token = "invalid_token";
      const error = new Error("Invalid or expired token");
      mockApi.get.mockRejectedValue(error);

      await expect(authApi.verifyPasswordResetToken(token)).rejects.toThrow(
        "Invalid or expired token",
      );
    });
  });

  describe("resetPassword", () => {
    it("should reset password with valid token", async () => {
      const token = "valid_reset_token";
      const resetData: ResetPasswordRequest = {
        password: "newpassword123",
        password_confirmation: "newpassword123",
      };

      const resetResponse = {
        data: {
          success: true,
          message: "Password reset successfully",
        },
      };

      mockApi.post.mockResolvedValue(resetResponse);

      const result = await authApi.resetPassword(token, resetData);

      expect(mockApi.post).toHaveBeenCalledWith(`auth/reset-password/${token}`, resetData);
      expect(result).toEqual(resetResponse.data);
    });

    it("should handle password mismatch", async () => {
      const token = "valid_reset_token";
      const resetData: ResetPasswordRequest = {
        password: "newpassword123",
        password_confirmation: "differentpassword",
      };

      const error = new Error("Passwords do not match");
      mockApi.post.mockRejectedValue(error);

      await expect(authApi.resetPassword(token, resetData)).rejects.toThrow(
        "Passwords do not match",
      );
    });

    it("should handle expired token", async () => {
      const token = "expired_token";
      const resetData: ResetPasswordRequest = {
        password: "newpassword123",
        password_confirmation: "newpassword123",
      };

      const error = new Error("Token has expired");
      mockApi.post.mockRejectedValue(error);

      await expect(authApi.resetPassword(token, resetData)).rejects.toThrow("Token has expired");
    });
  });
});
