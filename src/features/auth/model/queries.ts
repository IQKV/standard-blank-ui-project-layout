import { useQueryClient } from "@tanstack/react-query";
import {
  useAuthLogin,
  useAuthLogout,
  useAuthRegister,
  useAuthForgotPassword,
  useAuthPasswordResetTokenVerify,
  useAuthPasswordReset
} from "@/entities/auth";
import { useUserMe, userKeys } from "@/entities/user";
import type { LoginInput, ForgotPasswordInput, ResetPasswordWithTokenInput, RegisterInput } from "@/entities/auth";

// Feature-level auth queries with business logic
export const useAuthMe = () => {
  return useUserMe();
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const loginMutation = useAuthLogin();

  return {
    ...loginMutation,
    mutateAsync: async (loginData: LoginInput) => {
      const result = await loginMutation.mutateAsync(loginData);
      // Business logic: invalidate user session after successful login
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      return result;
    },
  };
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const logoutMutation = useAuthLogout();

  return {
    ...logoutMutation,
    mutateAsync: async () => {
      const result = await logoutMutation.mutateAsync();
      // Business logic: clear all cached data after logout
      queryClient.clear();
      return result;
    },
  };
};

export const useRegister = () => {
  const registerMutation = useAuthRegister();

  return {
    ...registerMutation,
    mutateAsync: async (registerData: RegisterInput) => {
      const result = await registerMutation.mutateAsync(registerData);
      // Business logic: could add analytics, notifications, etc.
      return result;
    },
  };
};

export const useForgotPassword = () => {
  const forgotPasswordMutation = useAuthForgotPassword();

  return {
    ...forgotPasswordMutation,
    mutateAsync: async (emailData: ForgotPasswordInput) => {
      const result = await forgotPasswordMutation.mutateAsync(emailData);
      // Business logic: could add user feedback, analytics, etc.
      return result;
    },
  };
};

export const useVerifyPasswordResetToken = () => {
  return useAuthPasswordResetTokenVerify();
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  const resetPasswordMutation = useAuthPasswordReset();

  return {
    ...resetPasswordMutation,
    mutateAsync: async (data: ResetPasswordWithTokenInput) => {
      const result = await resetPasswordMutation.mutateAsync(data);
      // Business logic: invalidate auth state after password reset
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      return result;
    },
  };
};
