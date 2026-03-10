import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useBulkDeleteUsers,
  useBulkUpdateUsers,
  useUserMe,
  userKeys,
} from "./queries";
import { userApi } from "../api/user-api";
import type { CreateUserRequest, UpdateUserData, UserFilters } from "./types";

// Mock the user API
vi.mock("../api/user-api", () => ({
  userApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkDelete: vi.fn(),
    bulkUpdate: vi.fn(),
    me: vi.fn(),
  },
}));

const mockUserApi = {
  getAll: vi.mocked(userApi.getAll),
  getById: vi.mocked(userApi.getById),
  create: vi.mocked(userApi.create),
  update: vi.mocked(userApi.update),
  delete: vi.mocked(userApi.delete),
  bulkDelete: vi.mocked(userApi.bulkDelete),
  bulkUpdate: vi.mocked(userApi.bulkUpdate),
  me: vi.mocked(userApi.me),
};

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("user queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    full_name: "John Doe",
    email: "john@example.com",
    status: "ACTIVE" as const,
    role: "GUEST" as const,
  };

  const mockApiResponse = {
    data: mockUser,
    success: true,
    message: "Success",
  };

  describe("userKeys", () => {
    it("should generate correct query keys", () => {
      expect(userKeys.all).toEqual(["user"]);
      expect(userKeys.lists()).toEqual(["user", "list"]);
      expect(userKeys.list({ page: 1 })).toEqual(["user", "list", { filters: { page: 1 } }]);
      expect(userKeys.details()).toEqual(["user", "detail"]);
      expect(userKeys.detail("1")).toEqual(["user", "detail", "1"]);
      expect(userKeys.me()).toEqual(["user", "me"]);
    });
  });

  describe("useUsers", () => {
    it("should fetch users without filters", async () => {
      const mockResponse = {
        data: [mockUser],
        success: true,
        message: "Success",
      };

      mockUserApi.getAll.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUserApi.getAll).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockResponse);
    });

    it("should fetch users with filters", async () => {
      const filters: UserFilters = {
        page: 1,
        limit: 10,
        search: "john",
        status: "ACTIVE",
      };

      const mockResponse = {
        data: [mockUser],
        success: true,
        message: "Success",
      };

      mockUserApi.getAll.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUsers(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUserApi.getAll).toHaveBeenCalledWith(filters);
      expect(result.current.data).toEqual(mockResponse);
    });

    it("should handle fetch errors", async () => {
      const error = new Error("Failed to fetch users");
      mockUserApi.getAll.mockRejectedValue(error);

      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe("useUser", () => {
    it("should fetch user by ID", async () => {
      mockUserApi.getById.mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useUser("1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUserApi.getById).toHaveBeenCalledWith("1");
      expect(result.current.data).toEqual(mockApiResponse);
    });

    it("should not fetch when userId is falsy", () => {
      const { result } = renderHook(() => useUser(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockUserApi.getById).not.toHaveBeenCalled();
    });

    it("should handle numeric user ID", async () => {
      mockUserApi.getById.mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useUser(123), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUserApi.getById).toHaveBeenCalledWith(123);
    });
  });

  describe("useCreateUser", () => {
    it("should create a new user", async () => {
      const userData: CreateUserRequest = {
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
        password: "password123",
      };

      mockUserApi.create.mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(userData);

      expect(mockUserApi.create).toHaveBeenCalledWith(userData);
    });

    it("should handle creation errors", async () => {
      const userData: CreateUserRequest = {
        first_name: "Jane",
        last_name: "Smith",
        email: "invalid-email",
        password: "123",
      };

      const error = new Error("Validation failed");
      mockUserApi.create.mockRejectedValue(error);

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(userData)).rejects.toThrow("Validation failed");
    });
  });

  describe("useUpdateUser", () => {
    it("should update a user", async () => {
      const updateData: UpdateUserData = {
        first_name: "Jane",
        email: "jane@example.com",
      };

      const updatedUser = { ...mockUser, ...updateData };
      const updateResponse = {
        data: updatedUser,
        success: true,
        message: "User updated",
      };

      mockUserApi.update.mockResolvedValue(updateResponse);

      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ userId: "1", data: updateData });

      expect(mockUserApi.update).toHaveBeenCalledWith("1", updateData);
    });

    it("should handle update errors", async () => {
      const updateData: UpdateUserData = {
        email: "invalid-email",
      };

      const error = new Error("Invalid email format");
      mockUserApi.update.mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateUser(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ userId: "1", data: updateData })).rejects.toThrow(
        "Invalid email format",
      );
    });
  });

  describe("useDeleteUser", () => {
    it("should delete a user", async () => {
      const deleteResponse = {
        data: undefined,
        success: true,
        message: "User deleted",
      };

      mockUserApi.delete.mockResolvedValue(deleteResponse);

      const { result } = renderHook(() => useDeleteUser(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync("1");

      expect(mockUserApi.delete).toHaveBeenCalledWith("1");
    });

    it("should handle delete errors", async () => {
      const error = new Error("User not found");
      mockUserApi.delete.mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteUser(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync("999")).rejects.toThrow("User not found");
    });
  });

  describe("useBulkDeleteUsers", () => {
    it("should delete multiple users", async () => {
      const userIds = ["1", "2", "3"];
      const deleteResponse = {
        data: undefined,
        success: true,
        message: "Users deleted",
      };

      mockUserApi.bulkDelete.mockResolvedValue(deleteResponse);

      const { result } = renderHook(() => useBulkDeleteUsers(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(userIds);

      expect(mockUserApi.bulkDelete).toHaveBeenCalledWith(userIds);
    });
  });

  describe("useBulkUpdateUsers", () => {
    it("should update multiple users", async () => {
      const updates = [
        { id: "1", data: { first_name: "John" } },
        { id: "2", data: { first_name: "Jane" } },
      ];

      const bulkResponse = {
        data: [mockUser],
        success: true,
        message: "Users updated",
      };

      mockUserApi.bulkUpdate.mockResolvedValue(bulkResponse);

      const { result } = renderHook(() => useBulkUpdateUsers(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(updates);

      expect(mockUserApi.bulkUpdate).toHaveBeenCalledWith(updates);
    });
  });

  describe("useUserMe", () => {
    it("should fetch current user", async () => {
      mockUserApi.me.mockResolvedValue(mockApiResponse);

      const { result } = renderHook(() => useUserMe(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockUserApi.me).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockApiResponse);
    });

    it("should handle me fetch errors", async () => {
      const error = new Error("Unauthorized");
      mockUserApi.me.mockRejectedValue(error);

      const { result } = renderHook(() => useUserMe(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });
});
