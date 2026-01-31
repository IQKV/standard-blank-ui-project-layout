export type AppRuntimeEnvKey = "VITE_API_SERVER_URL" | "VITE_MOCK_API";

export const runtimeEnv = {
  VITE_API_SERVER_URL: import.meta.env.VITE_API_SERVER_URL as
    | string
    | undefined,
  VITE_MOCK_API: import.meta.env.VITE_MOCK_API as string | undefined,
} as const satisfies Record<AppRuntimeEnvKey, string | undefined>;

export const getRuntimeConfig = (
  key: AppRuntimeEnvKey,
  fallback?: string
): string | undefined => runtimeEnv[key] ?? fallback;
