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
