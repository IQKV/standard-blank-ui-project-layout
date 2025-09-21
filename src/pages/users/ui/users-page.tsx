import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { 
  UserCreateForm, 
  UserEditForm, 
  UserDeleteConfirmation,
  UserBulkActions 
} from "@/features/user-management";
import { UserList, useUsers, type User, type UserFilters, type IdParam } from "@/entities/user";
import { useAuthIntegration } from "@/processes/auth-session";
import { useNotifications } from "@/shared";

type ViewMode = "list" | "create" | "edit" | "delete";

export function UsersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthIntegration();
  const { add: addNotification } = useNotifications();
  
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<IdParam[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});

  // Data fetching
  const { data: usersResponse, isLoading, error } = useUsers(filters);
  const users = usersResponse?.data || [];

  // Auth check
  if (!isAuthenticated) {
    navigate({ to: "/auth/login" });
    return null;
  }

  // Role check - only admins can manage users
  if (user?.role !== "ADMIN") {
    navigate({ to: "/" });
    return null;
  }

  // Event handlers
  const handleCreateSuccess = (newUser: any) => {
    addNotification({
      type: "success",
      title: "User Created",
      message: `${newUser.data?.full_name} has been created successfully.`,
    });
    setViewMode("list");
  };

  const handleUpdateSuccess = (updatedUser: any) => {
    addNotification({
      type: "success",
      title: "User Updated",
      message: `${updatedUser.data?.full_name} has been updated successfully.`,
    });
    setViewMode("list");
    setSelectedUser(null);
  };

  const handleDeleteSuccess = () => {
    addNotification({
      type: "success",
      title: "User Deleted",
      message: "User has been deleted successfully.",
    });
    setViewMode("list");
    setSelectedUser(null);
  };

  const handleError = (error: Error) => {
    addNotification({
      type: "error",
      title: "Operation Failed",
      message: error.message || "An error occurred. Please try again.",
    });
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleBulkActionSuccess = () => {
    addNotification({
      type: "success",
      title: "Bulk Operation Complete",
      message: "The bulk operation has been completed successfully.",
    });
    setSelectedUserIds([]);
  };

  const toggleUserSelection = (userId: IdParam) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(user => user.id).filter(Boolean) as IdParam[]);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div role="status" aria-label="Loading users">
        <p>Loading users...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div role="alert">
        <h1>Error Loading Users</h1>
        <p>Failed to load users. Please try again.</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <header>
        <h1>User Management</h1>
        <p>Manage user accounts, roles, and permissions.</p>
      </header>

      <main>
        {viewMode === "list" && (
          <>
            {/* Filters and Actions */}
            <section>
              <div>
                <h2>Filters</h2>
                <div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={filters.search || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                  
                  <select
                    value={filters.status || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  
                  <select
                    value={filters.role || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value as any }))}
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="GUEST">Guest</option>
                  </select>
                </div>
              </div>

              <div>
                <h2>Actions</h2>
                <button onClick={() => setViewMode("create")}>
                  Create New User
                </button>
                
                <button onClick={handleSelectAll}>
                  {selectedUserIds.length === users.length ? "Deselect All" : "Select All"}
                </button>
              </div>
            </section>

            {/* Bulk Actions */}
            <UserBulkActions
              selectedUserIds={selectedUserIds}
              onSuccess={handleBulkActionSuccess}
              onError={handleError}
              onClearSelection={() => setSelectedUserIds([])}
            />

            {/* User List */}
            <section>
              <h2>Users ({users.length})</h2>
              {users.length > 0 ? (
                <div>
                  {users.map((user) => (
                    <div key={user.id}>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id!)}
                        onChange={() => toggleUserSelection(user.id!)}
                        aria-label={`Select ${user.full_name}`}
                      />
                      
                      <div onClick={() => handleUserSelect(user)}>
                        <UserCard user={user} />
                      </div>
                      
                      <div>
                        <button onClick={() => {
                          setSelectedUser(user);
                          setViewMode("edit");
                        }}>
                          Edit
                        </button>
                        
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setViewMode("delete");
                          }}
                          data-danger="true"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No users found. Try adjusting your filters or create a new user.</p>
              )}
            </section>
          </>
        )}

        {viewMode === "create" && (
          <section>
            <UserCreateForm
              onSuccess={handleCreateSuccess}
              onError={handleError}
              onCancel={() => setViewMode("list")}
            />
          </section>
        )}

        {viewMode === "edit" && selectedUser && (
          <section>
            <UserEditForm
              userId={selectedUser.id!}
              initialData={selectedUser}
              onSuccess={handleUpdateSuccess}
              onError={handleError}
              onCancel={() => {
                setViewMode("list");
                setSelectedUser(null);
              }}
            />
          </section>
        )}

        {viewMode === "delete" && selectedUser && (
          <section>
            <UserDeleteConfirmation
              user={selectedUser}
              onSuccess={handleDeleteSuccess}
              onError={handleError}
              onCancel={() => {
                setViewMode("list");
                setSelectedUser(null);
              }}
            />
          </section>
        )}
      </main>
    </div>
  );
}

// Simple UserCard component for the list
function UserCard({ user }: { user: User }) {
  return (
    <article>
      <header>
        <h3>{user.full_name}</h3>
        <p>{user.email}</p>
      </header>
      
      <div>
        {user.role && (
          <span data-role={user.role.toLowerCase()}>
            {user.role}
          </span>
        )}
        {user.status && (
          <span data-status={user.status.toLowerCase()}>
            {user.status}
          </span>
        )}
      </div>
      
      {user.last_login_at && (
        <footer>
          <p>Last login: {new Date(user.last_login_at).toLocaleDateString()}</p>
        </footer>
      )}
    </article>
  );
}