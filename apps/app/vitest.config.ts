import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    clearMocks: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "react-native$": "react-native-web",
    },
    // Vite has no built-in concept of Metro's .native/.web platform
    // extensions — this list makes it check .web.ts(x) before the
    // bare extension, which is the correct choice for a jsdom test
    // environment (tests run in a browser-like context, not native).
    extensions: [".web.ts", ".web.tsx", ".ts", ".tsx", ".js", ".jsx", ".json"],
  },
});
