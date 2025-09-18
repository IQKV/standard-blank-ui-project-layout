import { z } from "zod";
import { availableLocales } from "@/shared/lib";

// Base validation schemas for auth features
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

export const localeSchema = z.enum(availableLocales as [string, ...string[]], {
  errorMap: () => ({ message: "Please select a valid locale" }),
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Password reset request schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    password_confirmation: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Password reset with token schema
export const resetPasswordWithTokenSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  resetData: resetPasswordSchema,
});

// Token verification schema
export const tokenVerificationSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// User registration schema
export const registerSchema = z
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

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordWithTokenInput = z.infer<typeof resetPasswordWithTokenSchema>;
export type TokenVerificationInput = z.infer<typeof tokenVerificationSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;