import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginProcess } from "@/processes/auth-session";
import { useLoginForm, useFormValidation } from "../model/form-store";
import { loginSchema, type LoginInput } from "../model/validation";

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const login = useLoginProcess();
  const loginForm = useLoginForm();
  const { setFormErrors, clearFormErrors } = useFormValidation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginForm.data,
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      // Update form store with current data
      loginForm.update(data);
      clearFormErrors("login");

      await login.mutateAsync(data);

      // Clear form on successful login
      loginForm.clear();
      onSuccess?.();
    } catch (error) {
      // Store form errors in Zustand store
      if (error instanceof Error) {
        setFormErrors("login", {
          general: [error.message],
        });
      }
      onError?.(error as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email Address *
        </label>
        <input
          {...register("email")}
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
          {...register("password")}
          type="password"
          id="password"
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>

      {login.error && (
        <p className="mt-2 text-sm text-red-600">
          {login.error instanceof Error ? login.error.message : "Login failed"}
        </p>
      )}
    </form>
  );
}
