import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth-api";
import { 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordWithTokenSchema, 
  tokenVerificationSchema, 
  registerSchema 
} from "./validation";
import type { 
  LoginInput, 
  ForgotPasswordInput, 
  ResetPasswordWithTokenInput, 
  TokenVerificationInput, 
  RegisterInput 
} from "./validation";

// Entity-level query keys
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  refresh: () => [...authKeys.all, 'refresh'] as const,
};

// Entity-level auth mutations (basic auth operations)
export const useAuthLogin = () => {
  return useMutation({
    mutationFn: (loginData: LoginInput) => {
      const validatedData = loginSchema.parse(loginData);
      return authApi.login(validatedData);
    },
  });
};

export const useAuthLogout = () => {
  return useMutation({
    mutationFn: authApi.logout,
  });
};

export const useAuthRegister = () => {
  return useMutation({
    mutationFn: (registerData: RegisterInput) => {
      const validatedData = registerSchema.parse(registerData);
      return authApi.register(validatedData);
    },
  });
};

export const useAuthForgotPassword = () => {
  return useMutation({
    mutationFn: (emailData: ForgotPasswordInput) => {
      const validatedData = forgotPasswordSchema.parse(emailData);
      return authApi.forgotPassword(validatedData);
    },
  });
};

export const useAuthPasswordResetTokenVerify = () => {
  return useMutation({
    mutationFn: (tokenData: TokenVerificationInput) => {
      const validatedData = tokenVerificationSchema.parse(tokenData);
      return authApi.verifyPasswordResetToken(validatedData.token);
    },
  });
};

export const useAuthPasswordReset = () => {
  return useMutation({
    mutationFn: ({ token, resetData }: ResetPasswordWithTokenInput) => {
      const validatedInput = resetPasswordWithTokenSchema.parse({ token, resetData });
      return authApi.resetPassword(validatedInput.token, validatedInput.resetData);
    },
  });
};

export const useAuthRefresh = () => {
  return useMutation({
    mutationFn: authApi.refreshAccessTokenFn,
  });
};