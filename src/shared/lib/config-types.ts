// Config type definitions for shared layer
// This allows shared layer to work with config without importing from app layer

export interface ApiConfig {
  baseUrl: string | undefined;
  timeout?: number;
  headers?: Record<string, string>;
  mockApi?: boolean;
}

// Use any for ReactQuery config to avoid complex type compatibility issues
export interface ReactQueryConfig {
  defaultOptions?: any;
}

export interface AppConfigInterface {
  apiConfig: ApiConfig;
  reactQueryConfig: ReactQueryConfig;
}

// Global config instance - will be injected by app layer
let appConfig: AppConfigInterface | null = null;

export const setAppConfig = (config: AppConfigInterface) => {
  appConfig = config;
};

export const getAppConfig = (): AppConfigInterface => {
  if (!appConfig) {
    throw new Error(
      "App config not initialized. Call setAppConfig() from app layer before using shared utilities.",
    );
  }
  return appConfig;
};
