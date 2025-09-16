import { ConfigKeys } from "../types.ts";

export const clientBuildEnv: { [K in ConfigKeys]: string } = {
  VITE_API_URL_SERVER: import.meta.env.VITE_API_URL_SERVER,
};

export const getConfig = (
  key: ConfigKeys,
  fallback?: string
): string | undefined => {
  return clientBuildEnv[key] || fallback;
};
