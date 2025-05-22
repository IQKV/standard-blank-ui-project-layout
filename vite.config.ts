import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

const isTest = process.env.NODE_ENV === "test";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react(), !isTest && TanStackRouterVite()],
});
