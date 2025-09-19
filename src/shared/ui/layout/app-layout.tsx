import React, { useEffect } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { useAuthIntegration, useAuthEffects } from "@/processes/auth-session";
import { useTheme, useNotifications, useGlobalLoading } from "@/shared";
import { useAppSettingsStore } from "@/shared/model/app-settings-store";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
        // For Embedded Mode
        // default: res.TanStackRouterDevtoolsPanel
      }))
    );

export function AppLayout() {
  // Initialize auth integration
  const { isAuthenticated, user, isInitialized } = useAuthIntegration();

  // Set up auth effects
  useAuthEffects();

  // UI state management
  const theme = useTheme();
  const { notifications, remove: removeNotification } = useNotifications();
  const { hasAnyLoading } = useGlobalLoading();

  // App settings
  const { markAsLoaded, isLoaded } = useAppSettingsStore();

  // Initialize app settings on mount
  useEffect(() => {
    if (!isLoaded) {
      markAsLoaded();
    }
  }, [isLoaded, markAsLoaded]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System theme
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Global loading indicator */}
      {hasAnyLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse z-50"></div>
      )}

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                About
              </Link>
            </div>

            {/* User info */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, {user.first_name}
                </span>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Not logged in
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                max-w-sm p-4 rounded-lg shadow-lg border
                ${notification.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}
                ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
                ${notification.type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-800" : ""}
                ${notification.type === "info" ? "bg-blue-50 border-blue-200 text-blue-800" : ""}
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{notification.title}</h4>
                  {notification.message && (
                    <p className="mt-1 text-sm opacity-90">
                      {notification.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TanStackRouterDevtools />
    </>
  );
}
