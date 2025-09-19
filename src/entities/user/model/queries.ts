import { useQuery, useMutation } from "@tanstack/react-query";
import { userApi } from "../api/user-api";
import type { IdParam } from "@/shared/types";

// Entity-level query keys
export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string | number | IdParam) =>
    [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, "me"] as const,
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
    mutationFn: ({
      userId,
      updateParams,
    }: {
      userId: IdParam;
      updateParams: any;
    }) => userApi.updateUser(userId, updateParams),
  });
};

export const useUserMeUpdate = () => {
  return useMutation({
    mutationFn: (updateParams: any) => userApi.updateMe(updateParams),
  });
};
