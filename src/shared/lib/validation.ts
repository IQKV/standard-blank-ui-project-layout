import { z } from "zod";

// Common validation utilities
export const createOptionalField = <T extends z.ZodTypeAny>(schema: T) => {
  return schema.optional().or(z.literal(""));
};

export const createRequiredField = <T extends z.ZodTypeAny>(
  schema: T,
  message?: string
) => {
  return schema.refine(
    (val) => val !== undefined && val !== null && val !== "",
    {
      message: message || "This field is required",
    }
  );
};

// Common validation patterns
export const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
export const urlRegex = /^https?:\/\/.+/;
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Validation error formatter
export const formatZodError = (error: z.ZodError) => {
  return error.errors.reduce(
    (acc, curr) => {
      const path = curr.path.join(".");
      acc[path] = curr.message;
      return acc;
    },
    {} as Record<string, string>
  );
};

// Validation result type
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

// Safe validation wrapper
export const safeValidate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: formatZodError(error) };
    }
    return { success: false, errors: { _general: "Validation failed" } };
  }
};

// Async validation wrapper for React Hook Form
export const createAsyncValidator = <T>(
  schema: z.ZodSchema<T>,
  asyncValidation?: (data: T) => Promise<boolean | string>
) => {
  return async (data: unknown) => {
    try {
      const parsed = schema.parse(data);

      if (asyncValidation) {
        const asyncResult = await asyncValidation(parsed);
        if (typeof asyncResult === "string") {
          return asyncResult;
        }
        if (!asyncResult) {
          return "Validation failed";
        }
      }

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "Validation failed";
      }
      return "Validation failed";
    }
  };
};
