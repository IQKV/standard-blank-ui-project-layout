import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userUpdateDataSchema } from "../model/validation";
import { useUpdateUserWithValidation } from "../model/crud-operations";
import type { UpdateUserData, User, IdParam } from "@/entities/user";

interface UserEditFormProps {
  userId: IdParam;
  initialData?: Partial<User>;
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export function UserEditForm({
  userId,
  initialData,
  onSuccess,
  onError,
  onCancel,
}: UserEditFormProps) {
  const updateUser = useUpdateUserWithValidation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserData>({
    resolver: zodResolver(userUpdateDataSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      timezone: initialData?.timezone || "",
      status: initialData?.status || "ACTIVE",
      role: initialData?.role || "GUEST",
      locale: initialData?.locale || "en",
    },
  });

  const onSubmit = async (data: UpdateUserData) => {
    try {
      // Only send fields that have values
      const updateData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== "" && value !== undefined
        )
      ) as UpdateUserData;

      const result = await updateUser.mutateAsync({ userId, data: updateData });
      onSuccess?.(result);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <legend>Edit User</legend>

        <div>
          <label htmlFor="first_name">First Name</label>
          <input {...register("first_name")} type="text" id="first_name" />
          {errors.first_name && <p role="alert">{errors.first_name.message}</p>}
        </div>

        <div>
          <label htmlFor="last_name">Last Name</label>
          <input {...register("last_name")} type="text" id="last_name" />
          {errors.last_name && <p role="alert">{errors.last_name.message}</p>}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input {...register("email")} type="email" id="email" />
          {errors.email && <p role="alert">{errors.email.message}</p>}
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
          <select {...register("role")} id="role">
            <option value="">Keep current</option>
            <option value="GUEST">Guest</option>
            <option value="ADMIN">Admin</option>
          </select>
          {errors.role && <p role="alert">{errors.role.message}</p>}
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <select {...register("status")} id="status">
            <option value="">Keep current</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          {errors.status && <p role="alert">{errors.status.message}</p>}
        </div>

        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update User"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>

        {updateUser.error && (
          <p role="alert">
            {updateUser.error instanceof Error
              ? updateUser.error.message
              : "Failed to update user"}
          </p>
        )}
      </fieldset>
    </form>
  );
}
