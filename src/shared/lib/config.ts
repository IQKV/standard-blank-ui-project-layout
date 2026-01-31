import { ConfigKeys } from "@/shared/types";

export const clientBuildEnv: { [K in ConfigKeys]: string } = {
  VITE_API_SERVER_URL: import.meta.env.VITE_API_SERVER_URL,
};

export const getConfig = (
  key: ConfigKeys,
  fallback?: string
): string | undefined => {
  return clientBuildEnv[key] || fallback;
};
