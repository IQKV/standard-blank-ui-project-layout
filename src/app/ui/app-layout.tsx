import React, { useEffect } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { useAuthIntegration, useAuthEffects } from "@/processes/auth-session";
import { useTheme, useNotifications, useGlobalLoading } from "@/shared";
import { useAppSettingsStore } from "@/shared";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : React.lazy(() =>
      // Lazy load in development
      import("@tanstack/react-router-devtools").then((res) => ({
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
      <div role="status" aria-label="Loading application">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <>
      {/* Global loading indicator */}
      {hasAnyLoading && (
        <div role="status" aria-label="Loading">
          <p>Loading...</p>
        </div>
      )}

      {/* Navigation */}
      <nav role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/profile">My Profile</Link>
              </li>
              {user?.role === "ADMIN" && (
                <>
                  <li>
                    <Link to="/users">Manage Users</Link>
                  </li>
                  <li>
                    <Link to="/admin">Admin Panel</Link>
                  </li>
                </>
              )}
            </>
          ) : (
            <>
              <li>
                <Link to="/auth/login">Sign In</Link>
              </li>
              <li>
                <Link to="/auth/register">Sign Up</Link>
              </li>
            </>
          )}
        </ul>

        {/* User info */}
        <div>
          {isAuthenticated && user ? (
            <p>Welcome, {user.first_name}</p>
          ) : (
            <p>Not logged in</p>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Notifications */}
      {notifications.length > 0 && (
        <section role="alert" aria-label="Notifications">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              data-notification-type={notification.type}
            >
              <header>
                <h4>{notification.title}</h4>
                {notification.message && <p>{notification.message}</p>}
              </header>
              <button
                onClick={() => removeNotification(notification.id)}
                aria-label={`Dismiss ${notification.title} notification`}
              >
                ×
              </button>
            </article>
          ))}
        </section>
      )}

      <TanStackRouterDevtools />
    </>
  );
}
