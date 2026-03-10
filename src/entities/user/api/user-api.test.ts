import { describe, it, expect, beforeEach, vi } from "vitest";
import { userApi } from "./user-api";
import { api } from "@/shared/api";
import type { User, CreateUserRequest, UpdateUserData } from "../model/types";

// Mock the API module
vi.mock("@/shared/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockApi = {
  get: vi.mocked(api.get),
  post: vi.mocked(api.post),
  put: vi.mocked(api.put),
  delete: vi.mocked(api.delete),
};

describe("userApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser: User = {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    full_name: "John Doe",
    email: "john@example.com",
    status: "ACTIVE",
    role: "GUEST",
  };

  const mockResponse = {
    data: {
      data: mockUser,
      success: true,
      message: "Success",
    },
  };

  describe("create", () => {
    it("should create a new user", async () => {
      const userData: CreateUserRequest = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userApi.create(userData);

      expect(mockApi.post).toHaveBeenCalledWith("users", userData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("getAll", () => {
    it("should fetch all users without filters", async () => {
      const mockUsersResponse = {
        data: {
          data: [mockUser],
          success: true,
          message: "Success",
        },
      };

      mockApi.get.mockResolvedValue(mockUsersResponse);

      const result = await userApi.getAll();

      expect(mockApi.get).toHaveBeenCalledWith("users", { params: undefined });
      expect(result).toEqual(mockUsersResponse.data);
    });

    it("should fetch users with filters", async () => {
      const filters = {
        page: 1,
        limit: 10,
        search: "john",
        status: "ACTIVE" as const,
        role: "GUEST" as const,
      };

      mockApi.get.mockResolvedValue({ data: { data: [mockUser] } });

      await userApi.getAll(filters);

      expect(mockApi.get).toHaveBeenCalledWith("users", { params: filters });
    });
  });

  describe("getById", () => {
    it("should fetch user by ID", async () => {
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userApi.getById("1");

      expect(mockApi.get).toHaveBeenCalledWith("users/1");
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle numeric ID", async () => {
      mockApi.get.mockResolvedValue(mockResponse);

      await userApi.getById(123);

      expect(mockApi.get).toHaveBeenCalledWith("users/123");
    });
  });

  describe("update", () => {
    it("should update user by ID", async () => {
      const updateData: UpdateUserData = {
        first_name: "Jane",
        email: "jane@example.com",
      };

      mockApi.put.mockResolvedValue(mockResponse);

      const result = await userApi.update("1", updateData);

      expect(mockApi.put).toHaveBeenCalledWith("users/1", updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("delete", () => {
    it("should delete user by ID", async () => {
      const deleteResponse = {
        data: {
          data: undefined,
          success: true,
          message: "User deleted",
        },
      };

      mockApi.delete.mockResolvedValue(deleteResponse);

      const result = await userApi.delete("1");

      expect(mockApi.delete).toHaveBeenCalledWith("users/1");
      expect(result).toEqual(deleteResponse.data);
    });
  });

  describe("bulkDelete", () => {
    it("should delete multiple users", async () => {
      const userIds = ["1", "2", "3"];
      const deleteResponse = {
        data: {
          data: undefined,
          success: true,
          message: "Users deleted",
        },
      };

      mockApi.delete.mockResolvedValue(deleteResponse);

      const result = await userApi.bulkDelete(userIds);

      expect(mockApi.delete).toHaveBeenCalledWith("users/bulk", {
        data: { ids: userIds },
      });
      expect(result).toEqual(deleteResponse.data);
    });
  });

  describe("bulkUpdate", () => {
    it("should update multiple users", async () => {
      const updates = [
        { id: "1", data: { first_name: "John" } },
        { id: "2", data: { first_name: "Jane" } },
      ];

      const bulkResponse = {
        data: {
          data: [mockUser],
          success: true,
          message: "Users updated",
        },
      };

      mockApi.put.mockResolvedValue(bulkResponse);

      const result = await userApi.bulkUpdate(updates);

      expect(mockApi.put).toHaveBeenCalledWith("users/bulk", { updates });
      expect(result).toEqual(bulkResponse.data);
    });
  });

  describe("me", () => {
    it("should fetch current user", async () => {
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userApi.me();

      expect(mockApi.get).toHaveBeenCalledWith("users/me");
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("updateMe", () => {
    it("should update current user", async () => {
      const updateParams = {
        first_name: "John",
        last_name: "Smith",
      };

      mockApi.put.mockResolvedValue(mockResponse);

      const result = await userApi.updateMe(updateParams);

      expect(mockApi.put).toHaveBeenCalledWith("users/me", updateParams);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("email operations", () => {
    describe("confirmEmailAddress", () => {
      it("should confirm email address with token", async () => {
        mockApi.post.mockResolvedValue(mockResponse);

        const result = await userApi.confirmEmailAddress("1", "token123");

        expect(mockApi.post).toHaveBeenCalledWith("users/1/confirm-email/token123");
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe("confirmEmailChange", () => {
      it("should confirm email change with token", async () => {
        mockApi.post.mockResolvedValue(mockResponse);

        const result = await userApi.confirmEmailChange("1", "token123");

        expect(mockApi.post).toHaveBeenCalledWith("users/1/email-change/token123");
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe("cancelEmailChange", () => {
      it("should cancel email change", async () => {
        mockApi.delete.mockResolvedValue(mockResponse);

        const result = await userApi.cancelEmailChange("1");

        expect(mockApi.delete).toHaveBeenCalledWith("users/1/email-change");
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe("resendConfirmation", () => {
      it("should resend email confirmation", async () => {
        const confirmationResponse = {
          data: {
            success: true,
            message: "Confirmation sent",
          },
        };

        mockApi.post.mockResolvedValue(confirmationResponse);

        const result = await userApi.resendConfirmation("1");

        expect(mockApi.post).toHaveBeenCalledWith("users/1/resend-email-confirmation");
        expect(result).toEqual(confirmationResponse.data);
      });
    });

    describe("confirmEmailAddressWithCode", () => {
      it("should confirm email with code", async () => {
        const codeResponse = {
          data: {
            success: true,
            message: "Email confirmed",
          },
        };

        mockApi.post.mockResolvedValue(codeResponse);

        const result = await userApi.confirmEmailAddressWithCode("1", "123456");

        expect(mockApi.post).toHaveBeenCalledWith("users/1/confirm-email-with-code", {
          code: "123456",
        });
        expect(result).toEqual(codeResponse.data);
      });
    });
  });

  describe("legacy operations", () => {
    describe("all", () => {
      it("should fetch all users (legacy)", async () => {
        const usersResponse = {
          data: {
            data: [mockUser],
            success: true,
          },
        };

        mockApi.get.mockResolvedValue(usersResponse);

        const result = await userApi.all();

        expect(mockApi.get).toHaveBeenCalledWith("users");
        expect(result).toEqual(usersResponse.data);
      });
    });

    describe("findByID", () => {
      it("should find user by ID (legacy)", async () => {
        mockApi.get.mockResolvedValue(mockResponse);

        const result = await userApi.findByID("1");

        expect(mockApi.get).toHaveBeenCalledWith("users/1");
        expect(result).toEqual(mockResponse.data);
      });
    });

    describe("updateUser", () => {
      it("should update user (legacy)", async () => {
        const updateParams = {
          first_name: "John",
          last_name: "Doe",
          role: "ADMIN",
          status: "ACTIVE",
        };

        mockApi.put.mockResolvedValue(mockResponse);

        const result = await userApi.updateUser("1", updateParams);

        expect(mockApi.put).toHaveBeenCalledWith("users/1", updateParams);
        expect(result).toEqual(mockResponse.data);
      });
    });
  });
});
