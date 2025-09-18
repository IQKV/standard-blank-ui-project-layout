import { SupportedLocales } from "@/shared/lib/locales";
import { IdParam } from "@/shared/types";

export interface User {
  id?: IdParam;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  timezone?: string;
  password?: string;
  is_email_verified?: boolean;
  has_pending_email_change?: boolean;
  enforce_email_confirmation_during_registration?: boolean;
  pending_email?: string;
  last_login_at?: string;
  status?: "ACTIVE" | "INACTIVE";
  role?: "ADMIN" | "GUEST";
  locale?: SupportedLocales;
}

export interface UserMeRequest {
  first_name: string;
  last_name: string;
  email: string;
  timezone: string;
  password: string;
  password_confirmation: string;
  password_current: string;
  locale: string;
}

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  role: string;
  status: string;
}

export interface UserRegistrationRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  locale: SupportedLocales | string;
}
