import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  localeSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordWithTokenSchema,
  tokenVerificationSchema,
  registerSchema,
} from "./validation";

describe("Auth validation schemas", () => {
  describe("emailSchema", () => {
    it("should validate correct email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
        "123@example.com",
      ];

      validEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "",
        "invalid-email",
        "@example.com",
        "test@",
        "test..test@example.com",
        "test@example",
      ];

      invalidEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });

    it("should provide appropriate error messages", () => {
      try {
        emailSchema.parse("");
      } catch (error: any) {
        expect(error.errors[0].message).toBe("Email is required");
      }

      try {
        emailSchema.parse("invalid-email");
      } catch (error: any) {
        expect(error.errors[0].message).toBe("Please enter a valid email address");
      }
    });
  });

  describe("passwordSchema", () => {
    it("should validate strong passwords", () => {
      const validPasswords = ["Password123!", "MyStr0ng@Pass", "C0mplex#Password", "Secure123$"];

      validPasswords.forEach((password) => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it("should reject weak passwords", () => {
      const invalidPasswords = [
        "short",
        "password", // no uppercase, number, special char
        "PASSWORD", // no lowercase, number, special char
        "Password", // no number, special char
        "Password123", // no special char
        "password123!", // no uppercase
        "PASSWORD123!", // no lowercase
      ];

      invalidPasswords.forEach((password) => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });

    it("should provide specific error messages for password requirements", () => {
      const testCases = [
        {
          password: "short",
          expectedMessage: "Password must be at least 8 characters",
        },
        {
          password: "password123!",
          expectedMessage: "Password must contain at least one uppercase letter",
        },
        {
          password: "PASSWORD123!",
          expectedMessage: "Password must contain at least one lowercase letter",
        },
        {
          password: "Password!",
          expectedMessage: "Password must contain at least one number",
        },
        {
          password: "Password123",
          expectedMessage: "Password must contain at least one special character",
        },
      ];

      testCases.forEach(({ password, expectedMessage }) => {
        try {
          passwordSchema.parse(password);
        } catch (error: any) {
          expect(error.errors.some((e: any) => e.message === expectedMessage)).toBe(true);
        }
      });
    });
  });

  describe("nameSchema", () => {
    it("should validate correct names", () => {
      const validNames = ["John", "Mary Jane", "O'Connor", "Jean-Pierre", "Smith", "Van Der Berg"];

      validNames.forEach((name) => {
        expect(() => nameSchema.parse(name)).not.toThrow();
      });
    });

    it("should reject invalid names", () => {
      const invalidNames = [
        "",
        "A", // too short
        "John123", // contains numbers
        "John@Doe", // contains special chars
        "A".repeat(51), // too long
      ];

      invalidNames.forEach((name) => {
        expect(() => nameSchema.parse(name)).toThrow();
      });
    });

    it("should provide appropriate error messages", () => {
      try {
        nameSchema.parse("");
      } catch (error: any) {
        expect(error.errors[0].message).toBe("Name is required");
      }

      try {
        nameSchema.parse("A");
      } catch (error: any) {
        expect(error.errors[0].message).toBe("Name must be at least 2 characters");
      }

      try {
        nameSchema.parse("John123");
      } catch (error: any) {
        expect(error.errors[0].message).toBe(
          "Name can only contain letters, spaces, hyphens, and apostrophes",
        );
      }
    });
  });

  describe("localeSchema", () => {
    it("should validate supported locales", () => {
      // Note: This test assumes 'en' is a supported locale
      // You may need to adjust based on your actual supported locales
      const validLocales = ["en"];

      validLocales.forEach((locale) => {
        expect(() => localeSchema.parse(locale)).not.toThrow();
      });
    });

    it("should reject unsupported locales", () => {
      const invalidLocales = ["invalid", "xx", ""];

      invalidLocales.forEach((locale) => {
        expect(() => localeSchema.parse(locale)).toThrow();
      });
    });
  });

  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validLogin = {
        email: "test@example.com",
        password: "anypassword",
      };

      expect(() => loginSchema.parse(validLogin)).not.toThrow();
    });

    it("should reject invalid login data", () => {
      const invalidLogins = [
        { email: "", password: "password" },
        { email: "invalid-email", password: "password" },
        { email: "test@example.com", password: "" },
      ];

      invalidLogins.forEach((login) => {
        expect(() => loginSchema.parse(login)).toThrow();
      });
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should validate correct email for password reset", () => {
      const validData = { email: "test@example.com" };
      expect(() => forgotPasswordSchema.parse(validData)).not.toThrow();
    });

    it("should reject invalid email for password reset", () => {
      const invalidData = [{ email: "" }, { email: "invalid-email" }];

      invalidData.forEach((data) => {
        expect(() => forgotPasswordSchema.parse(data)).toThrow();
      });
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate matching strong passwords", () => {
      const validData = {
        password: "NewPassword123!",
        password_confirmation: "NewPassword123!",
      };

      expect(() => resetPasswordSchema.parse(validData)).not.toThrow();
    });

    it("should reject mismatched passwords", () => {
      const invalidData = {
        password: "NewPassword123!",
        password_confirmation: "DifferentPassword123!",
      };

      try {
        resetPasswordSchema.parse(invalidData);
      } catch (error: any) {
        expect(error.errors[0].message).toBe("Passwords do not match");
        expect(error.errors[0].path).toEqual(["password_confirmation"]);
      }
    });

    it("should reject weak passwords", () => {
      const invalidData = {
        password: "weak",
        password_confirmation: "weak",
      };

      expect(() => resetPasswordSchema.parse(invalidData)).toThrow();
    });

    it("should reject empty password confirmation", () => {
      const invalidData = {
        password: "NewPassword123!",
        password_confirmation: "",
      };

      expect(() => resetPasswordSchema.parse(invalidData)).toThrow();
    });
  });

  describe("resetPasswordWithTokenSchema", () => {
    it("should validate correct token and password data", () => {
      const validData = {
        token: "valid-reset-token",
        resetData: {
          password: "NewPassword123!",
          password_confirmation: "NewPassword123!",
        },
      };

      expect(() => resetPasswordWithTokenSchema.parse(validData)).not.toThrow();
    });

    it("should reject empty token", () => {
      const invalidData = {
        token: "",
        resetData: {
          password: "NewPassword123!",
          password_confirmation: "NewPassword123!",
        },
      };

      expect(() => resetPasswordWithTokenSchema.parse(invalidData)).toThrow();
    });
  });

  describe("tokenVerificationSchema", () => {
    it("should validate non-empty token", () => {
      const validData = { token: "valid-token" };
      expect(() => tokenVerificationSchema.parse(validData)).not.toThrow();
    });

    it("should reject empty token", () => {
      const invalidData = { token: "" };
      expect(() => tokenVerificationSchema.parse(invalidData)).toThrow();
    });
  });

  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
        locale: "en" as const,
      };

      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it("should reject invalid registration data", () => {
      const invalidDataSets = [
        // Missing first name
        {
          first_name: "",
          last_name: "Doe",
          email: "john@example.com",
          password: "Password123!",
          password_confirmation: "Password123!",
          locale: "en" as const,
        },
        // Invalid email
        {
          first_name: "John",
          last_name: "Doe",
          email: "invalid-email",
          password: "Password123!",
          password_confirmation: "Password123!",
          locale: "en" as const,
        },
        // Weak password
        {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          password: "weak",
          password_confirmation: "weak",
          locale: "en" as const,
        },
        // Mismatched passwords
        {
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          password: "Password123!",
          password_confirmation: "DifferentPassword123!",
          locale: "en" as const,
        },
      ];

      invalidDataSets.forEach((data) => {
        expect(() => registerSchema.parse(data)).toThrow();
      });
    });

    it("should provide password mismatch error", () => {
      const invalidData = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "Password123!",
        password_confirmation: "DifferentPassword123!",
        locale: "en" as const,
      };

      try {
        registerSchema.parse(invalidData);
      } catch (error: any) {
        const passwordError = error.errors.find(
          (e: any) =>
            e.path.includes("password_confirmation") && e.message === "Passwords do not match",
        );
        expect(passwordError).toBeDefined();
      }
    });
  });
});
