import { useState } from "react";
import {
  useBulkDeleteUsersWithValidation,
  useBulkUpdateUsersWithValidation,
} from "../model/crud-operations";
import type { IdParam, UpdateUserData } from "@/entities/user";

interface UserBulkActionsProps {
  selectedUserIds: IdParam[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onClearSelection?: () => void;
}

export function UserBulkActions({
  selectedUserIds,
  onSuccess,
  onError,
  onClearSelection,
}: UserBulkActionsProps) {
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const bulkDelete = useBulkDeleteUsersWithValidation();
  const bulkUpdate = useBulkUpdateUsersWithValidation();

  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(selectedUserIds);
      setShowDeleteConfirm(false);
      onClearSelection?.();
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleBulkUpdate = async (updateData: UpdateUserData) => {
    try {
      const updates = selectedUserIds.map((id) => ({ id, data: updateData }));
      await bulkUpdate.mutateAsync(updates);
      setShowBulkUpdate(false);
      onClearSelection?.();
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  if (selectedUserIds.length === 0) {
    return null;
  }

  return (
    <div>
      <header>
        <h3>{selectedUserIds.length} user(s) selected</h3>
      </header>

      <div>
        <button type="button" onClick={() => setShowBulkUpdate(true)}>
          Bulk Update
        </button>

        <button type="button" onClick={() => setShowDeleteConfirm(true)} data-danger="true">
          Bulk Delete
        </button>

        <button type="button" onClick={onClearSelection}>
          Clear Selection
        </button>
      </div>

      {showBulkUpdate && (
        <BulkUpdateForm
          onSubmit={handleBulkUpdate}
          onCancel={() => setShowBulkUpdate(false)}
          isLoading={bulkUpdate.isPending}
          error={bulkUpdate.error}
        />
      )}

      {showDeleteConfirm && (
        <div role="dialog" aria-labelledby="bulk-delete-title">
          <header>
            <h4 id="bulk-delete-title">Confirm Bulk Delete</h4>
          </header>

          <p>
            Are you sure you want to delete {selectedUserIds.length} user(s)? This action cannot be
            undone.
          </p>

          <div>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDelete.isPending}
              data-danger="true"
            >
              {bulkDelete.isPending ? "Deleting..." : "Delete All"}
            </button>

            <button type="button" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
          </div>

          {bulkDelete.error && (
            <p role="alert">
              {bulkDelete.error instanceof Error
                ? bulkDelete.error.message
                : "Failed to delete users"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface BulkUpdateFormProps {
  onSubmit: (data: UpdateUserData) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: Error | null;
}

function BulkUpdateForm({ onSubmit, onCancel, isLoading, error }: BulkUpdateFormProps) {
  const [updateData, setUpdateData] = useState<UpdateUserData>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only send fields that have values
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== "" && value !== undefined),
    ) as UpdateUserData;

    if (Object.keys(filteredData).length === 0) {
      return; // No changes to apply
    }

    onSubmit(filteredData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>Bulk Update Users</legend>

        <div>
          <label htmlFor="bulk-status">Status</label>
          <select
            id="bulk-status"
            value={updateData.status || ""}
            onChange={(e) =>
              setUpdateData((prev) => ({
                ...prev,
                status: e.target.value as "ACTIVE" | "INACTIVE" | undefined,
              }))
            }
          >
            <option value="">No change</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="bulk-role">Role</label>
          <select
            id="bulk-role"
            value={updateData.role || ""}
            onChange={(e) =>
              setUpdateData((prev) => ({
                ...prev,
                role: e.target.value as "ADMIN" | "GUEST" | undefined,
              }))
            }
          >
            <option value="">No change</option>
            <option value="GUEST">Guest</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update All"}
          </button>

          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>

        {error && (
          <p role="alert">{error instanceof Error ? error.message : "Failed to update users"}</p>
        )}
      </fieldset>
    </form>
  );
}
