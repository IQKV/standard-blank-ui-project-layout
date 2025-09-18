import { useQueryClient } from "@tanstack/react-query";
import { useAuthLogin, useAuthLogout, authKeys } from "@/entities/auth";
import { useUserMe, userKeys } from "@/entities/user";
import type { LoginInput } from "@/entities/auth";

// Cross-entity process: Authentication session management
// This handles the complex business process of managing user authentication state
// across both auth and user entities

export const useAuthSession = () => {
  const userMeQuery = useUserMe();
  
  return {
    user: userMeQuery.data?.data,
    isAuthenticated: !!userMeQuery.data?.data,
    isLoading: userMeQuery.isLoading,
    error: userMeQuery.error,
  };
};

export const useLoginProcess = () => {
  const queryClient = useQueryClient();
  const loginMutation = useAuthLogin();
  
  return {
    ...loginMutation,
    mutateAsync: async (loginData: LoginInput) => {
      // Step 1: Perform login
      const result = await loginMutation.mutateAsync(loginData);
      
      // Step 2: Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      
      // Step 3: Could trigger other cross-entity processes
      // - Update user preferences
      // - Log analytics event
      // - Initialize user-specific data
      
      return result;
    },
  };
};

export const useLogoutProcess = () => {
  const queryClient = useQueryClient();
  const logoutMutation = useAuthLogout();
  
  return {
    ...logoutMutation,
    mutateAsync: async () => {
      // Step 1: Perform logout
      const result = await logoutMutation.mutateAsync();
      
      // Step 2: Clear all user-related data
      queryClient.removeQueries({ queryKey: userKeys.all });
      queryClient.removeQueries({ queryKey: authKeys.all });
      
      // Step 3: Could trigger other cleanup processes
      // - Clear local storage
      // - Reset application state
      // - Redirect to login page
      
      return result;
    },
  };
};