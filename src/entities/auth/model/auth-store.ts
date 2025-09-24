import { createStore } from "@/shared/lib/store";
import { persist } from "@/shared/lib/store-persistence";
import { useShallow } from "@/shared/lib/store-utils";
import type { User } from "@/entities/user";

export interface AuthState {
  // Authentication status
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Current user session
  user: User | null;

  // Token management
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;

  // Session metadata
  sessionId: string | null;
  lastActivity: number | null;

  // Auth flow state
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isRefreshing: boolean;
}

interface AuthActions {
  // Session management
  setSession: (session: {
    user: User;
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number;
    sessionId?: string;
  }) => void;

  clearSession: () => void;

  updateUser: (user: Partial<User>) => void;

  // Token management
  setTokens: (tokens: {
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number;
  }) => void;

  clearTokens: () => void;

  // Auth flow states
  setLoggingIn: (isLoggingIn: boolean) => void;
  setLoggingOut: (isLoggingOut: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;

  // Session activity
  updateLastActivity: () => void;

  // Initialization
  setInitialized: (initialized: boolean) => void;

  // Session validation
  isTokenExpired: () => boolean;
  shouldRefreshToken: () => boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  sessionId: null,
  lastActivity: null,
  isLoggingIn: false,
  isLoggingOut: false,
  isRefreshing: false,
};

export const useAuthStore = createStore<AuthState & AuthActions>(
  "auth-store",
  persist(
    (set, get) => ({
      ...initialState,

      // Session management
      setSession: (session: {
        user: User;
        accessToken: string;
        refreshToken: string;
        tokenExpiry: number;
        sessionId?: string;
      }) =>
        set((state: any): any => {
          state.isAuthenticated = true;
          state.user = session.user;
          state.accessToken = session.accessToken;
          state.refreshToken = session.refreshToken;
          state.tokenExpiry = session.tokenExpiry;
          state.sessionId = session.sessionId || null;
          state.lastActivity = Date.now();
          state.isLoggingIn = false;
        }),

      clearSession: () =>
        set((state: any): any => {
          state.isAuthenticated = false;
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.tokenExpiry = null;
          state.sessionId = null;
          state.lastActivity = null;
          state.isLoggingOut = false;
          state.isRefreshing = false;
        }),

      updateUser: (userUpdate: Partial<User>) =>
        set((state: any): any => {
          if (state.user) {
            state.user = { ...state.user, ...userUpdate };
          }
        }),

      // Token management
      setTokens: (tokens: {
        accessToken: string;
        refreshToken: string;
        tokenExpiry: number;
      }) =>
        set((state: any): any => {
          state.accessToken = tokens.accessToken;
          state.refreshToken = tokens.refreshToken;
          state.tokenExpiry = tokens.tokenExpiry;
          state.lastActivity = Date.now();
          state.isRefreshing = false;
        }),

      clearTokens: () =>
        set((state: any): any => {
          state.accessToken = null;
          state.refreshToken = null;
          state.tokenExpiry = null;
        }),

      // Auth flow states
      setLoggingIn: (isLoggingIn: boolean) =>
        set((state: any): any => {
          state.isLoggingIn = isLoggingIn;
        }),

      setLoggingOut: (isLoggingOut: boolean) =>
        set((state: any): any => {
          state.isLoggingOut = isLoggingOut;
        }),

      setRefreshing: (isRefreshing: boolean) =>
        set((state: any): any => {
          state.isRefreshing = isRefreshing;
        }),

      // Session activity
      updateLastActivity: () =>
        set((state: any): any => {
          state.lastActivity = Date.now();
        }),

      // Initialization
      setInitialized: (initialized: boolean) =>
        set((state: any): any => {
          state.isInitialized = initialized;
        }),

      // Session validation
      isTokenExpired: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return true;
        return Date.now() >= tokenExpiry;
      },

      shouldRefreshToken: () => {
        const { tokenExpiry, refreshToken } = get();
        if (!tokenExpiry || !refreshToken) return false;

        // Refresh if token expires within 5 minutes
        const fiveMinutes = 5 * 60 * 1000;
        return Date.now() >= tokenExpiry - fiveMinutes;
      },
    }),
    {
      name: "auth-session",
      partialize: (state) => ({
        // Only persist essential auth data, not loading states
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenExpiry: state.tokenExpiry,
        sessionId: state.sessionId,
        lastActivity: state.lastActivity,
      }),
      version: 1,
    }
  )
);

// Selectors for optimized subscriptions
export const useAuthSession = () =>
  useShallow(useAuthStore, (state) => ({
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    user: state.user,
    sessionId: state.sessionId,
    lastActivity: state.lastActivity,
  }));

export const useAuthTokens = () =>
  useShallow(useAuthStore, (state) => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    tokenExpiry: state.tokenExpiry,
    isTokenExpired: state.isTokenExpired(),
    shouldRefreshToken: state.shouldRefreshToken(),
  }));

export const useAuthFlow = () =>
  useShallow(useAuthStore, (state) => ({
    isLoggingIn: state.isLoggingIn,
    isLoggingOut: state.isLoggingOut,
    isRefreshing: state.isRefreshing,
    setLoggingIn: state.setLoggingIn,
    setLoggingOut: state.setLoggingOut,
    setRefreshing: state.setRefreshing,
  }));

export const useCurrentUser = () => useAuthStore((state) => state.user);
