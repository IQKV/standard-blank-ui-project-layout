import { api } from "@/shared/api";
import { GenericDataResponse, IdParam } from "@/shared/types";
import { User, UserMeRequest, UpdateUserRequest } from "../model/types";

export const userApi = {
  confirmEmailAddress: async (userId: IdParam, token: string) => {
    const response = await api.post<GenericDataResponse<User>>(
      `users/${userId}/confirm-email/${token}`
    );
    return response.data;
  },
  confirmEmailChange: async (userId: IdParam, token: string) => {
    const response = await api.post<GenericDataResponse<User>>(
      `users/${userId}/email-change/${token}`
    );
    return response.data;
  },
  cancelEmailChange: async (userId: IdParam) => {
    const response = await api.delete<GenericDataResponse<User>>(
      `users/${userId}/email-change`
    );
    return response.data;
  },
  updateMe: async (updateParams: Partial<UserMeRequest>) => {
    const response = await api.put<GenericDataResponse<User>>(
      `users/me`,
      updateParams
    );
    return response.data;
  },
  updateUser: async (userId: IdParam, updateParams: UpdateUserRequest) => {
    const response = await api.put<GenericDataResponse<User>>(
      `users/${userId}`,
      updateParams
    );
    return response.data;
  },
  all: async () => {
    const response = await api.get<GenericDataResponse<User[]>>("users");
    return response.data;
  },
  me: async () => {
    const response = await api.get<GenericDataResponse<User>>("users/me");
    return response.data;
  },

  findByID: async (userId: IdParam) => {
    const response = await api.get<GenericDataResponse<User>>(
      `users/${userId}`
    );
    return response.data;
  },

  resendConfirmation: async (userId: IdParam) => {
    const response = await api.post(
      `users/${userId}/resend-email-confirmation`
    );
    return response.data;
  },
  confirmEmailAddressWithCode: async (userId: IdParam, code: IdParam) => {
    const response = await api.post(`users/${userId}/confirm-email-with-code`, {
      code,
    });
    return response.data;
  },
};