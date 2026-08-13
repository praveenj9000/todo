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
    testTimeout: 15000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    env: {
      EXPO_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co",
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "placeholder-key",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "react-native$": "react-native-web",
      "@react-native-async-storage/async-storage": path.resolve(
        __dirname,
        "src/test/mocks/asyncStorage.ts",
      ),
      "react-native-url-polyfill/auto": path.resolve(__dirname, "src/test/mocks/urlPolyfill.ts"),
    },
    // Vite has no built-in concept of Metro's .native/.web platform
    // extensions — this list makes it check .web.ts(x) before the
    // bare extension, which is the correct choice for a jsdom test
    // environment (tests run in a browser-like context, not native).
    extensions: [".web.ts", ".web.tsx", ".ts", ".tsx", ".js", ".jsx", ".json"],
  },
});
