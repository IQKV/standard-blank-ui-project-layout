import { api } from "@/shared/api";
import { GenericDataResponse } from "@/shared/types";
import { User, UserRegistrationRequest } from "@/entities/user";
import { LoginData, LoginResponse, ResetPasswordRequest } from "../model/types";

export const authApi = {
  refreshAccessTokenFn: async () => {
    const response = await api.get<LoginResponse>("auth/refresh");
    return response.data;
  },

  register: async (registerData: UserRegistrationRequest) => {
    const response = await api.post<GenericDataResponse<User>>(
      "auth/register",
      registerData
    );
    return response.data;
  },

  login: async (user: LoginData) => {
    const response = await api.post<LoginResponse>("auth/login", user);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("auth/logout");
    return response.data;
  },

  forgotPassword: async (email: { email: string }) => {
    const response = await api.post("auth/forgot-password", email);
    return response.data;
  },

  verifyPasswordResetToken: async (token: string) => {
    const response = await api.get(`auth/reset-password/${token}`);
    return response.data;
  },

  resetPassword: async (token: string, resetData: ResetPasswordRequest) => {
    const response = await api.post(`auth/reset-password/${token}`, resetData);
    return response.data;
  },
};