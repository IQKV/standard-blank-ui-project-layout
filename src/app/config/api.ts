import { getRuntimeConfig } from "./runtime";

export interface ApiConfig {
  baseUrl: string | undefined;
}

export const apiConfig: ApiConfig = {
  baseUrl: getRuntimeConfig("VITE_API_URL_SERVER"),
};
