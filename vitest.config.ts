import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  test: {
    setupFiles: "vitest.mocks.ts",
    browser: {
      enabled: true,
      name: "chromium",
      provider: "playwright",
    },
    exclude: ["node_modules", "buildtools"]
  },
});
