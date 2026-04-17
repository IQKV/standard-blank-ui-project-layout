/// <reference types="vite/client" />

// Explicit re-declaration to ensure import.meta.env is available even when
// @types/node is transitively included via msw and overrides ImportMeta.
// This is a known issue with tsc -b (project references) + TS6 + @types/node.
declare interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly SSR: boolean;
  [key: string]: string | boolean | undefined;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
