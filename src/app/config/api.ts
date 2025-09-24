import { getRuntimeConfig } from "./runtime";

export interface ApiConfig {
  baseUrl: string | undefined;
  mockApi: boolean;
}

export const apiConfig: ApiConfig = {
  baseUrl: getRuntimeConfig("VITE_API_URL_SERVER"),
  mockApi: getRuntimeConfig("VITE_MOCK_API") === "true",
};
