import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  createOptionalField,
  createRequiredField,
  phoneRegex,
  urlRegex,
  slugRegex,
  formatZodError,
  safeValidate,
  createAsyncValidator,
} from "./validation";

describe("validation utilities", () => {
  describe("createOptionalField", () => {
    it("should make field optional", () => {
      const schema = createOptionalField(z.string());

      expect(schema.parse("test")).toBe("test");
      expect(schema.parse(undefined)).toBe(undefined);
      expect(schema.parse("")).toBe("");
    });

    it("should work with complex schemas", () => {
      const schema = createOptionalField(z.number().min(0));

      expect(schema.parse(5)).toBe(5);
      expect(schema.parse(undefined)).toBe(undefined);
      expect(schema.parse("")).toBe("");
    });
  });

  describe("createRequiredField", () => {
    it("should enforce required validation", () => {
      const schema = createRequiredField(z.string());

      expect(schema.parse("test")).toBe("test");
      expect(() => schema.parse("")).toThrow();
      expect(() => schema.parse(undefined)).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });

    it("should use custom error message", () => {
      const schema = createRequiredField(z.string(), "Custom error message");

      try {
        schema.parse("");
      } catch (error) {
        expect((error as z.ZodError).errors[0].message).toBe(
          "Custom error message"
        );
      }
    });
  });

  describe("regex patterns", () => {
    describe("phoneRegex", () => {
      it("should validate phone numbers", () => {
        expect(phoneRegex.test("+1234567890")).toBe(true);
        expect(phoneRegex.test("1234567890")).toBe(true);
        expect(phoneRegex.test("+123")).toBe(true);

        expect(phoneRegex.test("")).toBe(false);
        expect(phoneRegex.test("abc")).toBe(false);
        expect(phoneRegex.test("0123")).toBe(false); // starts with 0
      });
    });

    describe("urlRegex", () => {
      it("should validate URLs", () => {
        expect(urlRegex.test("https://example.com")).toBe(true);
        expect(urlRegex.test("http://test.org")).toBe(true);
        expect(urlRegex.test("https://sub.domain.com/path")).toBe(true);

        expect(urlRegex.test("ftp://example.com")).toBe(false);
        expect(urlRegex.test("example.com")).toBe(false);
        expect(urlRegex.test("")).toBe(false);
      });
    });

    describe("slugRegex", () => {
      it("should validate slugs", () => {
        expect(slugRegex.test("hello-world")).toBe(true);
        expect(slugRegex.test("test123")).toBe(true);
        expect(slugRegex.test("a")).toBe(true);

        expect(slugRegex.test("Hello-World")).toBe(false); // uppercase
        expect(slugRegex.test("hello_world")).toBe(false); // underscore
        expect(slugRegex.test("hello--world")).toBe(false); // double dash
        expect(slugRegex.test("-hello")).toBe(false); // starts with dash
        expect(slugRegex.test("hello-")).toBe(false); // ends with dash
      });
    });
  });

  describe("formatZodError", () => {
    it("should format Zod errors correctly", () => {
      const schema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        age: z.number().min(0, "Age must be positive"),
      });

      try {
        schema.parse({
          name: "",
          email: "invalid-email",
          age: -1,
        });
      } catch (error) {
        const formatted = formatZodError(error as z.ZodError);

        expect(formatted).toEqual({
          name: "Name is required",
          email: "Invalid email",
          age: "Age must be positive",
        });
      }
    });

    it("should handle nested object errors", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(1, "Name required"),
          }),
        }),
      });

      try {
        schema.parse({
          user: {
            profile: {
              name: "",
            },
          },
        });
      } catch (error) {
        const formatted = formatZodError(error as z.ZodError);
        expect(formatted["user.profile.name"]).toBe("Name required");
      }
    });
  });

  describe("safeValidate", () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().min(0),
    });

    it("should return success for valid data", () => {
      const result = safeValidate(schema, { name: "John", age: 25 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: "John", age: 25 });
      }
    });

    it("should return errors for invalid data", () => {
      const result = safeValidate(schema, { name: "", age: -1 });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveProperty("name");
        expect(result.errors).toHaveProperty("age");
      }
    });

    it("should handle non-Zod errors", () => {
      const throwingSchema = {
        parse: () => {
          throw new Error("Custom error");
        },
      } as any;

      const result = safeValidate(throwingSchema, {});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors._general).toBe("Validation failed");
      }
    });
  });

  describe("createAsyncValidator", () => {
    const schema = z.object({
      username: z.string().min(3),
    });

    it("should validate synchronously when no async validation provided", async () => {
      const validator = createAsyncValidator(schema);

      const result = await validator({ username: "john" });
      expect(result).toBe(true);
    });

    it("should return error message for invalid sync validation", async () => {
      const validator = createAsyncValidator(schema);

      const result = await validator({ username: "jo" });
      expect(typeof result).toBe("string");
      expect(result).toContain("String must contain at least 3 character(s)");
    });

    it("should run async validation after sync validation passes", async () => {
      const asyncValidation = async (data: { username: string }) => {
        return data.username !== "taken";
      };

      const validator = createAsyncValidator(schema, asyncValidation);

      const validResult = await validator({ username: "available" });
      expect(validResult).toBe(true);

      const invalidResult = await validator({ username: "taken" });
      expect(invalidResult).toBe("Validation failed");
    });

    it("should return custom async error message", async () => {
      const asyncValidation = async (data: { username: string }) => {
        if (data.username === "taken") {
          return "Username is already taken";
        }
        return true;
      };

      const validator = createAsyncValidator(schema, asyncValidation);

      const result = await validator({ username: "taken" });
      expect(result).toBe("Username is already taken");
    });

    it("should handle async validation errors", async () => {
      const asyncValidation = async () => {
        throw new Error("Network error");
      };

      const validator = createAsyncValidator(schema, asyncValidation);

      const result = await validator({ username: "test" });
      expect(result).toBe("Validation failed");
    });
  });
});
