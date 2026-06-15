import { defineConfig } from "vitest/config";

// The globe helpers are pure (no DOM); their only `@/` imports are type-only and
// erased at runtime, so no path-alias wiring is needed here.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
