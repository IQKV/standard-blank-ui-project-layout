import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/entities/user";
import {
  validateUserMeUpdate,
  validateUserUpdate,
  validateEmailConfirmation,
  validateEmailConfirmationWithCode,
  validateUserQuery,
  type UserMeUpdateInput,
  type UserUpdateInput,
  type EmailConfirmationInput,
  type EmailConfirmationWithCodeInput,
} from "./validation";

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
};

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userApi.all,
  });
};

export const useUser = (userId: string | number) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => {
      const validatedInput = validateUserQuery({ userId });
      return userApi.findByID(validatedInput.userId);
    },
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // eslint-disable-next-line
    mutationFn: ({ userId, updateParams }: { userId: any; updateParams: UserUpdateInput }) => {
      const validatedUserId = validateUserQuery({ userId }).userId;
      const validatedParams = validateUserUpdate(updateParams);
      return userApi.updateUser(validatedUserId, validatedParams);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateParams: UserMeUpdateInput) => {
      const validatedParams = validateUserMeUpdate(updateParams);
      return userApi.updateMe(validatedParams);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useConfirmEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, token }: EmailConfirmationInput) => {
      const validatedInput = validateEmailConfirmation({ userId, token });
      return userApi.confirmEmailAddress(validatedInput.userId, validatedInput.token);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useConfirmEmailChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, token }: EmailConfirmationInput) => {
      const validatedInput = validateEmailConfirmation({ userId, token });
      return userApi.confirmEmailChange(validatedInput.userId, validatedInput.token);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useCancelEmailChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string | number) => {
      const validatedInput = validateUserQuery({ userId });
      return userApi.cancelEmailChange(validatedInput.userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};

export const useResendConfirmation = () => {
  return useMutation({
    mutationFn: (userId: string | number) => {
      const validatedInput = validateUserQuery({ userId });
      return userApi.resendConfirmation(validatedInput.userId);
    },
  });
};

export const useConfirmEmailWithCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, code }: EmailConfirmationWithCodeInput) => {
      const validatedInput = validateEmailConfirmationWithCode({ userId, code });
      return userApi.confirmEmailAddressWithCode(validatedInput.userId, validatedInput.code);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
};
