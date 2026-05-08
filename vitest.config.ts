import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "examples/live-open-payments/tests/**/*.test.ts"]
  }
});
