import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./src/lib/__tests__/empty-module.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/lib/__tests__/vitest.setup.ts"],
    env: {
      SESSION_SECRET: "test-secret-key-that-is-at-least-32-characters!!",
    },
  },
});
