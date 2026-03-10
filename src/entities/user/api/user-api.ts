import { api } from "@/shared/api";
import { GenericDataResponse, IdParam } from "@/shared/types";
import { User, UserMeRequest, UpdateUserRequest } from "../model/types";

// Standard CRUD operations for User entity
export const userApi = {
  // CREATE - Create new user
  create: async (userData: Omit<User, "id" | "full_name">) => {
    const response = await api.post<GenericDataResponse<User>>("users", userData);
    return response.data;
  },

  // READ - Get all users with optional filtering
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }) => {
    const response = await api.get<GenericDataResponse<User[]>>("users", {
      params,
    });
    return response.data;
  },

  // READ - Get user by ID
  getById: async (userId: IdParam) => {
    const response = await api.get<GenericDataResponse<User>>(`users/${userId}`);
    return response.data;
  },

  // UPDATE - Update user by ID
  update: async (userId: IdParam, updateData: Partial<User>) => {
    const response = await api.put<GenericDataResponse<User>>(`users/${userId}`, updateData);
    return response.data;
  },

  // DELETE - Delete user by ID
  delete: async (userId: IdParam) => {
    const response = await api.delete<GenericDataResponse<void>>(`users/${userId}`);
    return response.data;
  },

  // BULK OPERATIONS
  bulkDelete: async (userIds: IdParam[]) => {
    const response = await api.delete<GenericDataResponse<void>>("users/bulk", {
      data: { ids: userIds },
    });
    return response.data;
  },

  bulkUpdate: async (updates: Array<{ id: IdParam; data: Partial<User> }>) => {
    const response = await api.put<GenericDataResponse<User[]>>("users/bulk", {
      updates,
    });
    return response.data;
  },

  // LEGACY/SPECIFIC OPERATIONS (keeping existing functionality)
  // These are more specific business operations, not standard CRUD
  all: async () => {
    const response = await api.get<GenericDataResponse<User[]>>("users");
    return response.data;
  },

  me: async () => {
    const response = await api.get<GenericDataResponse<User>>("users/me");
    return response.data;
  },

  findByID: async (userId: IdParam) => {
    const response = await api.get<GenericDataResponse<User>>(`users/${userId}`);
    return response.data;
  },

  updateMe: async (updateParams: Partial<UserMeRequest>) => {
    const response = await api.put<GenericDataResponse<User>>(`users/me`, updateParams);
    return response.data;
  },

  updateUser: async (userId: IdParam, updateParams: UpdateUserRequest) => {
    const response = await api.put<GenericDataResponse<User>>(`users/${userId}`, updateParams);
    return response.data;
  },

  // EMAIL-SPECIFIC OPERATIONS
  confirmEmailAddress: async (userId: IdParam, token: string) => {
    const response = await api.post<GenericDataResponse<User>>(
      `users/${userId}/confirm-email/${token}`,
    );
    return response.data;
  },

  confirmEmailChange: async (userId: IdParam, token: string) => {
    const response = await api.post<GenericDataResponse<User>>(
      `users/${userId}/email-change/${token}`,
    );
    return response.data;
  },

  cancelEmailChange: async (userId: IdParam) => {
    const response = await api.delete<GenericDataResponse<User>>(`users/${userId}/email-change`);
    return response.data;
  },

  resendConfirmation: async (userId: IdParam) => {
    const response = await api.post(`users/${userId}/resend-email-confirmation`);
    return response.data;
  },

  confirmEmailAddressWithCode: async (userId: IdParam, code: IdParam) => {
    const response = await api.post(`users/${userId}/confirm-email-with-code`, {
      code,
    });
    return response.data;
  },
};
