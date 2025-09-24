import axios from "axios";
import { getAppConfig } from "@/shared/lib/config-types";

// Create axios instance with lazy config loading
const getBaseUrl = () => {
  try {
    const config = getAppConfig();
    return (
      config.apiConfig.baseUrl ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3000/api"
    );
  } catch (error) {
    // Fallback for development/testing
    return import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  }
};

const BASE_URL = getBaseUrl();
const LOGIN_PATH = "/auth/login";
const PREVIOUS_URL_KEY = "previous_url";

const ALLOWED_UNAUTHENTICATED_PATHS = ["auth/login", "auth"];

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
    // If no response, it might be a network error
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;
    const currentPath = window?.location.pathname;
    const isAllowedUnauthenticatedPath = ALLOWED_UNAUTHENTICATED_PATHS.some(
      (path) => currentPath.includes(path)
    );
    const isAuthError = status === 401 || status === 403;

    if (isAuthError && !isAllowedUnauthenticatedPath) {
      // Store the current URL before redirecting to the login page
      window?.localStorage?.setItem(PREVIOUS_URL_KEY, window?.location.href);
      window?.location?.replace(LOGIN_PATH);
    }

    return Promise.reject(error);
  }
);

axios.defaults.withCredentials = true;
