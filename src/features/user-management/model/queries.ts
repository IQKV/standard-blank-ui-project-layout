
import { useQueryClient } from "@tanstack/react-query";
import {
  useUsers,
  useUser,
  useUserEmailConfirmation,
  useUserEmailChange,
  useUserEmailChangeCancel,
  useUserConfirmationResend,
  useUserEmailConfirmationWithCode,
  useUserUpdate,
  useUserMeUpdate,
  userKeys
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

// Feature-specific user update with validation and business logic
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const updateUserMutation = useUserUpdate();

  return {
    ...updateUserMutation, // eslint-disable-next-line
    mutateAsync: async ({ userId, updateParams }: { userId: any; updateParams: UserUpdateInput }) => {
      // Feature-level validation
      const validatedUserId = validateUserQuery({ userId }).userId;
      const validatedParams = validateUserUpdate(updateParams);

      const result = await updateUserMutation.mutateAsync({
        userId: validatedUserId,
        updateParams: validatedParams,
      });

      // Business logic: invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Could add notifications, analytics, etc.

      return result;
    },
  };
};

// Feature-specific profile update with validation and business logic
export const useUpdateMe = () => {
  const queryClient = useQueryClient();
  const updateMeMutation = useUserMeUpdate();

  return {
    ...updateMeMutation,
    mutateAsync: async (updateParams: UserMeUpdateInput) => {
      // Feature-level validation
      const validatedParams = validateUserMeUpdate(updateParams);
      const result = await updateMeMutation.mutateAsync(validatedParams);

      // Business logic: invalidate user session data
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      // Could add success notifications, analytics, etc.

      return result;
    },
  };
};

// Feature-specific email confirmation with validation and business logic
export const useConfirmEmail = () => {
  const queryClient = useQueryClient();
  const confirmEmailMutation = useUserEmailConfirmation();

  return {
    ...confirmEmailMutation,
    mutateAsync: async ({ userId, token }: EmailConfirmationInput) => {
      // Feature-level validation
      const validatedInput = validateEmailConfirmation({ userId, token });
      const result = await confirmEmailMutation.mutateAsync({
        userId: validatedInput.userId,
        token: validatedInput.token,
      });

      // Business logic: invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });

      return result;
    },
  };
};

// Feature-specific email change confirmation with validation and business logic
export const useConfirmEmailChange = () => {
  const queryClient = useQueryClient();
  const confirmEmailChangeMutation = useUserEmailChange();

  return {
    ...confirmEmailChangeMutation,
    mutateAsync: async ({ userId, token }: EmailConfirmationInput) => {
      // Feature-level validation
      const validatedInput = validateEmailConfirmation({ userId, token });
      const result = await confirmEmailChangeMutation.mutateAsync({
        userId: validatedInput.userId,
        token: validatedInput.token,
      });

      // Business logic: invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });

      return result;
    },
  };
};

// Feature-specific email change cancellation with validation and business logic
export const useCancelEmailChange = () => {
  const queryClient = useQueryClient();
  const cancelEmailChangeMutation = useUserEmailChangeCancel();

  return {
    ...cancelEmailChangeMutation,
    mutateAsync: async (userId: string | number) => {
      // Feature-level validation
      const validatedInput = validateUserQuery({ userId });
      const result = await cancelEmailChangeMutation.mutateAsync(validatedInput.userId);

      // Business logic: invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });

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

// Feature-specific email confirmation with code, validation and business logic
export const useConfirmEmailWithCode = () => {
  const queryClient = useQueryClient();
  const confirmEmailWithCodeMutation = useUserEmailConfirmationWithCode();

  return {
    ...confirmEmailWithCodeMutation,
    mutateAsync: async ({ userId, code }: EmailConfirmationWithCodeInput) => {
      // Feature-level validation
      const validatedInput = validateEmailConfirmationWithCode({ userId, code });
      const result = await confirmEmailWithCodeMutation.mutateAsync({
        userId: validatedInput.userId,
        code: validatedInput.code,
      });

      // Business logic: invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });

      return result;
    },
  };
};
