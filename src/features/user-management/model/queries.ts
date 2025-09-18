
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useUsers,
  useUser,
  useUserEmailConfirmation,
  useUserEmailChange,
  useUserEmailChangeCancel,
  useUserConfirmationResend,
  useUserEmailConfirmationWithCode,
  userKeys,
  userApi
} from "@/entities/user";
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

// Feature-level user management queries with business logic

// Re-export entity queries for convenience
export { useUsers, useUser };

// Feature-specific user update with business logic
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
      // Business logic: invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Could add notifications, analytics, etc.
    },
  });
};

// Feature-specific profile update with business logic
export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateParams: UserMeUpdateInput) => {
      const validatedParams = validateUserMeUpdate(updateParams);
      return userApi.updateMe(validatedParams);
    },
    onSuccess: () => {
      // Business logic: invalidate user session data
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      // Could add success notifications, analytics, etc.
    },
  });
};

// Feature-specific email confirmation with business logic
export const useConfirmEmail = () => {

  const confirmEmailMutation = useUserEmailConfirmation();

  return {
    ...confirmEmailMutation,
    mutateAsync: async ({ userId, token }: EmailConfirmationInput) => {
      const validatedInput = validateEmailConfirmation({ userId, token });
      const result = await confirmEmailMutation.mutateAsync({
        userId: validatedInput.userId,
        token: validatedInput.token,
      });
      // Additional business logic could go here
      return result;
    },
  };
};

// Feature-specific email change confirmation with business logic
export const useConfirmEmailChange = () => {

  const confirmEmailChangeMutation = useUserEmailChange();

  return {
    ...confirmEmailChangeMutation,
    mutateAsync: async ({ userId, token }: EmailConfirmationInput) => {
      const validatedInput = validateEmailConfirmation({ userId, token });
      const result = await confirmEmailChangeMutation.mutateAsync({
        userId: validatedInput.userId,
        token: validatedInput.token,
      });
      // Additional business logic could go here
      return result;
    },
  };
};

// Feature-specific email change cancellation with business logic
export const useCancelEmailChange = () => {
  const cancelEmailChangeMutation = useUserEmailChangeCancel();

  return {
    ...cancelEmailChangeMutation,
    mutateAsync: async (userId: string | number) => {
      const validatedInput = validateUserQuery({ userId });
      const result = await cancelEmailChangeMutation.mutateAsync(validatedInput.userId);
      // Additional business logic could go here
      return result;
    },
  };
};

// Feature-specific confirmation resend with business logic
export const useResendConfirmation = () => {
  const resendConfirmationMutation = useUserConfirmationResend();

  return {
    ...resendConfirmationMutation,
    mutateAsync: async (userId: string | number) => {
      const validatedInput = validateUserQuery({ userId });
      const result = await resendConfirmationMutation.mutateAsync(validatedInput.userId);
      // Additional business logic: could add rate limiting, notifications, etc.
      return result;
    },
  };
};

// Feature-specific email confirmation with code and business logic
export const useConfirmEmailWithCode = () => {
  const confirmEmailWithCodeMutation = useUserEmailConfirmationWithCode();

  return {
    ...confirmEmailWithCodeMutation,
    mutateAsync: async ({ userId, code }: EmailConfirmationWithCodeInput) => {
      const validatedInput = validateEmailConfirmationWithCode({ userId, code });
      const result = await confirmEmailWithCodeMutation.mutateAsync({
        userId: validatedInput.userId,
        code: validatedInput.code,
      });
      // Additional business logic could go here
      return result;
    },
  };
};
