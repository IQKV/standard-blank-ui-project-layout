import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { getPreviousUrl, clearPreviousUrl, usePreviousUrl } from "../previous-url";
import { PREVIOUS_URL_KEY } from "../constants";

describe("previous-url utils", () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Ensure a stable URL base in jsdom
    window.history.pushState({}, "", "/");
  });

  it("getPreviousUrl returns value when set", () => {
    const target = "http://example.com/xyz";
    window.localStorage.setItem(PREVIOUS_URL_KEY, target);
    expect(getPreviousUrl()).toBe(target);
  });

  it("clearPreviousUrl removes the key", () => {
    const target = "http://example.com/xyz";
    window.localStorage.setItem(PREVIOUS_URL_KEY, target);
    clearPreviousUrl();
    expect(window.localStorage.getItem(PREVIOUS_URL_KEY)).toBeNull();
  });

  it("usePreviousUrl exposes value and clear() updates state", () => {
    const target = "http://example.com/abc";
    window.localStorage.setItem(PREVIOUS_URL_KEY, target);

    const { result } = renderHook(() => usePreviousUrl());
    expect(result.current.previousUrl).toBe(target);

    act(() => {
      result.current.clear();
    });

    expect(window.localStorage.getItem(PREVIOUS_URL_KEY)).toBeNull();
    expect(result.current.previousUrl).toBeNull();
  });
});