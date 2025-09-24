import { http, HttpResponse } from "msw";

/**
 * Mock API handlers for MSW
 * Add your API endpoints and mock data here
 */
export const handlers = [
  // Example handler for GET requests
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

  // Example handler for POST requests
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
