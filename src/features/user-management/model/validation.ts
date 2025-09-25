import { z } from "zod";
import { availableLocales, type SupportedLocales } from "@/shared/locales";
import type { CreateUserRequest, UpdateUserData } from "@/entities/user";

// Base validation schemas for user management
export const userIdSchema = z.union([
  z.string().min(1, "User ID is required"),
  z.number().positive("User ID must be positive"),
]);

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must not exceed 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  );

export const timezoneSchema = z
  .string()
  .optional()
  .refine((tz) => {
    if (!tz) return true;
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, "Invalid timezone");

export const localeSchema = z.enum(
  availableLocales as [SupportedLocales, ...SupportedLocales[]],
  {
    errorMap: () => ({ message: "Please select a valid locale" }),
  }
);

export const userStatusSchema = z.enum(["ACTIVE", "INACTIVE"], {
  errorMap: () => ({ message: "Status must be either ACTIVE or INACTIVE" }),
});

export const userRoleSchema = z.enum(["ADMIN", "GUEST"], {
  errorMap: () => ({ message: "Role must be either ADMIN or GUEST" }),
});

// User profile update schema (for current user)
export const userMeUpdateSchema = z
  .object({
    first_name: nameSchema.optional(),
    last_name: nameSchema.optional(),
    email: emailSchema.optional(),
    timezone: timezoneSchema,
    password: passwordSchema.optional(),
    password_confirmation: z.string().optional(),
    password_current: z.string().optional(),
    locale: localeSchema.optional(),
  })
  .refine(
    (data) => {
      // If password is provided, password_confirmation and password_current are required
      if (data.password) {
        return data.password_confirmation && data.password_current;
      }
      return true;
    },
    {
      message:
        "Current password and password confirmation are required when changing password",
      path: ["password_current"],
    }
  )
  .refine(
    (data) => {
      // If password is provided, it must match confirmation
      if (data.password && data.password_confirmation) {
        return data.password === data.password_confirmation;
      }
      return true;
    },
    {
      message: "New passwords do not match",
      path: ["password_confirmation"],
    }
  );

// Admin user update schema
export const userUpdateSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  role: userRoleSchema,
  status: userStatusSchema,
});

// Email confirmation schemas
export const emailConfirmationSchema = z.object({
  userId: userIdSchema,
  token: z.string().min(1, "Confirmation token is required"),
});

export const emailConfirmationWithCodeSchema = z.object({
  userId: userIdSchema,
  code: z.string().min(1, "Confirmation code is required"),
});

// User query schemas
export const userQuerySchema = z.object({
  userId: userIdSchema,
});

// User management specific validation
export const userListFiltersSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  role: z.enum(["ADMIN", "GUEST"]).optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
});

export const bulkUserActionSchema = z.object({
  userIds: z
    .array(z.union([z.string(), z.number()]))
    .min(1, "At least one user must be selected"),
  action: z.enum(["activate", "deactivate", "delete"]),
});

// Create user schema (moved from UI to model for SRP)
export const createUserSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  timezone: timezoneSchema,
  status: userStatusSchema.optional(),
  role: userRoleSchema.optional(),
  locale: localeSchema.optional(),
}) satisfies z.ZodType<CreateUserRequest>;

// Partial update schema for edit form (moved from UI to model for SRP)
export const userUpdateDataSchema = z.object({
  first_name: nameSchema.optional(),
  last_name: nameSchema.optional(),
  email: emailSchema.optional(),
  timezone: timezoneSchema,
  status: userStatusSchema.optional(),
  role: userRoleSchema.optional(),
  locale: localeSchema.optional(),
}) satisfies z.ZodType<UpdateUserData>;

// Validation functions for use in mutations
export const validateUserMeUpdate = (data: unknown): UserMeUpdateInput => {
  return userMeUpdateSchema.parse(data);
};

export const validateUserUpdate = (data: unknown): UserUpdateInput => {
  return userUpdateSchema.parse(data);
};

export const validateEmailConfirmation = (
  data: unknown
): EmailConfirmationInput => {
  return emailConfirmationSchema.parse(data);
};

export const validateEmailConfirmationWithCode = (
  data: unknown
): EmailConfirmationWithCodeInput => {
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
export type UserMeUpdateInput = z.infer<typeof userMeUpdateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type EmailConfirmationInput = z.infer<typeof emailConfirmationSchema>;
export type EmailConfirmationWithCodeInput = z.infer<
  typeof emailConfirmationWithCodeSchema
>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type UserListFiltersInput = z.infer<typeof userListFiltersSchema>;
export type BulkUserActionInput = z.infer<typeof bulkUserActionSchema>;
