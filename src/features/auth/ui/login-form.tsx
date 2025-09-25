import { useCallback, useState } from "react";
import { useLogin } from "../model/queries";
import { loginSchema, type LoginInput } from "../model/validation";

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const login = useLogin();
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors(null);

      const form = e.currentTarget;
      const formData = new FormData(form);
      const raw = {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      };

      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) {
        const fieldErrors: { email?: string; password?: string } = {};
        for (const issue of parsed.error.issues) {
          const path = issue.path[0];
          if (path === "email" || path === "password") {
            if (!fieldErrors[path]) fieldErrors[path] = issue.message;
          }
        }
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        return;
      }

      setIsSubmitting(true);
      try {
        await login.mutateAsync(parsed.data as LoginInput);
        form.reset();
        onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setErrors({ general: message });
        onError?.(err as Error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [login, onSuccess, onError]
  );

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>Sign In</legend>

        <div>
          <label htmlFor="email">Email Address</label>
          <input
            name="email"
            type="email"
            id="email"
            autoComplete="email"
            required
          />
          {errors?.email && <p role="alert">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            id="password"
            autoComplete="current-password"
            required
          />
          {errors?.password && <p role="alert">{errors.password}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>

        {errors?.general && <p role="alert">{errors.general}</p>}
      </fieldset>
    </form>
  );
}
