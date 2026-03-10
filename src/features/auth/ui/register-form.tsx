import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../model/queries";
import { registerSchema, type RegisterInput } from "../model/validation";

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
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      locale: "en",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await register.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <legend>Create Account</legend>

        <div>
          <label htmlFor="first_name">First Name</label>
          <input
            {...registerField("first_name")}
            type="text"
            id="first_name"
            autoComplete="given-name"
            required
          />
          {errors.first_name && <p role="alert">{errors.first_name.message}</p>}
        </div>

        <div>
          <label htmlFor="last_name">Last Name</label>
          <input
            {...registerField("last_name")}
            type="text"
            id="last_name"
            autoComplete="family-name"
            required
          />
          {errors.last_name && <p role="alert">{errors.last_name.message}</p>}
        </div>

        <div>
          <label htmlFor="email">Email Address</label>
          <input
            {...registerField("email")}
            type="email"
            id="email"
            autoComplete="email"
            required
          />
          {errors.email && <p role="alert">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            {...registerField("password")}
            type="password"
            id="password"
            autoComplete="new-password"
            required
          />
          {errors.password && <p role="alert">{errors.password.message}</p>}
          <p>
            Password must be at least 8 characters with uppercase, lowercase, number, and special
            character.
          </p>
        </div>

        <div>
          <label htmlFor="password_confirmation">Confirm Password</label>
          <input
            {...registerField("password_confirmation")}
            type="password"
            id="password_confirmation"
            autoComplete="new-password"
            required
          />
          {errors.password_confirmation && (
            <p role="alert">{errors.password_confirmation.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="locale">Language</label>
          <select {...registerField("locale")} id="locale" required>
            <option value="en">English</option>
          </select>
          {errors.locale && <p role="alert">{errors.locale.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>

        {register.error && (
          <p role="alert">
            {register.error instanceof Error ? register.error.message : "Registration failed"}
          </p>
        )}
      </fieldset>
    </form>
  );
}
