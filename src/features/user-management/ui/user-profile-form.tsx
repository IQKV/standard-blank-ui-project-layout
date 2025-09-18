import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateMe, userMeUpdateSchema, type UserMeUpdateInput } from "../model/validation";

interface UserProfileFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function UserProfileForm({ onSuccess, onError }: UserProfileFormProps) {
  const updateMe = useUpdateMe();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<UserMeUpdateInput>({
    resolver: zodResolver(userMeUpdateSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: UserMeUpdateInput) => {
    try {
      await updateMe.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium">
          First Name
        </label>
        <input
          {...register("first_name")}
          type="text"
          id="first_name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.first_name && (
          <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium">
          Last Name
        </label>
        <input
          {...register("last_name")}
          type="text"
          id="last_name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.last_name && (
          <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          id="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium">
          Timezone
        </label>
        <input
          {...register("timezone")}
          type="text"
          id="timezone"
          placeholder="e.g., America/New_York"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.timezone && (
          <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="locale" className="block text-sm font-medium">
          Language
        </label>
        <select
          {...register("locale")}
          id="locale"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Select language</option>
          <option value="en">English</option>
        </select>
        {errors.locale && (
          <p className="mt-1 text-sm text-red-600">{errors.locale.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          New Password (optional)
        </label>
        <input
          {...register("password")}
          type="password"
          id="password"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {password && (
        <>
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium">
              Confirm New Password
            </label>
            <input
              {...register("password_confirmation")}
              type="password"
              id="password_confirmation"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password_current" className="block text-sm font-medium">
              Current Password
            </label>
            <input
              {...register("password_current")}
              type="password"
              id="password_current"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.password_current && (
              <p className="mt-1 text-sm text-red-600">{errors.password_current.message}</p>
            )}
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? "Updating..." : "Update Profile"}
      </button>

      {updateMe.error && (
        <p className="mt-2 text-sm text-red-600">
          {updateMe.error instanceof Error ? updateMe.error.message : "An error occurred"}
        </p>
      )}
    </form>
  );
}