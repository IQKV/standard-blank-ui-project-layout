import { http, HttpResponse } from "msw";

/**
 * Mock API handlers for MSW
 * Add your API endpoints and mock data here
 */

// In-memory auth state for mock mode
const mockAuthState = {
  isAuthenticated: false,
  accessToken: "",
  refreshToken: "",
  sessionId: "",
  user: {
    id: 1,
    first_name: "Demo",
    last_name: "User",
    full_name: "Demo User",
    email: "demo@example.com",
    role: "ADMIN",
    status: "ACTIVE",
  },
};

// Helper to build login-like responses
const buildLoginResponse = () => ({
  access_token: mockAuthState.accessToken || "mock-access-token",
  refresh_token: mockAuthState.refreshToken || "mock-refresh-token",
  token_type: "Bearer",
  expires_at: Date.now() + 60 * 60 * 1000, // +1h
  session_id: mockAuthState.sessionId || "mock-session-id",
  user: mockAuthState.user,
});

export const handlers = [
  // AUTH: login
  http.post("*/api/auth/login", async ({ request }) => {
    const url = new URL(request.url);
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    console.log(`[Mock API] POST ${url.pathname}`, body);

    if (!body?.email || !body?.password) {
      return HttpResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Simple auth rule: fail if password is 'fail'
    if (body.password === "fail") {
      return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    mockAuthState.isAuthenticated = true;
    mockAuthState.accessToken = "mock-access-token";
    mockAuthState.refreshToken = "mock-refresh-token";
    mockAuthState.sessionId = "mock-session-id";
    // Set the user email to the one used to log in
    mockAuthState.user.email = body.email;

    return HttpResponse.json(buildLoginResponse());
  }),

  // AUTH: logout
  http.post("*/api/auth/logout", async ({ request }) => {
    const url = new URL(request.url);
    console.log(`[Mock API] POST ${url.pathname}`);

    mockAuthState.isAuthenticated = false;
    mockAuthState.accessToken = "";
    mockAuthState.refreshToken = "";
    mockAuthState.sessionId = "";

    return HttpResponse.json({ success: true });
  }),

  // AUTH: refresh
  http.get("*/api/auth/refresh", async ({ request }) => {
    const url = new URL(request.url);
    console.log(`[Mock API] GET ${url.pathname}`);

    if (!mockAuthState.isAuthenticated) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Issue fresh tokens
    mockAuthState.accessToken = "mock-access-token";
    mockAuthState.refreshToken = "mock-refresh-token";

    return HttpResponse.json(buildLoginResponse());
  }),

  // USERS: me
  http.get("*/api/users/me", async ({ request }) => {
    const url = new URL(request.url);
    console.log(`[Mock API] GET ${url.pathname}`);

    if (!mockAuthState.isAuthenticated) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({
      data: mockAuthState.user,
    });
  }),

  // Fallback handler for GET requests
  http.get("*/api/*", ({ request }) => {
    const url = new URL(request.url);

    console.log(`[Mock API] Intercepted GET request to ${url.pathname}`);

    // Generate mock data based on the endpoint
    return HttpResponse.json({
      success: true,
      message: `This is mock data for ${url.pathname}`,
      data: {
        id: Math.floor(Math.random() * 1000),
        name: "Mock Data",
        createdAt: new Date().toISOString(),
      },
    });
  }),

  // Fallback handler for POST requests
  http.post("*/api/*", async ({ request }) => {
    const url = new URL(request.url);
    const body = await request.json();

    console.log(`[Mock API] Intercepted POST request to ${url.pathname}`, body);

    return HttpResponse.json({
      success: true,
      message: "Data saved successfully (mock)",
      data: {
        id: Math.floor(Math.random() * 1000),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ...body,
        createdAt: new Date().toISOString(),
      },
    });
  }),
];
