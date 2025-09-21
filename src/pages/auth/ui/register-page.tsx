import { useNavigate } from "@tanstack/react-router";
import { RegisterForm } from "@/features/auth";
import { useAuthIntegration } from "@/processes/auth-session";
import { useNotifications } from "@/shared";

export function RegisterPage() {
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
      title: "Account Created!",
      message: "Your account has been created successfully. Please sign in.",
    });
    navigate({ to: "/auth/login" });
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
        <p>Join us! Create your account to get started.</p>
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