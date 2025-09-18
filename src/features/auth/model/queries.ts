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
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordWithTokenSchema,
  tokenVerificationSchema,
  registerSchema,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordWithTokenInput,
  type RegisterInput
} from "./validation";

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
      // Feature-level validation
      const validatedData = loginSchema.parse(loginData);
      const result = await loginMutation.mutateAsync(validatedData);

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
      // Feature-level validation
      const validatedData = registerSchema.parse(registerData);
      const result = await registerMutation.mutateAsync(validatedData);

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
      // Feature-level validation
      const validatedData = forgotPasswordSchema.parse(emailData);
      const result = await forgotPasswordMutation.mutateAsync(validatedData);

      // Business logic: could add user feedback, analytics, etc.
      return result;
    },
  };
};

export const useVerifyPasswordResetToken = () => {
  const verifyMutation = useAuthPasswordResetTokenVerify();

  return {
    ...verifyMutation,
    mutateAsync: async (token: string) => {
      // Feature-level validation
      const validatedData = tokenVerificationSchema.parse({ token });
      return await verifyMutation.mutateAsync(validatedData.token);
    },
  };
};

export const useResetPassword = () => {
  const queryClient = useQueryClient();
  const resetPasswordMutation = useAuthPasswordReset();

  return {
    ...resetPasswordMutation,
    mutateAsync: async (data: ResetPasswordWithTokenInput) => {
      // Feature-level validation
      const validatedInput = resetPasswordWithTokenSchema.parse(data);
      const result = await resetPasswordMutation.mutateAsync(validatedInput);

      // Business logic: invalidate auth state after password reset
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      return result;
    },
  };
};
