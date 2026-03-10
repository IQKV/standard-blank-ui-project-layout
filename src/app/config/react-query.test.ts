import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { handleAuthRedirect } from "@/app/config/react-query";
import { ApiErrorKind, type NormalizedApiError } from "@/shared/api";

const makeError = (kind: ApiErrorKind): NormalizedApiError => ({
  kind,
  message: "err",
  original: new Error("x"),
  status: kind === ApiErrorKind.Unauthorized ? 401 : 403,
});

const setPathname = (path: string) => {
  // Use history API to change pathname in jsdom
  window.history.pushState({}, "", path);
};

describe("handleAuthRedirect", () => {
  let replaceSpy: ReturnType<typeof vi.fn>;
  let originalLocation: Location;

  beforeEach(() => {
    // Reset storage and spies
    window.localStorage.clear();
    setPathname("/protected");

    // Mock window.location.replace safely (some environments mark it non-configurable)
    originalLocation = window.location;
    replaceSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, replace: replaceSpy },
    });
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("stores previous_url and redirects to login on Unauthorized", () => {
    const err = makeError(ApiErrorKind.Unauthorized);
    handleAuthRedirect(err);

    expect(window.localStorage.getItem("previous_url")).toBe(window.location.href);
    expect(replaceSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("stores previous_url and redirects to login on Forbidden", () => {
    const err = makeError(ApiErrorKind.Forbidden);
    handleAuthRedirect(err);

    expect(window.localStorage.getItem("previous_url")).toBe(window.location.href);
    expect(replaceSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("does not redirect on allowed unauthenticated path", () => {
    setPathname("/auth/login");
    // Because we mocked window.location with a snapshot object, ensure pathname reflects the allowed route
    (window.location as any).pathname = "/auth/login";

    const err = makeError(ApiErrorKind.Unauthorized);
    handleAuthRedirect(err);

    expect(replaceSpy).not.toHaveBeenCalled();
  });
});
