import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, loginSchema, forgotPasswordSchema, resetPasswordWithTokenSchema, tokenVerificationSchema, registerSchema } from "@/entities/auth";
import { userApi } from "@/entities/user";
import type { LoginInput, ForgotPasswordInput, ResetPasswordWithTokenInput, TokenVerificationInput } from "@/entities/auth";
import type { UserRegistrationInput } from "@/entities/user";

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  refresh: () => [...authKeys.all, 'refresh'] as const,
};

export const useAuthMe = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: userApi.me,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (loginData: LoginInput) => {
      const validatedData = loginSchema.parse(loginData);
      return authApi.login(validatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (registerData: UserRegistrationInput) => {
      const validatedData = registerSchema.parse(registerData);
      return authApi.register(validatedData);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (emailData: ForgotPasswordInput) => {
      const validatedData = forgotPasswordSchema.parse(emailData);
      return authApi.forgotPassword(validatedData);
    },
  });
};

export const useVerifyPasswordResetToken = () => {
  return useMutation({
    mutationFn: (tokenData: TokenVerificationInput) => {
      const validatedData = tokenVerificationSchema.parse(tokenData);
      return authApi.verifyPasswordResetToken(validatedData.token);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, resetData }: ResetPasswordWithTokenInput) => {
      const validatedInput = resetPasswordWithTokenSchema.parse({ token, resetData });
      return authApi.resetPassword(validatedInput.token, validatedInput.resetData);
    },
  });
};
