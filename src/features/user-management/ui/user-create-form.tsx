import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUserWithValidation } from "../model/crud-operations";
import { createUserSchema } from "../model/validation";
import type { CreateUserRequest } from "@/entities/user";

interface UserCreateFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export function UserCreateForm({ onSuccess, onError, onCancel }: UserCreateFormProps) {
  const createUser = useCreateUserWithValidation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserRequest>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      status: "ACTIVE",
      role: "GUEST",
      locale: "en",
    },
  });

  const onSubmit = async (data: CreateUserRequest) => {
    try {
      const result = await createUser.mutateAsync(data);
      reset();
      onSuccess?.(result);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <legend>Create New User</legend>

        <div>
          <label htmlFor="first_name">First Name</label>
          <input {...register("first_name")} type="text" id="first_name" required />
          {errors.first_name && <p role="alert">{errors.first_name.message}</p>}
        </div>

        <div>
          <label htmlFor="last_name">Last Name</label>
          <input {...register("last_name")} type="text" id="last_name" required />
          {errors.last_name && <p role="alert">{errors.last_name.message}</p>}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input {...register("email")} type="email" id="email" required />
          {errors.email && <p role="alert">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input {...register("password")} type="password" id="password" required />
          {errors.password && <p role="alert">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="timezone">Timezone</label>
          <input
            {...register("timezone")}
            type="text"
            id="timezone"
            placeholder="e.g., America/New_York"
          />
          {errors.timezone && <p role="alert">{errors.timezone.message}</p>}
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <select {...register("role")} id="role" required>
            <option value="GUEST">Guest</option>
            <option value="ADMIN">Admin</option>
          </select>
          {errors.role && <p role="alert">{errors.role.message}</p>}
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <select {...register("status")} id="status" required>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          {errors.status && <p role="alert">{errors.status.message}</p>}
        </div>

        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create User"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>

        {createUser.error && (
          <p role="alert">
            {createUser.error instanceof Error ? createUser.error.message : "Failed to create user"}
          </p>
        )}
      </fieldset>
    </form>
  );
}
