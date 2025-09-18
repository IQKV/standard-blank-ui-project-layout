import { z } from "zod";
import { emailSchema, passwordSchema, userRegistrationSchema } from "@/entities/user/model/validation";

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

// Re-export user registration schema for convenience
export { userRegistrationSchema as registerSchema };

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordWithTokenInput = z.infer<typeof resetPasswordWithTokenSchema>;
export type TokenVerificationInput = z.infer<typeof tokenVerificationSchema>;
export type RegisterInput = z.infer<typeof userRegistrationSchema>;