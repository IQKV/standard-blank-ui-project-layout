import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateMe } from "../model/queries";
import { userMeUpdateSchema, type UserMeUpdateInput } from "../model/validation";

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <legend>Update Profile</legend>

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
          <label htmlFor="locale">Language</label>
          <select {...register("locale")} id="locale">
            <option value="">Select language</option>
            <option value="en">English</option>
          </select>
          {errors.locale && <p role="alert">{errors.locale.message}</p>}
        </div>
      </fieldset>

      <fieldset>
        <legend>Change Password (Optional)</legend>

        <div>
          <label htmlFor="password">New Password</label>
          <input {...register("password")} type="password" id="password" />
          {errors.password && <p role="alert">{errors.password.message}</p>}
        </div>

        {password && (
          <>
            <div>
              <label htmlFor="password_confirmation">Confirm New Password</label>
              <input
                {...register("password_confirmation")}
                type="password"
                id="password_confirmation"
                required
              />
              {errors.password_confirmation && (
                <p role="alert">{errors.password_confirmation.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password_current">Current Password</label>
              <input
                {...register("password_current")}
                type="password"
                id="password_current"
                required
              />
              {errors.password_current && <p role="alert">{errors.password_current.message}</p>}
            </div>
          </>
        )}
      </fieldset>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Profile"}
      </button>

      {updateMe.error && (
        <p role="alert">
          {updateMe.error instanceof Error ? updateMe.error.message : "An error occurred"}
        </p>
      )}
    </form>
  );
}
