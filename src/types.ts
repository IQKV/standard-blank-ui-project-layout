import { SupportedLocales } from "@/locales.ts";

export type ConfigKeys = "VITE_API_URL_SERVER";

export type IdParam = string | undefined | number;

export interface SortDirectionLabel {
  asc: string;
  desc: string;
}

export interface PaginationData {
  total: number;
  per_page: number;
  current_page: number;
  links: string[];
  last_page: number;
  from: number;
  to: number;
  path: number;
  allowed_sorts: Record<string, SortDirectionLabel>;
  default_sort: string;
  default_sort_direction: string;
}

export interface GenericDataResponse<T> {
  data: T;
  errors?: Record<string, string>;
}

export interface GenericPaginatedResponse<T> {
  data: T[];
  meta: PaginationData;
}

export interface SortableItem {
  id: IdParam;
  order: number;
}

export interface User {
  id?: IdParam;
  account_id?: IdParam;
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
  role?: "ADMIN";
  is_account_owner?: boolean;
  locale?: SupportedLocales;
}

export interface Account {
  id?: IdParam;
  name: string;
  email: string;
  timezone?: string;
  currency_code?: string;
  password?: string;
  is_account_email_confirmed?: boolean;
  requires_manual_verification?: boolean;
}

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

export interface RegisterAccountRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  locale: SupportedLocales;
}

export interface ResetPasswordRequest {
  password: string;
  password_confirmation: string;
}
