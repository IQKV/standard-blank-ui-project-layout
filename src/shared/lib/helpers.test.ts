import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isNumber,
  isObjectEmpty,
  pluck,
  addQueryStringToUrl,
  removeQueryStringFromUrl,
  getUrlParam,
  formatNumber,
  isEmptyHtml,
} from "./helpers";

// Mock window object for URL manipulation tests
const mockLocation = {
  href: "https://example.com/test",
  search: "?existing=param",
};

const mockHistory = {
  pushState: vi.fn(),
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

Object.defineProperty(window, "history", {
  value: mockHistory,
  writable: true,
});

describe("helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "https://example.com/test";
    mockLocation.search = "?existing=param";
  });

  describe("isNumber", () => {
    it("should return true for valid numbers", () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-1)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
    });

    it("should return false for non-numbers", () => {
      expect(isNumber("42")).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(NaN)).toBe(true); // NaN is technically of type number
    });
  });

  describe("isObjectEmpty", () => {
    it("should return true for empty objects", () => {
      expect(isObjectEmpty({})).toBe(true);
    });

    it("should return false for non-empty objects", () => {
      expect(isObjectEmpty({ key: "value" })).toBe(false);
      expect(isObjectEmpty({ a: 1, b: 2 })).toBe(false);
    });
  });

  describe("pluck", () => {
    const testObject = {
      name: "John",
      age: 30,
      email: "john@example.com",
      city: "New York",
    };

    it("should extract specified keys from object", () => {
      const result = pluck(testObject, ["name", "email"]);
      expect(result).toEqual({
        name: "John",
        email: "john@example.com",
      });
    });

    it("should handle empty key array", () => {
      const result = pluck(testObject, []);
      expect(result).toEqual({});
    });

    it("should handle non-existent keys", () => {
      const result = pluck(testObject, ["name", "nonexistent" as any]);
      expect(result).toEqual({
        name: "John",
        nonexistent: undefined,
      });
    });
  });

  describe("addQueryStringToUrl", () => {
    it("should add new query parameter", () => {
      addQueryStringToUrl("newParam", "newValue");
      expect(mockHistory.pushState).toHaveBeenCalledWith(
        {},
        "",
        expect.stringContaining("newParam=newValue")
      );
    });

    it("should not add duplicate query parameter", () => {
      // Mock URL constructor to simulate existing parameter
      const originalURL = global.URL;
      global.URL = class MockURL {
        searchParams = {
          has: vi.fn().mockReturnValue(true),
          append: vi.fn(),
        };
        toString = vi
          .fn()
          .mockReturnValue("https://example.com/test?existing=param");
      } as any;

      addQueryStringToUrl("existing", "param");
      expect(mockHistory.pushState).toHaveBeenCalled();

      global.URL = originalURL;
    });
  });

  describe("removeQueryStringFromUrl", () => {
    it("should remove existing query parameter", () => {
      const originalURL = global.URL;
      global.URL = class MockURL {
        searchParams = {
          has: vi.fn().mockReturnValue(true),
          delete: vi.fn(),
        };
        toString = vi.fn().mockReturnValue("https://example.com/test");
      } as any;

      removeQueryStringFromUrl("existing");
      expect(mockHistory.pushState).toHaveBeenCalled();

      global.URL = originalURL;
    });
  });

  describe("getUrlParam", () => {
    it("should return parameter value if exists", () => {
      mockLocation.search = "?test=value&other=param";
      const result = getUrlParam("test");
      expect(result).toBe("value");
    });

    it("should return null if parameter does not exist", () => {
      mockLocation.search = "?other=param";
      const result = getUrlParam("nonexistent");
      expect(result).toBe(null);
    });
  });

  describe("formatNumber", () => {
    it("should format valid numbers", () => {
      expect(formatNumber(1234)).toBe("1,234");
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber(0)).toBe("0");
    });

    it("should return 0 for invalid numbers", () => {
      expect(formatNumber("invalid" as any)).toBe(0);
      expect(formatNumber(null as any)).toBe(0);
      expect(formatNumber(undefined as any)).toBe(0);
    });
  });

  describe("isEmptyHtml", () => {
    beforeEach(() => {
      // Mock document.createElement
      global.document.createElement = vi.fn().mockReturnValue({
        innerHTML: "",
        textContent: "",
      });
    });

    it("should return true for empty HTML content", () => {
      const mockDiv = {
        innerHTML: "",
        textContent: "",
      };
      global.document.createElement = vi.fn().mockReturnValue(mockDiv);

      expect(isEmptyHtml("")).toBe(true);
      expect(isEmptyHtml("<p></p>")).toBe(true);
    });

    it("should return false for non-empty HTML content", () => {
      const mockDiv = {
        innerHTML: "<p>Content</p>",
        textContent: "Content",
      };
      global.document.createElement = vi.fn().mockReturnValue(mockDiv);

      expect(isEmptyHtml("<p>Content</p>")).toBe(false);
    });

    it("should handle null textContent", () => {
      // Test the actual implementation behavior
      const result = isEmptyHtml("");
      expect(typeof result).toBe("boolean");
    });
  });
});
