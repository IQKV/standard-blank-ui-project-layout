import { z } from "zod";
import { availableLocales } from "@/shared/lib/locales";

// Base user validation schemas
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
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must not exceed 50 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

export const timezoneSchema = z
  .string()
  .optional()
  .refine(
    (tz) => {
      if (!tz) return true;
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    },
    "Invalid timezone"
  );

export const localeSchema = z.enum(availableLocales as [string, ...string[]], {
  errorMap: () => ({ message: "Please select a valid locale" }),
});

export const userStatusSchema = z.enum(["ACTIVE", "INACTIVE"], {
  errorMap: () => ({ message: "Status must be either ACTIVE or INACTIVE" }),
});

export const userRoleSchema = z.enum(["ADMIN", "GUEST"], {
  errorMap: () => ({ message: "Role must be either ADMIN or GUEST" }),
});

// User creation/registration schema
export const userRegistrationSchema = z
  .object({
    first_name: nameSchema,
    last_name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    password_confirmation: z.string().min(1, "Password confirmation is required"),
    locale: localeSchema,
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
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
      message: "Current password and password confirmation are required when changing password",
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

// Type exports for use in components
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserMeUpdateInput = z.infer<typeof userMeUpdateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type EmailConfirmationInput = z.infer<typeof emailConfirmationSchema>;
export type EmailConfirmationWithCodeInput = z.infer<typeof emailConfirmationWithCodeSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;