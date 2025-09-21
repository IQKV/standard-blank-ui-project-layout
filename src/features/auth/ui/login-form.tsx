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
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <legend>Sign In</legend>
        
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            {...register("email")}
            type="email"
            id="email"
            autoComplete="email"
            required
          />
          {errors.email && (
            <p role="alert">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            {...register("password")}
            type="password"
            id="password"
            autoComplete="current-password"
            required
          />
          {errors.password && (
            <p role="alert">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        {login.error && (
          <p role="alert">
            {login.error instanceof Error ? login.error.message : "Login failed"}
          </p>
        )}
      </fieldset>
    </form>
  );
}
