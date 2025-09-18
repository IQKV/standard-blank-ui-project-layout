import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../model/queries";
import { registerSchema, type UserRegistrationInput } from "@/entities/auth";

interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function RegisterForm({ onSuccess, onError }: RegisterFormProps) {
  const register = useRegister();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserRegistrationInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      locale: "en",
    },
  });

  const onSubmit = async (data: UserRegistrationInput) => {
    try {
      await register.mutateAsync(data);
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
          {...registerField("first_name")}
          type="text"
          id="first_name"
          autoComplete="given-name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.first_name && (
          <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium">
          Last Name *
        </label>
        <input
          {...registerField("last_name")}
          type="text"
          id="last_name"
          autoComplete="family-name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.last_name && (
          <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email Address *
        </label>
        <input
          {...registerField("email")}
          type="email"
          id="email"
          autoComplete="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password *
        </label>
        <input
          {...registerField("password")}
          type="password"
          id="password"
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Password must be at least 8 characters with uppercase, lowercase, number, and special character.
        </p>
      </div>

      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium">
          Confirm Password *
        </label>
        <input
          {...registerField("password_confirmation")}
          type="password"
          id="password_confirmation"
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.password_confirmation && (
          <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="locale" className="block text-sm font-medium">
          Language *
        </label>
        <select
          {...registerField("locale")}
          id="locale"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="en">English</option>
        </select>
        {errors.locale && (
          <p className="mt-1 text-sm text-red-600">{errors.locale.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      {register.error && (
        <p className="mt-2 text-sm text-red-600">
          {register.error instanceof Error ? register.error.message : "Registration failed"}
        </p>
      )}
    </form>
  );
}