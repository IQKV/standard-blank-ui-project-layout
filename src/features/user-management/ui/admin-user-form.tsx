import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateUser } from "../model/queries";
import { userUpdateSchema, type UserUpdateInput } from "../model/validation";

interface AdminUserFormProps {
  userId: string | number;
  initialData?: Partial<UserUpdateInput>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function AdminUserForm({
  userId,
  initialData,
  onSuccess,
  onError,
}: AdminUserFormProps) {
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateInput>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: UserUpdateInput) => {
    try {
      await updateUser.mutateAsync({ userId, updateParams: data });
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <legend>Update User</legend>

        <div>
          <label htmlFor="first_name">First Name</label>
          <input
            {...register("first_name")}
            type="text"
            id="first_name"
            required
          />
          {errors.first_name && <p role="alert">{errors.first_name.message}</p>}
        </div>

        <div>
          <label htmlFor="last_name">Last Name</label>
          <input
            {...register("last_name")}
            type="text"
            id="last_name"
            required
          />
          {errors.last_name && <p role="alert">{errors.last_name.message}</p>}
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <select {...register("role")} id="role" required>
            <option value="">Select role</option>
            <option value="ADMIN">Admin</option>
            <option value="GUEST">Guest</option>
          </select>
          {errors.role && <p role="alert">{errors.role.message}</p>}
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <select {...register("status")} id="status" required>
            <option value="">Select status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          {errors.status && <p role="alert">{errors.status.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update User"}
        </button>

        {updateUser.error && (
          <p role="alert">
            {updateUser.error instanceof Error
              ? updateUser.error.message
              : "An error occurred"}
          </p>
        )}
      </fieldset>
    </form>
  );
}
