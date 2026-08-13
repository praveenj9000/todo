/**
 * Avoids importing react-native's Platform directly in app source —
 * that bare import doesn't resolve cleanly to react-native-web under
 * Vitest (the alias in vitest.config.ts doesn't reliably catch it,
 * and react-native's own index.js uses Flow syntax Vite can't parse).
 * This is a plain, dependency-free equivalent for the one thing we
 * actually need: "are we running on web."
 */
export const isWeb = typeof document !== "undefined";
