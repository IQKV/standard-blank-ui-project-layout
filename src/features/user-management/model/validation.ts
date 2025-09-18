import { z } from "zod";
import {
  userMeUpdateSchema,
  userUpdateSchema,
  emailConfirmationSchema,
  emailConfirmationWithCodeSchema,
  userQuerySchema,
  type UserMeUpdateInput,
  type UserUpdateInput,
  type EmailConfirmationInput,
  type EmailConfirmationWithCodeInput,
  type UserQueryInput,
} from "@/entities/user";

// User management specific validation
export const userListFiltersSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  role: z.enum(["ADMIN", "GUEST"]).optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
});

export const bulkUserActionSchema = z.object({
  userIds: z.array(z.union([z.string(), z.number()])).min(1, "At least one user must be selected"),
  action: z.enum(["activate", "deactivate", "delete"]),
});

// Validation functions for use in mutations
export const validateUserMeUpdate = (data: unknown): UserMeUpdateInput => {
  return userMeUpdateSchema.parse(data);
};

export const validateUserUpdate = (data: unknown): UserUpdateInput => {
  return userUpdateSchema.parse(data);
};

export const validateEmailConfirmation = (data: unknown): EmailConfirmationInput => {
  return emailConfirmationSchema.parse(data);
};

export const validateEmailConfirmationWithCode = (data: unknown): EmailConfirmationWithCodeInput => {
  return emailConfirmationWithCodeSchema.parse(data);
};

export const validateUserQuery = (data: unknown): UserQueryInput => {
  return userQuerySchema.parse(data);
};

export const validateUserListFilters = (data: unknown) => {
  return userListFiltersSchema.parse(data);
};

export const validateBulkUserAction = (data: unknown) => {
  return bulkUserActionSchema.parse(data);
};

// Type exports
export type UserListFiltersInput = z.infer<typeof userListFiltersSchema>;
export type BulkUserActionInput = z.infer<typeof bulkUserActionSchema>;

// Re-export validation schemas and types from entities
export {
  userMeUpdateSchema,
  userUpdateSchema,
  emailConfirmationSchema,
  emailConfirmationWithCodeSchema,
  userQuerySchema,
  type UserMeUpdateInput,
  type UserUpdateInput,
  type EmailConfirmationInput,
  type EmailConfirmationWithCodeInput,
  type UserQueryInput,
};