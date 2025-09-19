export type AppRuntimeEnvKey = "VITE_API_URL_SERVER";

export const runtimeEnv = {
  VITE_API_URL_SERVER: import.meta.env.VITE_API_URL_SERVER as
    | string
    | undefined,
} as const satisfies Record<AppRuntimeEnvKey, string | undefined>;

export const getRuntimeConfig = (
  key: AppRuntimeEnvKey,
  fallback?: string
): string | undefined => runtimeEnv[key] ?? fallback;
