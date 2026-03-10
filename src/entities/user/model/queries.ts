import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user-api";
import type { IdParam } from "@/shared/types";
import type { CreateUserRequest, UpdateUserData, UserFilters } from "./types";

// Entity-level query keys (hierarchical structure for better cache management)
export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string | number | IdParam) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, "me"] as const,
};

// STANDARD CRUD QUERIES

// CREATE - Create new user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userApi.create(userData),
    onSuccess: () => {
      // Invalidate and refetch user lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// READ - Get all users with filtering
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userApi.getAll(filters),
  });
};

// READ - Get user by ID
export const useUser = (userId: string | number) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApi.getById(userId),
    enabled: !!userId,
  });
};

// UPDATE - Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: IdParam; data: UpdateUserData }) =>
      userApi.update(userId, data),
    onSuccess: (updatedUser, { userId }) => {
      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(userId), updatedUser);
      // Invalidate user lists to reflect changes
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// DELETE - Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: IdParam) => userApi.delete(userId),
    onSuccess: (_, userId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });
      // Invalidate user lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// BULK OPERATIONS
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: IdParam[]) => userApi.bulkDelete(userIds),
    onSuccess: (_, userIds) => {
      // Remove all deleted users from cache
      userIds.forEach((userId) => {
        queryClient.removeQueries({ queryKey: userKeys.detail(userId) });
      });
      // Invalidate user lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ id: IdParam; data: UpdateUserData }>) =>
      userApi.bulkUpdate(updates),
    onSuccess: (updatedUsers) => {
      // Update each user in cache
      updatedUsers?.data?.forEach((user) => {
        if (user.id) {
          queryClient.setQueryData(userKeys.detail(user.id), user);
        }
      });
      // Invalidate user lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// LEGACY QUERIES (keeping for backward compatibility)
export const useUserMe = () => {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: userApi.me,
  });
};

// Entity-level mutations (pure data access, no business logic)
export const useUserEmailConfirmation = () => {
  return useMutation({
    mutationFn: ({ userId, token }: { userId: IdParam; token: string }) =>
      userApi.confirmEmailAddress(userId, token),
  });
};

export const useUserEmailChange = () => {
  return useMutation({
    mutationFn: ({ userId, token }: { userId: IdParam; token: string }) =>
      userApi.confirmEmailChange(userId, token),
  });
};

export const useUserEmailChangeCancel = () => {
  return useMutation({
    mutationFn: (userId: IdParam) => userApi.cancelEmailChange(userId),
  });
};

export const useUserConfirmationResend = () => {
  return useMutation({
    mutationFn: (userId: IdParam) => userApi.resendConfirmation(userId),
  });
};

export const useUserEmailConfirmationWithCode = () => {
  return useMutation({
    mutationFn: ({ userId, code }: { userId: IdParam; code: IdParam }) =>
      userApi.confirmEmailAddressWithCode(userId, code),
  });
};

export const useUserUpdate = () => {
  return useMutation({
    mutationFn: ({ userId, updateParams }: { userId: IdParam; updateParams: any }) =>
      userApi.updateUser(userId, updateParams),
  });
};

export const useUserMeUpdate = () => {
  return useMutation({
    mutationFn: (updateParams: any) => userApi.updateMe(updateParams),
  });
};
