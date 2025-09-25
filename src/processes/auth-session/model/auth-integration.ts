import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, useAuthSession, useAuthTokens } from "@/entities/auth";
import { useLogin, useLogout, useAuthMe } from "@/features/auth";
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
  }, [
    isInitialized,
    accessToken,
    user,
    isTokenExpired,
    queryClient,
    clearSession,
    setInitialized,
  ]);

  return {
    isAuthenticated,
    user,
    isInitialized,
  };
};

/**
 * Enhanced login hook that integrates with auth store
 */
export const useLoginProcess = () => {
  const authStore = useAuthStore();
  const { add: addNotification } = useNotifications();
  const loginMutation = useLogin();

  return {
    ...loginMutation,
    mutateAsync: async (
      loginData: Parameters<typeof loginMutation.mutateAsync>[0]
    ) => {
      authStore.setLoggingIn(true);

      try {
        const result = await loginMutation.mutateAsync(loginData);

        // Update auth store with login result
        if (result.user && result.access_token) {
          authStore.setSession({
            user: result.user,
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            tokenExpiry: result.expires_at,
            sessionId: result.session_id,
          });

          addNotification({
            type: "success",
            title: "Welcome back!",
            message: `Hello, ${result.user.first_name}`,
          });

          // After successful login, restore the previous URL if present
          // Keep this navigation in the process layer per FSD
          try {
            const { restorePreviousUrlAfterLogin } = await import("./redirect");
            restorePreviousUrlAfterLogin("/");
          } catch {}
        }

        return result;
      } catch (error) {
        authStore.setLoggingIn(false);

        addNotification({
          type: "error",
          title: "Login Failed",
          message:
            error instanceof Error
              ? error.message
              : "Please check your credentials and try again.",
        });

        throw error;
      }
    },
  };
};

/**
 * Enhanced logout hook that integrates with auth store
 */
export const useLogoutProcess = () => {
  const authStore = useAuthStore();
  const { add: addNotification } = useNotifications();
  const logoutMutation = useLogout();

  return {
    ...logoutMutation,
    mutateAsync: async () => {
      authStore.setLoggingOut(true);

      try {
        const result = await logoutMutation.mutateAsync();

        // Clear auth store
        authStore.clearSession();

        addNotification({
          type: "info",
          title: "Logged Out",
          message: "You have been successfully logged out.",
        });

        return result;
      } catch (error) {
        // Even if logout fails on server, clear local session
        authStore.clearSession();

        addNotification({
          type: "warning",
          title: "Logged Out",
          message: "Session cleared locally.",
        });

        throw error;
      }
    },
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
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [isAuthenticated, queryClient]);
};
