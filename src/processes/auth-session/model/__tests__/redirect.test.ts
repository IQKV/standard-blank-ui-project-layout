import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { restorePreviousUrlAfterLogin, __testonly } from "../redirect";

const setPathname = (path: string) => {
  window.history.pushState({}, "", path);
};

describe("restorePreviousUrlAfterLogin", () => {
  let replaceSpy: ReturnType<typeof vi.fn>;
  let originalLocation: Location;

  beforeEach(() => {
    window.localStorage.clear();
    setPathname("/auth/login");

    originalLocation = window.location;
    replaceSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, replace: replaceSpy },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("redirects to previous_url and clears it", () => {
    const target = "http://example.com/protected";
    window.localStorage.setItem(__testonly.PREVIOUS_URL_KEY, target);

    const did = restorePreviousUrlAfterLogin("/");
    expect(did).toBe(true);
    expect(replaceSpy).toHaveBeenCalledWith(target);
    expect(window.localStorage.getItem(__testonly.PREVIOUS_URL_KEY)).toBeNull();
  });

  it("uses fallback when previous_url is missing", () => {
    const did = restorePreviousUrlAfterLogin("/");
    expect(did).toBe(true);
    expect(replaceSpy).toHaveBeenCalledWith("/");
  });

  it("does not navigate back to login from previous_url", () => {
    const loginUrl = window.location.origin + __testonly.LOGIN_PATH;
    window.localStorage.setItem(__testonly.PREVIOUS_URL_KEY, loginUrl);

    const did = restorePreviousUrlAfterLogin("/");
    expect(did).toBe(true);
    expect(replaceSpy).toHaveBeenCalledWith("/");
  });
});