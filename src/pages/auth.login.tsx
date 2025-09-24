import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth";
import { useAuthIntegration } from "@/processes/auth-session";
import { useNotifications } from "@/shared";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthIntegration();
  const { add: addNotification } = useNotifications();

  // Redirect if already authenticated (avoid navigating during render)
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const handleLoginSuccess = () => {
    addNotification({
      type: "success",
      title: "Welcome!",
      message: "You have successfully signed in.",
    });
    navigate({ to: "/" });
  };

  const handleLoginError = (error: Error) => {
    // Only notify if there is a message to show
    const message = error?.message?.trim();
    if (message) {
      addNotification({
        type: "error",
        title: "Sign In Failed",
        message,
      });
    }
  };

  return (
    <div>
      <header>
        <h1>Sign In</h1>
        <p>Welcome back! Please sign in to your account.</p>
      </header>

      <main>
        <LoginForm onSuccess={handleLoginSuccess} onError={handleLoginError} />

        <footer>
          <p>
            Don't have an account? <a href="/auth/register">Create one here</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
