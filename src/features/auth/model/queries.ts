import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/entities/auth";
import { userApi } from "@/entities/user";

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
    mutationFn: authApi.login,
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
    mutationFn: authApi.register,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    // eslint-disable-next-line
    mutationFn: ({ token, resetData }: { token: string; resetData: any }) =>
      authApi.resetPassword(token, resetData),
  });
};
