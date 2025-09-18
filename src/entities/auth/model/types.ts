import { User } from "@/entities/user";

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface ResetPasswordRequest {
  password: string;
  password_confirmation: string;
}