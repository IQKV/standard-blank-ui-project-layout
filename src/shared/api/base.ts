import axios from "axios";
import { getAppConfig } from "@/shared/lib/config-types";
import { normalizeAxiosError } from "./errors";

// Create axios instance with lazy config loading
const getBaseUrl = () => {
  try {
    const config = getAppConfig();
    return (
      config.apiConfig.baseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
    );
  } catch (_error) {
    // Fallback for development/testing
    return import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  }
};

const BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeAxiosError(error);
    return Promise.reject(normalized);
  },
);

axios.defaults.withCredentials = true;
