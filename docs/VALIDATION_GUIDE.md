# Zod Validation Guide

This project uses [Zod](https://zod.dev/) for runtime type validation and schema validation. The validation system is integrated throughout the Feature-Sliced Design architecture.

## Architecture Overview

```
src/
├── entities/
│   ├── user/model/validation.ts     # User entity validation schemas
│   └── auth/model/validation.ts     # Auth entity validation schemas
├── features/
│   ├── user-management/model/validation.ts  # Feature-specific validation
│   └── auth/model/validation.ts             # Feature-specific validation
└── shared/lib/validation.ts         # Common validation utilities
```

## Validation Layers

### 1. Entity Layer Validation

Located in `entities/{entity}/model/validation.ts`

**Purpose**: Define core validation schemas for business entities
**Examples**: User registration, login credentials, user profile updates

```typescript
// entities/user/model/validation.ts
export const userRegistrationSchema = z
  .object({
    first_name: nameSchema,
    last_name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    password_confirmation: z
      .string()
      .min(1, "Password confirmation is required"),
    locale: localeSchema,
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });
```

### 2. Feature Layer Validation

Located in `features/{feature}/model/validation.ts`

**Purpose**: Feature-specific validation logic and validation functions
**Examples**: Bulk operations, filtered queries, complex business rules

```typescript
// features/user-management/model/validation.ts
export const validateUserMeUpdate = (data: unknown): UserMeUpdateInput => {
  return userMeUpdateSchema.parse(data);
};
```

### 3. Shared Validation Utilities

Located in `shared/lib/validation.ts`

**Purpose**: Common validation patterns and utilities
**Examples**: Phone validation, URL validation, error formatting

## Validation Schemas

### User Validation

#### Basic Schemas

```typescript
// Name validation
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must not exceed 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  );

// Email validation
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );
```

#### Complex Schemas

```typescript
// User profile update with conditional validation
const userMeUpdateSchema = z
  .object({
    first_name: nameSchema.optional(),
    last_name: nameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    password_confirmation: z.string().optional(),
    password_current: z.string().optional(),
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
  );
```

### Auth Validation

```typescript
// Login validation
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Password reset validation
const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    password_confirmation: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });
```

## Integration with React Hook Form

### Basic Form Setup

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userMeUpdateSchema,
  type UserMeUpdateInput,
} from "../model/validation";

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<UserMeUpdateInput>({
  resolver: zodResolver(userMeUpdateSchema),
});
```

### Form Submission with Validation

```typescript
const onSubmit = async (data: UserMeUpdateInput) => {
  try {
    // Data is already validated by React Hook Form + Zod
    await updateMe.mutateAsync(data);
    onSuccess?.();
  } catch (error) {
    onError?.(error as Error);
  }
};
```

## Integration with Tanstack Query

### Mutation with Validation

```typescript
export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateParams: UserMeUpdateInput) => {
      // Validate data before API call
      const validatedParams = validateUserMeUpdate(updateParams);
      return userApi.updateMe(validatedParams);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};
```

### Query Parameter Validation

```typescript
export const useUser = (userId: string | number) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => {
      // Validate query parameters
      const validatedInput = validateUserQuery({ userId });
      return userApi.findByID(validatedInput.userId);
    },
    enabled: !!userId,
  });
};
```

## Error Handling

### Zod Error Formatting

```typescript
import { formatZodError } from "@/shared/lib/validation";

try {
  const result = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    const formattedErrors = formatZodError(error);
    // formattedErrors = { "field.path": "Error message" }
  }
}
```

### Safe Validation

```typescript
import { safeValidate } from "@/shared/lib/validation";

const result = safeValidate(userSchema, userData);
if (result.success) {
  // result.data is typed and validated
  console.log(result.data);
} else {
  // result.errors contains field-specific errors
  console.log(result.errors);
}
```

## Best Practices

### 1. Schema Composition

```typescript
// ✅ Good: Compose schemas from smaller pieces
const baseUserSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
});

const userRegistrationSchema = baseUserSchema.extend({
  password: passwordSchema,
  password_confirmation: z.string(),
});
```

### 2. Validation at Boundaries

```typescript
// ✅ Good: Validate at API boundaries
export const useLogin = () => {
  return useMutation({
    mutationFn: (loginData: LoginInput) => {
      const validatedData = loginSchema.parse(loginData); // Validate here
      return authApi.login(validatedData);
    },
  });
};
```

### 3. Type Safety

```typescript
// ✅ Good: Export and use inferred types
export type UserMeUpdateInput = z.infer<typeof userMeUpdateSchema>;

// Use the type in components
const MyComponent = ({ data }: { data: UserMeUpdateInput }) => {
  // data is fully typed
};
```

### 4. Custom Validation Messages

```typescript
// ✅ Good: Provide clear, user-friendly messages
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");
```

### 5. Conditional Validation

```typescript
// ✅ Good: Use refine for complex conditional logic
const schema = z
  .object({
    type: z.enum(["email", "phone"]),
    contact: z.string(),
  })
  .refine(
    (data) => {
      if (data.type === "email") {
        return z.string().email().safeParse(data.contact).success;
      }
      return z.string().regex(phoneRegex).safeParse(data.contact).success;
    },
    {
      message: "Invalid contact format",
      path: ["contact"],
    }
  );
```

## Common Patterns

### Optional Fields

```typescript
// Make field optional but validate when present
const optionalEmailSchema = z.string().email().optional();

// Or use shared utility
const optionalEmailSchema = createOptionalField(z.string().email());
```

### Array Validation

```typescript
const userIdsSchema = z
  .array(z.union([z.string(), z.number()]))
  .min(1, "At least one user must be selected");
```

### Enum Validation

```typescript
const statusSchema = z.enum(["ACTIVE", "INACTIVE"], {
  errorMap: () => ({ message: "Status must be either ACTIVE or INACTIVE" }),
});
```

This validation system provides type safety, runtime validation, and excellent developer experience while maintaining the clean architecture principles of Feature-Sliced Design.
