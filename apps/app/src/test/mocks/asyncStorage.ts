// In-memory stand-in for @react-native-async-storage/async-storage in
// tests — the real package unconditionally imports react-native at its
// entry point, which Vite/Rollup can't parse (Flow syntax) and which
// tests have no business touching anyway (no real native storage in
// jsdom). This mirrors AsyncStorage's actual API surface closely enough
// for anything that reads/writes session or cache data during a test.
const store = new Map<string, string>();

export default {
  getItem: async (key: string) => store.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: async (key: string) => {
    store.delete(key);
  },
  clear: async () => {
    store.clear();
  },
  getAllKeys: async () => Array.from(store.keys()),
  multiGet: async (keys: string[]) => keys.map((key) => [key, store.get(key) ?? null] as const),
  multiSet: async (pairs: [string, string][]) => {
    pairs.forEach(([key, value]) => store.set(key, value));
  },
  multiRemove: async (keys: string[]) => {
    keys.forEach((key) => store.delete(key));
  },
};
