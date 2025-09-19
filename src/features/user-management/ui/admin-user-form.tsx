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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium">
          First Name *
        </label>
        <input
          {...register("first_name")}
          type="text"
          id="first_name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.first_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.first_name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium">
          Last Name *
        </label>
        <input
          {...register("last_name")}
          type="text"
          id="last_name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.last_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.last_name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Role *
        </label>
        <select
          {...register("role")}
          id="role"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Select role</option>
          <option value="ADMIN">Admin</option>
          <option value="GUEST">Guest</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Status *
        </label>
        <select
          {...register("status")}
          id="status"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Select status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? "Updating..." : "Update User"}
      </button>

      {updateUser.error && (
        <p className="mt-2 text-sm text-red-600">
          {updateUser.error instanceof Error
            ? updateUser.error.message
            : "An error occurred"}
        </p>
      )}
    </form>
  );
}
