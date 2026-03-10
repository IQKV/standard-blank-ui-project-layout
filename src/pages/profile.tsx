import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { UserProfileForm } from "@/features/user-management";
import { useAuthIntegration } from "@/processes/auth-session";
import { useNotifications } from "@/shared";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthIntegration();
  const { add: addNotification } = useNotifications();

  // Redirect if not authenticated (avoid navigating during render)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/auth/login" });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleUpdateSuccess = () => {
    addNotification({
      type: "success",
      title: "Profile Updated",
      message: "Your profile has been updated successfully.",
    });
  };

  const handleUpdateError = (error: Error) => {
    addNotification({
      type: "error",
      title: "Update Failed",
      message: error.message || "Failed to update profile. Please try again.",
    });
  };

  return (
    <div>
      <header>
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences.</p>
      </header>

      <main>
        <section>
          <h2>Account Information</h2>
          {user && (
            <div>
              <p>
                <strong>Name:</strong> {user.first_name} {user.last_name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
          )}
        </section>

        <section>
          <h2>Update Profile</h2>
          <UserProfileForm onSuccess={handleUpdateSuccess} onError={handleUpdateError} />
        </section>
      </main>
    </div>
  );
}
