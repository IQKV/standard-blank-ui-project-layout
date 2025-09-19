import { User } from "@/entities/user";

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Response structure for login and token refresh endpoints
 */
export interface LoginResponse {
  /** JWT access token for API authentication */
  access_token: string;
  /** JWT refresh token for obtaining new access tokens */
  refresh_token: string;
  /** Token type, typically "Bearer" */
  token_type: string;
  /** Token expiration timestamp (Unix timestamp in milliseconds) */
  expires_at: number;
  /** Unique session identifier */
  session_id: string;
  /** Authenticated user data */
  user: User;
}

export interface ResetPasswordRequest {
  password: string;
  password_confirmation: string;
}
