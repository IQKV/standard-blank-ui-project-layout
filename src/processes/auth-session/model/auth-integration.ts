import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, useAuthSession, useAuthTokens } from "@/entities/auth";
import { useAuthMe } from "@/features/auth";
import { userKeys } from "@/entities/user";
import { useNotifications } from "@/shared";

/**
 * Integration hook that connects auth store with server state management
 * This hook manages the synchronization between client auth state and server auth state
 */
export const useAuthIntegration = () => {
  const queryClient = useQueryClient();
  const { add: addNotification } = useNotifications();

  const { isAuthenticated, user } = useAuthSession();
  const { accessToken, shouldRefreshToken, isTokenExpired } = useAuthTokens();

  // Select only needed auth actions/flags to avoid full-store subscriptions
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const clearSession = useAuthStore((s) => s.clearSession);
  const updateUser = useAuthStore((s) => s.updateUser);

  // Sync user data from server when authenticated
  // Note: serverUser is GenericDataResponse<User>, so we need to access .data property
  const { data: serverUser, error: userError } = useAuthMe();

  // Auto-refresh token when needed
  useEffect(() => {
    if (isAuthenticated && shouldRefreshToken && !isTokenExpired) {
      // Implement token refresh logic here
      // This would typically call a refresh mutation
      console.log("Token refresh needed");
    }
  }, [isAuthenticated, shouldRefreshToken, isTokenExpired]);

  // Sync server user data with client store
  useEffect(() => {
    if (serverUser?.data && user?.id !== serverUser.data.id) {
      updateUser(serverUser.data);
    }
  }, [serverUser, user, updateUser]);

  // Handle user data fetch errors
  useEffect(() => {
    if (userError && isAuthenticated) {
      // If user fetch fails and we think we're authenticated, clear session
      clearSession();
      queryClient.clear();
      addNotification({
        type: "error",
        title: "Session Expired",
        message: "Please log in again.",
      });
    }
  }, [userError, isAuthenticated, clearSession, queryClient, addNotification]);

  // Initialize auth state on app start
  useEffect(() => {
    if (!isInitialized) {
      // Check if we have valid tokens and user data
      if (accessToken && user && !isTokenExpired) {
        // Validate session with server
        queryClient.invalidateQueries({ queryKey: userKeys.me() });
      } else if (accessToken && isTokenExpired) {
        // Clear expired session
        clearSession();
      }

      setInitialized(true);
    }
  }, [isInitialized, accessToken, user, isTokenExpired, queryClient, clearSession, setInitialized]);

  return {
    isAuthenticated,
    user,
    isInitialized,
  };
};

/**
 * Hook for managing auth-related side effects
 */
export const useAuthEffects = () => {
  const { isAuthenticated } = useAuthSession();
  const queryClient = useQueryClient();

  // Clear queries when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear all cached queries when user is not authenticated
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient]);

  // Set up periodic token validation
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(
      () => {
        // Validate token periodically (every 5 minutes)
        queryClient.invalidateQueries({ queryKey: userKeys.me() });
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [isAuthenticated, queryClient]);
};
