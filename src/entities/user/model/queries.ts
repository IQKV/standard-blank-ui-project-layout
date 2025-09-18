import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user-api";
import type { IdParam } from "@/shared/types";

// Entity-level query keys
export const userKeys = {
  all: ['user'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string | number | IdParam) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

// Entity-level queries (basic CRUD operations)
export const useUser = (userId: string | number) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userApi.findByID(userId),
    enabled: !!userId,
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userApi.all,
  });
};

export const useUserMe = () => {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: userApi.me,
  });
};

// Entity-level mutations (basic operations without business logic)
export const useUserEmailConfirmation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, token }: { userId: IdParam; token: string }) => {
      return userApi.confirmEmailAddress(userId, token);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useUserEmailChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, token }: { userId: IdParam; token: string }) => {
      return userApi.confirmEmailChange(userId, token);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useUserEmailChangeCancel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: IdParam) => {
      return userApi.cancelEmailChange(userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useUserConfirmationResend = () => {
  return useMutation({
    mutationFn: (userId: IdParam) => {
      return userApi.resendConfirmation(userId);
    },
  });
};

export const useUserEmailConfirmationWithCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, code }: { userId: IdParam; code: IdParam }) => {
      return userApi.confirmEmailAddressWithCode(userId, code);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};
