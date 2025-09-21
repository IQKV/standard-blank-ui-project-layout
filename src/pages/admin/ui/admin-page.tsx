import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AdminUserForm } from "@/features/user-management";
import { UserList } from "@/entities/user";
import { useUsers } from "@/entities/user";
import { useAuthIntegration } from "@/processes/auth-session";
import { useNotifications } from "@/shared";
import type { User } from "@/entities/user";

export function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthIntegration();
  const { add: addNotification } = useNotifications();
  const { data: usersResponse, isLoading } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    navigate({ to: "/auth/login" });
    return null;
  }

  // Simple role check - in real app, this would be more sophisticated
  if (user?.role !== "ADMIN") {
    navigate({ to: "/" });
    return null;
  }

  const users = usersResponse?.data || [];

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
  };

  const handleUpdateSuccess = () => {
    addNotification({
      type: "success",
      title: "User Updated",
      message: "User has been updated successfully.",
    });
    setSelectedUser(null);
  };

  const handleUpdateError = (error: Error) => {
    addNotification({
      type: "error",
      title: "Update Failed",
      message: error.message || "Failed to update user. Please try again.",
    });
  };

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading users">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <header>
        <h1>User Administration</h1>
        <p>Manage user accounts and permissions.</p>
      </header>

      <main>
        <section>
          <h2>Users</h2>
          {users.length > 0 ? (
            <UserList 
              users={users} 
              onUserClick={handleUserSelect}
            />
          ) : (
            <p>No users found.</p>
          )}
        </section>

        {selectedUser && (
          <section>
            <h2>Edit User: {selectedUser.first_name} {selectedUser.last_name}</h2>
            <AdminUserForm
              userId={selectedUser.id as string | number}
              initialData={{
                first_name: selectedUser.first_name,
                last_name: selectedUser.last_name,
                role: selectedUser.role,
                status: selectedUser.status,
              }}
              onSuccess={handleUpdateSuccess}
              onError={handleUpdateError}
            />
            <button 
              type="button" 
              onClick={() => setSelectedUser(null)}
            >
              Cancel
            </button>
          </section>
        )}
      </main>
    </div>
  );
}