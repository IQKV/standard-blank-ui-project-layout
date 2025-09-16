import axios from "axios";
import { getConfig } from "../utilites/config";

export const publicApi = axios.create({
  withCredentials: true,
});

publicApi.interceptors.request.use(
  (config) => {
    const baseUrl = getConfig("VITE_API_URL_SERVER");

    config.baseURL = `${baseUrl}/public`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.defaults.withCredentials = true;
