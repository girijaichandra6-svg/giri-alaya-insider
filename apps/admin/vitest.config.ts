import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/app/admin/vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@alaya/db": path.resolve(__dirname, "../../packages/db/src"),
      "@alaya/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@alaya/config": path.resolve(__dirname, "../../packages/config/src"),
      "@alaya/utils": path.resolve(__dirname, "../../packages/utils/src"),
    },
  },
});
