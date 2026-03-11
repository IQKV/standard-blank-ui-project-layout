import { useDeleteUserWithConfirmation } from "../model/crud-operations";
import type { User } from "@/entities/user";

interface UserDeleteConfirmationProps {
  user: User;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export function UserDeleteConfirmation({
  user,
  onSuccess,
  onError,
  onCancel,
}: UserDeleteConfirmationProps) {
  const deleteUser = useDeleteUserWithConfirmation();

  const handleDelete = async () => {
    if (!user.id) return;

    try {
      await deleteUser.mutateAsync(user.id);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <div role="dialog" aria-labelledby="delete-title" aria-describedby="delete-description">
      <header>
        <h2 id="delete-title">Delete User</h2>
      </header>

      <main>
        <p id="delete-description">
          Are you sure you want to delete <strong>{user.full_name}</strong> ({user.email})?
        </p>
        <p>This action cannot be undone. The user will be permanently removed from the system.</p>

        {user.role === "ADMIN" && (
          <p role="alert">
            <strong>Warning:</strong> You are about to delete an admin user. This may affect system
            administration capabilities.
          </p>
        )}
      </main>

      <footer>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteUser.isPending}
          data-danger="true"
        >
          {deleteUser.isPending ? "Deleting..." : "Delete User"}
        </button>

        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        {deleteUser.error && (
          <p role="alert">
            {deleteUser.error instanceof Error ? deleteUser.error.message : "Failed to delete user"}
          </p>
        )}
      </footer>
    </div>
  );
}
