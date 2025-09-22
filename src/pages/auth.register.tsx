import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { RegisterForm } from "@/features/auth";
import { useAuthIntegration } from "@/processes/auth-session";
import { useNotifications } from "@/shared";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthIntegration();
  const { add: addNotification } = useNotifications();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const handleRegisterSuccess = () => {
    addNotification({
      type: "success",
      title: "Registration Complete!",
      message: "Your account has been successfully created.",
    });
    navigate({ to: "/" });
  };

  const handleRegisterError = (error: Error) => {
    addNotification({
      type: "error",
      title: "Registration Failed",
      message: error.message || "Please check your information and try again.",
    });
  };

  return (
    <div>
      <header>
        <h1>Create Account</h1>
        <p>Please fill out the form below to create your account.</p>
      </header>

      <main>
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onError={handleRegisterError}
        />

        <footer>
          <p>
            Already have an account? <a href="/auth/login">Sign in here</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
