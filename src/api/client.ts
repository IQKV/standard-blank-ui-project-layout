import axios from "axios";
import { getConfig } from "../utilites/config.ts";

const BASE_URL = getConfig("VITE_API_URL_SERVER");
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
