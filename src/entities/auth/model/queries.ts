import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth-api";
import type { LoginData, ResetPasswordRequest } from "./types";
import type { UserRegistrationRequest } from "@/entities/user";

// Entity-level query keys
export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  refresh: () => [...authKeys.all, "refresh"] as const,
};

// Entity-level auth mutations (pure data access, no validation)
export const useAuthLogin = () => {
  return useMutation({
    mutationFn: (loginData: LoginData) => authApi.login(loginData),
  });
};

export const useAuthLogout = () => {
  return useMutation({
    mutationFn: authApi.logout,
  });
};

export const useAuthRegister = () => {
  return useMutation({
    mutationFn: (registerData: UserRegistrationRequest) => authApi.register(registerData),
  });
};

export const useAuthForgotPassword = () => {
  return useMutation({
    mutationFn: (emailData: { email: string }) => authApi.forgotPassword(emailData),
  });
};

export const useAuthPasswordResetTokenVerify = () => {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyPasswordResetToken(token),
  });
};

export const useAuthPasswordReset = () => {
  return useMutation({
    mutationFn: ({ token, resetData }: { token: string; resetData: ResetPasswordRequest }) =>
      authApi.resetPassword(token, resetData),
  });
};

export const useAuthRefresh = () => {
  return useMutation({
    mutationFn: authApi.refreshAccessTokenFn,
  });
};
