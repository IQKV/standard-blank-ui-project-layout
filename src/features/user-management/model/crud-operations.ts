// Feature-level CRUD operations with business logic
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useBulkDeleteUsers,
  useBulkUpdateUsers,
  userKeys,
} from "@/entities/user";
import type { CreateUserRequest, UpdateUserData, IdParam } from "@/entities/user";

// CREATE USER with business logic
export const useCreateUserWithValidation = () => {
  const createUser = useCreateUser();

  return {
    ...createUser,
    mutateAsync: async (userData: CreateUserRequest) => {
      // Feature-level business logic
      const processedData = {
        ...userData,
        // Set default values
        status: userData.status || ("ACTIVE" as const),
        role: userData.role || ("GUEST" as const),
        locale: userData.locale || ("en" as const),
      };

      const result = await createUser.mutateAsync(processedData);

      // Additional business logic after creation
      // Could trigger notifications, analytics, etc.

      return result;
    },
  };
};

// UPDATE USER with business logic
export const useUpdateUserWithValidation = () => {
  const updateUser = useUpdateUser();

  return {
    ...updateUser,
    mutateAsync: async ({ userId, data }: { userId: IdParam; data: UpdateUserData }) => {
      // Feature-level validation and business logic
      const processedData = { ...data };

      // Business rule: Don't allow changing email to existing email
      // Business rule: Admin role changes require special handling

      const result = await updateUser.mutateAsync({
        userId,
        data: processedData,
      });

      // Post-update business logic
      // Could trigger audit logs, notifications, etc.

      return result;
    },
  };
};

// DELETE USER with business logic
export const useDeleteUserWithConfirmation = () => {
  const deleteUser = useDeleteUser();

  return {
    ...deleteUser,
    mutateAsync: async (userId: IdParam) => {
      // Feature-level business logic
      // Could check for dependencies, create audit trail, etc.

      const result = await deleteUser.mutateAsync(userId);

      // Post-deletion business logic
      // Could clean up related data, send notifications, etc.

      return result;
    },
  };
};

// BULK OPERATIONS with business logic
export const useBulkDeleteUsersWithValidation = () => {
  const bulkDelete = useBulkDeleteUsers();

  return {
    ...bulkDelete,
    mutateAsync: async (userIds: IdParam[]) => {
      // Feature-level validation
      // Don't allow deleting current user, admin users, etc.

      const result = await bulkDelete.mutateAsync(userIds);

      // Post-deletion business logic
      return result;
    },
  };
};

export const useBulkUpdateUsersWithValidation = () => {
  const bulkUpdate = useBulkUpdateUsers();

  return {
    ...bulkUpdate,
    mutateAsync: async (updates: Array<{ id: IdParam; data: UpdateUserData }>) => {
      // Feature-level validation and processing
      const processedUpdates = updates.map((update) => ({
        ...update,
        data: {
          ...update.data,
          // Apply business rules to each update
        },
      }));

      const result = await bulkUpdate.mutateAsync(processedUpdates);

      // Post-update business logic
      return result;
    },
  };
};

// SEARCH AND FILTER operations
export const useUserSearch = () => {
  const queryClient = useQueryClient();

  const searchUsers = async (searchTerm: string) => {
    // Implement search logic
    const filters = { search: searchTerm };

    // Could implement debounced search, caching, etc.
    return queryClient.fetchQuery({
      queryKey: userKeys.list(filters),
      queryFn: () => import("@/entities/user").then(({ userApi }) => userApi.getAll(filters)),
    });
  };

  return { searchUsers };
};
