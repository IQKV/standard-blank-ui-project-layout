import { beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Mock handlers for API endpoints
const handlers = [
  // Auth endpoints
  http.post("/api/auth/login", () => {
    return HttpResponse.json({
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
      token_type: "Bearer",
      expires_at: Date.now() + 3600000,
      session_id: "mock_session_id",
      user: {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        email: "john@example.com",
        status: "ACTIVE",
        role: "GUEST",
      },
    });
  }),

  http.post("/api/auth/register", () => {
    return HttpResponse.json({
      data: {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        email: "john@example.com",
        status: "ACTIVE",
        role: "GUEST",
      },
      success: true,
      message: "User registered successfully",
    });
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  }),

  http.post("/api/auth/forgot-password", () => {
    return HttpResponse.json({
      success: true,
      message: "Password reset email sent",
    });
  }),

  http.get("/api/auth/reset-password/:token", () => {
    return HttpResponse.json({
      success: true,
      message: "Token is valid",
    });
  }),

  http.post("/api/auth/reset-password/:token", () => {
    return HttpResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  }),

  http.get("/api/auth/refresh", () => {
    return HttpResponse.json({
      access_token: "new_access_token",
      refresh_token: "new_refresh_token",
      token_type: "Bearer",
      expires_at: Date.now() + 3600000,
      session_id: "new_session_id",
      user: {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        email: "john@example.com",
        status: "ACTIVE",
        role: "GUEST",
      },
    });
  }),

  // User endpoints
  http.get("/api/users", () => {
    return HttpResponse.json({
      data: [
        {
          id: "1",
          first_name: "John",
          last_name: "Doe",
          full_name: "John Doe",
          email: "john@example.com",
          status: "ACTIVE",
          role: "GUEST",
        },
        {
          id: "2",
          first_name: "Jane",
          last_name: "Smith",
          full_name: "Jane Smith",
          email: "jane@example.com",
          status: "ACTIVE",
          role: "ADMIN",
        },
      ],
      success: true,
      message: "Users fetched successfully",
    });
  }),

  http.get("/api/users/me", () => {
    return HttpResponse.json({
      data: {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        email: "john@example.com",
        status: "ACTIVE",
        role: "GUEST",
      },
      success: true,
      message: "Current user fetched successfully",
    });
  }),

  http.get("/api/users/:id", ({ params }) => {
    return HttpResponse.json({
      data: {
        id: params.id,
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        email: "john@example.com",
        status: "ACTIVE",
        role: "GUEST",
      },
      success: true,
      message: "User fetched successfully",
    });
  }),

  http.post("/api/users", () => {
    return HttpResponse.json({
      data: {
        id: "3",
        first_name: "New",
        last_name: "User",
        full_name: "New User",
        email: "new@example.com",
        status: "ACTIVE",
        role: "GUEST",
      },
      success: true,
      message: "User created successfully",
    });
  }),

  http.put("/api/users/:id", ({ params }) => {
    return HttpResponse.json({
      data: {
        id: params.id,
        first_name: "Updated",
        last_name: "User",
        full_name: "Updated User",
        email: "updated@example.com",
        status: "ACTIVE",
        role: "GUEST",
      },
      success: true,
      message: "User updated successfully",
    });
  }),

  http.put("/api/users/me", () => {
    return HttpResponse.json({
      data: {
        id: "1",
        first_name: "Updated",
        last_name: "Profile",
        full_name: "Updated Profile",
        email: "updated@example.com",
        status: "ACTIVE",
        role: "GUEST",
      },
      success: true,
      message: "Profile updated successfully",
    });
  }),

  http.delete("/api/users/:id", () => {
    return HttpResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  }),

  http.delete("/api/users/bulk", () => {
    return HttpResponse.json({
      success: true,
      message: "Users deleted successfully",
    });
  }),

  http.put("/api/users/bulk", () => {
    return HttpResponse.json({
      data: [
        {
          id: "1",
          first_name: "Bulk",
          last_name: "Updated",
          full_name: "Bulk Updated",
          email: "bulk@example.com",
          status: "ACTIVE",
          role: "GUEST",
        },
      ],
      success: true,
      message: "Users updated successfully",
    });
  }),

  // User email operations
  http.post("/api/users/:id/confirm-email/:token", () => {
    return HttpResponse.json({
      data: {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        email: "john@example.com",
        status: "ACTIVE",
        role: "GUEST",
        is_email_verified: true,
      },
      success: true,
      message: "Email confirmed successfully",
    });
  }),

  http.post("/api/users/:id/email-change/:token", () => {
    return HttpResponse.json({
      data: {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        email: "newemail@example.com",
        status: "ACTIVE",
        role: "GUEST",
      },
      success: true,
      message: "Email change confirmed successfully",
    });
  }),

  http.delete("/api/users/:id/email-change", () => {
    return HttpResponse.json({
      data: {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        email: "john@example.com",
        status: "ACTIVE",
        role: "GUEST",
        has_pending_email_change: false,
      },
      success: true,
      message: "Email change cancelled successfully",
    });
  }),

  http.post("/api/users/:id/resend-email-confirmation", () => {
    return HttpResponse.json({
      success: true,
      message: "Confirmation email sent successfully",
    });
  }),

  http.post("/api/users/:id/confirm-email-with-code", () => {
    return HttpResponse.json({
      success: true,
      message: "Email confirmed with code successfully",
    });
  }),

  // Error handlers for testing error scenarios
  http.post("/api/auth/login-error", () => {
    return HttpResponse.json(
      {
        message: "Invalid credentials",
        error: "INVALID_CREDENTIALS",
      },
      { status: 401 }
    );
  }),

  http.get("/api/users/error", () => {
    return HttpResponse.json(
      {
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }),

  http.post("/api/users/validation-error", () => {
    return HttpResponse.json(
      {
        message: "Validation failed",
        errors: {
          email: ["Email is required"],
          password: ["Password must be at least 8 characters"],
        },
      },
      { status: 422 }
    );
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

// Export for use in individual tests
export { http, HttpResponse };
